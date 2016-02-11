//
// @name Cookie consent
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Prompt = HelsingborgPrime.Prompt || {};

HelsingborgPrime.Prompt.CookieConsent = (function ($) {

    var animationSpeed = 1000;

    function CookieConsent() {
        this.init();
    }

    CookieConsent.prototype.init = function () {
        var showCookieConsent = true;
        if (typeof HbgPrimeLang.cookieConsent.show != 'undefined' && HbgPrimeLang.cookieConsent.show === false) {
            showCookieConsent = false;
        }

        if (showCookieConsent && !this.hasAccepted()) {
            this.displayConsent();

            $(document).on('click', '[data-action="cookie-consent"]', function (e) {
                e.preventDefault();
                var btn = $(e.target).closest('button');
                this.accept();
            }.bind(this));
        }
    };

    CookieConsent.prototype.displayConsent = function() {
        var wrapper = $('body');
        if ($('#wrapper:first-child').length > 0) {
            wrapper = $('#wrapper:first-child');
        }

        var consentText = 'Denna hemsidan använder cookies (kakor) för att webbplatsen ska fungera på ett bra sätt för dig. Genom att klicka vidare godkänner du att vi använder cookies. <a href="http://www.pts.se/cookies" target="_blank">Vad är cookies?</a>';
        if (typeof HbgPrimeLang.cookieConsent.message != 'undefined' && HbgPrimeLang.cookieConsent.message.length > 0) {
            consentText = HbgPrimeLang.cookieConsent.message;
        }

        var buttonText = 'Jag godkänner';
        if (typeof HbgPrimeLang.cookieConsent.button != 'undefined' && HbgPrimeLang.cookieConsent.button.length > 0) {
            buttonText = HbgPrimeLang.cookieConsent.button;
        }

        wrapper.prepend('\
            <div id="cookie-consent" class="notice info gutter gutter-vertical" style="display:none;">\
                <div class="container"><div class="grid grid-table-md grid-va-middle">\
                    <div class="grid-md-9">' + consentText + '</div>\
                    <div class="grid-md-3 text-right-md text-right-lg"><button class="btn btn-primary" data-action="cookie-consent">' + buttonText + '</button></div>\
                </div></div>\
            </div>\
        ');

        $('#cookie-consent').slideDown(animationSpeed);
    };

    CookieConsent.prototype.hasAccepted = function() {
        return HelsingborgPrime.Helper.Cookie.check('cookie-consent', true);
    };

    CookieConsent.prototype.accept = function() {
        $('#cookie-consent').slideUp(animationSpeed);
        HelsingborgPrime.Helper.Cookie.set('cookie-consent', true, 60);
    };

    return new CookieConsent();

})(jQuery);
