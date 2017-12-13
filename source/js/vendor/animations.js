$(function(jQuery) {

    //Declarations
    var $window         = $(window),
    win_height_padded   = $window.height() * 1.1,
    targetWrapper       = '.animate',
    target;

    //Scroll event
    $window.on('scroll', revealOnScroll);

    //Run scroll reveal
    function revealOnScroll() {
        var scrolled        = $window.scrollTop(),
        win_height_padded   = $window.height() * 0.98;
          console.log('Scrolled: ' + scrolled);
          console.log('Win height: ' + win_height_padded);
        $(targetWrapper + ":not(.animated)").each(function() {

          var animationTarget = $(this).offset().top;

          if (scrolled >= animationTarget - win_height_padded + (win_height_padded * 0.3)) {
            //console.log(this);
            $(this).addClass('animated');
          }
        });

    }

    //Init function
    revealOnScroll();
});
