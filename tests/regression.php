<?php
/** Focused regression checks; no CMS database or external services required. */
error_reporting(E_ALL);
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

$metadata = array();
$can_edit = true;
$front_page = false;
$hooks = array();

function add_action($hook, $callback, $priority = 10, $args = 1) { $GLOBALS['hooks'][$hook][] = $callback; }
function add_filter($hook, $callback, $priority = 10, $args = 1) {}
function current_user_can($capability, $id = null) { return $GLOBALS['can_edit']; }
function wp_verify_nonce($nonce, $action) { return $nonce === 'valid'; }
function get_post_meta($id, $key, $single = true) { return $GLOBALS['metadata'][$id][$key] ?? ''; }
function update_post_meta($id, $key, $value) { $GLOBALS['metadata'][$id][$key] = $value; }
function delete_post_meta($id, $key) { unset($GLOBALS['metadata'][$id][$key]); }
function sanitize_text_field($value) { return strip_tags((string) $value); }
function wp_kses_post($value) { return strip_tags($value, '<p><strong><em>'); }
function wp_parse_url($url, $component = -1) { return parse_url($url, $component); }
function wp_strip_all_tags($value) { return strip_tags($value); }
function wp_trim_words($value, $count, $more = '') { return implode(' ', array_slice(explode(' ', $value), 0, $count)); }
function strip_shortcodes($value) { return $value; }
function get_nav_menu_locations() { return in_array('--empty-menu', $GLOBALS['argv'], true) ? array() : array('menu-1' => 1); }
function wp_get_nav_menu_items($id) {
    $items = array();
    foreach (array(1, 1, 2, 3, 4, 5, 6) as $index => $page_id) {
        $items[] = (object) array('ID' => 100 + $index, 'object_id' => $page_id, 'object' => 'page', 'type' => 'post_type');
    }
    $items[] = (object) array('ID' => 200, 'object_id' => 1, 'object' => 'custom', 'type' => 'custom');
    return $items;
}
function get_post($id) {
    if (is_object($id)) { return $id; }
    if ($id === 6) { return null; }
    return (object) array('ID' => $id, 'post_status' => $id === 3 ? 'draft' : 'publish', 'post_password' => $id === 4 ? 'secret' : '', 'post_excerpt' => 'A page excerpt', 'post_content' => 'Page content', 'post_name' => 'page-' . $id);
}
function get_page_template_slug($page) { return (is_object($page) ? $page->ID : $page) === 5 ? 'template-homepage.php' : 'template-history.php'; }
function is_front_page() { return $GLOBALS['front_page']; }
function is_page_template($template) { return false; }
function is_author() { return false; }
function is_singular() { return true; }
function is_search() { return false; }
function is_404() { return false; }
function post_password_required($id) { return false; }
function get_queried_object_id() { return 1; }
function wp_get_canonical_url($id) { return 'https://example.org/page-1/'; }
function get_permalink($id) { return 'https://example.org/page-1/'; }
function get_option($key, $default = false) { return $key === 'page_on_front' ? 1 : $default; }
function get_bloginfo($key) { return $key === 'name' ? 'A </script><script>alert(1)</script> title' : 'A site description'; }
function wp_get_document_title() { return get_bloginfo('name'); }
function get_theme_mod($key) { return false; }
function home_url($path = '/') { return ($GLOBALS['test_home_url'] ?? 'https://example.org') . $path; }
function is_admin() { return $GLOBALS['test_is_admin'] ?? false; }
function get_template_directory() { return dirname(__DIR__); }
function get_template_directory_uri() { return 'https://example.org/theme'; }
function has_post_thumbnail($id = null) { return false; }
function wp_json_encode($data, $flags = 0) { return json_encode($data, $flags); }
class WP_REST_Response {
    public $data;
    public function __construct($data, $status) { $this->data = $data; }
}

require dirname(__DIR__) . '/inc/template-helpers.php';
require dirname(__DIR__) . '/inc/cdn.php';
require dirname(__DIR__) . '/inc/custom-meta-boxes.php';
require dirname(__DIR__) . '/inc/seo-meta.php';
require dirname(__DIR__) . '/inc/rest-api-history.php';

$checks = 0;
function check($condition, $message) {
    if (!$condition) { throw new RuntimeException($message); }
    $GLOBALS['checks']++;
}

