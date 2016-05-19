//
// @name Image upload
// @description
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.ImageUpload = (function ($) {

    var elementClass = '.image-upload';
    var drags = 0;
    var selectedFiles = new Array();
    var allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];

    function ImageUpload() {
        this.initDragAndDrop();
        this.initFileInput();
    }

    /**
     * Select file by browse
     * @return {void}
     */
    ImageUpload.prototype.initFileInput = function () {
        $imageUploadInput = $(elementClass).find('input[type="file"]');

        $imageUploadInput.on('change', function (e) {
            var file = $(e.target).closest('input[type="file"]').get(0).files[0];
            this.addFile($(e.target).closest(elementClass), file);
        }.bind(this));
    };

    /**
     * Drag and drop a file
     * @return {void}
     */
    ImageUpload.prototype.initDragAndDrop = function () {
        $imageUpload = $(elementClass);

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

            this.addFile($(e.target).closest(elementClass), e.originalEvent.dataTransfer.files[0]);
        }.bind(this));
    };

    /**
     * Adds a file
     * @param {object} element The image uploader element
     * @param {object} file    The file object
     */
    ImageUpload.prototype.addFile = function (element, file) {
        if (allowedFileTypes.indexOf(file.type) == -1) {
            element.addClass('is-error is-error-filetype');
            element.find('.selected-file').html('');

            return false;
        }

        var maxFilesize = element.attr('data-max-size') ? element.attr('data-max-size') : 500;
        var fileSize = (file.size/1000).toFixed(2);

        if (fileSize > maxFilesize) {
            element.addClass('is-error is-error-filesize');
            element.find('.selected-file').html('');

            return false;
        }

        selectedFiles.push(file);
        element.find('.selected-file').html(file.name);
        element.addClass('is-selected');

        var reader = new FileReader();
        reader.readAsDataURL(file);

        reader.addEventListener('load', function (e) {
            var image = e.target;
            var max_images = element.attr('data-max-files');


            if (max_images && selectedFiles.length > max_images) {
                selectedFiles = selectedFiles.slice(1);
                element.find('input[name="image_uploader_file[]"]:first').remove();
            }

            element.append('<input type="hidden" name="image_uploader_file[]" read-only>');
            element.find('input[name="image_uploader_file[]"]:last').val(image.result);
        });

        return true;
    };

    return new ImageUpload();

})(jQuery);
