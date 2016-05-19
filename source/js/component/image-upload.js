//
// @name Image upload
// @description
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.ImageUpload = (function ($) {

    var drags = 0;
    var droppedFiles = new Array();
    var allowedFileTypes = ['image/svg+xml'];

    function ImageUpload() {
        this.init();
    }

    ImageUpload.prototype.handleEvents = function () {

    };

    ImageUpload.prototype.init = function () {
        $imageUpload = $('.image-upload');

        $imageUpload.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
            e.preventDefault();
            e.stopPropagation();

            $imageUpload.removeClass('is-error is-error-filetype')
        })
        .on('dragenter', function (e) {
            drags++;

            if (drags === 1) {
                $imageUpload.addClass('is-dragover');
            }
        })
        .on('dragleave', function (e) {
            drags--;

            if (drags === 0) {
                $imageUpload.removeClass('is-dragover');
            }
        })
        .on('drop', function (e) {
            drags--;
            if (drags === 0) {
                $imageUpload.removeClass('is-selected is-dragover');
            }

            droppedFiles = e.originalEvent.dataTransfer.files;

            if (allowedFileTypes.indexOf(droppedFiles[droppedFiles.length-1].type) == -1) {
                droppedFiles = false;
                $imageUpload.addClass('is-error is-error-filetype');
                $imageUpload.find('.selected-file').html('');
                $imageUpload.find('input[type="file"]').prop('files', '');
                return false;
            }

            $imageUpload.find('input[type="file"]').prop('files', droppedFiles);

            $imageUpload.find('.selected-file').html(droppedFiles[droppedFiles.length-1].name);
            $imageUpload.addClass('is-selected');
        });
    };

    return new ImageUpload();

})(jQuery);
