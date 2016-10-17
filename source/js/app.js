var hyperformWrapper = hyperform(window);
var HelsingborgPrime = {};

$('html, body').removeClass('no-js');
document.documentElement.setAttribute('data-useragent', navigator.userAgent);

jQuery.expr.filters.offscreen = function(el) {
    var rect = el.getBoundingClientRect();
    return (
        (rect.x + rect.width) < 0
        || (rect.y + rect.height) < 0
        || (rect.x > window.innerWidth || rect.y > window.innerHeight)
    );
};
