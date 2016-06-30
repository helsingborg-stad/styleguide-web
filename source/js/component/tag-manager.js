//
// @name Modal
// @description  Show accodrion dropdown, make linkable by updating adress bar
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};
HelsingborgPrime.Component.TagManager = (function ($) {

    function TagManager() {
        $('.tag-manager').each(function (index, element) {
            this.init(element);
        }.bind(this));

        $(document).on('click', '.tag-manager .tag-manager-selected button[data-action="remove"]', function (e) {
            e.preventDefault();

            var tagElement = $(e.target).closest('li');
            this.removeTag(tagElement);
        }.bind(this));
    }

    TagManager.prototype.init = function(element) {
        var $element = $(element);
        var $button = $element.find('.tag-manager-input [name="add-tag"]');
        var $input = $button.parents('.tag-manager').find('.tag-manager-input input[type="text"]');

        $button.on('click', function (e) {
            e.preventDefault();
            var tag = $input.val();

            this.addTag(element, tag);
        }.bind(this));

        $input.on('keypress', function (e) {
            if (e.keyCode !== 67) {
                return;
            }

            e.preventDefault();
            this.addTag(element, $input.val());
        }.bind(this));
    };

    TagManager.prototype.addTag = function(element, tag) {
        $element = $(element);
        $element.find('.tag-manager-selected ul').append('<li class="label">\
            <button class="btn btn-plain" data-action="remove">&times;</button>\
            ' + tag + '\
            <input type="hidden" name="responsibilities" value="' + tag + '">\
        </li>');

        $element.find('.tag-manager-input input[type="text"]').val('');
    };

    TagManager.prototype.removeTag = function(tagElement) {
        $(tagElement).remove();
    };

    return new TagManager();

})(jQuery);
