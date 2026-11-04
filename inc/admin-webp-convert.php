<?php
/**
 * Admin: Bulk WebP Conversion Tool
 *
 * Finds every image that is actually referenced somewhere in the site —
 * featured images, gallery, podcast guests, Serati image, credits image,
 * and prospect carousel slides — then generates a .webp counterpart for each
 * original file and all its thumbnail sizes. Files that already have a WebP
 * version on disk are silently skipped.
 *
 * Accessible at Tools → Convert Images to WebP
 *
 * @package AFCT
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ---------------------------------------------------------------------------
// Image discovery
// ---------------------------------------------------------------------------

/**
 * Return an array of unique JPEG/PNG attachment IDs that are actually
 * referenced somewhere in the site's content or meta boxes.
 *
 * Sources:
 *   1. Featured images  (_thumbnail_id)
 *   2. Attachments with a post parent (inserted via editor)
 *   3. Gallery images   (_afct_gallery_images)  — stores 'id' or URL
 *   4. Podcast guests   (_afct_podcast_guests)  — stores URL
 *   5. Serati image     (_afct_about_serati_image) — stores array with 'id'
 *   6. Credits image    (_afct_credits_image)   — stores array with 'id'
 *   7. Prospect slides  (_afct_prospect_slides) — stores 'image_id'
 *
 * @return int[]
 */
function afct_webp_collect_in_use_ids() {
    global $wpdb;
    $ids = array();

    // 1. Featured images
    $rows = $wpdb->get_col(
        "SELECT DISTINCT meta_value
           FROM $wpdb->postmeta
          WHERE meta_key = '_thumbnail_id'
            AND meta_value != ''"
    );
    foreach ( $rows as $id ) {
        $ids[] = (int) $id;
    }

    // 2. Attachments that are children of a post
    $rows = $wpdb->get_col(
        "SELECT ID FROM $wpdb->posts
          WHERE post_type   = 'attachment'
            AND post_parent > 0"
    );
    foreach ( $rows as $id ) {
        $ids[] = (int) $id;
    }

    // 3. Gallery images — may store 'id' directly; fall back to URL lookup
    $rows = $wpdb->get_col(
        "SELECT meta_value FROM $wpdb->postmeta
          WHERE meta_key = '_afct_gallery_images'
            AND meta_value != ''"
    );
    foreach ( $rows as $row ) {
        $images = maybe_unserialize( $row );
        if ( ! is_array( $images ) ) {
            continue;
        }
        foreach ( $images as $img ) {
            if ( ! empty( $img['id'] ) ) {
                $ids[] = (int) $img['id'];
            } elseif ( ! empty( $img['url'] ) ) {
                $att_id = attachment_url_to_postid( $img['url'] );
                if ( $att_id ) {
                    $ids[] = (int) $att_id;
                }
            }
        }
    }

    // 4. Podcast guest images — URL only
    $rows = $wpdb->get_col(
        "SELECT meta_value FROM $wpdb->postmeta
          WHERE meta_key = '_afct_podcast_guests'
            AND meta_value != ''"
    );
    foreach ( $rows as $row ) {
        $guests = maybe_unserialize( $row );
        if ( ! is_array( $guests ) ) {
            continue;
        }
        foreach ( $guests as $guest ) {
            if ( ! empty( $guest['image'] ) ) {
                $att_id = attachment_url_to_postid( $guest['image'] );
                if ( $att_id ) {
                    $ids[] = (int) $att_id;
                }
            }
        }
    }

    // 5 & 6. Serati and credits images — array with 'id' key
    foreach ( array( '_afct_about_serati_image', '_afct_credits_image' ) as $key ) {
        $rows = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT meta_value FROM $wpdb->postmeta
                  WHERE meta_key = %s AND meta_value != ''",
                $key
            )
        );
        foreach ( $rows as $row ) {
            $data = maybe_unserialize( $row );
            if ( is_array( $data ) && ! empty( $data['id'] ) ) {
                $ids[] = (int) $data['id'];
            }
        }
    }

    // 7. Prospect carousel slides — integer 'image_id'
    $rows = $wpdb->get_col(
        "SELECT meta_value FROM $wpdb->postmeta
          WHERE meta_key = '_afct_prospect_slides'
            AND meta_value != ''"
    );
    foreach ( $rows as $row ) {
        $slides = maybe_unserialize( $row );
        if ( ! is_array( $slides ) ) {
            continue;
        }
        foreach ( $slides as $slide ) {
            if ( ! empty( $slide['image_id'] ) ) {
                $ids[] = (int) $slide['image_id'];
            }
        }
    }

    // Deduplicate and filter to JPEG/PNG only
    $ids       = array_unique( array_filter( $ids ) );
    $valid_ids = array();
    foreach ( $ids as $id ) {
        $mime = get_post_mime_type( $id );
        if ( in_array( $mime, array( 'image/jpeg', 'image/png' ), true ) ) {
            $valid_ids[] = $id;
        }
    }

    return array_values( $valid_ids );
}

