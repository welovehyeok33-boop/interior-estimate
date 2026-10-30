<?php
// Formit known-referrer module v1.0.0. Appended to the existing collector, not a separate plugin.
defined('ABSPATH') || exit;

function fkr_source() {
    $host = strtolower((string) wp_parse_url(home_url(), PHP_URL_HOST));
    return [
        'office.interiorhub.kr' => 'interiorhub_office',
        'academy.interiorhub.kr' => 'interiorhub_academy',
        'apt.interiorhub.kr' => 'interiorhub_apt',
        'villa.interiorhub.kr' => 'interiorhub_villa',
    ][$host] ?? '';
}
function fkr_table() { global $wpdb; return $wpdb->prefix . 'formit_known_referrer'; }
function fkr_now() { return new DateTimeImmutable('now', new DateTimeZone('Asia/Seoul')); }

// Only a valid external HTTP(S) origin qualifies. UTM labels alone do not establish a referrer.
function fkr_external_referrer($value, $own_host) {
    if (!is_string($value) || strlen($value) > 2048) return false;
    $ref = wp_parse_url($value);
    if (!is_array($ref) || !in_array(strtolower($ref['scheme'] ?? ''), ['http', 'https'], true) || isset($ref['user']) || isset($ref['pass'])) return false;
    $host = strtolower(rtrim($ref['host'] ?? '', '.'));
    $own = preg_replace('/^www\./', '', strtolower(rtrim($own_host, '.')));
    $canonical = preg_replace('/^www\./', '', $host);
    if (!$host || !strpos($host, '.') || !filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME)) return false;
    if ($canonical === $own || substr($canonical, -strlen('.' . $own)) === '.' . $own) return false;
    return true;
}

add_action('init', function () {
    if (!fkr_source() || get_option('fkr_schema') === '1') return;
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $table = fkr_table(); $charset = $wpdb->get_charset_collate();
    dbDelta("CREATE TABLE $table (
        day date NOT NULL,
        browser char(64) NOT NULL,
        clicked tinyint unsigned NOT NULL DEFAULT 0,
        updated_at datetime NOT NULL,
        PRIMARY KEY  (day,browser)
    ) $charset;");
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $wpdb->esc_like($table))) !== $table) return;
    // Old records have no daily-browser/referrer linkage and must not become invented zeroes.
    add_option('fkr_started', gmdate('c'), '', false);
    update_option('fkr_schema', '1', false);
});

function fkr_record($request) {
    global $wpdb;
    $uid = wp_validate_auth_cookie('', 'logged_in');
    if ($uid && user_can($uid, 'manage_options')) return;
    if (preg_match('/bot|crawler|spider|headless|preview/i', $_SERVER['HTTP_USER_AGENT'] ?? '') || ($_SERVER['HTTP_DNT'] ?? '') === '1' || ($_SERVER['HTTP_SEC_GPC'] ?? '') === '1') return;
    $own = (string) wp_parse_url(home_url(), PHP_URL_HOST);
    if (wp_parse_url($request->get_header('origin'), PHP_URL_HOST) !== $own) return;
    $p = $request->get_json_params();
    if (!is_array($p) || ($p['metric'] ?? '') !== 'daily_unique_browser' || !in_array($p['kind'] ?? '', ['view', 'click'], true)) return;
    $bid = $p['bid'] ?? '';
    if (!is_string($bid) || !preg_match('/^[a-f0-9-]{32,64}$/i', $bid) || !fkr_external_referrer($p['ref'] ?? '', $own)) return;
    $day = fkr_now()->format('Y-m-d');
    if (get_option('fkr_schema') !== '1') { update_option('fkr_gap_' . $day, true, false); return; }
    $browser = hash_hmac('sha256', 'formit-known-referrer-v1|' . $day . '|' . $bid, wp_salt());
    $previous = $wpdb->suppress_errors(true);
    $ok = $wpdb->query($wpdb->prepare('INSERT INTO ' . fkr_table() . ' (day,browser,clicked,updated_at) VALUES (%s,%s,%d,%s) ON DUPLICATE KEY UPDATE clicked=GREATEST(clicked,VALUES(clicked)),updated_at=VALUES(updated_at)', $day, $browser, $p['kind'] === 'click' ? 1 : 0, gmdate('Y-m-d H:i:s')));
    $wpdb->suppress_errors($previous);
    if ($ok === false) update_option('fkr_gap_' . $day, true, false);
}

