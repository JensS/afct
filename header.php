<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package AFCT
 */

?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">

	<?php wp_head(); ?>
</head>

<body <?php body_class('body-main'); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site">
	<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', 'afct' ); ?></a>

	<header id="masthead" class="site-header">
		<div class="site-branding"></div>

		<nav id="site-navigation" class="menu">
			<?php
				wp_nav_menu(
					array(
						'theme_location' => 'menu-1',
						'menu_id'        => 'primary-menu',
						'walker'         => new AFCT_Menu_Walker(),
					)
				);
			?>
		</nav>
	</header>

	<!-- Theme Toggle Button -->
	<div id="theme-toggle-btn" class="theme-toggle">
		<div class="theme-toggle-inner">
			<span class="theme-toggle-text">Toggle dark/light</span>
		</div>
	</div>
</div>
