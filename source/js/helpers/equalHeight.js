//
// @name EqualHeight
// @description  Sets element heights equally to the heighest value.
//
// @markup
// <div class="grid">
//     <div class="grid-md-6">
//         Hej<br>på<br>dig
//     </div>
//     <div class="grid-md-6">
//         Hej<br>på<br>dig
//     </div>
// </div>
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helpers = HelsingborgPrime.Helpers || {};

HelsingborgPrime.Helpers.EqualHeight = (function ($) {

    function EqualHeight() {
        $(function(){

        }.bind(this));
    }

    EqualHeight.prototype.init = function (el) {
        $('[data-equal-container]').each(function (e) {

        }.bind(this));
    };

    return new EqualHeight();

})(jQuery);
