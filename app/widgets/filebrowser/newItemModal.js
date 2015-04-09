define(['plugins/dialog', 'knockout', 'knockout.validation'], function (dialog, ko, ko_validation) {

    ko.validation = ko_validation;

    var NewItemModal = function() {
        var self = this;
        self.input = ko.observable('').extend({
            required: true,
            pattern: {
                message : 'The name must not contain a \'/\'',
                params  : '^[^/]+$'
            }
        });
        self.typeItem = ko.observable('file');
        self.form = ko.validatedObservable( {input: self.input} );
        self.isValid = ko.computed(function() {
            return self.form.isValid();
        });
    };

    NewItemModal.prototype.ok = function() {
        dialog.close(this, { name: this.input(), type: this.typeItem()});
    };

    NewItemModal.prototype.close = function() {
        dialog.close(this);
    };

    NewItemModal.show = function(defaultValue){
        return dialog.show(new NewItemModal(defaultValue));
    };

    return NewItemModal;
});