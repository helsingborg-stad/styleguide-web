//
// @name Gallery
// @description  Popup boxes for gallery items.
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helpers = HelsingborgPrime.Helpers || {};

HelsingborgPrime.Helpers.GalleryPopup = (function ($) {

    function ModalLimit() {

    	//Click event
    	this.clickWatcher();

    	//Popup hash changes
    	$(window).bind('hashchange', function() {
			this.togglePopupClass();
		}.bind(this)).trigger('hashchange');

    }

    ModalLimit.prototype.clickWatcher = function () {

	    $('.lightbox-trigger').click(function(event) {

			event.preventDefault();

			//Get data
			var image_href 		= $(this).attr("href");
			var image_caption 	= $(this).attr("data-caption");

			//Update hash
			window.location.hash = "lightbox-modal-open";

			//Add markup, or update.
			if ($('#lightbox-modal').length > 0) {
				$('#lightbox-modal-image').attr('src',image_href);
				$('#lightbox-modal').show();
			} else {

				var lightbox =
				'<div id="lightbox-modal">' +
					'<div id="lightbox-image-wrapper" data-caption="' + image_caption + '">' +
						'<a class="btn-close" href="#lightbox-modal-close"></a>' +
						'<img id="lightbox-modal-image" src="' + image_href +'" />' +
					'</div>' +
				'</div>';

				$('body').append(lightbox);

			}

		});

		$(document).on('click', '#lightbox-modal', function() {
			$(this).hide();
		});

    };

    ModalLimit.prototype.togglePopupClass = function(){
	    if (window.location.hash.indexOf('lightbox-modal-open') > 0 ) {
			$('html').addClass('gallery-hidden');
		} else {
			$('html').removeClass('gallery-hidden');
		}
    };

    return new ModalLimit();

})(jQuery);
