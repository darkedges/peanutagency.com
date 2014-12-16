/*
 * Based on the wonderful work done by tympanus @ http://tympanus.net/Tutorials/ThumbnailGridExpandingPreview/
 */
+ function ($) {
    'use strict';
    var Grid = function (element, options) {
        this.$element = $(element)
        this.options = options
        this.currentItem = null
        this.previousItem = null
        this.marginExpanded = 10
        this.scrollExtra = 0

        this.$element.find('li').each(function () {
            var $item = $(this);
            $item.data('height', $item.height());
            $item.data('panelheight',$item.find('div').first().height());
            $item.data('offset', $item.offset());
            $item.css('height', $item.height());
            $item.css('transition', 'height 350ms ease');
        })
    }
    Grid.VERSION = '0.0.1'

    Grid.DEFAULTS = {
        panelheight: 350,
        itemheight: 650
    }



    Grid.prototype.click = function (pos) {
        var item = this.$element.find('li#' + pos.show);
        this.scrollExtra = 0;
        if (item.length) {
            this.currentItem = item;
            if (this.previousItem != null && !this.currentItem.is(this.previousItem)) {
                if (this.previousItem.hasClass('enabled')) {
                    if (this.currentItem.offset().top == this.previousItem.offset().top) {
                        this.currentItem.addClass('enabled');
                        this.currentItem.addClass('notransition');
                        this.changeImg(this.previousItem);
                        this.previousItem.css('height', this.previousItem.data('height'));
                        this.previousItem.find('div').first().css('display', 'none');
                        this.previousItem.removeClass('enabled');
                        this.previousItem.removeClass('og-expanded');
                    } else {
                        if (this.currentItem.offset().top > this.previousItem.offset().top) {
                            this.scrollExtra = (this.currentItem.offset().top - this.previousItem.offset().top) - this.currentItem.height();
                        }
                        this.close(this.previousItem);
                    }
                }
                this.open(this.currentItem);
                this.currentItem.removeClass('notransition');
            } else {

                if (!this.currentItem.hasClass('enabled')) {
                    this.open(this.currentItem);
                } else {
                    this.close(this.currentItem)
                }
            }
            this.previousItem = this.currentItem;
        } else {
            if (this.previousItem != null) {
                this.close(this.previousItem);
            }
        }
    }

    Grid.prototype.setHeights = function (item, panel) {
        //var height = this.marginExpanded + this.options.panelheight;
        var itemHeight
        if($.isNumeric(this.options.itemheight)) {
            itemHeight = this.marginExpanded + this.options.itemheight;
            if (itemHeight > $(window).height()) {
                this.options.itemheight = 'auto';
            }
        }

        if (this.options.itemheight == 'auto') {
             itemHeight = item.data('height') + item.data('panelheight')
        }

        this.onEndFn = function (support) {
            if (support) {
                $(this).off(this.transEndEventName);
            }
        };


        panel.css('height', item.data('panelheight'));
        item.css('height', itemHeight).on(this.transEndEventName, this.onEndFn(this.support));;
    }

    Grid.prototype.open = function (item) {
        this.changeImg(item);
        item.addClass('enabled');
        item.addClass('og-expanded');

        // Open the Panel
        var panel = item.find('div').first();
        panel.css('display', 'inline');

        this.setHeights(item, panel);
        this.positionPreview(item, panel);
        this.setTransition(item, panel);

    }

    Grid.prototype.setTransition = function (item, panel) {
        panel.css('transition', 'height 350ms ease');
        item.css('transition', 'height 350ms ease');
    }

    Grid.prototype.positionPreview = function (item, panel) {
        var position = item.offset().top - this.scrollExtra,
            previewOffsetT = panel.offset().top - this.scrollExtra,
            scrollVal = (this.marginExpanded + 350) + item.height() + this.marginExpanded <= $(window).height() ? position : item.height() < $(window).height() ? previewOffsetT - ($(window).height() - item.height()) : previewOffsetT;
        scrollVal = position - 30;
        $('html, body').animate({
            scrollTop: scrollVal
        }, 350);
    }

    Grid.prototype.close = function (item) {
        this.changeImg(item);
        if (item.hasClass('enabled')) {

            var panel = item.find('div').first();
            setTimeout($.proxy(function () {
                panel.css('height', '0');
                item.css('height', item.data('height')).one('bsTransitionEnd', function () {
                    item.find('div').first().css('display', 'none');
                });
                item.removeClass('enabled');
                item.removeClass('og-expanded');

            }, this), 25);
        }
    }

    Grid.prototype.changeImg = function (item) {
        var img = item.find('img').first();
        var alt = img.data('alternate');
        var cur = img.attr('src');
        img.attr('src', alt);
        img.data('alternate', cur);
    }

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.og-grid')
            var options = $.extend({}, Grid.DEFAULTS, $this.data(), typeof option == 'object' && option)
            var action = typeof option == 'string' ? option : options.show

            if (!data) $this.data('bs.og-grid', (data = new Grid(this, options)))

            data.click(option);
        })

    }

    var old = $.fn.grid

    $.fn.grid = Plugin
    $.fn.grid.Constructor = Grid

    $.fn.grid.noConflict = function () {
        $.fn.grid = old
        return this
    }

    var clickHandler = function (e) {
        var href
        var $this = $(this)

        var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
        if (!$target.hasClass('og-grid')) return
        var options = $.extend({}, $target.data(), $this.data())

        Plugin.call($target, options)

        e.preventDefault()
    }

    $(document)
        .on('click.bs.grid.data-api', '[data-show]', clickHandler).on('click.bs.grid.data-api', 'span.og-close', clickHandler)

    $(window).on('load', function () {
        $('[data-ride="grid"]').each(function () {
            var $grid = $(this)
            Plugin.call($grid, $grid.data())
        })
    })

}(jQuery);