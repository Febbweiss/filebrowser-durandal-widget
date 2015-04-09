define(['durandal/app', 'durandal/composition', 'plugins/http',
        'jquery', 'knockout', 'knockout.mapping',
        'perfect.scrollbar',
        './renameModal', './newItemModal'],
        function(app, composition,http, $, ko, ko_mapping, perfectScrollbar, RenameModal, NewItemModal) {

	ko.mapping = ko_mapping;
	
	ko.bindingHandlers['let'] = {
	    'init': function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
	        // Make a modified binding context, with extra properties, and apply it to descendant elements
	        var innerContext = bindingContext.extend(valueAccessor());
	        ko.applyBindingsToDescendants(innerContext, element);
	
	        return { controlsDescendantBindings: true };
	    }
	};
	ko.virtualElements.allowedBindings['let'] = true;
    
    var ctor = function() { },
        selected = ko.observableArray(),
        showContextMenu = ko.observable(false),
        copied = ko.observable(undefined),
        folder = ko.observable(ko.mapping.fromJS({children: []})),
        scrollable = $('#filebrowser'),
        cachedData;

    ctor.prototype.activate = function(settings) {
        this.settings = settings;
        this.selected = selected;
        this.hasCopied = ko.computed( function() {
           return copied() !== undefined;
        });
        this.showContextMenu = showContextMenu;
        this.folder = folder;
        scrollable.perfectScrollbar();
    };

    ctor.prototype.openFile = function(object, event) {
        console.log('File dblclick ', arguments);
    };
    ctor.prototype.select = function(object, event) {
        if( !event.ctrlKey ) {
            $('li > span.select').removeClass('select');
            selected.removeAll();
        }
        $(event.target).toggleClass('select');
        selected.push( ko.mapping.fromJS(object) );
    };
    ctor.prototype.openFolder = function(event) {
        var id = arguments[0].uuid();
    	console.log('openFolder', id);
        $('input[type=checkbox][id=' + id + ']').click();
        $('#icon_folder_' + id).toggleClass('fa-folder-o').toggleClass('fa-folder-open-o');
        $('#filebrowser').perfectScrollbar('update');
    };
    
    /** Context Menu **/

    ctor.prototype.openContextMenu = function(object, event) {
        console.log('openContextMenu');
        selected( ko.mapping.fromJS(object) );
        // Position du menu, calculer la pos pour eviter sortie du viewport
        var posX = event.pageX,
            posY = event.pageY,
            windowWidth = $(window).width(),
            windowHeight = $(window).height(),
            contextMenu = $('#fileBrowserContextMenu'),
            menuWidth = contextMenu.width(),
            menuHeight = contextMenu.height();

        posX = Math.min(posX - 45, windowWidth - menuWidth - 15);
        posY = Math.min(posY - 80, windowHeight - menuHeight - 10);

        // affichage
        contextMenu.css({
            left : posX + 'px',
            top : posY + 'px'
        });

        showContextMenu(true);
    };

    ctor.prototype.openRenamePopup = function(ctor, event) {
        RenameModal.show(ctor.selected().name()).then(function(response) {
            if( response !== undefined ) {
                ctor.selected().name(response);
            }
        });
    };

    ctor.prototype.openDeletePopup = function(ctor, event) {
        app.showMessage(
            'Are you sure you want to delete this ' +
                (ctor.selected().is_folder ? ' folder and all its content' : 'file') + '?',
            'Delete ' + ctor.selected().name(), [ { text: "Yes", value: "yes" }, { text: "No", value: "no" }]).then( function( dialogResult ) {
                if( dialogResult === 'yes' ) {
                    console.log('Deleting', ctor.selected().name());
                }
            });
    };

    ctor.prototype.copy = function(ctor, event) {
        console.log('Copied', ctor.selected().name());
        copied( ctor.selected() );
    };

    ctor.prototype.paste = function(ctor, event) {
        if( copied() !== undefined ) {
            console.log('Paste', copied().name(), 'into', ctor.selected().name());
            copied( undefined );
        }
    };

    ctor.prototype.newItem = function(ctor, event) {
        NewItemModal.show().then(function(response) {
            if( response !== undefined ) {
                console.log('New item : ' + response.type + ' - ' + response.name );
            }
        });
    };

    $(document).on('click', function() {
        showContextMenu(false);
    });
    /** End of Context Menu */

  	http.get('/data/filesystem.json').then(function(response) {
     	console.log(response);
        folder(ko.mapping.fromJS(response));
        $('#filebrowser').perfectScrollbar();
   });

    return ctor;
});