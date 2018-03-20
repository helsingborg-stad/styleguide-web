
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.LocalStorageReferer = (function ($) {
    
    var refUrlStorageHistory;
    
    /**
     * Create Local Storage.
     * @author Johan Silvergrund
     * @constructor
     * @this {LocalStorageReferer}
     */
    function LocalStorageReferer() {
        if (typeof(Storage) !== 'undefined') {
            this.setStorage(); 
        }    
    };

    
    /**
     * Check local storage
     * @author Johan Silvergrund
     * @this {checkStorage}
     * @param {string} storageType
     * @return {string} url
     */
    LocalStorageReferer.prototype.checkStorage = function(storageType) {
        return localStorage.getItem(storageType);
    };    
    

    /**
     * Creates a Local storage
     * @author Johan Silvergrund
     * @this {setStorage}
     */
    LocalStorageReferer.prototype.setStorage = function() {
        var storeHistory = this.checkStorage('refUrlStorage');
        if (storeHistory != window.location.href)
            refUrlStorageHistory = localStorage.setItem('refUrlStorageHistory', storeHistory );
        refUrlStorage = localStorage.setItem('refUrlStorage', window.location.href );
        this.addStorageRefererToDoom();      
    };
    

    /**
     * Adding referer URL to doom
     * @author Johan Silvergrund
     * @this {addStorageRefererToDoom}
     */
    LocalStorageReferer.prototype.addStorageRefererToDoom = function() {
        if($('.mod-form').find('#modularity-form-referer').length !== 0) {
            $('#modularity-form-referer').val(this.checkStorage('refUrlStorageHistory'));
            $('#modularity-form-url').val(this.checkStorage('refUrlStorage'));
        } 
    };    

    return new LocalStorageReferer();

})(jQuery);