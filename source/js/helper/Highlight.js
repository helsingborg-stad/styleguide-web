HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Highlight = (function ($) {

    function Highlight() {
        var highlightText = this.getQueryString('highlight');
        if (!highlightText) {
            return;
        }

        highlightText = highlightText.split('+');
        this.highlightWords(highlightText, $('.main-container')[0]);
    }

    Highlight.prototype.highlightWords = function(words, element) {
        var pattern = '(?![^<>]*>)(' + words.join('|') + ')';

        var regex = new RegExp(pattern, 'gi');
        var repl = '<mark class="mark-yellow no-padding">$1</mark>';
        element.innerHTML = element.innerHTML.replace(regex, repl);
    };

    Highlight.prototype.getQueryString = function (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");

        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");

            if (pair[0] == variable) {
                return pair[1];
            }
        }

        return(false);
    };

    return new Highlight();

})(jQuery);
