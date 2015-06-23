define(['durandal/app', 'knockout', 'highlightjs'], function (app, ko) {
	var type = ko.observable(),
		content = ko.observable();
	
	var sub = app.on('filebrowser:open_file').then(function(message) {
		type(message.type);
		if( message.type === "json" ) {
			content(ko.utils.stringifyJson(message.content));
		} else {
        	content(message.content);
        }
        hljs.highlightBlock($('#editor')[0]);
    }, this);


	return {
		attached: function () {
			hljs.configure({
			  tabReplace: '  '
			});
			hljs.initHighlighting();
		},
		type: type,
		content: content
	};
});