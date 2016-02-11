//
// @name Video Player
// @description  Video functionalty for vimeo and youtube.
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Player = (function ($) {

    //Declarations
    var playerFirstInitYoutube = true; //Indicates wheter to load Youtube api or not.
    var playerFirstInitVimeo = true; //Indicates wheter to load Vimeo api or not.

    //Check for players, if exists; Run player script.
    function Player() {
        if(jQuery(".player").length) {
            this.init();
        }
    }

    //Listen for play argument
    Player.prototype.init = function () {
        jQuery(".player a").on('click', function (e) {
            this.initVideoPlayer($(e.target));
        }.bind(this));
    };

    //Init player on start
    Player.prototype.initVideoPlayer = function(e) {
        var videoid = e.attr("data-video-id");
        if(this.isNumeric(videoid)) {
            this.initVimeo(videoid, e);
        } else {
            this.initYoutube(videoid, e);
        }
    };

    Player.prototype.initVimeo = function(videoid,target) {

        //Remove controls
        this.toggleControls(target);

        //Append player
        $(target).parent().append('<iframe src="//player.vimeo.com/video/'+videoid+'?portrait=0&color=333&autoplay=1" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');

        //Not first run anymore
        this.playerFirstInitVimeo = false;
    };

    Player.prototype.initYoutube = function(videoid,target) {

        //Remove controls
        this.toggleControls(target);

        //Append player
        $(target).parent().append('<iframe type="text/html" width="100%" height="100%"src="http://www.youtube.com/embed/' +videoid+ '?autoplay=1&autohide=1&cc_load_policy=0&enablejsapi=1&modestbranding=1&origin=styleguide.dev&showinfo=0&autohide=1&iv_load_policy=3" frameborder="0"></iframe>');

        //Not first run anymore
        this.playerFirstInitYoutube = false;
    };

    Player.prototype.toggleControls = function(target) {
        if ( typeof target !== 'undefined' ) {
            target = target.parent();
            if(target.hasClass("is-playing")) {
                target.removeClass("is-playing");
                $("html").removeClass("video-is-playing");
            } else {
                target.addClass("is-playing");
                $("html").addClass("video-is-playing");
            }
        } else {
            console.log("Error: Could not start player. Wrapper not found.");
        }
    };

    //Reset all players, or with target id.
    Player.prototype.resetPlayer = function(target) {
       if (typeof target !== 'undefined') {
            $(".player iframe").remove();
            $(".player").removeClass("is-playing");
            $("html").removeClass("video-is-playing");
        } else {
            $("iframe",target).remove();
            target.removeClass("is-playing");
            $("html").removeClass("video-is-playing");
        }
    };

    Player.prototype.isNumeric = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    return new Player();

})(jQuery);
