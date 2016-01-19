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
    	jQuery(window).bind('hashchange', function() {
			this.togglePopupClass();
		}.bind(this)).trigger('hashchange');

    }

    ModalLimit.prototype.clickWatcher = function () {
	    
	    jQuery('.lightbox-trigger').click(function(event) {

			event.preventDefault();

			//Get data 
			var image_href 		= jQuery(this).attr("href");
			var image_caption 	= jQuery(this).attr("data-caption");

			//Update hash
			window.location.hash = "lightbox-open"; 

			//Add markup, or update. 
			if (jQuery('#lightbox').length > 0) {
				jQuery('#lightbox-image').attr('src',image_href);
				jQuery('#lightbox').show(0);
			} else {
				
				var lightbox = 
				'<div id="lightbox">' +
					'<div id="lightbox-image-wrapper" data-caption="' + image_caption + '">' +
						'<a class="btn-close" href="#lightbox-close"></a>' +
						'<img id="lightbox-image" src="' + image_href +'" />' +
					'</div>' +
				'</div>';
					
				jQuery('body').append(lightbox);
				
			}
			
			//State 
			HelsingborgPrime.Helpers.GalleryPopup.togglePopupClass(); 
			
		});
	
		jQuery(document).on('click', '#lightbox', function() {
			jQuery(this).hide();
			window.location.hash = "lightbox-closed"; 
			HelsingborgPrime.Helpers.GalleryPopup.togglePopupClass(); 
		});
         
    };

    ModalLimit.prototype.togglePopupClass = function(){
	    if (window.location.hash.replace("-","") == "#lightbox-open".replace("-","")) {
			jQuery('html').addClass('gallery-hidden');
		} else {
			jQuery('html').removeClass('gallery-hidden');
		}
    };

    return new ModalLimit();

})(jQuery);