<?php

// ---------------------------------------------------------------------------
// Meta box renderers
// ---------------------------------------------------------------------------

function afct_awards_laurels_meta_box_callback( $post ) {
    wp_nonce_field( 'afct_save_awards_laurels_data', 'afct_awards_laurels_nonce' );
    $laurels = get_post_meta( $post->ID, '_afct_awards_laurels', true );
    if ( empty( $laurels ) ) $laurels = [];
    ?>
    <style>
        .laurel-row { border: 1px solid #ddd; padding: 10px; margin-bottom: 8px; background: #fafafa; display: flex; gap: 12px; align-items: flex-start; }
        .laurel-row .laurel-fields { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .laurel-row label { display: block; font-size: 11px; color: #666; margin-bottom: 2px; }
        .laurel-row input[type=text] { width: 100%; }
        .laurel-thumb { width: 60px; height: 60px; object-fit: contain; display: block; margin-top: 4px; }
        .laurel-image-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 80px; }
    </style>
    <div id="laurels-wrapper">
        <?php foreach ( $laurels as $i => $laurel ) : ?>
        <div class="laurel-row">
            <div class="laurel-image-wrap">
                <input type="hidden" name="laurel_image[]" value="<?php echo esc_attr( $laurel['image'] ?? '' ); ?>">
                <?php if ( !empty( $laurel['image'] ) ) : ?>
                <img src="<?php echo esc_url( $laurel['image'] ); ?>" class="laurel-thumb" alt="">
                <?php endif; ?>
                <button type="button" class="upload_laurel_image button button-small">Image</button>
                <button type="button" class="remove-laurel-image button button-small" style="color:#c00">✕</button>
            </div>
            <div class="laurel-fields">
                <div>
                    <label>Festival / Award name</label>
                    <input type="text" name="laurel_title[]" value="<?php echo esc_attr( $laurel['title'] ?? '' ); ?>">
                </div>
                <div>
                    <label>Category / Award</label>
                    <input type="text" name="laurel_award[]" value="<?php echo esc_attr( $laurel['award'] ?? '' ); ?>">
                </div>
                <div>
                    <label>Year</label>
                    <input type="text" name="laurel_year[]" value="<?php echo esc_attr( $laurel['year'] ?? '' ); ?>" style="width:80px">
                </div>
                <div>
                    <label>Type</label>
                    <select name="laurel_type[]">
                        <option value="nomination" <?php selected( $laurel['type'] ?? '', 'nomination' ); ?>>Nomination</option>
                        <option value="win" <?php selected( $laurel['type'] ?? '', 'win' ); ?>>Win</option>
                        <option value="official-selection" <?php selected( $laurel['type'] ?? '', 'official-selection' ); ?>>Official Selection</option>
                    </select>
                </div>
            </div>
            <button type="button" class="remove-laurel button button-small" style="align-self:center;color:#c00">Remove</button>
        </div>
        <?php endforeach; ?>
    </div>
    <button type="button" id="add-laurel" class="button">+ Add Laurel</button>

    <script>
    jQuery(document).ready(function($) {
        $('#add-laurel').on('click', function() {
            $('#laurels-wrapper').append(`
                <div class="laurel-row">
                    <div class="laurel-image-wrap">
                        <input type="hidden" name="laurel_image[]" value="">
                        <button type="button" class="upload_laurel_image button button-small">Image</button>
                        <button type="button" class="remove-laurel-image button button-small" style="color:#c00">✕</button>
                    </div>
                    <div class="laurel-fields">
                        <div><label>Festival / Award name</label><input type="text" name="laurel_title[]" value=""></div>
                        <div><label>Category / Award</label><input type="text" name="laurel_award[]" value=""></div>
                        <div><label>Year</label><input type="text" name="laurel_year[]" value="" style="width:80px"></div>
                        <div><label>Type</label>
                            <select name="laurel_type[]">
                                <option value="nomination">Nomination</option>
                                <option value="win">Win</option>
                                <option value="official-selection">Official Selection</option>
                            </select>
                        </div>
                    </div>
                    <button type="button" class="remove-laurel button button-small" style="align-self:center;color:#c00">Remove</button>
                </div>
            `);
        });

        $(document).on('click', '.remove-laurel', function() {
            $(this).closest('.laurel-row').remove();
        });

        $(document).on('click', '.remove-laurel-image', function() {
            var wrap = $(this).closest('.laurel-image-wrap');
            wrap.find('input[type=hidden]').val('');
            wrap.find('img').remove();
        });

        $(document).on('click', '.upload_laurel_image', function(e) {
            e.preventDefault();
            var btn = $(this);
            wp.media({
                title: 'Select Laurel Image',
                button: { text: 'Use this image' },
                multiple: false
            }).on('select', function() {
                var att = wp.media.frame.state().get('selection').first().toJSON();
                var wrap = btn.closest('.laurel-image-wrap');
                wrap.find('input[type=hidden]').val(att.url);
                wrap.find('img').remove();
                btn.before('<img src="' + att.url + '" class="laurel-thumb" alt="">');
            }).open();
        });
    });
    </script>
    <?php
}

function afct_awards_articles_meta_box_callback( $post ) {
    wp_nonce_field( 'afct_save_awards_articles_data', 'afct_awards_articles_nonce' );
    $articles = get_post_meta( $post->ID, '_afct_awards_articles', true );
    if ( empty( $articles ) ) $articles = [];
    ?>
    <style>
        .article-row { border: 1px solid #ddd; padding: 10px; margin-bottom: 6px; background: #fafafa; display: grid; grid-template-columns: 2fr 1fr 2fr 1fr auto; gap: 8px; align-items: end; }
        .article-row label { display: block; font-size: 11px; color: #666; margin-bottom: 2px; }
        .article-row input { width: 100%; }
    </style>
    <div id="articles-wrapper">
        <?php foreach ( $articles as $article ) : ?>
        <div class="article-row">
            <div><label>Article title</label><input type="text" name="article_title[]" value="<?php echo esc_attr( $article['title'] ?? '' ); ?>"></div>
            <div><label>Publication</label><input type="text" name="article_publication[]" value="<?php echo esc_attr( $article['publication'] ?? '' ); ?>"></div>
            <div><label>URL</label><input type="url" name="article_url[]" value="<?php echo esc_attr( $article['url'] ?? '' ); ?>"></div>
            <div><label>Date</label><input type="text" name="article_date[]" value="<?php echo esc_attr( $article['date'] ?? '' ); ?>" placeholder="e.g. Jan 2025"></div>
            <button type="button" class="remove-article button button-small" style="color:#c00">Remove</button>
        </div>
        <?php endforeach; ?>
    </div>
    <button type="button" id="add-article" class="button">+ Add Article</button>

    <script>
    jQuery(document).ready(function($) {
        $('#add-article').on('click', function() {
            $('#articles-wrapper').append(`
                <div class="article-row">
                    <div><label>Article title</label><input type="text" name="article_title[]" value=""></div>
                    <div><label>Publication</label><input type="text" name="article_publication[]" value=""></div>
                    <div><label>URL</label><input type="url" name="article_url[]" value=""></div>
                    <div><label>Date</label><input type="text" name="article_date[]" value="" placeholder="e.g. Jan 2025"></div>
                    <button type="button" class="remove-article button button-small" style="color:#c00">Remove</button>
                </div>
            `);
        });

        $(document).on('click', '.remove-article', function() {
            $(this).closest('.article-row').remove();
        });
    });
    </script>
    <?php
}

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

function afct_save_awards_meta( $post_id ) {
    if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    // Save laurels
    if ( isset( $_POST['afct_awards_laurels_nonce'] ) &&
         wp_verify_nonce( $_POST['afct_awards_laurels_nonce'], 'afct_save_awards_laurels_data' ) ) {

        $titles = $_POST['laurel_title']       ?? [];
        $awards = $_POST['laurel_award']       ?? [];
        $years  = $_POST['laurel_year']        ?? [];
        $types  = $_POST['laurel_type']        ?? [];
        $images = $_POST['laurel_image']       ?? [];
        $laurels = [];

        for ( $i = 0; $i < count( $titles ); $i++ ) {
            if ( empty( $titles[$i] ) && empty( $images[$i] ) ) continue;
            $laurels[] = [
                'title' => sanitize_text_field( $titles[$i] ?? '' ),
                'award' => sanitize_text_field( $awards[$i] ?? '' ),
                'year'  => sanitize_text_field( $years[$i]  ?? '' ),
                'type'  => sanitize_key( $types[$i] ?? 'nomination' ),
                'image' => esc_url_raw( $images[$i] ?? '' ),
            ];
        }
        update_post_meta( $post_id, '_afct_awards_laurels', $laurels );
    }

    // Save articles
    if ( isset( $_POST['afct_awards_articles_nonce'] ) &&
         wp_verify_nonce( $_POST['afct_awards_articles_nonce'], 'afct_save_awards_articles_data' ) ) {

        $titles    = $_POST['article_title']       ?? [];
        $pubs      = $_POST['article_publication'] ?? [];
        $urls      = $_POST['article_url']         ?? [];
        $dates     = $_POST['article_date']        ?? [];
        $articles  = [];

        for ( $i = 0; $i < count( $titles ); $i++ ) {
            if ( empty( $titles[$i] ) && empty( $urls[$i] ) ) continue;
            $articles[] = [
                'title'       => sanitize_text_field( $titles[$i] ?? '' ),
                'publication' => sanitize_text_field( $pubs[$i]   ?? '' ),
                'url'         => esc_url_raw( $urls[$i]  ?? '' ),
                'date'        => sanitize_text_field( $dates[$i]  ?? '' ),
            ];
        }
        update_post_meta( $post_id, '_afct_awards_articles', $articles );
    }
}
add_action( 'save_post', 'afct_save_awards_meta' );
