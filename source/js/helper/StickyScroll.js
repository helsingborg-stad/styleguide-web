//
// @name Local link
// @description  Finds link items with outbound links and gives them outbound class
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.StickyScroll = (function ($) {

    var _stickyElements = [];
    var _isFloatingClass = 'is-sticky-scroll';
    var _isAdminbar = false;

    function StickyScroll() {
        $('.sticky-scroll').each(function (index, element) {
            this.init(element);
        }.bind(this));

        $(document).on('scroll', function () {
            this.scrolling();
        }.bind(this));

        if ($('#wpadminbar').length) {
            _isAdminbar = true;
        }
    }

    /**
     * Initializes the sticky-scroll functionallity on element
     * @param  {object} element
     * @return {void}
     */
    StickyScroll.prototype.init = function(element) {
        var $element = $(element).closest('.sticky-scroll');
        var offsetTop = $(element).offset().top;

        _stickyElements.push({
            element: $element,
            originalMarginTop: $element.css('margin-top'),
            originalOffset: null
        });
    }

    /**
     * Handles actions during scroll
     * @return {void}
     */
    StickyScroll.prototype.scrolling = function() {
        var scrollPos = $(document).scrollTop();
        var itemMarginTop = 0;

        if (_isAdminbar) {
            scrollPos += $('#wpadminbar').height();
            itemMarginTop = $('#wpadminbar').height();
        }

        _stickyElements.forEach(function (item) {
            var $element = $(item.element);

            if (
                (item.originalOffset === null && scrollPos >= $element.offset().top)
                ||
                (item.originalOffset !== null && scrollPos >= item.originalOffset)
            ) {
                if (!$element.hasClass(_isFloatingClass)) {
                    item.originalOffset = $element.offset().top;
                    this.addPlaceholder(item.element);
                    item.element.addClass(_isFloatingClass);
                    item.element.css('margin-top', itemMarginTop);
                }

                return
            }

            // Resets the floating class if it shouldnt float
            if (item.element.hasClass(_isFloatingClass)) {
                item.originalOffset = null;
                item.element.removeClass(_isFloatingClass);
                this.removePlaceholder(item.element);
                item.element.css('margin-top', item.originalMarginTop);
            }
        }.bind(this));
    };

    /**
     * Adds a placeholder to keep the dom from "jumping"
     * @param {object} element
     */
    StickyScroll.prototype.addPlaceholder = function(element) {
        var $ghost = element.clone();
        $ghost.addClass(_isFloatingClass + '-placeholder');

        // Hide the ghost placeholder
        $ghost.css({
            visibility: 'hidden'
        });

        // Make sure to disable all type of form elements in placeholder
        $ghost.find('form, input, select, textarea').prop('disabled', true);

        // Insert the placeholder to the dom
        $ghost.insertBefore(element);
    };

    /**
     * Removes the placeholder
     * @param  {object} element Element
     * @return {void}
     */
    StickyScroll.prototype.removePlaceholder = function(element) {
        var $ghost = element.prev('.' + _isFloatingClass + '-placeholder');
        $ghost.remove();
    };

    return new StickyScroll();

})(jQuery);
