<?php
// Formit known-referrer module v1.2.0. Uses retained source-qualified visitor statistics.
defined('ABSPATH') || exit;

function fkr_source() {
    $host = strtolower((string) wp_parse_url(home_url(), PHP_URL_HOST));
    return ['office.interiorhub.kr' => 'interiorhub_office', 'academy.interiorhub.kr' => 'interiorhub_academy', 'apt.interiorhub.kr' => 'interiorhub_apt', 'villa.interiorhub.kr' => 'interiorhub_villa'][$host] ?? '';
}
function fkr_now() { return new DateTimeImmutable('now', new DateTimeZone('Asia/Seoul')); }
function fkr_external_referrer($value, $own_host) {
    if (!is_string($value) || strlen($value) > 2048) return false;
    $ref = wp_parse_url($value);
    if (!is_array($ref) || !in_array(strtolower($ref['scheme'] ?? ''), ['http', 'https'], true) || isset($ref['user']) || isset($ref['pass'])) return false;
    $host = strtolower(rtrim($ref['host'] ?? '', '.'));
    $own = preg_replace('/^www\./', '', strtolower(rtrim($own_host, '.')));
    $canonical = preg_replace('/^www\./', '', $host);
    if (!$host || !strpos($host, '.') || !filter_var($host, FILTER_VALIDATE_DOMAIN, FILTER_FLAG_HOSTNAME)) return false;
    return $canonical !== $own && substr($canonical, -strlen('.' . $own)) !== '.' . $own;
}

// Koko stores no site row on a day without pageviews. A missing row alone is not proof of zero.
// Reuse the already-authorized daily-browser report only to confirm zero total visitors;
// a positive, missing, expired or failed legacy count can never replace source-qualified data.
function fkr_confirmed_zero_days($legacy, $from, $to, $today, $first) {
    if (!is_array($legacy) || ($legacy['version'] ?? null) !== 1 || ($legacy['source'] ?? null) !== fkr_source() || ($legacy['timezone'] ?? null) !== 'Asia/Seoul' || ($legacy['metric'] ?? null) !== 'daily_unique_browser' || isset($legacy['visitorScope']) || ($legacy['from'] ?? null) !== $from->format('Y-m-d') || ($legacy['to'] ?? null) !== $to->format('Y-m-d') || !in_array($legacy['coverage'] ?? null, ['complete', 'partial'], true) || !is_array($legacy['days'] ?? null) || count($legacy['days']) !== $from->diff($to)->days + 1 || !is_string($first) || !preg_match('/^\d{4}-\d{2}-\d{2}$/D', $first)) return [];
    $started = $legacy['trackingStartedAt'] ?? null;
    if (!is_string($started) || !preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/D', $started)) return [];
    try { $start = new DateTimeImmutable($started); } catch (Exception $error) { return []; }
    $errors = DateTimeImmutable::getLastErrors();
    if ($errors && ($errors['warning_count'] || $errors['error_count'])) return [];
    $start = $start->setTimezone(new DateTimeZone('Asia/Seoul'));
    $retained = $today->modify('-89 days'); $seen = []; $zeroes = [];
    foreach ($legacy['days'] as $row) {
        if (!is_array($row) || !is_string($row['day'] ?? null) || !array_key_exists('visitors', $row)) return [];
        $day = $row['day']; $value = $row['visitors'];
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $day, $today->getTimezone());
        if (!$date || $date->format('Y-m-d') !== $day || $date < $from || $date > $to || isset($seen[$day]) || ($value !== null && (!is_int($value) || $value < 0))) return [];
        $seen[$day] = true;
        if ($value === 0 && $date >= $start->setTime(0, 0) && $date >= $retained && $day >= $first && !($day === $start->format('Y-m-d') && $start->format('H:i:s') !== '00:00:00')) $zeroes[$day] = true;
    }
    return $zeroes;
}

