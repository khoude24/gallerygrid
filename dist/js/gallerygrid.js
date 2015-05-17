(function() {
  var Constants, GalleryGrid, GalleryHelpers, docElem, root, support, transEndEventName, transEndEventNames, viewportWidth;

  docElem = window.document.documentElement;

  transEndEventNames = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd',
    msTransition: 'MSTransitionEnd',
    transition: 'transitionend'
  };

  transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];

  support = {
    transitions: Modernizr.csstransitions,
    support3d: Modernizr.csstransforms3d
  };

  viewportWidth = function() {
    var client, inner;
    client = docElem.clientWidth;
    inner = window.innerWidth;
    if (client < inner) {
      return inner;
    } else {
      return client;
    }
  };

  Constants = (function() {
    function Constants() {}

    Constants.NEXT = 'next';

    Constants.PREV = 'prev';

    Constants.CLOSE = 'close';

    return Constants;

  })();

  GalleryHelpers = (function() {
    function GalleryHelpers() {}

    GalleryHelpers.setTransform = function(el, transformStr) {
      return el.style.WebkitTransform = el.style.msTransform = el.style.transform = transformStr;
    };

    GalleryHelpers.translate = function(el, multiplier) {
      if (multiplier == null) {
        multiplier = 1;
      }
      return Number(multiplier * (viewportWidth() / 2 + el.offsetWidth / 2));
    };

    return GalleryHelpers;

  })();

  GalleryGrid = (function() {
    function GalleryGrid(el, options) {
      this.el = el;
      this.options = options != null ? options : {};
      this.init();
    }

    GalleryGrid.prototype.init = function() {
      this.grid = this.el.querySelector('section.grid-wrap > ul.grid');
      this.gridItems = [].slice.call(this.grid.querySelectorAll('li:not(.grid-sizer)'));
      this.itemsCount = this.gridItems.length;
      this.slideshow = this.el.querySelector('section.slideshow > ul');
      this.slideshowItems = [].slice.call(this.slideshow.children);
      this.current = -1;
      this.ctrlPrev = this.el.querySelector('section.slideshow > nav > span.nav-prev');
      this.ctrlNext = this.el.querySelector('section.slideshow > nav > span.nav-next');
      this.ctrlClose = this.el.querySelector('section.slideshow > nav > span.nav-close');
      this.initMasonry();
      return this.initEvents();
    };

    GalleryGrid.prototype.initMasonry = function() {
      return imagesLoaded(this.grid, (function(_this) {
        return function() {
          return new Masonry(_this.grid, {
            itemSelector: 'li',
            columnWidth: _this.grid.querySelector('.grid-sizer')
          });
        };
      })(this));
    };

    GalleryGrid.prototype.initEvents = function() {
      _.each(this.gridItems, (function(_this) {
        return function(item, idx) {
          return item.addEventListener('click', function() {
            return _this.openSlideshow(idx);
          });
        };
      })(this));
      this.ctrlPrev.addEventListener('click', (function(_this) {
        return function() {
          return _this.navigate(Constants.PREV);
        };
      })(this));
      this.ctrlNext.addEventListener('click', (function(_this) {
        return function() {
          return _this.navigate(Constants.NEXT);
        };
      })(this));
      this.ctrlClose.addEventListener('click', (function(_this) {
        return function() {
          return _this.closeSlideshow();
        };
      })(this));
      window.addEventListener('resize', _.debounce(this.resize, 50));
      document.addEventListener('keydown', (function(_this) {
        return function(ev) {
          var keycode;
          if (!_this.isSlideshowVisible) {
            return;
          }
          keycode = ev.keycode || ev.which;
          switch (keycode) {
            case 37:
              return _this.navigate(Constants.PREV);
            case 39:
              return _this.navigate(Constants.NEXT);
            case 27:
              return _this.closeSlideshow();
          }
        };
      })(this));
      return window.addEventListener('scroll', (function(_this) {
        return function() {
          var _ref, _ref1;
          if (_this.isSlideshowVisible) {
            return window.scrollTo(((_ref = _this.scrollPosition) != null ? _ref.x : void 0) || 0, ((_ref1 = _this.scrollPosition) != null ? _ref1.y : void 0) || 0);
          } else {
            return _this.scrollPosition = {
              x: window.pageXOffset || docElem.scrollLeft,
              y: window.pageYOffset || docElem.scrollTop
            };
          }
        };
      })(this));
    };

    GalleryGrid.prototype.openSlideshow = function(pos) {
      var translateVal;
      this.isSlideshowVisible = true;
      this.current = pos;
      classie.addClass(this.el, 'slideshow-open');
      this.setViewportItems();
      classie.addClass(this.currentItem, 'show');
      classie.addClass(this.currentItem, 'current');
      if (this.prevItem) {
        classie.addClass(this.prevItem, 'show');
        translateVal = GalleryHelpers.translate(this.prevItem, -1);
        GalleryHelpers.setTransform(this.prevItem, (support.support3d ? "translate3d(" + translateVal + "px, 0, -150px)" : "translate(" + translateVal + "px)"));
      }
      if (this.nextItem) {
        classie.addClass(this.nextItem, 'show');
        translateVal = GalleryHelpers.translate(this.nextItem);
        return GalleryHelpers.setTransform(this.nextItem, (support.support3d ? "translate3d(" + translateVal + "px, 0, -150px)" : "translate(" + translateVal + "px)"));
      }
    };

    GalleryGrid.prototype.navigate = function(dir) {
      var incomingItem, itemWidth, slide, transformCenterStr, transformIncomingStr, transformLeftStr, transformOutStr, transformRightStr, translate2;
      if (this.isAnimating) {
        return;
      }
      if (dir === Constants.NEXT && this.current === this.itemsCount - 1 || dir === Constants.PREV && this.current === 0) {
        return this.closeSlideshow();
      }
      this.isAnimating = true;
      this.setViewportItems();
      itemWidth = this.currentItem.offsetWidth;
      translate2 = function(mod, multiplier) {
        var width;
        if (mod == null) {
          mod = '';
        }
        if (multiplier == null) {
          multiplier = 1;
        }
        width = Number((viewportWidth() * multiplier) / 2 + itemWidth / 2);
        if (support.support3d) {
          return "translate3d(" + mod + width + "px, 0, -150px)";
        } else {
          return "translate(" + mod + width + "px)";
        }
      };
      transformLeftStr = translate2('-');
      transformRightStr = translate2();
      transformOutStr = dir === Constants.NEXT ? translate2('-', 2) : translate2('', 2);
      transformIncomingStr = dir === Constants.NEXT ? translate2('', 2) : translate2('-', 2);
      transformCenterStr = '';
      incomingItem = null;
      classie.removeClass(this.slideshow, 'animatable');
      if ((dir === Constants.NEXT && this.current < this.itemsCount - 2) || (dir === Constants.PREV && this.current > 1)) {
        incomingItem = this.slideshowItems[dir === Constants.NEXT ? this.current + 2 : this.current - 2];
        GalleryHelpers.setTransform(incomingItem, transformIncomingStr);
        classie.addClass(incomingItem, 'show');
      }
      slide = (function(_this) {
        return function() {
          var onEndTransitionFn, self;
          classie.addClass(_this.slideshow, 'animatable');
          classie.removeClass(_this.currentItem, 'current');
          GalleryHelpers.setTransform(_this.currentItem, (dir === Constants.NEXT ? transformLeftStr : transformRightStr));
          if (_this.nextItem) {
            GalleryHelpers.setTransform(_this.nextItem, (dir === Constants.NEXT ? transformCenterStr : transformOutStr));
          }
          if (_this.prevItem) {
            GalleryHelpers.setTransform(_this.prevItem, (dir === Constants.NEXT ? transformOutStr : transformCenterStr));
          }
          if (incomingItem) {
            GalleryHelpers.setTransform(incomingItem, (dir === Constants.NEXT ? transformRightStr : transformLeftStr));
          }
          self = _this;
          onEndTransitionFn = function(ev) {
            if (support.transitions) {
              if (-1 === ev.propertyName.indexOf('transform')) {
                return false;
              }
              this.removeEventListener(transEndEventName, onEndTransitionFn);
            }
            if (self.prevItem && dir === Constants.NEXT) {
              classie.removeClass(self.prevItem, 'show');
            }
            if (self.nextItem && dir === Constants.PREV) {
              classie.removeClass(self.nextItem, 'show');
            }
            if (dir === Constants.NEXT) {
              self.prevItem = self.currentItem;
              self.currentItem = self.nextItem;
              if (incomingItem) {
                self.nextItem = incomingItem;
              }
            } else {
              self.nextItem = self.currentItem;
              self.currentItem = self.prevItem;
              if (incomingItem) {
                self.prevItem = incomingItem;
              }
            }
            self.current = dir === Constants.NEXT ? self.current + 1 : self.current - 1;
            self.isAnimating = false;
            return classie.addClass(self.currentItem, 'current');
          };
          if (support.transitions) {
            return _this.currentItem.addEventListener(transEndEventName, onEndTransitionFn);
          } else {
            return onEndTransitionFn();
          }
        };
      })(this);
      return setTimeout(slide, 25);
    };

    GalleryGrid.prototype.closeSlideshow = function() {
      var onEndTransitionFn, self;
      classie.removeClass(this.el, 'slideshow-open');
      classie.removeClass(this.slideshow, 'animatable');
      self = this;
      onEndTransitionFn = function(ev) {
        if (support.transitions) {
          if (ev.target.tagName.toLowerCase() !== 'ul') {
            return;
          }
          this.removeEventListener(transEndEventName, onEndTransitionFn);
        }
        classie.removeClass(self.currentItem, 'current');
        classie.removeClass(self.currentItem, 'show');
        if (self.prevItem) {
          classie.removeClass(self.prevItem, 'show');
        }
        if (self.nextItem) {
          classie.removeClass(self.nextItem, 'show');
        }
        _.each(self.slideshowItems, function(item) {
          return GalleryHelpers.setTransform(item, '');
        });
        return self.isSlideshowVisible = false;
      };
      if (support.transitions) {
        return this.el.addEventListener(transEndEventName, onEndTransitionFn);
      } else {
        return onEndTransitionFn();
      }
    };

    GalleryGrid.prototype.setViewportItems = function() {
      this.currentItem = null;
      this.nextItem = null;
      this.prevItem = null;
      if (this.current > 0) {
        this.prevItem = this.slideshowItems[this.current - 1];
      }
      if (this.current < this.itemsCount - 1) {
        this.nextItem = this.slideshowItems[this.current + 1];
      }
      return this.currentItem = this.slideshowItems[this.current];
    };

    GalleryGrid.prototype.resize = function() {
      var translateVal;
      if (!this.isSlideshowVisible) {
        return;
      }
      if (this.prevItem) {
        translateVal = GalleryHelpers.translate(this.prevItem, -1);
        GalleryHelpers.setTransform(this.prevItem, (support.support3d ? "translate3d(" + translateVal + "px, 0, -150px)" : "translate(" + translateVal + "px)"));
      }
      if (this.nextItem) {
        translateVal = GalleryHelpers.translate(this.nextItem);
        return GalleryHelpers.setTransform(this.nextItem, (support.support3d ? "translate3d(" + translateVal + "px, 0, -150px)" : "translate(" + translateVal + "px)"));
      }
    };

    return GalleryGrid;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.GalleryGrid = GalleryGrid;

}).call(this);
