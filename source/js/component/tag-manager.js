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
        var $input = $element.find('.tag-manager-input input[type="text"]');

        $button.on('click', function (e) {
            e.preventDefault();
            var tag = $input.val();

            this.addTag(element, tag);
        }.bind(this));

        $input.on('keypress', function (e) {
            if (e.keyCode !== 13) {
                return;
            }

            e.preventDefault();
            this.addTag($(e.target).parents('.tag-manager')[0], $input.val());
        }.bind(this));
    };

    TagManager.prototype.addTag = function(element, tag) {
        if (tag.length === 0) {
            return;
        }

        var $element = $(element);
        var inputname = $(element).attr('data-input-name');
        $element.find('.tag-manager-selected ul').append('<li class="label">\
            <button class="btn btn-plain" data-action="remove">&times;</button>\
            ' + tag + '\
            <input type="hidden" name="' + inputname + '[]" value="' + tag + '">\
        </li>');

        $element.find('.tag-manager-input input[type="text"]').val('');
    };

    TagManager.prototype.removeTag = function(tagElement) {
        $(tagElement).remove();
    };

    return new TagManager();

})(jQuery);
