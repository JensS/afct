<?php


function afct_add_custom_boxes() {
    global $post;
    if (!$post) return;

    $template_file = get_post_meta($post->ID, '_wp_page_template', true);

    switch ($template_file) {
        case 'template-homepage.php':
            add_meta_box(
                'homepage_sections_meta_box',
                'Homepage Sections',
                'afct_homepage_sections_meta_box_callback',
                'page',
                'normal',
                'high'
            );
            break;
        case 'template-podcast.php':
            add_meta_box(
                'podcast_audio_meta_box',
                'Podcast Audio',
                'afct_podcast_audio_meta_box_callback',
                'page',
                'normal',
                'high'
            );
            add_meta_box(
                'podcast_guests_meta_box',
                'Podcast Guests',
                'afct_podcast_guests_meta_box_callback',
                'page',
                'normal',
                'high'
            );
            add_meta_box(
                'podcast_chapters_meta_box',
                'Podcast Chapters',
                'afct_podcast_chapters_meta_box_callback',
                'page',
                'normal',
                'high'
            );
            break;
        case "template-intro.php":
            add_meta_box(
                "aboutproject_meta_box",
                "Intro About Project",
                "afct_about_intro_meta_box_callback",
                "page",
                "normal",
                "high"
            );
            break;
        case "template-herovideo.php":
            add_meta_box(
                "cover_cover",
                "Hero Video Cover Image",
                "afct_video_cover_image_meta_box_callback",
                "page",
                "normal",
                "high"
            );
            add_meta_box(
                "video_meta_box",
                "Hero Video",
                "afct_background_video_meta_box_callback",
                "page",
                "normal",
                "high"
            );
            break;
        case "template-film.php":
            add_meta_box(
                "afct_youtube_embed_meta_box_callback",
                "Youtube Embed",
                "afct_youtube_embed_meta_box_callback",
                "page",
                "normal",
                "high"
            );
            break;
        case "template-aboutserati.php":
            add_meta_box(
                "serati_meta_box",
                "About Serati Text",
                "afct_about_serati_meta_box_callback",
                "page",
                "normal",
                "high"
            );
            add_meta_box(
                "serati_image_meta_box",
                "About Serati Image",
                "afct_about_serati_image_meta_box_callback",
                "page",
                "normal",
                "high"
            );
            break;
        case "template-gallery.php":
            add_meta_box(
                'afct_gallery_meta_box', // id
                'Gallery Layout',         // title
                'afct_gallery_meta_box_html', // callback - changed from afct_gallery_images_meta_box_callback
                'page',                  // screen
                'normal',                // context
                'high'                   // priority
            );
            break;
        case "template-history.php":
            add_meta_box(
                'afct_history_meta_box',
                'History Timeline Entries',
                'afct_history_meta_box_callback',
                'page',
                'normal',
                'high'
            );
            break;
        case 'template-prospect.php':
            add_meta_box(
                'afct_prospect_slides_meta_box', // Unique ID for the meta box
                'Prospect Carousel Slides',      // Title of the meta box
                'afct_prospect_slides_meta_box_callback', // Callback function to render the fields
                'page',                          // Screen type (post type)
                'normal',                        // Context (where it appears)
                'high'                           // Priority
            );
            break;
        case 'template-credits.php':

            add_meta_box(
                'afct_credits_image_meta_box',
                'Credits Page Image',
                'afct_credits_image_meta_box_callback',
                'page',
                'normal',
                'high'
            );
            break;
        default:
            
    }
}
add_action('add_meta_boxes', 'afct_add_custom_boxes');
