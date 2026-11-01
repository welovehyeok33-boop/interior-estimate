<?php
namespace KokoAnalytics { function get_settings() { return ['tracking_method' => $GLOBALS['method']]; } }
namespace {
define('ABSPATH', '/wordpress/'); define('ARRAY_A', 'ARRAY_A'); define('KOKO_ANALYTICS_VERSION', '2.5.3');
$actions=[]; $filters=[]; $own='apt.interiorhub.kr'; $method='cookie'; $zone='Asia/Seoul'; $checks=0;
function check($ok,$label) { global $checks; if(!$ok)throw new \Exception($label); $checks++; }
function home_url(){global $own;return 'https://'.$own;}
function wp_parse_url($value,$component=-1){return parse_url((string)$value,$component);}
function add_filter($key,$callback,...$rest){global $filters;$filters[$key][]=$callback;}
function add_action($key,$callback,...$rest){global $actions;$actions[$key][]=$callback;}
function get_option($key,...$rest){return $key==='fkr_schema'?'1':false;}
function wp_timezone(){global $zone;return new \DateTimeZone($zone);}
function is_wp_error($value){return $value instanceof WP_Error;}
function rest_ensure_response($value){return $value;}
class WP_Error {function __construct(public $code,public $message,public $data){}}
class WP_REST_Response {public $headers=[];function __construct(public $data,public $status=200){} function get_status(){return $this->status;}function get_data(){return $this->data;}function header($k,$v){$this->headers[$k]=$v;}}
class Request {function __construct(public $params=[],public $method='GET',public $route='/ih-admin/v1/formit-stats'){}function get_param($k){return $this->params[$k]??null;}function get_route(){return $this->route;}function get_method(){return $this->method;}}
class TestDb {
 public $prefix='test_'; public $last_error=''; public $site=[]; public $ref=[]; public $writes=[];public $fail=false;public $first='';
 function prepare($sql,...$args){return [$sql,$args];}
 function suppress_errors($value){return false;}
 function get_results($query,...$rest){$this->last_error=$this->fail?'private error':'';return $this->fail?null:(str_contains($query[0],'referrer_stats')?$this->ref:$this->site);}
 function get_var($query){$this->last_error=$this->fail?'private error':'';return $this->first;}
 function query($query){$this->writes[]=$query;return 0;}
}
$wpdb=new TestDb();require dirname(__DIR__).'/formit-known-referrer.php';
$today=fkr_now()->format('Y-m-d');$yesterday=fkr_now()->modify('-1 day')->format('Y-m-d');$missing=fkr_now()->modify('-2 day')->format('Y-m-d');$third=fkr_now()->modify('-3 day')->format('Y-m-d');$fourth=fkr_now()->modify('-4 day')->format('Y-m-d');
$wpdb->first=$fourth;$wpdb->site=[['day'=>$fourth,'visitors'=>'10'],['day'=>$third,'visitors'=>'7'],['day'=>$yesterday,'visitors'=>'4']];
$wpdb->ref=[['day'=>$fourth,'referrer'=>'search.naver.com','visitors'=>'4'],['day'=>$fourth,'referrer'=>'google.com','visitors'=>'2'],['day'=>$fourth,'referrer'=>'apt.interiorhub.kr','visitors'=>'3'],['day'=>$fourth,'referrer'=>'example.com','visitors'=>'0'],['day'=>$third,'referrer'=>'github.com/project','visitors'=>'3'],['day'=>$third,'referrer'=>'m.search.naver.com','visitors'=>'2'],['day'=>$missing,'referrer'=>'naver.com','visitors'=>'9']];
$request=new Request(['from'=>$fourth,'to'=>$today,'visitor_scope'=>'known_referrer']);$result=fkr_report($request);
check($result instanceof WP_REST_Response,'existing retained provider returns a report');
check(array_column($result->data['days'],'visitors')===[6,5,null,0,null],'retained source records restore history; empty days without corroboration remain unknown even today');
check(array_column($result->data['days'],'clickers')===[null,null,null,null,null],'unavailable outbound clicks are never invented');
check($result->data['trackingStartedAt']===$fourth.'T00:00:00+09:00','baseline comes from retained history, not this module deployment');
check($result->data['provider']==='koko_cookie'&&$result->data['metric']==='daily_unique_browser','daily cookie provider is declared');
check($result->headers['Cache-Control']==='private, no-store, max-age=0','scoped response is private');
check(count($wpdb->writes)===0&&!isset($actions['init']),'reads create neither a new table nor a new collector');
check(!str_contains(json_encode($result),'naver.com')&&!str_contains(json_encode($result),'private error'),'only date aggregates leave WordPress');
$hook=$filters['rest_request_after_callbacks'][0];$original=new WP_REST_Response(['legacy'=>true]);$denied=new WP_REST_Response(['error'=>'auth'],401);
check($hook($denied,null,$request)===$denied,'authentication remains in force');
$error=new WP_Error('auth','Forbidden',['status'=>403]);check($hook($error,null,$request)===$error,'WP auth error is preserved');
check($hook($original,null,new Request(['from'=>$fourth,'to'=>$today]))===$original,'unfiltered legacy report is unchanged');
check($hook($original,null,new Request([], 'POST','/ih-admin/v1/track'))===$original&&count($wpdb->writes)===0,'existing tracking is not modified');
$wpdb->ref[]=['day'=>$third,'referrer'=>'bing.com','visitors'=>'10'];check(fkr_report($request)->data['days'][1]['visitors']===null,'referrer sums larger than the provider total are unknown, not accepted');array_pop($wpdb->ref);
$wpdb->ref[]=['day'=>$third,'referrer'=>'example.net','visitors'=>'-1'];check(fkr_report($request)->data['days'][1]['visitors']===null,'malformed source count cannot become zero');array_pop($wpdb->ref);
$wpdb->fail=true;check(fkr_report($request)->data['status']===503,'storage errors remain unavailable');$wpdb->fail=false;
$zone='UTC';check(fkr_report($request)->data['status']===503,'incompatible day boundaries are rejected');$zone='Asia/Seoul';
$method='none';check(fkr_report($request)->data['status']===503,'disabled unique visitor collection is not represented as a valid count');$method='cookie';
foreach(['office','academy','apt','villa']as$type){$own=$type.'.interiorhub.kr';check(fkr_source()==='interiorhub_'.$type,'fixed active source '.$type);}$own='apt.interiorhub.kr';
foreach(['https://naver.com/','https://google.com/','https://github.com/a']as$ref)check(fkr_external_referrer($ref,$own),'valid external site');
foreach(['','naver.com','javascript:alert(1)','https://apt.interiorhub.kr/','https://www.apt.interiorhub.kr/','https://child.apt.interiorhub.kr/','https://user:secret@example.com/']as$ref)check(!fkr_external_referrer($ref,$own),'internal or invalid source is excluded');
foreach([['from'=>'2026-02-30','to'=>$today],['from'=>$today,'to'=>'2099-01-01'],['from'=>$today,'to'=>$yesterday]]as$params)check(fkr_report(new Request($params))->data['status']===400,'invalid date');

$legacy=['version'=>1,'source'=>fkr_source(),'timezone'=>'Asia/Seoul','metric'=>'daily_unique_browser','from'=>$fourth,'to'=>$today,'trackingStartedAt'=>$fourth.'T00:00:00+09:00','coverage'=>'partial','days'=>[]];
foreach([$fourth=>10,$third=>7,$missing=>0,$yesterday=>4,$today=>0]as$day=>$visitors)$legacy['days'][]=['day'=>$day,'visitors'=>$visitors,'clickers'=>0];
$wpdb->ref=array_values(array_filter($wpdb->ref,fn($row)=>$row['day']!==$missing));
$confirmed=$hook(new WP_REST_Response($legacy),null,$request);
check(array_column($confirmed->data['days'],'visitors')===[6,5,0,0,0],'missing sparse rows with a verified total of zero are valid zero visitor days');
check($confirmed->data['coverage']==='partial','today remains provisional even when zero is confirmed');
$past=new Request(['from'=>$missing,'to'=>$missing,'visitor_scope'=>'known_referrer']);$empty=$legacy;$empty['from']=$empty['to']=$missing;$empty['days']=[$legacy['days'][2]];
$one=$hook(new WP_REST_Response($empty),null,$past);
check($one->data['days'][0]['visitors']===0&&$one->data['coverage']==='complete','a completed zero-traffic day is complete, not a missing Academy report');
foreach([1,null,'0',-1]as$value){$bad=$legacy;$bad['days'][2]['visitors']=$value;check(fkr_report($request,$bad)->data['days'][2]['visitors']===null,'positive, unknown or malformed legacy values cannot invent a source-filtered zero');}
foreach(['source'=>'wrong','timezone'=>'UTC','metric'=>'pageviews','from'=>$third,'to'=>$yesterday,'version'=>2,'visitorScope'=>'known_referrer','coverage'=>'unknown','trackingStartedAt'=>'not a timestamp']as$key=>$value){$bad=$legacy;$bad[$key]=$value;check(fkr_report($request,$bad)->data['days'][2]['visitors']===null,'legacy zero requires the original matching daily-browser contract: '.$key);}
$bad=$legacy;$bad['days'][2]=$bad['days'][0];check(fkr_report($request,$bad)->data['days'][2]['visitors']===null,'duplicate legacy dates are rejected');
$bad=$legacy;$bad['trackingStartedAt']=$missing.'T12:00:00+09:00';check(fkr_report($request,$bad)->data['days'][2]['visitors']===null,'the collector start day is not a complete empty day');
$bad=$legacy;$bad['trackingStartedAt']=$today.'T00:00:00+09:00';check(fkr_report($request,$bad)->data['days'][2]['visitors']===null,'days before legacy collection remain unknown');
$tz=new \DateTimeZone('Asia/Seoul');$from=new \DateTimeImmutable($fourth,$tz);$to=new \DateTimeImmutable($today,$tz);
check(fkr_confirmed_zero_days($legacy,$from,$to,$to->modify('+100 days'),$fourth)===[],'expired native zeroes cannot fill missing history');
check(!isset(fkr_confirmed_zero_days($legacy,$from,$to,$to,$today)[$missing]),'zero fallback cannot predate Koko retained history');
$wpdb->ref[]=['day'=>$missing,'referrer'=>'naver.com','visitors'=>'1'];check(fkr_report($request,$legacy)->data['days'][2]['visitors']===null,'orphan source records remain inconsistent, never zero');array_pop($wpdb->ref);
$wpdb->site[]=['day'=>$missing,'visitors'=>'-1'];check(fkr_report($request,$legacy)->data['days'][2]['visitors']===null,'an invalid existing provider total cannot be overwritten by legacy zero');array_pop($wpdb->site);
$wpdb->fail=true;check(fkr_report($request,$legacy)->data['status']===503,'native zero fallback cannot conceal Koko storage errors');$wpdb->fail=false;
check(count($wpdb->writes)===0,'zero confirmation and authenticated scoped reporting remain read-only');
$own='unlisted.example.com';check($hook($original,null,$request)===$original,'unlisted host stays disabled');
echo 'PHP 8.3 retained-source checks passed: '.$checks." assertions\n";
}
