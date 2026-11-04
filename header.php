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

	<?php
	wp_head();
	?>
</head>

<body id="afct-body" <?php body_class('body-main'); ?>>
	<?php wp_body_open(); ?>
	<header id="masthead" class="site-header">
		<nav id="site-navigation" class="menu">
			<button
				class="menu-toggle"
				type="button"
				aria-controls="primary-menu"
				aria-expanded="false"
			>
				<span class="screen-reader-text"><?php esc_html_e( 'Toggle navigation', 'afct' ); ?></span>
			</button>
			<?php
				wp_nav_menu(
				array(
					'theme_location' => 'menu-1',
					'menu_id'        => 'primary-menu',
					'walker'         => new AFCT_Menu_Walker(),
					'fallback_cb'    => false,
				)
			);
		?>
	</nav>
</header>

<div id="smooth-wrapper">
<div id="smooth-content">
