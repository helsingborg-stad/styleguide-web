//
// @name Toggle classes
// @description Creates an easy to use to use utility for triggering hide/show classes on target elements.
//
// EXAMPLE USAGE:
// <a href="" class="js-toggle" data-target="div#toggle1" data-toggle-class="some-other-class">ID</a>
// <a href="" class="js-toggle" data-target=".toggle-target">CLASS</a>
// <a href="" class="js-toggle" data-target="div">TAG</a>
// <a href="#toggle2" class="js-toggle">HREF</a>
//
// <div id="toggle1" class="toggle-target">toogle 1</div>
// <div id="toggle2" class="toggle-target">toggle 2</div>
// <div id="toggle3" class="toggle-target">toggle 3</div>

HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.ToggleClass = (function () {

    function ToggleClass() {

        //Init
        var jsItems = [].slice.call(document.getElementsByClassName('js-toggle'));

        jsItems.forEach(function(a) {
            a.addEventListener('click', function(e) { e.preventDefault();
                this.toggle(e);
            }.bind(this));
        }.bind(this));

    }

    ToggleClass.prototype.toggle = function(e) {

        //Get target
        var jsTarget = e.target.getAttribute('data-target');
        if(jsTarget === null || this.isEmpty(jsTarget)) {
            var jsTarget = e.target.getAttribute('href');
            if(jsTarget === null || this.isEmpty(jsTarget)) {
                this.printError("No taget dom-element specified.");
                return;
            }
        }

        //Fallback to hidden class
        var jsClass = e.target.getAttribute('data-toggle-class');
        if(jsClass === null || this.isEmpty(jsClass)) {
            var jsClass = "is-hidden";
        }

        //Toggle classes
        jsFoundItems = [].slice.call(document.querySelectorAll(jsTarget));
        jsFoundItems.forEach(function(c){
            c.classList.toggle(jsClass);
        }.bind(this));

    };

    ToggleClass.prototype.isEmpty = function(string) {
        return (string.length === 0 || !string.trim());
    };

    ToggleClass.prototype.printError = function(string) {
        console.log("Toggle class error: " + string);
    };

    return new ToggleClass();

})();