function fkr_report($request) {
    global $wpdb;
    $tz = new DateTimeZone('Asia/Seoul'); $dates = [];
    foreach (['from', 'to'] as $key) {
        $value = $request->get_param($key);
        $date = is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/D', $value) ? DateTimeImmutable::createFromFormat('!Y-m-d', $value, $tz) : false;
        if (!$date || $date->format('Y-m-d') !== $value) return new WP_Error('invalid_dates', 'Invalid date range', ['status' => 400]);
        $dates[$key] = $date;
    }
    $today = fkr_now()->setTime(0, 0); $from = $dates['from']; $to = $dates['to'];
    if ($from > $to || $to > $today || $from->diff($to)->days > 29) return new WP_Error('invalid_dates', 'Invalid date range', ['status' => 400]);
    $started = get_option('fkr_started');
    if (get_option('fkr_schema') !== '1' || !is_string($started) || !strtotime($started)) return new WP_Error('unavailable', 'Statistics unavailable', ['status' => 503]);
    $start = (new DateTimeImmutable($started))->setTimezone($tz); $retained = $today->modify('-89 days');
    $previous = $wpdb->suppress_errors(true);
    $rows = $wpdb->get_results($wpdb->prepare('SELECT day,COUNT(*) visitors,SUM(clicked) clickers FROM ' . fkr_table() . ' WHERE day BETWEEN %s AND %s GROUP BY day', $from->format('Y-m-d'), $to->format('Y-m-d')), ARRAY_A);
    $failed = (bool) $wpdb->last_error; $wpdb->suppress_errors($previous);
    if ($failed) return new WP_Error('storage', 'Statistics unavailable', ['status' => 503]);
    $map = []; foreach ($rows ?: [] as $row) $map[$row['day']] = $row;
    $days = []; $partial = false;
    for ($date = $from; $date <= $to; $date = $date->modify('+1 day')) {
        $day = $date->format('Y-m-d');
        $missing = $date < $retained || $date < $start->setTime(0, 0) || get_option('fkr_gap_' . $day, false);
        if ($missing || $date == $today || $day === $start->format('Y-m-d')) $partial = true;
        $days[] = ['day' => $day, 'visitors' => $missing ? null : (int) ($map[$day]['visitors'] ?? 0), 'clickers' => $missing ? null : (int) ($map[$day]['clickers'] ?? 0)];
    }
    $response = new WP_REST_Response(['version' => 1, 'source' => fkr_source(), 'timezone' => 'Asia/Seoul', 'metric' => 'daily_unique_browser', 'visitorScope' => 'known_referrer', 'from' => $from->format('Y-m-d'), 'to' => $to->format('Y-m-d'), 'trackingStartedAt' => $started, 'dateUpdatedAt' => gmdate('c'), 'days' => $days, 'coverage' => $partial ? 'partial' : 'complete']);
    $response->header('Cache-Control', 'private, no-store, max-age=0');
    $response->header('Vary', 'Authorization');
    return $response;
}

// Reuse the existing bridge's endpoint and authentication. Never replace an auth/error response.
add_filter('rest_request_after_callbacks', function ($response, $handler, $request) {
    if (!fkr_source() || is_wp_error($response)) return $response;
    $status = rest_ensure_response($response)->get_status();
    if ($request->get_route() === '/ih-admin/v1/track' && $request->get_method() === 'POST' && $status === 204) fkr_record($request);
    if ($request->get_route() === '/ih-admin/v1/formit-stats' && $request->get_method() === 'GET' && $status === 200 && $request->get_param('visitor_scope') === 'known_referrer') return fkr_report($request);
    return $response;
}, 30, 3);

add_action('ihadm_cleanup', function () {
    global $wpdb; $cutoff = fkr_now()->modify('-89 days')->format('Y-m-d');
    $wpdb->query($wpdb->prepare('DELETE FROM ' . fkr_table() . ' WHERE day < %s', $cutoff));
});
