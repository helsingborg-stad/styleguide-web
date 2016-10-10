HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Input = (function ($) {

    function Input() {
        $('form input, form select').on('invalid', function (e) {
            this.invalidMessage(e.target);
        }.bind(this));
    }

    Input.prototype.invalidMessage = function (element) {
        var $target = $(element);
        var message = $target.attr('data-invalid-message');

        if (message) {
            element.setCustomValidity(message);
        }

        return false;
    };

    return new Input();

})(jQuery);
