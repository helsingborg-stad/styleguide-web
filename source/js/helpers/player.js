//
// @name Video Player
// @description  Video functionalty for vimeo and youtube.
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helpers = HelsingborgPrime.Helpers || {};

HelsingborgPrime.Helpers.Player = (function ($) {

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
    }

    Player.prototype.initVimeo = function(videoid,target) {

        //Init vimeo api
        if ( this.playerFirstInitVimeo === true ) {
            this.playerFirstInitVimeo = false;
            var vtag = document.createElement('script');
                vtag.src = "https://f.vimeocdn.com/js/froogaloop2.min.js";
            var vfirstScriptTag = document.getElementsByTagName('script')[0];
                vfirstScriptTag.parentNode.insertBefore(vtag,vfirstScriptTag);
        }

        //Remove controls
        this.toggleControls(target);

        //Append player
        $(target).parent().append('<iframe src="//player.vimeo.com/video/'+videoid+'?portrait=0&color=333&autoplay=1" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');

        //Not first run anymore
        this.playerFirstInitVimeo = false;
    }

    Player.prototype.initYoutube = function(videoid,target) {

        //Init vimeo api
        if ( this.playerFirstInitYoutube === true ) {
            var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag,firstScriptTag)
        }

        //Remove controls
        this.toggleControls(target);

        //Append player
        console.log("youtube");

        //Not first run anymore
        this.playerFirstInitYoutube = false;
    }

    Player.prototype.toggleControls = function(target) {
        if ( typeof target !== 'undefined' ) {
            target = target.parent();
            if(target.hasClass("is-playing")) {
                target.removeClass("is-playing");
            } else {
                target.addClass("is-playing");
            }
        } else {
            console.log("Error: Could not start player. Wrapper not found.");
        }
    }

    Player.prototype.isNumeric = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    return new Player();

})(jQuery);
