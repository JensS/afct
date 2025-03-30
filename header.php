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

<body data-scroll-container <?php body_class('body-main'); ?>>
<?php wp_body_open(); ?>
<header id="masthead" class="site-header">
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

<div class="menu theme-toggler">
	<ul>
		<div class="theme-toggle">
			<div class="embed-menu-line w-embed" style="position:relative;">
				<svg width="24" height="1" viewBox="0 0 24 1" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="24" height="1" transform="matrix(1 0 0 -1 0 1)" fill="currentColor"></rect>
				</svg>
			</div>
			<div class="theme-toggle-text">Toggle dark/light</div>
		</div>
	</ul>
</div>