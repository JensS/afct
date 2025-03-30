<?php
/**
 * Template Name: Imprint
 * Template Post Type: page
 */

 if(!defined("IN_ONEPAGER")) 
 get_header();

?>

<section id="imprint" class="slide">
    <?php
    $headline_parts = afct_split_headline(get_the_title());
    ?>
    <div class="text-upper-left">
        <h1><?php echo esc_html($headline_parts['upper']); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html($headline_parts['lower']); ?></h1>
    </div>
    <div class="global-container">
            <div class="imprint-section" data-scroll data-scroll-speed="2"  >
                <h3>Information according to § 5 TMG (Telemediengesetz):</h3>
                
                <div class="imprint-info">
                    <h4>Website Owner & Responsible for Content:</h4>
                    <p>Jens Sage</p>
                    <p>Prenzlauer Allee 86K</p>
                    <p>10405 Berlin</p>
                    <p>Germany</p>
                </div>
                
                <div class="imprint-info">
                    <h4>Contact Information:</h4>
                    <p>Phone: +49 162 45 11 591</p>
                    <p>Email: contact@jenssage.com</p>
                </div>
                
                <div class="imprint-info">
                    <h4>Disclaimer:</h4>
                    <p>All content on this website is created with great care. However, I do not guarantee the accuracy, completeness, or timeliness of the content. If you notice any errors or have any concerns, please feel free to contact me.</p>
                </div>
                
                <div class="imprint-info">
                    <h4>Liability for Links:</h4>
                    <p>My website may contain links to external websites. I have no influence on the content of these websites and therefore cannot assume any liability for them. The respective providers or operators of the linked websites are responsible for their content.</p>
                </div>
                
                <div class="imprint-info">
                    <h4>Copyright:</h4>
                    <p>All content and works on this website are subject to copyright law. Any duplication, processing, distribution, or any form of commercialization of such material beyond the scope of the copyright law shall require the prior written consent of the author or authors.</p>
                </div>
        </div>
    </div>
</section>

<?php
 if(!defined("IN_ONEPAGER")) 
get_footer();
