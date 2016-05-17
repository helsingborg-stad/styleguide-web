//
// @name Modal
// @description  Show accodrion dropdown, make linkable by updating adress bar
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.Dropdown = (function ($) {

    function Dropdown() {
        this.handleEvents();
    }

    Dropdown.prototype.handleEvents = function () {
        $('[data-dropdown]').on('click', function (e) {
            var targetElement = $(this).attr('data-dropdown');
            $(this).parent().find(targetElement).toggle();
        });
    };

    return new Dropdown();

})(jQuery);
