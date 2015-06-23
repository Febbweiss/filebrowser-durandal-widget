requirejs.config({
	paths: {
		'text'						: '../lib/requirejs-text/text',
		'durandal'					: '../lib/durandal/js',
		'plugins'					: '../lib/durandal/js/plugins',
		'transitions'				: '../lib/durandal/js/transitions',
		'knockout'					: '../lib/knockout.js/knockout',
		'knockout.mapping'		: '../lib/bower-knockout-mapping/dist/knockout.mapping.min',
		'knockout.validation'	: '../lib/knockout-validation/dist/knockout.validation.min',
		'jquery'						: '../lib/jquery/jquery.min',
		'perfect.scrollbar'		: '../lib/perfect-scrollbar/js/perfect-scrollbar.jquery',
		'highlightjs'				: '../lib/highlightjs/highlight.pack'
	},
	shim: {
		'knockout.mapping': {
			deps: ['knockout'],
			exports: 'knockout.mapping'
		},
		'knockout.validation': {
			deps: ['knockout'],
			exports: 'knockout.validation'
		}
	}
});

define(['durandal/system', 'durandal/app'], function (system, app) {
	system.debug(true);

	app.title = 'File browser Durandal Widget';

	app.configurePlugins({
		router	: true,
		dialog	: true,
		widget	: {
			kinds: [
				'filebrowser'
			]
		}
	});

	app.start().then(function() {
		app.setRoot('shell');
	});
});