$asset_path = '/wp-content/themes/afct/dist/afct.min.js?ver=123#asset';
check(afct_cdn_url('https://example.org' . $asset_path) === 'https://example.org' . $asset_path, 'Development and other sites retain their own assets.');
$GLOBALS['test_home_url'] = 'https://www.africanface.org';
$cdn = 'https://africanface.b-cdn.net';
foreach (array('https://www.africanface.org', 'http://africanface.org', '//www.africanface.org', '') as $origin) {
    check(afct_cdn_url($origin . $asset_path) === $cdn . $asset_path, 'Production static URLs preserve version queries and fragments on the CDN.');
}
foreach (array(
    'https://third-party.org/wp-content/uploads/photo.jpg',
    'https://africanface.org.evil.org/wp-content/uploads/photo.jpg',
    'https://www.africanface.org/film/',
    'https://www.africanface.org/wp-json/afct/v1/history',
    'https://www.africanface.org/wp-admin/admin-ajax.php?file=image.jpg',
    '/wp-content/plugins/plugin/endpoint.php?file=image.jpg',
    '/wp-content/uploads/../private/image.jpg',
    '/wp-content/uploads/%2e%2e/private/image.jpg',
    '/wp-content/uploads/photo.jpg/endpoint.php',
    'https://user:password@www.africanface.org/wp-content/uploads/photo.jpg',
    'https://www.africanface.org:8443/wp-content/uploads/photo.jpg',
    'data:image/png;base64,abcd', '', '#section-film',
) as $url) {
    check(afct_cdn_url($url) === $url, 'Navigation, dynamic endpoints, third parties and unsupported URLs stay unchanged.');
}
$origin_image = 'https://www.africanface.org/wp-content/uploads/photo.jpg';
$cdn_image = $cdn . '/wp-content/uploads/photo.jpg';
$media = '<picture><source srcset="' . $origin_image . ' 640w, /wp-content/uploads/photo-large.webp 1280w"><img src="' . $origin_image . '" width="640" height="480"></picture>';
$rewritten_media = afct_cdn_media_html($media);
check(strpos($rewritten_media, 'src="' . $cdn_image . '"') !== false, 'Attachment image sources use the CDN.');
check(strpos($rewritten_media, 'srcset="' . $cdn_image . ' 640w, ' . $cdn . '/wp-content/uploads/photo-large.webp 1280w"') !== false, 'Responsive and WebP sources use the same CDN.');
check(strpos($rewritten_media, 'width="640" height="480"') !== false, 'Image dimensions survive CDN rewriting.');
$link = '<a href="' . $origin_image . '">Download</a><iframe src="https://show.7minus2.com/player"></iframe>';
check(afct_cdn_media_html($link) === $link, 'Media rewriting leaves links and third-party players alone.');
check(afct_cdn_url($cdn_image) === $cdn_image, 'CDN URLs are not rewritten twice.');
$GLOBALS['test_is_admin'] = true;
check(afct_cdn_url($origin_image) === $origin_image && afct_cdn_media_html($media) === $media, 'The editor and media library retain origin URLs.');
$GLOBALS['test_is_admin'] = false;
$GLOBALS['test_home_url'] = 'http://afct.test';
check(afct_cdn_url($origin_image) === $origin_image, 'Local previews never pull production media through the CDN.');
$GLOBALS['test_home_url'] = 'https://www.africanface.org';
define('AFCT_CDN_URL', '');
check(afct_cdn_url($origin_image) === $origin_image, 'The configuration switch disables CDN delivery immediately.');
unset($GLOBALS['test_home_url']);

$metadata[102]['_afct_menu_experimental'] = '1';
$sections = afct_get_homepage_sections();
check(count($sections) === (in_array('--empty-menu', $argv, true) ? 0 : 1), 'Render only unique public pages, excluding drafts, protected, experimental, missing and recursive pages.');
check(count(afct_get_homepage_sections(true)) === (in_array('--empty-menu', $argv, true) ? 0 : 2), 'Experimental preview still excludes private and recursive pages.');

