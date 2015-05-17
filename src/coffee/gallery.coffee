
docElem = window.document.documentElement
transEndEventNames =
  WebkitTransition: 'webkitTransitionEnd'
  MozTransition: 'transitionend'
  OTransition: 'oTransitionEnd'
  msTransition: 'MSTransitionEnd'
  transition: 'transitionend'

transEndEventName = transEndEventNames[Modernizr.prefixed 'transition']

support =
  transitions: Modernizr.csstransitions
  support3d: Modernizr.csstransforms3d

viewportWidth = ->
  client = docElem.clientWidth
  inner = window.innerWidth

  if client < inner then inner else client

class Constants
  @NEXT: 'next'
  @PREV: 'prev'
  @CLOSE: 'close'

class GalleryHelpers
  @setTransform = (el, transformStr) ->
    el.style.WebkitTransform = el.style.msTransform = el.style.transform = transformStr

  @translate = (el, multiplier = 1) ->
    Number multiplier * (viewportWidth() / 2 + el.offsetWidth / 2)

class GalleryGrid
  constructor: (@el, @options = {}) ->
    @init()

  init: ->
    @grid = @el.querySelector 'section.grid-wrap > ul.grid'
    @gridItems = [].slice.call @grid.querySelectorAll 'li:not(.grid-sizer)'

    @itemsCount = @gridItems.length
    @slideshow = @el.querySelector 'section.slideshow > ul'
    @slideshowItems = [].slice.call @slideshow.children

    @current = -1
    @ctrlPrev = @el.querySelector 'section.slideshow > nav > span.nav-prev'
    @ctrlNext = @el.querySelector 'section.slideshow > nav > span.nav-next'
    @ctrlClose = @el.querySelector 'section.slideshow > nav > span.nav-close'

    @initMasonry()
    @initEvents()

  initMasonry: ->
    imagesLoaded @grid, =>
      new Masonry @grid,
        itemSelector: 'li'
        columnWidth: @grid.querySelector '.grid-sizer'

  initEvents: ->
    _.each @gridItems, (item, idx) =>
      item.addEventListener 'click', =>
        @openSlideshow idx

    @ctrlPrev.addEventListener 'click', => @navigate Constants.PREV
    @ctrlNext.addEventListener 'click', => @navigate Constants.NEXT
    @ctrlClose.addEventListener 'click', => @closeSlideshow()

    window.addEventListener 'resize', _.debounce @resize, 50

    document.addEventListener 'keydown', (ev) =>
      return if not @isSlideshowVisible
      keycode = ev.keycode or ev.which

      switch keycode
        when 37 then @navigate Constants.PREV
        when 39 then @navigate Constants.NEXT
        when 27 then @closeSlideshow()

    window.addEventListener 'scroll', =>
      if @isSlideshowVisible
        window.scrollTo @scrollPosition?.x or 0, @scrollPosition?.y or 0
      else
        @scrollPosition =
          x: window.pageXOffset or docElem.scrollLeft
          y: window.pageYOffset or docElem.scrollTop

  openSlideshow: (pos) ->
    @isSlideshowVisible = yes
    @current = pos

    classie.addClass @el, 'slideshow-open'

    @setViewportItems()

    classie.addClass @currentItem, 'show'
    classie.addClass @currentItem, 'current'

    if @prevItem
      classie.addClass @prevItem, 'show'
      translateVal = GalleryHelpers.translate @prevItem, -1
      GalleryHelpers.setTransform @prevItem, (if support.support3d then "translate3d(#{translateVal}px, 0, -150px)" else "translate(#{translateVal}px)")

    if @nextItem
      classie.addClass @nextItem, 'show'
      translateVal = GalleryHelpers.translate @nextItem
      GalleryHelpers.setTransform @nextItem, (if support.support3d then "translate3d(#{translateVal}px, 0, -150px)" else "translate(#{translateVal}px)")

  navigate: (dir) ->
    return if @isAnimating
    return @closeSlideshow() if dir is Constants.NEXT and @current is @itemsCount - 1 or dir is Constants.PREV and @current is 0

    @isAnimating = yes
    @setViewportItems()

    itemWidth = @currentItem.offsetWidth

    translate2 = (mod = '', multiplier = 1) ->
      width = Number (viewportWidth() * multiplier) / 2 + itemWidth / 2
      if support.support3d then "translate3d(#{mod}#{width}px, 0, -150px)" else "translate(#{mod}#{width}px)"

    transformLeftStr = translate2 '-'
    transformRightStr = translate2()
    transformOutStr = if dir is Constants.NEXT then translate2 '-', 2 else translate2 '', 2
    transformIncomingStr =  if dir is Constants.NEXT then translate2 '', 2 else translate2 '-', 2
    transformCenterStr = ''
    incomingItem = null

    classie.removeClass @slideshow, 'animatable'

    if (dir is Constants.NEXT and @current < @itemsCount - 2) or (dir is Constants.PREV and @current > 1)
      incomingItem = @slideshowItems[if dir is Constants.NEXT then @current+2 else @current-2]
      GalleryHelpers.setTransform incomingItem, transformIncomingStr
      classie.addClass incomingItem, 'show'

    slide = =>
      classie.addClass @slideshow, 'animatable'

      classie.removeClass @currentItem, 'current'

      GalleryHelpers.setTransform @currentItem, (if dir is Constants.NEXT then transformLeftStr else transformRightStr)

      if @nextItem then GalleryHelpers.setTransform @nextItem, (if dir is Constants.NEXT then transformCenterStr else transformOutStr)
      if @prevItem then GalleryHelpers.setTransform @prevItem, (if dir is Constants.NEXT then transformOutStr else transformCenterStr)
      if incomingItem then GalleryHelpers.setTransform incomingItem, (if dir is Constants.NEXT then transformRightStr else transformLeftStr)

      self = @
      onEndTransitionFn = (ev) ->
        if support.transitions
          return false if -1 is ev.propertyName.indexOf 'transform'
          @removeEventListener transEndEventName, onEndTransitionFn

        if self.prevItem and dir is Constants.NEXT then classie.removeClass self.prevItem, 'show'
        if self.nextItem and dir is Constants.PREV then classie.removeClass self.nextItem, 'show'

        if dir is Constants.NEXT
          self.prevItem = self.currentItem
          self.currentItem = self.nextItem
          if incomingItem then self.nextItem = incomingItem

        else
          self.nextItem = self.currentItem
          self.currentItem = self.prevItem
          if incomingItem then self.prevItem = incomingItem

        self.current = if dir is Constants.NEXT then self.current+1 else self.current-1
        self.isAnimating = no

        classie.addClass self.currentItem, 'current'

      if support.transitions then @currentItem.addEventListener transEndEventName, onEndTransitionFn else onEndTransitionFn()

    setTimeout slide, 25

  closeSlideshow: ->
    classie.removeClass @el, 'slideshow-open'
    classie.removeClass @slideshow, 'animatable'

    self = @
    onEndTransitionFn = (ev) ->
      if support.transitions
        return if ev.target.tagName.toLowerCase() isnt 'ul'
        @removeEventListener transEndEventName, onEndTransitionFn

      classie.removeClass self.currentItem, 'current'
      classie.removeClass self.currentItem, 'show'

      if self.prevItem then classie.removeClass self.prevItem, 'show'
      if self.nextItem then classie.removeClass self.nextItem, 'show'

      _.each self.slideshowItems, (item) -> GalleryHelpers.setTransform item, ''
      self.isSlideshowVisible = no

    if support.transitions then @el.addEventListener transEndEventName, onEndTransitionFn else onEndTransitionFn()

  setViewportItems: ->
    @currentItem = null
    @nextItem = null
    @prevItem = null

    if @current > 0 then @prevItem = @slideshowItems[@current-1]
    if @current < @itemsCount-1 then @nextItem = @slideshowItems[@current+1]
    @currentItem = @slideshowItems[@current]

  resize: ->
    return if not @isSlideshowVisible

    if @prevItem
      translateVal = GalleryHelpers.translate @prevItem, -1
      GalleryHelpers.setTransform @prevItem, (if support.support3d then "translate3d(#{translateVal}px, 0, -150px)" else "translate(#{translateVal}px)")

    if @nextItem
      translateVal = GalleryHelpers.translate @nextItem
      GalleryHelpers.setTransform @nextItem, (if support.support3d then "translate3d(#{translateVal}px, 0, -150px)" else "translate(#{translateVal}px)")

root = exports ? window
root.GalleryGrid = GalleryGrid