function fkr_report($request, $legacy = null) {
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
    // Koko's cookie expires at the site's midnight; require an aligned daily cookie metric.
    if (!defined('KOKO_ANALYTICS_VERSION') || !function_exists('KokoAnalytics\\get_settings') || (\KokoAnalytics\get_settings()['tracking_method'] ?? '') !== 'cookie' || wp_timezone()->getOffset($from) !== 32400 || wp_timezone()->getOffset($to) !== 32400) return new WP_Error('unavailable', 'Visitor statistics unavailable', ['status' => 503]);
    $prefix = $wpdb->prefix . 'koko_analytics_';
    $previous = $wpdb->suppress_errors(true);
    $site_rows = $wpdb->get_results($wpdb->prepare('SELECT date day, visitors FROM ' . $prefix . 'site_stats WHERE date BETWEEN %s AND %s', $from->format('Y-m-d'), $to->format('Y-m-d')), ARRAY_A);
    $failed = (bool) $wpdb->last_error;
    $referrer_rows = $wpdb->get_results($wpdb->prepare('SELECT s.date day, l.value referrer, s.unique_hits visitors FROM ' . $prefix . 'referrer_stats s JOIN ' . $prefix . 'referrer_labels l ON l.id=s.id WHERE s.date BETWEEN %s AND %s', $from->format('Y-m-d'), $to->format('Y-m-d')), ARRAY_A);
    $failed = $failed || (bool) $wpdb->last_error;
    $first = $wpdb->get_var('SELECT MIN(date) FROM ' . $prefix . 'site_stats');
    $failed = $failed || (bool) $wpdb->last_error; $wpdb->suppress_errors($previous);
    if ($failed || !is_array($site_rows) || !is_array($referrer_rows)) return new WP_Error('storage', 'Visitor statistics unavailable', ['status' => 503]);
    $totals = []; $qualified = []; $referrer_dates = [];
    foreach ($site_rows as $row) {
        $value = filter_var($row['visitors'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
        $totals[$row['day']] = $value === false ? null : $value; $qualified[$row['day']] = $value === false ? null : 0;
    }
    $own = (string) wp_parse_url(home_url(), PHP_URL_HOST);
    // unique_hits uses the site's new-visitor flag, not every referring pageview.
    // Read raw counters; Koko's display helper promotes zero unique_hits to one.
    foreach ($referrer_rows as $row) {
        $day = $row['day'];
        $referrer_dates[$day] = true;
        if (!array_key_exists($day, $qualified) || $qualified[$day] === null) continue;
        $referrer = $row['referrer'] ?? '';
        if (!is_string($referrer) || !fkr_external_referrer('https://' . $referrer, $own)) continue;
        $value = filter_var($row['visitors'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
        if ($value === false || $value > PHP_INT_MAX - $qualified[$day]) { $qualified[$day] = null; continue; }
        $qualified[$day] += $value;
    }
    $zeroes = fkr_confirmed_zero_days($legacy, $from, $to, $today, $first);
    $days = []; $partial = false;
    for ($date = $from; $date <= $to; $date = $date->modify('+1 day')) {
        $day = $date->format('Y-m-d');
        $visitors = array_key_exists($day, $qualified) ? $qualified[$day] : (isset($zeroes[$day]) && !isset($referrer_dates[$day]) ? 0 : null);
        if (isset($totals[$day]) && $visitors !== null && $visitors > $totals[$day]) $visitors = null;
        if ($visitors === null || $date == $today || $day === $first) $partial = true;
        $days[] = ['day' => $day, 'visitors' => $visitors, 'clickers' => null];
    }
    $response = new WP_REST_Response(['version' => 1, 'source' => fkr_source(), 'timezone' => 'Asia/Seoul', 'metric' => 'daily_unique_browser', 'provider' => 'koko_cookie', 'visitorScope' => 'known_referrer', 'from' => $from->format('Y-m-d'), 'to' => $to->format('Y-m-d'), 'trackingStartedAt' => ($first ?: $today->format('Y-m-d')) . 'T00:00:00+09:00', 'dateUpdatedAt' => gmdate('c'), 'days' => $days, 'coverage' => $partial ? 'partial' : 'complete']);
    $response->header('Cache-Control', 'private, no-store, max-age=0'); $response->header('Vary', 'Authorization');
    return $response;
}

// Keep existing authentication/default reports; replace only successful scoped GETs.
add_filter('rest_request_after_callbacks', function ($response, $handler, $request) {
    if (!fkr_source() || is_wp_error($response)) return $response;
    if ($request->get_route() === '/ih-admin/v1/formit-stats' && $request->get_method() === 'GET' && rest_ensure_response($response)->get_status() === 200 && $request->get_param('visitor_scope') === 'known_referrer') return fkr_report($request, rest_ensure_response($response)->get_data());
    return $response;
}, 30, 3);

// Retain the unused v1.0 table without new writes and preserve its 90-day expiration.
add_action('ihadm_cleanup', function () {
    if (get_option('fkr_schema') !== '1') return;
    global $wpdb; $cutoff = fkr_now()->modify('-89 days')->format('Y-m-d');
    $wpdb->query($wpdb->prepare('DELETE FROM ' . $wpdb->prefix . 'formit_known_referrer WHERE day < %s', $cutoff));
});
