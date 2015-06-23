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
    
    var ctor = function() {},
        selected = ko.observable(),
        showContextMenu = ko.observable(),
        copied = ko.observable(undefined),
        folder = ko.observable(ko.mapping.fromJS({children: []})),
        scrollable = $('#filebrowser');

	ctor.prototype.attached = function() {
     showContextMenu(false);
		$('#filebrowser').perfectScrollbar();
	};
	
    ctor.prototype.activate = function(settings) {
        this.settings = settings;
		this.selected = selected;
		this.folder = folder;
		this.showContextMenu = showContextMenu;
      this.hasSelectedFolder = ko.computed(function() {
        return selected() != undefined && selected().type === 'folder';
      });
      this.hasCopied = ko.computed( function() {
        return copied() !== undefined;
      });
    };

    ctor.prototype.open = function(object,event) {
    	console.log('Opening', object);
    	if( object.type() === 'folder' ) {
	        var id = object.uuid(),
	        	checkbox = $('input[type=checkbox][id=' + id + ']');
	        	
	        checkbox.prop('checked', !checkbox.prop('checked'));
	        $('#icon_folder_' + id).toggleClass('fa-folder-o').toggleClass('fa-folder-open-o');
	        
	        $('#filebrowser').perfectScrollbar('update');
		} else {
 			var type = object.extra();
	        http.get(object.path()).then(function(response) {
		        app.trigger('filebrowser:open_file', {
		        	type: type,
		        	content: response
		        });
		   });
		}
    };
    
    ctor.prototype.select = function(object, event) {
        $('li > span.select').removeClass('select');
        $(event.target).toggleClass('select');
        selected( ko.mapping.fromJS(object) );
    };
    
    /** Context Menu **/

    ctor.prototype.openContextMenu = function(object, event) {
        // Position du menu, calculer la pos pour eviter sortie du viewport
        var posX = event.pageX,
            posY = event.pageY,
            windowWidth = $(window).width(),
            windowHeight = $(window).height(),
            contextMenu = $('#fileBrowserContextMenu'),
            menuWidth = contextMenu.width(),
            menuHeight = contextMenu.height();

			posX = Math.min(posX, windowWidth - menuWidth - 15);
			posY = Math.min(posY, windowHeight - menuHeight - 10);

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
        folder(ko.mapping.fromJS(response));
        $('#filebrowser').perfectScrollbar('update');
   });

    return ctor;
});