// ---------------------------------------------------------------------------
// Per-attachment conversion
// ---------------------------------------------------------------------------

/**
 * Convert a single attachment (full size + all registered thumbnail sizes)
 * to WebP. Returns tallies: converted, skipped (already exists), failed.
 *
 * @param  int   $attachment_id
 * @return array{converted:int, skipped:int, failed:int}
 */
function afct_webp_convert_one_attachment( $attachment_id ) {
    $result    = array( 'converted' => 0, 'skipped' => 0, 'failed' => 0 );
    $mime_type = get_post_mime_type( $attachment_id );

    if ( ! in_array( $mime_type, array( 'image/jpeg', 'image/png' ), true ) ) {
        $result['skipped']++;
        return $result;
    }

    $metadata   = wp_get_attachment_metadata( $attachment_id );
    $upload_dir = wp_upload_dir();
    $base_dir   = untrailingslashit( $upload_dir['basedir'] );

    // Build list of files to process
    $files = array();

    if ( ! empty( $metadata['file'] ) ) {
        $files[] = $base_dir . '/' . $metadata['file']; // full-size
    } else {
        $path = get_attached_file( $attachment_id );
        if ( $path ) {
            $files[] = $path;
        }
    }

    if ( ! empty( $metadata['sizes'] ) && ! empty( $metadata['file'] ) ) {
        $sub_dir = trailingslashit( $base_dir . '/' . dirname( $metadata['file'] ) );
        foreach ( $metadata['sizes'] as $size ) {
            if ( ! empty( $size['file'] ) ) {
                $files[] = $sub_dir . $size['file'];
            }
        }
    }

    foreach ( $files as $file_path ) {
        if ( ! file_exists( $file_path ) ) {
            continue;
        }

        $webp_path = preg_replace( '/\.[^.]+$/', '.webp', $file_path );

        if ( file_exists( $webp_path ) ) {
            $result['skipped']++;
            continue;
        }

        afct_convert_image_to_webp( $file_path, $mime_type );

        if ( file_exists( $webp_path ) ) {
            $result['converted']++;
        } else {
            $result['failed']++;
        }
    }

    return $result;
}

// ---------------------------------------------------------------------------
// AJAX endpoints
// ---------------------------------------------------------------------------

/**
 * Return the full queue of in-use attachment IDs.
 */
function afct_ajax_webp_get_queue() {
    check_ajax_referer( 'afct_webp_convert', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Permission denied.' );
    }
    $ids = afct_webp_collect_in_use_ids();
    wp_send_json_success( array( 'ids' => $ids ) );
}
add_action( 'wp_ajax_afct_webp_get_queue', 'afct_ajax_webp_get_queue' );

/**
 * Convert one attachment and return per-file tallies.
 */
function afct_ajax_webp_convert_one() {
    check_ajax_referer( 'afct_webp_convert', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Permission denied.' );
    }
    $attachment_id = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;
    if ( ! $attachment_id ) {
        wp_send_json_error( 'Invalid ID.' );
    }
    $result          = afct_webp_convert_one_attachment( $attachment_id );
    $result['title'] = get_the_title( $attachment_id );
    wp_send_json_success( $result );
}
add_action( 'wp_ajax_afct_webp_convert_one', 'afct_ajax_webp_convert_one' );

// ---------------------------------------------------------------------------
// Admin page
// ---------------------------------------------------------------------------

function afct_webp_admin_menu() {
    add_management_page(
        'Convert Images to WebP',
        'Convert to WebP',
        'manage_options',
        'afct-webp-convert',
        'afct_webp_admin_page'
    );
}
add_action( 'admin_menu', 'afct_webp_admin_menu' );

