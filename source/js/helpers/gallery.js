//
// @name Gallery
// @description  Popup boxes for gallery items. 
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helpers = HelsingborgPrime.Helpers || {};

HelsingborgPrime.Helpers.GalleryPopup = (function ($) {

    function ModalLimit() {
    	this.clickWatcher();
    	this.togglePopupClass();
    }

    ModalLimit.prototype.clickWatcher = function () {
	    
	    jQuery('.lightbox-trigger').click(function(event) {

			event.preventDefault();

			var image_href 		= jQuery(this).attr("href");
			var image_caption 	= jQuery(this).attr("data-caption");

			if (jQuery('#lightbox-modal').length > 0) {
				jQuery('#lightbox-modal-image').attr('src',image_href);
				jQuery('#lightbox-modal').show();
			} else {
				
				var lightbox = 
				'<div id="lightbox-modal">' +
					'<div id="lightbox-image-wrapper" data-caption="' + image_caption + '">' +
						'<a class="btn-close" href="#lightbox-modal-close"></a>' +
						'<img id="lightbox-modal-image" src="' + image_href +'" />' +
					'</div>' +
				'</div>';
					
				jQuery('body').append(lightbox);
				
			}
			
		});
	
		jQuery(document).on('click', '#lightbox-modal', function() { 
			jQuery(this).hide();
		});
         
    };

    ModalLimit.prototype.togglePopupClass = function(){
	    if (window.location.hash.indexOf('gallery-') > 0 ) {
			$('html').addClass('gallery-hidden');
		} else {
			$('html').removeClass('gallery-hidden');
		}
    };

    return new ModalLimit();

})(jQuery);