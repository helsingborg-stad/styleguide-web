HelsingborgPrime = HelsingborgPrime || {};

HelsingborgPrime.Menu = HelsingborgPrime.Menu || {};

HelsingborgPrime.Menu.ToggleSubmenuItems = (function ($) {

    function ToggleSubmenuItems() {
        this.init();
    }

    ToggleSubmenuItems.prototype.init = function () {
        $(".nav-mobile").each(function(menuIndex,menuObject){
            $("li.has-children > a, li.menu-item-has-children > a",menuObject).click(function(event){
                if(event.offsetX > ($(event.target).width()-7)) {
                    event.preventDefault();
                    if(!this.useAjax(event.target)) {
                        this.closeOpenItems(event.target);
                        this.showSibling(event.target);
                    } else {
                        this.closeOpenItems(event.target);
                        this.ajaxLoadItems(event.target);
                    }
                }
            }.bind(this));
        }.bind(this));
    };

    ToggleSubmenuItems.prototype.useAjax = function (target) {
        if($(target).siblings("ul").length) {
            return false;
        } else {
            return true;
        }
    };

    ToggleSubmenuItems.prototype.ajaxLoadItems = function (target) {
        var markup      = '';
        var parentId    = $.grep($(target).parent().attr('class').split(" "), function(v, i){
           return v.indexOf('page-') === 0;
        }).join().replace('page-','');

        //Request
        $.get('/wp-json/wp/v2/pages/',{parent: parentId},function(response){
            if(typeof response == 'object' && response.length != 0) {
                $.each(response,function(index,pageObject){
                    markup = markup + '<li class="menu-item"><a href="' + pageObject.link + '">' + pageObject.title.rendered + '</a></li>';
                }.bind(markup));
                $(target).parent().append('<ul class="sub-menu">' + markup + '</ul>');
                $(target).parent().addClass('current-menu-item current_page_item current current-menu-item');
            } else {
                window.location.href = $(target).attr('href');
            }
        }.bind(target)).fail(function(){
            window.location.href = $(target).attr('href');
        }.bind(target));
    };

    ToggleSubmenuItems.prototype.getItemId = function (target) {
        return $(target).parent('li').attr('data-post-id');
    };

    ToggleSubmenuItems.prototype.closeOpenItems = function (target) {
        $("li",$(target).parentsUntil("nav.nav-mobile")).removeClass('current-menu-item current_page_item current current-menu-item');
    };

    ToggleSubmenuItems.prototype.showSibling = function (target) {
        $(target).parent().addClass('current-menu-item current_page_item current current-menu-item');
    };

    return new ToggleSubmenuItems();

})(jQuery);