function afct_webp_admin_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $gd_ok = function_exists( 'imagewebp' );
    ?>
    <div class="wrap">
        <h1>Convert Images to WebP</h1>

        <p>Scans every image <em>actually in use</em> on this site — featured images, gallery, podcast guests, Serati image, credits image, and prospect carousel slides — and generates a <code>.webp</code> file alongside each original. All registered thumbnail sizes are included. Files that already have a <code>.webp</code> counterpart are skipped.</p>

        <?php if ( ! $gd_ok ) : ?>
            <div class="notice notice-error">
                <p><strong>PHP GD does not have WebP support on this server.</strong> Contact your hosting provider to enable <code>imagewebp()</code>.</p>
            </div>
        <?php else : ?>
            <p style="color:#2a7a2a;font-weight:600;">✓ GD with WebP support detected.</p>

            <p>
                <button id="afct-webp-start" class="button button-primary button-large">Scan &amp; Convert</button>
                <button id="afct-webp-stop" class="button button-large" style="display:none;margin-left:8px;">Stop</button>
            </p>

            <div id="afct-webp-status" style="margin-top:20px;display:none;">
                <div style="background:#e0e0e0;border-radius:4px;height:20px;width:100%;max-width:600px;overflow:hidden;">
                    <div id="afct-webp-bar" style="background:#0073aa;height:100%;width:0%;transition:width .3s ease;"></div>
                </div>
                <p id="afct-webp-label" style="margin-top:8px;color:#555;font-style:italic;"></p>
            </div>

            <div id="afct-webp-results" style="margin-top:24px;display:none;">
                <h2 style="margin-top:0;">Results</h2>
                <table class="widefat striped" style="max-width:540px;">
                    <thead>
                        <tr><th>Metric</th><th style="text-align:right;">Count</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Unique images found (in use)</td><td id="r-total" style="text-align:right;">—</td></tr>
                        <tr><td>Files newly converted to WebP</td><td id="r-converted" style="text-align:right;">—</td></tr>
                        <tr><td>Files already had WebP (skipped)</td><td id="r-skipped" style="text-align:right;">—</td></tr>
                        <tr><td>Failed (source missing / GD error)</td><td id="r-failed" style="text-align:right;">—</td></tr>
                    </tbody>
                </table>
            </div>

            <script>
            (function ($) {
                var queue   = [];
                var stopped = false;
                var totals  = { converted: 0, skipped: 0, failed: 0 };
                var nonce   = '<?php echo wp_create_nonce( 'afct_webp_convert' ); ?>';

                $('#afct-webp-start').on('click', function () {
                    stopped = false;
                    totals  = { converted: 0, skipped: 0, failed: 0 };

                    $(this).prop('disabled', true).text('Scanning…');
                    $('#afct-webp-stop').show().prop('disabled', false).text('Stop');
                    $('#afct-webp-status').show();
                    $('#afct-webp-results').hide();
                    $('#afct-webp-bar').css('width', '0%');
                    $('#afct-webp-label').text('Finding images in use…');

                    $.post(ajaxurl, { action: 'afct_webp_get_queue', nonce: nonce }, function (resp) {
                        if (!resp.success) {
                            alert('Error: ' + resp.data);
                            reset();
                            return;
                        }
                        queue = resp.data.ids;
                        if (queue.length === 0) {
                            $('#afct-webp-label').text('No eligible images found.');
                            reset();
                            return;
                        }
                        $('#r-total').text(queue.length);
                        processNext(0);
                    });
                });

                $('#afct-webp-stop').on('click', function () {
                    stopped = true;
                    $(this).prop('disabled', true).text('Stopping…');
                });

                function processNext(index) {
                    if (stopped || index >= queue.length) {
                        finish(index);
                        return;
                    }

                    var pct = Math.round((index / queue.length) * 100);
                    $('#afct-webp-bar').css('width', pct + '%');
                    $('#afct-webp-label').text('Processing ' + (index + 1) + ' of ' + queue.length + '…');

                    $.post(ajaxurl, { action: 'afct_webp_convert_one', nonce: nonce, id: queue[index] }, function (resp) {
                        if (resp.success) {
                            totals.converted += resp.data.converted;
                            totals.skipped   += resp.data.skipped;
                            totals.failed    += resp.data.failed;
                        }
                        processNext(index + 1);
                    }).fail(function () {
                        // Network error: skip this attachment and continue
                        processNext(index + 1);
                    });
                }

                function finish(processed) {
                    $('#afct-webp-bar').css('width', '100%');
                    var msg = stopped
                        ? 'Stopped after processing ' + processed + ' of ' + queue.length + ' images.'
                        : 'Done! All ' + queue.length + ' images processed.';
                    $('#afct-webp-label').text(msg);
                    $('#r-converted').text(totals.converted);
                    $('#r-skipped').text(totals.skipped);
                    $('#r-failed').text(totals.failed);
                    $('#afct-webp-results').show();
                    reset();
                }

                function reset() {
                    $('#afct-webp-start').prop('disabled', false).text('Scan & Convert');
                    $('#afct-webp-stop').hide();
                }
            }(jQuery));
            </script>
        <?php endif; ?>
    </div>
    <?php
}