foreach (array('https://youtu.be/h3euNUY3UfE', 'https://www.youtube.com/watch?v=h3euNUY3UfE&t=5', 'https://www.youtube-nocookie.com/embed/h3euNUY3UfE', 'https://youtube.com/shorts/h3euNUY3UfE') as $url) {
    check(afct_get_youtube_id($url) === 'h3euNUY3UfE', 'Support valid YouTube URL forms.');
}
foreach (array('', 'https://youtube.com.evil.org/watch?v=h3euNUY3UfE', 'https://youtu.be/invalid', 'https://youtube.com/watch?v[]=bad') as $url) {
    check(afct_get_youtube_id($url) === '', 'Reject invalid video IDs and untrusted hosts.');
}

$metadata[1]['_afct_podcast_chapters'] = array(array('time' => '10', 'title' => 'Existing'));
$metadata[1]['_afct_podcast_guests'] = array('existing');
$_POST = array('chapter_time' => array('0'), 'chapter_title' => array('Forged'), 'guest_image_id' => array());
afct_save_custom_meta_box_data(1);
check($metadata[1]['_afct_podcast_chapters'][0]['title'] === 'Existing', 'Forged chapter fields must not alter saved content.');
check($metadata[1]['_afct_podcast_guests'] === array('existing'), 'Forged guest fields must not alter saved content.');
$_POST = array();
afct_save_custom_meta_box_data(1);
check(isset($metadata[1]['_afct_podcast_chapters']), 'Unrelated saves preserve chapters.');
$_POST = array('afct_podcast_chapters_meta_box_nonce' => 'valid', 'chapter_time' => array('0'), 'chapter_title' => array('Start'));
afct_save_custom_meta_box_data(1);
check($metadata[1]['_afct_podcast_chapters'][0]['time'] === '0', 'A chapter at zero seconds must be saved.');
$can_edit = false;
$_POST = array('afct_podcast_chapters_meta_box_nonce' => 'valid');
afct_save_custom_meta_box_data(1);
check(isset($metadata[1]['_afct_podcast_chapters']), 'Unauthorized users cannot delete chapters.');
$can_edit = true;
afct_save_custom_meta_box_data(1);
check(!isset($metadata[1]['_afct_podcast_chapters']), 'An authorized intentional clear removes chapters.');

$_SERVER['REQUEST_URI'] = '/page-1/?utm_source=test&redirect=evil';
check(afct_get_canonical_url() === 'https://example.org/page-1/', 'Tracking input must not affect a singular canonical.');
ob_start();
afct_output_structured_data();
$json_ld = ob_get_clean();
check(substr_count($json_ld, '</script>') === 1, 'Structured data cannot terminate its script element through stored content.');
preg_match('~<script[^>]*>(.*)</script>~s', $json_ld, $matches);
check(is_array(json_decode($matches[1], true)), 'Structured data remains valid JSON.');

$metadata[1]['_afct_history_entries'] = 'bad legacy metadata';
check(afct_get_history_data(null)->data === array(), 'Malformed history metadata must return an empty response.');
$legacy = afct_normalize_history_entries(array(array(
    'year_start' => 1652, 'title' => 'Migration', 'paragraph' => 'Historical context',
    'animation_type' => 'migration', 'origin_points' => array(array(1, 2)),
    'destination_points' => array(array(3, 4)),
)));
check($legacy[0]['visualizations'][0]['destination'] === array(3, 4), 'Legacy migration overlays survive the embedded-data path.');
$legacy = afct_normalize_history_entries(array(array(
    'year_start' => 1800, 'animation_type' => 'language_development',
    'center_lng' => 25, 'center_lat' => -28, 'languages' => 'isiZulu, isiXhosa',
)));
check($legacy[0]['visualizations'][0]['languages'] === array('isiZulu', 'isiXhosa'), 'Legacy language map overlays retain their language labels.');

function get_the_title() { return 'Meet the Team'; }
function get_the_ID() { return 1; }
function esc_html($value) { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
function esc_attr($value) { return esc_html($value); }
function afct_split_headline($title, $variant = '') { return array('upper' => $title, 'lower' => ''); }
define('IN_ONEPAGER', true);
ob_start();
include dirname(__DIR__) . '/template-credits.php';
include dirname(__DIR__) . '/template-credits.php';
$credits_html = ob_get_clean();
check(substr_count($credits_html, 'Film Team') === 2, 'Different pages using the credits template can render in the same request.');
echo "Passed {$checks} regression checks.\n";
