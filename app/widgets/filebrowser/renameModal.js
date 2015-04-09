define(['plugins/dialog', 'knockout', , 'knockout.validation'], function (dialog, ko, ko_validation) {

    ko.validation = ko_validation;

    var RenameModal = function(defaultValue) {
        var self = this;
        self.previousName = defaultValue;
        self.input = ko.observable(defaultValue).extend({
            required: true,
            pattern: {
                message : 'The name must not contain a \'/\'',
                params  : '^[^/]+$'
            }
        });
        self.form = ko.validatedObservable( {input: self.input} );
        self.isValid = ko.computed(function() {
            return self.form.isValid() && self.input() != self.previousName;
        });
    };

    RenameModal.prototype.ok = function() {
        dialog.close(this, this.input());
    };

    RenameModal.prototype.close = function() {
        dialog.close(this);
    };

    RenameModal.show = function(defaultValue){
        return dialog.show(new RenameModal(defaultValue));
    };

    return RenameModal;
});