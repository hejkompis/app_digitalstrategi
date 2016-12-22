/* ========================================================================
 * Bootstrap: transition.js v3.3.6
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.6
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.6'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.3.6
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.6'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.6
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.6'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target)
      if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]'))) e.preventDefault()
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.6
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.6'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.6
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.6'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.6
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.6'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.6
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.6'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
            this.$element[0] !== e.target &&
            !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.6
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.6'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type)
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var elOffset  = isBody ? { top: 0, left: 0 } : $element.offset()
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.6
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.6'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.6
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = this.options.selector || ((this.options.target || '') + ' .nav li > a')
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.6'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.6
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.6'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 1.0.2
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function(){

  "use strict";

  //Declare root variable - window in the browser, global on the server
  var root = this,
    previous = root.Chart;

  //Occupy the global variable of Chart, and create a simple base class
  var Chart = function(context){
    var chart = this;
    this.canvas = context.canvas;

    this.ctx = context;

    //Variables global to the chart
    var computeDimension = function(element,dimension)
    {
      if (element['offset'+dimension])
      {
        return element['offset'+dimension];
      }
      else
      {
        return document.defaultView.getComputedStyle(element).getPropertyValue(dimension);
      }
    }

    var width = this.width = computeDimension(context.canvas,'Width');
    var height = this.height = computeDimension(context.canvas,'Height');

    // Firefox requires this to work correctly
    context.canvas.width  = width;
    context.canvas.height = height;

    var width = this.width = context.canvas.width;
    var height = this.height = context.canvas.height;
    this.aspectRatio = this.width / this.height;
    //High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
    helpers.retinaScale(this);

    return this;
  };
  //Globally expose the defaults to allow for user updating/changing
  Chart.defaults = {
    global: {
      // Boolean - Whether to animate the chart
      animation: true,

      // Number - Number of animation steps
      animationSteps: 60,

      // String - Animation easing effect
      animationEasing: "easeOutQuart",

      // Boolean - If we should show the scale at all
      showScale: true,

      // Boolean - If we want to override with a hard coded scale
      scaleOverride: false,

      // ** Required if scaleOverride is true **
      // Number - The number of steps in a hard coded scale
      scaleSteps: null,
      // Number - The value jump in the hard coded scale
      scaleStepWidth: null,
      // Number - The scale starting value
      scaleStartValue: null,

      // String - Colour of the scale line
      scaleLineColor: "rgba(0,0,0,.1)",

      // Number - Pixel width of the scale line
      scaleLineWidth: 1,

      // Boolean - Whether to show labels on the scale
      scaleShowLabels: true,

      // Interpolated JS string - can access value
      scaleLabel: "<%=value%>",

      // Boolean - Whether the scale should stick to integers, and not show any floats even if drawing space is there
      scaleIntegersOnly: true,

      // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
      scaleBeginAtZero: false,

      // String - Scale label font declaration for the scale label
      scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

      // Number - Scale label font size in pixels
      scaleFontSize: 12,

      // String - Scale label font weight style
      scaleFontStyle: "normal",

      // String - Scale label font colour
      scaleFontColor: "#666",

      // Boolean - whether or not the chart should be responsive and resize when the browser does.
      responsive: false,

      // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
      maintainAspectRatio: true,

      // Boolean - Determines whether to draw tooltips on the canvas or not - attaches events to touchmove & mousemove
      showTooltips: true,

      // Boolean - Determines whether to draw built-in tooltip or call custom tooltip function
      customTooltips: false,

      // Array - Array of string names to attach tooltip events
      tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],

      // String - Tooltip background colour
      tooltipFillColor: "rgba(0,0,0,0.8)",

      // String - Tooltip label font declaration for the scale label
      tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

      // Number - Tooltip label font size in pixels
      tooltipFontSize: 14,

      // String - Tooltip font weight style
      tooltipFontStyle: "normal",

      // String - Tooltip label font colour
      tooltipFontColor: "#fff",

      // String - Tooltip title font declaration for the scale label
      tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

      // Number - Tooltip title font size in pixels
      tooltipTitleFontSize: 14,

      // String - Tooltip title font weight style
      tooltipTitleFontStyle: "bold",

      // String - Tooltip title font colour
      tooltipTitleFontColor: "#fff",

      // Number - pixel width of padding around tooltip text
      tooltipYPadding: 6,

      // Number - pixel width of padding around tooltip text
      tooltipXPadding: 6,

      // Number - Size of the caret on the tooltip
      tooltipCaretSize: 8,

      // Number - Pixel radius of the tooltip border
      tooltipCornerRadius: 6,

      // Number - Pixel offset from point x to tooltip edge
      tooltipXOffset: 10,

      // String - Template string for single tooltips
      tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

      // String - Template string for single tooltips
      multiTooltipTemplate: "<%= value %>",

      // String - Colour behind the legend colour block
      multiTooltipKeyBackground: '#fff',

      // Function - Will fire on animation progression.
      onAnimationProgress: function(){},

      // Function - Will fire on animation completion.
      onAnimationComplete: function(){}

    }
  };

  //Create a dictionary of chart types, to allow for extension of existing types
  Chart.types = {};

  //Global Chart helpers object for utility methods and classes
  var helpers = Chart.helpers = {};

    //-- Basic js utility methods
  var each = helpers.each = function(loopable,callback,self){
      var additionalArgs = Array.prototype.slice.call(arguments, 3);
      // Check to see if null or undefined firstly.
      if (loopable){
        if (loopable.length === +loopable.length){
          var i;
          for (i=0; i<loopable.length; i++){
            callback.apply(self,[loopable[i], i].concat(additionalArgs));
          }
        }
        else{
          for (var item in loopable){
            callback.apply(self,[loopable[item],item].concat(additionalArgs));
          }
        }
      }
    },
    clone = helpers.clone = function(obj){
      var objClone = {};
      each(obj,function(value,key){
        if (obj.hasOwnProperty(key)) objClone[key] = value;
      });
      return objClone;
    },
    extend = helpers.extend = function(base){
      each(Array.prototype.slice.call(arguments,1), function(extensionObject) {
        each(extensionObject,function(value,key){
          if (extensionObject.hasOwnProperty(key)) base[key] = value;
        });
      });
      return base;
    },
    merge = helpers.merge = function(base,master){
      //Merge properties in left object over to a shallow clone of object right.
      var args = Array.prototype.slice.call(arguments,0);
      args.unshift({});
      return extend.apply(null, args);
    },
    indexOf = helpers.indexOf = function(arrayToSearch, item){
      if (Array.prototype.indexOf) {
        return arrayToSearch.indexOf(item);
      }
      else{
        for (var i = 0; i < arrayToSearch.length; i++) {
          if (arrayToSearch[i] === item) return i;
        }
        return -1;
      }
    },
    where = helpers.where = function(collection, filterCallback){
      var filtered = [];

      helpers.each(collection, function(item){
        if (filterCallback(item)){
          filtered.push(item);
        }
      });

      return filtered;
    },
    findNextWhere = helpers.findNextWhere = function(arrayToSearch, filterCallback, startIndex){
      // Default to start of the array
      if (!startIndex){
        startIndex = -1;
      }
      for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
        var currentItem = arrayToSearch[i];
        if (filterCallback(currentItem)){
          return currentItem;
        }
      }
    },
    findPreviousWhere = helpers.findPreviousWhere = function(arrayToSearch, filterCallback, startIndex){
      // Default to end of the array
      if (!startIndex){
        startIndex = arrayToSearch.length;
      }
      for (var i = startIndex - 1; i >= 0; i--) {
        var currentItem = arrayToSearch[i];
        if (filterCallback(currentItem)){
          return currentItem;
        }
      }
    },
    inherits = helpers.inherits = function(extensions){
      //Basic javascript inheritance based on the model created in Backbone.js
      var parent = this;
      var ChartElement = (extensions && extensions.hasOwnProperty("constructor")) ? extensions.constructor : function(){ return parent.apply(this, arguments); };

      var Surrogate = function(){ this.constructor = ChartElement;};
      Surrogate.prototype = parent.prototype;
      ChartElement.prototype = new Surrogate();

      ChartElement.extend = inherits;

      if (extensions) extend(ChartElement.prototype, extensions);

      ChartElement.__super__ = parent.prototype;

      return ChartElement;
    },
    noop = helpers.noop = function(){},
    uid = helpers.uid = (function(){
      var id=0;
      return function(){
        return "chart-" + id++;
      };
    })(),
    warn = helpers.warn = function(str){
      //Method for warning of errors
      if (window.console && typeof window.console.warn == "function") console.warn(str);
    },
    amd = helpers.amd = (typeof define == 'function' && define.amd),
    //-- Math methods
    isNumber = helpers.isNumber = function(n){
      return !isNaN(parseFloat(n)) && isFinite(n);
    },
    max = helpers.max = function(array){
      return Math.max.apply( Math, array );
    },
    min = helpers.min = function(array){
      return Math.min.apply( Math, array );
    },
    cap = helpers.cap = function(valueToCap,maxValue,minValue){
      if(isNumber(maxValue)) {
        if( valueToCap > maxValue ) {
          return maxValue;
        }
      }
      else if(isNumber(minValue)){
        if ( valueToCap < minValue ){
          return minValue;
        }
      }
      return valueToCap;
    },
    getDecimalPlaces = helpers.getDecimalPlaces = function(num){
      if (num%1!==0 && isNumber(num)){
        return num.toString().split(".")[1].length;
      }
      else {
        return 0;
      }
    },
    toRadians = helpers.radians = function(degrees){
      return degrees * (Math.PI/180);
    },
    // Gets the angle from vertical upright to the point about a centre.
    getAngleFromPoint = helpers.getAngleFromPoint = function(centrePoint, anglePoint){
      var distanceFromXCenter = anglePoint.x - centrePoint.x,
        distanceFromYCenter = anglePoint.y - centrePoint.y,
        radialDistanceFromCenter = Math.sqrt( distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);


      var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);

      //If the segment is in the top left quadrant, we need to add another rotation to the angle
      if (distanceFromXCenter < 0 && distanceFromYCenter < 0){
        angle += Math.PI*2;
      }

      return {
        angle: angle,
        distance: radialDistanceFromCenter
      };
    },
    aliasPixel = helpers.aliasPixel = function(pixelWidth){
      return (pixelWidth % 2 === 0) ? 0 : 0.5;
    },
    splineCurve = helpers.splineCurve = function(FirstPoint,MiddlePoint,AfterPoint,t){
      //Props to Rob Spencer at scaled innovation for his post on splining between points
      //http://scaledinnovation.com/analytics/splines/aboutSplines.html
      var d01=Math.sqrt(Math.pow(MiddlePoint.x-FirstPoint.x,2)+Math.pow(MiddlePoint.y-FirstPoint.y,2)),
        d12=Math.sqrt(Math.pow(AfterPoint.x-MiddlePoint.x,2)+Math.pow(AfterPoint.y-MiddlePoint.y,2)),
        fa=t*d01/(d01+d12),// scaling factor for triangle Ta
        fb=t*d12/(d01+d12);
      return {
        inner : {
          x : MiddlePoint.x-fa*(AfterPoint.x-FirstPoint.x),
          y : MiddlePoint.y-fa*(AfterPoint.y-FirstPoint.y)
        },
        outer : {
          x: MiddlePoint.x+fb*(AfterPoint.x-FirstPoint.x),
          y : MiddlePoint.y+fb*(AfterPoint.y-FirstPoint.y)
        }
      };
    },
    calculateOrderOfMagnitude = helpers.calculateOrderOfMagnitude = function(val){
      return Math.floor(Math.log(val) / Math.LN10);
    },
    calculateScaleRange = helpers.calculateScaleRange = function(valuesArray, drawingSize, textSize, startFromZero, integersOnly){

      //Set a minimum step of two - a point at the top of the graph, and a point at the base
      var minSteps = 2,
        maxSteps = Math.floor(drawingSize/(textSize * 1.5)),
        skipFitting = (minSteps >= maxSteps);

      var maxValue = max(valuesArray),
        minValue = min(valuesArray);

      // We need some degree of seperation here to calculate the scales if all the values are the same
      // Adding/minusing 0.5 will give us a range of 1.
      if (maxValue === minValue){
        maxValue += 0.5;
        // So we don't end up with a graph with a negative start value if we've said always start from zero
        if (minValue >= 0.5 && !startFromZero){
          minValue -= 0.5;
        }
        else{
          // Make up a whole number above the values
          maxValue += 0.5;
        }
      }

      var valueRange = Math.abs(maxValue - minValue),
        rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange),
        graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
        graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
        graphRange = graphMax - graphMin,
        stepValue = Math.pow(10, rangeOrderOfMagnitude),
        numberOfSteps = Math.round(graphRange / stepValue);

      //If we have more space on the graph we'll use it to give more definition to the data
      while((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
        if(numberOfSteps > maxSteps){
          stepValue *=2;
          numberOfSteps = Math.round(graphRange/stepValue);
          // Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
          if (numberOfSteps % 1 !== 0){
            skipFitting = true;
          }
        }
        //We can fit in double the amount of scale points on the scale
        else{
          //If user has declared ints only, and the step value isn't a decimal
          if (integersOnly && rangeOrderOfMagnitude >= 0){
            //If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
            if(stepValue/2 % 1 === 0){
              stepValue /=2;
              numberOfSteps = Math.round(graphRange/stepValue);
            }
            //If it would make it a float break out of the loop
            else{
              break;
            }
          }
          //If the scale doesn't have to be an int, make the scale more granular anyway.
          else{
            stepValue /=2;
            numberOfSteps = Math.round(graphRange/stepValue);
          }

        }
      }

      if (skipFitting){
        numberOfSteps = minSteps;
        stepValue = graphRange / numberOfSteps;
      }

      return {
        steps : numberOfSteps,
        stepValue : stepValue,
        min : graphMin,
        max : graphMin + (numberOfSteps * stepValue)
      };

    },
    /* jshint ignore:start */
    // Blows up jshint errors based on the new Function constructor
    //Templating methods
    //Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
    template = helpers.template = function(templateString, valuesObject){

      // If templateString is function rather than string-template - call the function for valuesObject

      if(templateString instanceof Function){
        return templateString(valuesObject);
      }

      var cache = {};
      function tmpl(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
        cache[str] = cache[str] :

        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj",
          "var p=[],print=function(){p.push.apply(p,arguments);};" +

          // Introduce the data as local variables using with(){}
          "with(obj){p.push('" +

          // Convert the template into pure JavaScript
          str
            .replace(/[\r\t\n]/g, " ")
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'") +
          "');}return p.join('');"
        );

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
      }
      return tmpl(templateString,valuesObject);
    },
    /* jshint ignore:end */
    generateLabels = helpers.generateLabels = function(templateString,numberOfSteps,graphMin,stepValue){
      var labelsArray = new Array(numberOfSteps);
      if (labelTemplateString){
        each(labelsArray,function(val,index){
          labelsArray[index] = template(templateString,{value: (graphMin + (stepValue*(index+1)))});
        });
      }
      return labelsArray;
    },
    //--Animation methods
    //Easing functions adapted from Robert Penner's easing equations
    //http://www.robertpenner.com/easing/
    easingEffects = helpers.easingEffects = {
      linear: function (t) {
        return t;
      },
      easeInQuad: function (t) {
        return t * t;
      },
      easeOutQuad: function (t) {
        return -1 * t * (t - 2);
      },
      easeInOutQuad: function (t) {
        if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
        return -1 / 2 * ((--t) * (t - 2) - 1);
      },
      easeInCubic: function (t) {
        return t * t * t;
      },
      easeOutCubic: function (t) {
        return 1 * ((t = t / 1 - 1) * t * t + 1);
      },
      easeInOutCubic: function (t) {
        if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
        return 1 / 2 * ((t -= 2) * t * t + 2);
      },
      easeInQuart: function (t) {
        return t * t * t * t;
      },
      easeOutQuart: function (t) {
        return -1 * ((t = t / 1 - 1) * t * t * t - 1);
      },
      easeInOutQuart: function (t) {
        if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
        return -1 / 2 * ((t -= 2) * t * t * t - 2);
      },
      easeInQuint: function (t) {
        return 1 * (t /= 1) * t * t * t * t;
      },
      easeOutQuint: function (t) {
        return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
      },
      easeInOutQuint: function (t) {
        if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
        return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
      },
      easeInSine: function (t) {
        return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
      },
      easeOutSine: function (t) {
        return 1 * Math.sin(t / 1 * (Math.PI / 2));
      },
      easeInOutSine: function (t) {
        return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
      },
      easeInExpo: function (t) {
        return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
      },
      easeOutExpo: function (t) {
        return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
      },
      easeInOutExpo: function (t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
        return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
      },
      easeInCirc: function (t) {
        if (t >= 1) return t;
        return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
      },
      easeOutCirc: function (t) {
        return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
      },
      easeInOutCirc: function (t) {
        if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
        return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
      },
      easeInElastic: function (t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) return 0;
        if ((t /= 1) == 1) return 1;
        if (!p) p = 1 * 0.3;
        if (a < Math.abs(1)) {
          a = 1;
          s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(1 / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
      },
      easeOutElastic: function (t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) return 0;
        if ((t /= 1) == 1) return 1;
        if (!p) p = 1 * 0.3;
        if (a < Math.abs(1)) {
          a = 1;
          s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(1 / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
      },
      easeInOutElastic: function (t) {
        var s = 1.70158;
        var p = 0;
        var a = 1;
        if (t === 0) return 0;
        if ((t /= 1 / 2) == 2) return 1;
        if (!p) p = 1 * (0.3 * 1.5);
        if (a < Math.abs(1)) {
          a = 1;
          s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(1 / a);
        if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
      },
      easeInBack: function (t) {
        var s = 1.70158;
        return 1 * (t /= 1) * t * ((s + 1) * t - s);
      },
      easeOutBack: function (t) {
        var s = 1.70158;
        return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
      },
      easeInOutBack: function (t) {
        var s = 1.70158;
        if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
        return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
      },
      easeInBounce: function (t) {
        return 1 - easingEffects.easeOutBounce(1 - t);
      },
      easeOutBounce: function (t) {
        if ((t /= 1) < (1 / 2.75)) {
          return 1 * (7.5625 * t * t);
        } else if (t < (2 / 2.75)) {
          return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
        } else if (t < (2.5 / 2.75)) {
          return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
        } else {
          return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
        }
      },
      easeInOutBounce: function (t) {
        if (t < 1 / 2) return easingEffects.easeInBounce(t * 2) * 0.5;
        return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
      }
    },
    //Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    requestAnimFrame = helpers.requestAnimFrame = (function(){
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
          return window.setTimeout(callback, 1000 / 60);
        };
    })(),
    cancelAnimFrame = helpers.cancelAnimFrame = (function(){
      return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        function(callback) {
          return window.clearTimeout(callback, 1000 / 60);
        };
    })(),
    animationLoop = helpers.animationLoop = function(callback,totalSteps,easingString,onProgress,onComplete,chartInstance){

      var currentStep = 0,
        easingFunction = easingEffects[easingString] || easingEffects.linear;

      var animationFrame = function(){
        currentStep++;
        var stepDecimal = currentStep/totalSteps;
        var easeDecimal = easingFunction(stepDecimal);

        callback.call(chartInstance,easeDecimal,stepDecimal, currentStep);
        onProgress.call(chartInstance,easeDecimal,stepDecimal);
        if (currentStep < totalSteps){
          chartInstance.animationFrame = requestAnimFrame(animationFrame);
        } else{
          onComplete.apply(chartInstance);
        }
      };
      requestAnimFrame(animationFrame);
    },
    //-- DOM methods
    getRelativePosition = helpers.getRelativePosition = function(evt){
      var mouseX, mouseY;
      var e = evt.originalEvent || evt,
        canvas = evt.currentTarget || evt.srcElement,
        boundingRect = canvas.getBoundingClientRect();

      if (e.touches){
        mouseX = e.touches[0].clientX - boundingRect.left;
        mouseY = e.touches[0].clientY - boundingRect.top;

      }
      else{
        mouseX = e.clientX - boundingRect.left;
        mouseY = e.clientY - boundingRect.top;
      }

      return {
        x : mouseX,
        y : mouseY
      };

    },
    addEvent = helpers.addEvent = function(node,eventType,method){
      if (node.addEventListener){
        node.addEventListener(eventType,method);
      } else if (node.attachEvent){
        node.attachEvent("on"+eventType, method);
      } else {
        node["on"+eventType] = method;
      }
    },
    removeEvent = helpers.removeEvent = function(node, eventType, handler){
      if (node.removeEventListener){
        node.removeEventListener(eventType, handler, false);
      } else if (node.detachEvent){
        node.detachEvent("on"+eventType,handler);
      } else{
        node["on" + eventType] = noop;
      }
    },
    bindEvents = helpers.bindEvents = function(chartInstance, arrayOfEvents, handler){
      // Create the events object if it's not already present
      if (!chartInstance.events) chartInstance.events = {};

      each(arrayOfEvents,function(eventName){
        chartInstance.events[eventName] = function(){
          handler.apply(chartInstance, arguments);
        };
        addEvent(chartInstance.chart.canvas,eventName,chartInstance.events[eventName]);
      });
    },
    unbindEvents = helpers.unbindEvents = function (chartInstance, arrayOfEvents) {
      each(arrayOfEvents, function(handler,eventName){
        removeEvent(chartInstance.chart.canvas, eventName, handler);
      });
    },
    getMaximumWidth = helpers.getMaximumWidth = function(domNode){
      var container = domNode.parentNode;
      // TODO = check cross browser stuff with this.
      return container.clientWidth;
    },
    getMaximumHeight = helpers.getMaximumHeight = function(domNode){
      var container = domNode.parentNode;
      // TODO = check cross browser stuff with this.
      return container.clientHeight;
    },
    getMaximumSize = helpers.getMaximumSize = helpers.getMaximumWidth, // legacy support
    retinaScale = helpers.retinaScale = function(chart){
      var ctx = chart.ctx,
        width = chart.canvas.width,
        height = chart.canvas.height;

      if (window.devicePixelRatio) {
        ctx.canvas.style.width = width + "px";
        ctx.canvas.style.height = height + "px";
        ctx.canvas.height = height * window.devicePixelRatio;
        ctx.canvas.width = width * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    },
    //-- Canvas methods
    clear = helpers.clear = function(chart){
      chart.ctx.clearRect(0,0,chart.width,chart.height);
    },
    fontString = helpers.fontString = function(pixelSize,fontStyle,fontFamily){
      return fontStyle + " " + pixelSize+"px " + fontFamily;
    },
    longestText = helpers.longestText = function(ctx,font,arrayOfStrings){
      ctx.font = font;
      var longest = 0;
      each(arrayOfStrings,function(string){
        var textWidth = ctx.measureText(string).width;
        longest = (textWidth > longest) ? textWidth : longest;
      });
      return longest;
    },
    drawRoundedRectangle = helpers.drawRoundedRectangle = function(ctx,x,y,width,height,radius){
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };


  //Store a reference to each instance - allowing us to globally resize chart instances on window resize.
  //Destroy method on the chart will remove the instance of the chart from this reference.
  Chart.instances = {};

  Chart.Type = function(data,options,chart){
    this.options = options;
    this.chart = chart;
    this.id = uid();
    //Add the chart instance to the global namespace
    Chart.instances[this.id] = this;

    // Initialize is always called when a chart type is created
    // By default it is a no op, but it should be extended
    if (options.responsive){
      this.resize();
    }
    this.initialize.call(this,data);
  };

  //Core methods that'll be a part of every chart type
  extend(Chart.Type.prototype,{
    initialize : function(){return this;},
    clear : function(){
      clear(this.chart);
      return this;
    },
    stop : function(){
      // Stops any current animation loop occuring
      cancelAnimFrame(this.animationFrame);
      return this;
    },
    resize : function(callback){
      this.stop();
      var canvas = this.chart.canvas,
        newWidth = getMaximumWidth(this.chart.canvas),
        newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);

      canvas.width = this.chart.width = newWidth;
      canvas.height = this.chart.height = newHeight;

      retinaScale(this.chart);

      if (typeof callback === "function"){
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
      }
      return this;
    },
    reflow : noop,
    render : function(reflow){
      if (reflow){
        this.reflow();
      }
      if (this.options.animation && !reflow){
        helpers.animationLoop(
          this.draw,
          this.options.animationSteps,
          this.options.animationEasing,
          this.options.onAnimationProgress,
          this.options.onAnimationComplete,
          this
        );
      }
      else{
        this.draw();
        this.options.onAnimationComplete.call(this);
      }
      return this;
    },
    generateLegend : function(){
      return template(this.options.legendTemplate,this);
    },
    destroy : function(){
      this.clear();
      unbindEvents(this, this.events);
      var canvas = this.chart.canvas;

      // Reset canvas height/width attributes starts a fresh with the canvas context
      canvas.width = this.chart.width;
      canvas.height = this.chart.height;

      // < IE9 doesn't support removeProperty
      if (canvas.style.removeProperty) {
        canvas.style.removeProperty('width');
        canvas.style.removeProperty('height');
      } else {
        canvas.style.removeAttribute('width');
        canvas.style.removeAttribute('height');
      }

      delete Chart.instances[this.id];
    },
    showTooltip : function(ChartElements, forceRedraw){
      // Only redraw the chart if we've actually changed what we're hovering on.
      if (typeof this.activeElements === 'undefined') this.activeElements = [];

      var isChanged = (function(Elements){
        var changed = false;

        if (Elements.length !== this.activeElements.length){
          changed = true;
          return changed;
        }

        each(Elements, function(element, index){
          if (element !== this.activeElements[index]){
            changed = true;
          }
        }, this);
        return changed;
      }).call(this, ChartElements);

      if (!isChanged && !forceRedraw){
        return;
      }
      else{
        this.activeElements = ChartElements;
      }
      this.draw();
      if(this.options.customTooltips){
        this.options.customTooltips(false);
      }
      if (ChartElements.length > 0){
        // If we have multiple datasets, show a MultiTooltip for all of the data points at that index
        if (this.datasets && this.datasets.length > 1) {
          var dataArray,
            dataIndex;

          for (var i = this.datasets.length - 1; i >= 0; i--) {
            dataArray = this.datasets[i].points || this.datasets[i].bars || this.datasets[i].segments;
            dataIndex = indexOf(dataArray, ChartElements[0]);
            if (dataIndex !== -1){
              break;
            }
          }
          var tooltipLabels = [],
            tooltipColors = [],
            medianPosition = (function(index) {

              // Get all the points at that particular index
              var Elements = [],
                dataCollection,
                xPositions = [],
                yPositions = [],
                xMax,
                yMax,
                xMin,
                yMin;
              helpers.each(this.datasets, function(dataset){
                dataCollection = dataset.points || dataset.bars || dataset.segments;
                if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()){
                  Elements.push(dataCollection[dataIndex]);
                }
              });

              helpers.each(Elements, function(element) {
                xPositions.push(element.x);
                yPositions.push(element.y);


                //Include any colour information about the element
                tooltipLabels.push(helpers.template(this.options.multiTooltipTemplate, element));
                tooltipColors.push({
                  fill: element._saved.fillColor || element.fillColor,
                  stroke: element._saved.strokeColor || element.strokeColor
                });

              }, this);

              yMin = min(yPositions);
              yMax = max(yPositions);

              xMin = min(xPositions);
              xMax = max(xPositions);

              return {
                x: (xMin > this.chart.width/2) ? xMin : xMax,
                y: (yMin + yMax)/2
              };
            }).call(this, dataIndex);

          new Chart.MultiTooltip({
            x: medianPosition.x,
            y: medianPosition.y,
            xPadding: this.options.tooltipXPadding,
            yPadding: this.options.tooltipYPadding,
            xOffset: this.options.tooltipXOffset,
            fillColor: this.options.tooltipFillColor,
            textColor: this.options.tooltipFontColor,
            fontFamily: this.options.tooltipFontFamily,
            fontStyle: this.options.tooltipFontStyle,
            fontSize: this.options.tooltipFontSize,
            titleTextColor: this.options.tooltipTitleFontColor,
            titleFontFamily: this.options.tooltipTitleFontFamily,
            titleFontStyle: this.options.tooltipTitleFontStyle,
            titleFontSize: this.options.tooltipTitleFontSize,
            cornerRadius: this.options.tooltipCornerRadius,
            labels: tooltipLabels,
            legendColors: tooltipColors,
            legendColorBackground : this.options.multiTooltipKeyBackground,
            title: ChartElements[0].label,
            chart: this.chart,
            ctx: this.chart.ctx,
            custom: this.options.customTooltips
          }).draw();

        } else {
          each(ChartElements, function(Element) {
            var tooltipPosition = Element.tooltipPosition();
            new Chart.Tooltip({
              x: Math.round(tooltipPosition.x),
              y: Math.round(tooltipPosition.y),
              xPadding: this.options.tooltipXPadding,
              yPadding: this.options.tooltipYPadding,
              fillColor: this.options.tooltipFillColor,
              textColor: this.options.tooltipFontColor,
              fontFamily: this.options.tooltipFontFamily,
              fontStyle: this.options.tooltipFontStyle,
              fontSize: this.options.tooltipFontSize,
              caretHeight: this.options.tooltipCaretSize,
              cornerRadius: this.options.tooltipCornerRadius,
              text: template(this.options.tooltipTemplate, Element),
              chart: this.chart,
              custom: this.options.customTooltips
            }).draw();
          }, this);
        }
      }
      return this;
    },
    toBase64Image : function(){
      return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
    }
  });

  Chart.Type.extend = function(extensions){

    var parent = this;

    var ChartType = function(){
      return parent.apply(this,arguments);
    };

    //Copy the prototype object of the this class
    ChartType.prototype = clone(parent.prototype);
    //Now overwrite some of the properties in the base class with the new extensions
    extend(ChartType.prototype, extensions);

    ChartType.extend = Chart.Type.extend;

    if (extensions.name || parent.prototype.name){

      var chartName = extensions.name || parent.prototype.name;
      //Assign any potential default values of the new chart type

      //If none are defined, we'll use a clone of the chart type this is being extended from.
      //I.e. if we extend a line chart, we'll use the defaults from the line chart if our new chart
      //doesn't define some defaults of their own.

      var baseDefaults = (Chart.defaults[parent.prototype.name]) ? clone(Chart.defaults[parent.prototype.name]) : {};

      Chart.defaults[chartName] = extend(baseDefaults,extensions.defaults);

      Chart.types[chartName] = ChartType;

      //Register this new chart type in the Chart prototype
      Chart.prototype[chartName] = function(data,options){
        var config = merge(Chart.defaults.global, Chart.defaults[chartName], options || {});
        return new ChartType(data,config,this);
      };
    } else{
      warn("Name not provided for this chart, so it hasn't been registered");
    }
    return parent;
  };

  Chart.Element = function(configuration){
    extend(this,configuration);
    this.initialize.apply(this,arguments);
    this.save();
  };
  extend(Chart.Element.prototype,{
    initialize : function(){},
    restore : function(props){
      if (!props){
        extend(this,this._saved);
      } else {
        each(props,function(key){
          this[key] = this._saved[key];
        },this);
      }
      return this;
    },
    save : function(){
      this._saved = clone(this);
      delete this._saved._saved;
      return this;
    },
    update : function(newProps){
      each(newProps,function(value,key){
        this._saved[key] = this[key];
        this[key] = value;
      },this);
      return this;
    },
    transition : function(props,ease){
      each(props,function(value,key){
        this[key] = ((value - this._saved[key]) * ease) + this._saved[key];
      },this);
      return this;
    },
    tooltipPosition : function(){
      return {
        x : this.x,
        y : this.y
      };
    },
    hasValue: function(){
      return isNumber(this.value);
    }
  });

  Chart.Element.extend = inherits;


  Chart.Point = Chart.Element.extend({
    display: true,
    inRange: function(chartX,chartY){
      var hitDetectionRange = this.hitDetectionRadius + this.radius;
      return ((Math.pow(chartX-this.x, 2)+Math.pow(chartY-this.y, 2)) < Math.pow(hitDetectionRange,2));
    },
    draw : function(){
      if (this.display){
        var ctx = this.ctx;
        ctx.beginPath();

        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.closePath();

        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;

        ctx.fillStyle = this.fillColor;

        ctx.fill();
        ctx.stroke();
      }


      //Quick debug for bezier curve splining
      //Highlights control points and the line between them.
      //Handy for dev - stripped in the min version.

      // ctx.save();
      // ctx.fillStyle = "black";
      // ctx.strokeStyle = "black"
      // ctx.beginPath();
      // ctx.arc(this.controlPoints.inner.x,this.controlPoints.inner.y, 2, 0, Math.PI*2);
      // ctx.fill();

      // ctx.beginPath();
      // ctx.arc(this.controlPoints.outer.x,this.controlPoints.outer.y, 2, 0, Math.PI*2);
      // ctx.fill();

      // ctx.moveTo(this.controlPoints.inner.x,this.controlPoints.inner.y);
      // ctx.lineTo(this.x, this.y);
      // ctx.lineTo(this.controlPoints.outer.x,this.controlPoints.outer.y);
      // ctx.stroke();

      // ctx.restore();



    }
  });

  Chart.Arc = Chart.Element.extend({
    inRange : function(chartX,chartY){

      var pointRelativePosition = helpers.getAngleFromPoint(this, {
        x: chartX,
        y: chartY
      });

      //Check if within the range of the open/close angle
      var betweenAngles = (pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle),
        withinRadius = (pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius);

      return (betweenAngles && withinRadius);
      //Ensure within the outside of the arc centre, but inside arc outer
    },
    tooltipPosition : function(){
      var centreAngle = this.startAngle + ((this.endAngle - this.startAngle) / 2),
        rangeFromCentre = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
      return {
        x : this.x + (Math.cos(centreAngle) * rangeFromCentre),
        y : this.y + (Math.sin(centreAngle) * rangeFromCentre)
      };
    },
    draw : function(animationPercent){

      var easingDecimal = animationPercent || 1;

      var ctx = this.ctx;

      ctx.beginPath();

      ctx.arc(this.x, this.y, this.outerRadius, this.startAngle, this.endAngle);

      ctx.arc(this.x, this.y, this.innerRadius, this.endAngle, this.startAngle, true);

      ctx.closePath();
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWidth;

      ctx.fillStyle = this.fillColor;

      ctx.fill();
      ctx.lineJoin = 'bevel';

      if (this.showStroke){
        ctx.stroke();
      }
    }
  });

  Chart.Rectangle = Chart.Element.extend({
    draw : function(){
      var ctx = this.ctx,
        halfWidth = this.width/2,
        leftX = this.x - halfWidth,
        rightX = this.x + halfWidth,
        top = this.base - (this.base - this.y),
        halfStroke = this.strokeWidth / 2;

      // Canvas doesn't allow us to stroke inside the width so we can
      // adjust the sizes to fit if we're setting a stroke on the line
      if (this.showStroke){
        leftX += halfStroke;
        rightX -= halfStroke;
        top += halfStroke;
      }

      ctx.beginPath();

      ctx.fillStyle = this.fillColor;
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWidth;

      // It'd be nice to keep this class totally generic to any rectangle
      // and simply specify which border to miss out.
      ctx.moveTo(leftX, this.base);
      ctx.lineTo(leftX, top);
      ctx.lineTo(rightX, top);
      ctx.lineTo(rightX, this.base);
      ctx.fill();
      if (this.showStroke){
        ctx.stroke();
      }
    },
    height : function(){
      return this.base - this.y;
    },
    inRange : function(chartX,chartY){
      return (chartX >= this.x - this.width/2 && chartX <= this.x + this.width/2) && (chartY >= this.y && chartY <= this.base);
    }
  });

  Chart.Tooltip = Chart.Element.extend({
    draw : function(){

      var ctx = this.chart.ctx;

      ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);

      this.xAlign = "center";
      this.yAlign = "above";

      //Distance between the actual element.y position and the start of the tooltip caret
      var caretPadding = this.caretPadding = 2;

      var tooltipWidth = ctx.measureText(this.text).width + 2*this.xPadding,
        tooltipRectHeight = this.fontSize + 2*this.yPadding,
        tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;

      if (this.x + tooltipWidth/2 >this.chart.width){
        this.xAlign = "left";
      } else if (this.x - tooltipWidth/2 < 0){
        this.xAlign = "right";
      }

      if (this.y - tooltipHeight < 0){
        this.yAlign = "below";
      }


      var tooltipX = this.x - tooltipWidth/2,
        tooltipY = this.y - tooltipHeight;

      ctx.fillStyle = this.fillColor;

      // Custom Tooltips
      if(this.custom){
        this.custom(this);
      }
      else{
        switch(this.yAlign)
        {
        case "above":
          //Draw a caret above the x/y
          ctx.beginPath();
          ctx.moveTo(this.x,this.y - caretPadding);
          ctx.lineTo(this.x + this.caretHeight, this.y - (caretPadding + this.caretHeight));
          ctx.lineTo(this.x - this.caretHeight, this.y - (caretPadding + this.caretHeight));
          ctx.closePath();
          ctx.fill();
          break;
        case "below":
          tooltipY = this.y + caretPadding + this.caretHeight;
          //Draw a caret below the x/y
          ctx.beginPath();
          ctx.moveTo(this.x, this.y + caretPadding);
          ctx.lineTo(this.x + this.caretHeight, this.y + caretPadding + this.caretHeight);
          ctx.lineTo(this.x - this.caretHeight, this.y + caretPadding + this.caretHeight);
          ctx.closePath();
          ctx.fill();
          break;
        }

        switch(this.xAlign)
        {
        case "left":
          tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
          break;
        case "right":
          tooltipX = this.x - (this.cornerRadius + this.caretHeight);
          break;
        }

        drawRoundedRectangle(ctx,tooltipX,tooltipY,tooltipWidth,tooltipRectHeight,this.cornerRadius);

        ctx.fill();

        ctx.fillStyle = this.textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.text, tooltipX + tooltipWidth/2, tooltipY + tooltipRectHeight/2);
      }
    }
  });

  Chart.MultiTooltip = Chart.Element.extend({
    initialize : function(){
      this.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);

      this.titleFont = fontString(this.titleFontSize,this.titleFontStyle,this.titleFontFamily);

      this.height = (this.labels.length * this.fontSize) + ((this.labels.length-1) * (this.fontSize/2)) + (this.yPadding*2) + this.titleFontSize *1.5;

      this.ctx.font = this.titleFont;

      var titleWidth = this.ctx.measureText(this.title).width,
        //Label has a legend square as well so account for this.
        labelWidth = longestText(this.ctx,this.font,this.labels) + this.fontSize + 3,
        longestTextWidth = max([labelWidth,titleWidth]);

      this.width = longestTextWidth + (this.xPadding*2);


      var halfHeight = this.height/2;

      //Check to ensure the height will fit on the canvas
      if (this.y - halfHeight < 0 ){
        this.y = halfHeight;
      } else if (this.y + halfHeight > this.chart.height){
        this.y = this.chart.height - halfHeight;
      }

      //Decide whether to align left or right based on position on canvas
      if (this.x > this.chart.width/2){
        this.x -= this.xOffset + this.width;
      } else {
        this.x += this.xOffset;
      }


    },
    getLineHeight : function(index){
      var baseLineHeight = this.y - (this.height/2) + this.yPadding,
        afterTitleIndex = index-1;

      //If the index is zero, we're getting the title
      if (index === 0){
        return baseLineHeight + this.titleFontSize/2;
      } else{
        return baseLineHeight + ((this.fontSize*1.5*afterTitleIndex) + this.fontSize/2) + this.titleFontSize * 1.5;
      }

    },
    draw : function(){
      // Custom Tooltips
      if(this.custom){
        this.custom(this);
      }
      else{
        drawRoundedRectangle(this.ctx,this.x,this.y - this.height/2,this.width,this.height,this.cornerRadius);
        var ctx = this.ctx;
        ctx.fillStyle = this.fillColor;
        ctx.fill();
        ctx.closePath();

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.titleTextColor;
        ctx.font = this.titleFont;

        ctx.fillText(this.title,this.x + this.xPadding, this.getLineHeight(0));

        ctx.font = this.font;
        helpers.each(this.labels,function(label,index){
          ctx.fillStyle = this.textColor;
          ctx.fillText(label,this.x + this.xPadding + this.fontSize + 3, this.getLineHeight(index + 1));

          //A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
          //ctx.clearRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);
          //Instead we'll make a white filled block to put the legendColour palette over.

          ctx.fillStyle = this.legendColorBackground;
          ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);

          ctx.fillStyle = this.legendColors[index].fill;
          ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);


        },this);
      }
    }
  });

  Chart.Scale = Chart.Element.extend({
    initialize : function(){
      this.fit();
    },
    buildYLabels : function(){
      this.yLabels = [];

      var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

      for (var i=0; i<=this.steps; i++){
        this.yLabels.push(template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)}));
      }
      this.yLabelWidth = (this.display && this.showLabels) ? longestText(this.ctx,this.font,this.yLabels) : 0;
    },
    addXLabel : function(label){
      this.xLabels.push(label);
      this.valuesCount++;
      this.fit();
    },
    removeXLabel : function(){
      this.xLabels.shift();
      this.valuesCount--;
      this.fit();
    },
    // Fitting loop to rotate x Labels and figure out what fits there, and also calculate how many Y steps to use
    fit: function(){
      // First we need the width of the yLabels, assuming the xLabels aren't rotated

      // To do that we need the base line at the top and base of the chart, assuming there is no x label rotation
      this.startPoint = (this.display) ? this.fontSize : 0;
      this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels

      // Apply padding settings to the start and end point.
      this.startPoint += this.padding;
      this.endPoint -= this.padding;

      // Cache the starting height, so can determine if we need to recalculate the scale yAxis
      var cachedHeight = this.endPoint - this.startPoint,
        cachedYLabelWidth;

      // Build the current yLabels so we have an idea of what size they'll be to start
      /*
       *  This sets what is returned from calculateScaleRange as static properties of this class:
       *
        this.steps;
        this.stepValue;
        this.min;
        this.max;
       *
       */
      this.calculateYRange(cachedHeight);

      // With these properties set we can now build the array of yLabels
      // and also the width of the largest yLabel
      this.buildYLabels();

      this.calculateXLabelRotation();

      while((cachedHeight > this.endPoint - this.startPoint)){
        cachedHeight = this.endPoint - this.startPoint;
        cachedYLabelWidth = this.yLabelWidth;

        this.calculateYRange(cachedHeight);
        this.buildYLabels();

        // Only go through the xLabel loop again if the yLabel width has changed
        if (cachedYLabelWidth < this.yLabelWidth){
          this.calculateXLabelRotation();
        }
      }

    },
    calculateXLabelRotation : function(){
      //Get the width of each grid by calculating the difference
      //between x offsets between 0 and 1.

      this.ctx.font = this.font;

      var firstWidth = this.ctx.measureText(this.xLabels[0]).width,
        lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width,
        firstRotated,
        lastRotated;


      this.xScalePaddingRight = lastWidth/2 + 3;
      this.xScalePaddingLeft = (firstWidth/2 > this.yLabelWidth + 10) ? firstWidth/2 : this.yLabelWidth + 10;

      this.xLabelRotation = 0;
      if (this.display){
        var originalLabelWidth = longestText(this.ctx,this.font,this.xLabels),
          cosRotation,
          firstRotatedWidth;
        this.xLabelWidth = originalLabelWidth;
        //Allow 3 pixels x2 padding either side for label readability
        var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;

        //Max label rotate should be 90 - also act as a loop counter
        while ((this.xLabelWidth > xGridWidth && this.xLabelRotation === 0) || (this.xLabelWidth > xGridWidth && this.xLabelRotation <= 90 && this.xLabelRotation > 0)){
          cosRotation = Math.cos(toRadians(this.xLabelRotation));

          firstRotated = cosRotation * firstWidth;
          lastRotated = cosRotation * lastWidth;

          // We're right aligning the text now.
          if (firstRotated + this.fontSize / 2 > this.yLabelWidth + 8){
            this.xScalePaddingLeft = firstRotated + this.fontSize / 2;
          }
          this.xScalePaddingRight = this.fontSize/2;


          this.xLabelRotation++;
          this.xLabelWidth = cosRotation * originalLabelWidth;

        }
        if (this.xLabelRotation > 0){
          this.endPoint -= Math.sin(toRadians(this.xLabelRotation))*originalLabelWidth + 3;
        }
      }
      else{
        this.xLabelWidth = 0;
        this.xScalePaddingRight = this.padding;
        this.xScalePaddingLeft = this.padding;
      }

    },
    // Needs to be overidden in each Chart type
    // Otherwise we need to pass all the data into the scale class
    calculateYRange: noop,
    drawingArea: function(){
      return this.startPoint - this.endPoint;
    },
    calculateY : function(value){
      var scalingFactor = this.drawingArea() / (this.min - this.max);
      return this.endPoint - (scalingFactor * (value - this.min));
    },
    calculateX : function(index){
      var isRotated = (this.xLabelRotation > 0),
        // innerWidth = (this.offsetGridLines) ? this.width - offsetLeft - this.padding : this.width - (offsetLeft + halfLabelWidth * 2) - this.padding,
        innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight),
        valueWidth = innerWidth/Math.max((this.valuesCount - ((this.offsetGridLines) ? 0 : 1)), 1),
        valueOffset = (valueWidth * index) + this.xScalePaddingLeft;

      if (this.offsetGridLines){
        valueOffset += (valueWidth/2);
      }

      return Math.round(valueOffset);
    },
    update : function(newProps){
      helpers.extend(this, newProps);
      this.fit();
    },
    draw : function(){
      var ctx = this.ctx,
        yLabelGap = (this.endPoint - this.startPoint) / this.steps,
        xStart = Math.round(this.xScalePaddingLeft);
      if (this.display){
        ctx.fillStyle = this.textColor;
        ctx.font = this.font;
        each(this.yLabels,function(labelString,index){
          var yLabelCenter = this.endPoint - (yLabelGap * index),
            linePositionY = Math.round(yLabelCenter),
            drawHorizontalLine = this.showHorizontalLines;

          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          if (this.showLabels){
            ctx.fillText(labelString,xStart - 10,yLabelCenter);
          }

          // This is X axis, so draw it
          if (index === 0 && !drawHorizontalLine){
            drawHorizontalLine = true;
          }

          if (drawHorizontalLine){
            ctx.beginPath();
          }

          if (index > 0){
            // This is a grid line in the centre, so drop that
            ctx.lineWidth = this.gridLineWidth;
            ctx.strokeStyle = this.gridLineColor;
          } else {
            // This is the first line on the scale
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = this.lineColor;
          }

          linePositionY += helpers.aliasPixel(ctx.lineWidth);

          if(drawHorizontalLine){
            ctx.moveTo(xStart, linePositionY);
            ctx.lineTo(this.width, linePositionY);
            ctx.stroke();
            ctx.closePath();
          }

          ctx.lineWidth = this.lineWidth;
          ctx.strokeStyle = this.lineColor;
          ctx.beginPath();
          ctx.moveTo(xStart - 5, linePositionY);
          ctx.lineTo(xStart, linePositionY);
          ctx.stroke();
          ctx.closePath();

        },this);

        each(this.xLabels,function(label,index){
          var xPos = this.calculateX(index) + aliasPixel(this.lineWidth),
            // Check to see if line/bar here and decide where to place the line
            linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + aliasPixel(this.lineWidth),
            isRotated = (this.xLabelRotation > 0),
            drawVerticalLine = this.showVerticalLines;

          // This is Y axis, so draw it
          if (index === 0 && !drawVerticalLine){
            drawVerticalLine = true;
          }

          if (drawVerticalLine){
            ctx.beginPath();
          }

          if (index > 0){
            // This is a grid line in the centre, so drop that
            ctx.lineWidth = this.gridLineWidth;
            ctx.strokeStyle = this.gridLineColor;
          } else {
            // This is the first line on the scale
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = this.lineColor;
          }

          if (drawVerticalLine){
            ctx.moveTo(linePos,this.endPoint);
            ctx.lineTo(linePos,this.startPoint - 3);
            ctx.stroke();
            ctx.closePath();
          }


          ctx.lineWidth = this.lineWidth;
          ctx.strokeStyle = this.lineColor;


          // Small lines at the bottom of the base grid line
          ctx.beginPath();
          ctx.moveTo(linePos,this.endPoint);
          ctx.lineTo(linePos,this.endPoint + 5);
          ctx.stroke();
          ctx.closePath();

          ctx.save();
          ctx.translate(xPos,(isRotated) ? this.endPoint + 12 : this.endPoint + 8);
          ctx.rotate(toRadians(this.xLabelRotation)*-1);
          ctx.font = this.font;
          ctx.textAlign = (isRotated) ? "right" : "center";
          ctx.textBaseline = (isRotated) ? "middle" : "top";
          ctx.fillText(label, 0, 0);
          ctx.restore();
        },this);

      }
    }

  });

  Chart.RadialScale = Chart.Element.extend({
    initialize: function(){
      this.size = min([this.height, this.width]);
      this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
    },
    calculateCenterOffset: function(value){
      // Take into account half font size + the yPadding of the top value
      var scalingFactor = this.drawingArea / (this.max - this.min);

      return (value - this.min) * scalingFactor;
    },
    update : function(){
      if (!this.lineArc){
        this.setScaleSize();
      } else {
        this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
      }
      this.buildYLabels();
    },
    buildYLabels: function(){
      this.yLabels = [];

      var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

      for (var i=0; i<=this.steps; i++){
        this.yLabels.push(template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)}));
      }
    },
    getCircumference : function(){
      return ((Math.PI*2) / this.valuesCount);
    },
    setScaleSize: function(){
      /*
       * Right, this is really confusing and there is a lot of maths going on here
       * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
       *
       * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
       *
       * Solution:
       *
       * We assume the radius of the polygon is half the size of the canvas at first
       * at each index we check if the text overlaps.
       *
       * Where it does, we store that angle and that index.
       *
       * After finding the largest index and angle we calculate how much we need to remove
       * from the shape radius to move the point inwards by that x.
       *
       * We average the left and right distances to get the maximum shape radius that can fit in the box
       * along with labels.
       *
       * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
       * on each side, removing that from the size, halving it and adding the left x protrusion width.
       *
       * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
       * and position it in the most space efficient manner
       *
       * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
       */


      // Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
      // Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
      var largestPossibleRadius = min([(this.height/2 - this.pointLabelFontSize - 5), this.width/2]),
        pointPosition,
        i,
        textWidth,
        halfTextWidth,
        furthestRight = this.width,
        furthestRightIndex,
        furthestRightAngle,
        furthestLeft = 0,
        furthestLeftIndex,
        furthestLeftAngle,
        xProtrusionLeft,
        xProtrusionRight,
        radiusReductionRight,
        radiusReductionLeft,
        maxWidthRadius;
      this.ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
      for (i=0;i<this.valuesCount;i++){
        // 5px to space the text slightly out - similar to what we do in the draw function.
        pointPosition = this.getPointPosition(i, largestPossibleRadius);
        textWidth = this.ctx.measureText(template(this.templateString, { value: this.labels[i] })).width + 5;
        if (i === 0 || i === this.valuesCount/2){
          // If we're at index zero, or exactly the middle, we're at exactly the top/bottom
          // of the radar chart, so text will be aligned centrally, so we'll half it and compare
          // w/left and right text sizes
          halfTextWidth = textWidth/2;
          if (pointPosition.x + halfTextWidth > furthestRight) {
            furthestRight = pointPosition.x + halfTextWidth;
            furthestRightIndex = i;
          }
          if (pointPosition.x - halfTextWidth < furthestLeft) {
            furthestLeft = pointPosition.x - halfTextWidth;
            furthestLeftIndex = i;
          }
        }
        else if (i < this.valuesCount/2) {
          // Less than half the values means we'll left align the text
          if (pointPosition.x + textWidth > furthestRight) {
            furthestRight = pointPosition.x + textWidth;
            furthestRightIndex = i;
          }
        }
        else if (i > this.valuesCount/2){
          // More than half the values means we'll right align the text
          if (pointPosition.x - textWidth < furthestLeft) {
            furthestLeft = pointPosition.x - textWidth;
            furthestLeftIndex = i;
          }
        }
      }

      xProtrusionLeft = furthestLeft;

      xProtrusionRight = Math.ceil(furthestRight - this.width);

      furthestRightAngle = this.getIndexAngle(furthestRightIndex);

      furthestLeftAngle = this.getIndexAngle(furthestLeftIndex);

      radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI/2);

      radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI/2);

      // Ensure we actually need to reduce the size of the chart
      radiusReductionRight = (isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
      radiusReductionLeft = (isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;

      this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight)/2;

      //this.drawingArea = min([maxWidthRadius, (this.height - (2 * (this.pointLabelFontSize + 5)))/2])
      this.setCenterPoint(radiusReductionLeft, radiusReductionRight);

    },
    setCenterPoint: function(leftMovement, rightMovement){

      var maxRight = this.width - rightMovement - this.drawingArea,
        maxLeft = leftMovement + this.drawingArea;

      this.xCenter = (maxLeft + maxRight)/2;
      // Always vertically in the centre as the text height doesn't change
      this.yCenter = (this.height/2);
    },

    getIndexAngle : function(index){
      var angleMultiplier = (Math.PI * 2) / this.valuesCount;
      // Start from the top instead of right, so remove a quarter of the circle

      return index * angleMultiplier - (Math.PI/2);
    },
    getPointPosition : function(index, distanceFromCenter){
      var thisAngle = this.getIndexAngle(index);
      return {
        x : (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
        y : (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
      };
    },
    draw: function(){
      if (this.display){
        var ctx = this.ctx;
        each(this.yLabels, function(label, index){
          // Don't draw a centre value
          if (index > 0){
            var yCenterOffset = index * (this.drawingArea/this.steps),
              yHeight = this.yCenter - yCenterOffset,
              pointPosition;

            // Draw circular lines around the scale
            if (this.lineWidth > 0){
              ctx.strokeStyle = this.lineColor;
              ctx.lineWidth = this.lineWidth;

              if(this.lineArc){
                ctx.beginPath();
                ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI*2);
                ctx.closePath();
                ctx.stroke();
              } else{
                ctx.beginPath();
                for (var i=0;i<this.valuesCount;i++)
                {
                  pointPosition = this.getPointPosition(i, this.calculateCenterOffset(this.min + (index * this.stepValue)));
                  if (i === 0){
                    ctx.moveTo(pointPosition.x, pointPosition.y);
                  } else {
                    ctx.lineTo(pointPosition.x, pointPosition.y);
                  }
                }
                ctx.closePath();
                ctx.stroke();
              }
            }
            if(this.showLabels){
              ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);
              if (this.showLabelBackdrop){
                var labelWidth = ctx.measureText(label).width;
                ctx.fillStyle = this.backdropColor;
                ctx.fillRect(
                  this.xCenter - labelWidth/2 - this.backdropPaddingX,
                  yHeight - this.fontSize/2 - this.backdropPaddingY,
                  labelWidth + this.backdropPaddingX*2,
                  this.fontSize + this.backdropPaddingY*2
                );
              }
              ctx.textAlign = 'center';
              ctx.textBaseline = "middle";
              ctx.fillStyle = this.fontColor;
              ctx.fillText(label, this.xCenter, yHeight);
            }
          }
        }, this);

        if (!this.lineArc){
          ctx.lineWidth = this.angleLineWidth;
          ctx.strokeStyle = this.angleLineColor;
          for (var i = this.valuesCount - 1; i >= 0; i--) {
            if (this.angleLineWidth > 0){
              var outerPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max));
              ctx.beginPath();
              ctx.moveTo(this.xCenter, this.yCenter);
              ctx.lineTo(outerPosition.x, outerPosition.y);
              ctx.stroke();
              ctx.closePath();
            }
            // Extra 3px out for some label spacing
            var pointLabelPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max) + 5);
            ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
            ctx.fillStyle = this.pointLabelFontColor;

            var labelsCount = this.labels.length,
              halfLabelsCount = this.labels.length/2,
              quarterLabelsCount = halfLabelsCount/2,
              upperHalf = (i < quarterLabelsCount || i > labelsCount - quarterLabelsCount),
              exactQuarter = (i === quarterLabelsCount || i === labelsCount - quarterLabelsCount);
            if (i === 0){
              ctx.textAlign = 'center';
            } else if(i === halfLabelsCount){
              ctx.textAlign = 'center';
            } else if (i < halfLabelsCount){
              ctx.textAlign = 'left';
            } else {
              ctx.textAlign = 'right';
            }

            // Set the correct text baseline based on outer positioning
            if (exactQuarter){
              ctx.textBaseline = 'middle';
            } else if (upperHalf){
              ctx.textBaseline = 'bottom';
            } else {
              ctx.textBaseline = 'top';
            }

            ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
          }
        }
      }
    }
  });

  // Attach global event to resize each chart instance when the browser resizes
  helpers.addEvent(window, "resize", (function(){
    // Basic debounce of resize function so it doesn't hurt performance when resizing browser.
    var timeout;
    return function(){
      clearTimeout(timeout);
      timeout = setTimeout(function(){
        each(Chart.instances,function(instance){
          // If the responsive flag is set in the chart instance config
          // Cascade the resize event down to the chart.
          if (instance.options.responsive){
            instance.resize(instance.render, true);
          }
        });
      }, 50);
    };
  })());


  if (amd) {
    define(function(){
      return Chart;
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = Chart;
  }

  root.Chart = Chart;

  Chart.noConflict = function(){
    root.Chart = previous;
    return Chart;
  };

}).call(this);

(function(){
  "use strict";

  var root = this,
    Chart = root.Chart,
    helpers = Chart.helpers;


  var defaultConfig = {
    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
    scaleBeginAtZero : true,

    //Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : true,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,

    //Boolean - If there is a stroke on each bar
    barShowStroke : true,

    //Number - Pixel width of the bar stroke
    barStrokeWidth : 2,

    //Number - Spacing between each of the X value sets
    barValueSpacing : 5,

    //Number - Spacing between data sets within X values
    barDatasetSpacing : 1,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

  };


  Chart.Type.extend({
    name: "Bar",
    defaults : defaultConfig,
    initialize:  function(data){

      //Expose options as a scope variable here so we can access it in the ScaleClass
      var options = this.options;

      this.ScaleClass = Chart.Scale.extend({
        offsetGridLines : true,
        calculateBarX : function(datasetCount, datasetIndex, barIndex){
          //Reusable method for calculating the xPosition of a given bar based on datasetIndex & width of the bar
          var xWidth = this.calculateBaseWidth(),
            xAbsolute = this.calculateX(barIndex) - (xWidth/2),
            barWidth = this.calculateBarWidth(datasetCount);

          return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * options.barDatasetSpacing) + barWidth/2;
        },
        calculateBaseWidth : function(){
          return (this.calculateX(1) - this.calculateX(0)) - (2*options.barValueSpacing);
        },
        calculateBarWidth : function(datasetCount){
          //The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
          var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * options.barDatasetSpacing);

          return (baseWidth / datasetCount);
        }
      });

      this.datasets = [];

      //Set up tooltip events on the chart
      if (this.options.showTooltips){
        helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
          var activeBars = (evt.type !== 'mouseout') ? this.getBarsAtEvent(evt) : [];

          this.eachBars(function(bar){
            bar.restore(['fillColor', 'strokeColor']);
          });
          helpers.each(activeBars, function(activeBar){
            activeBar.fillColor = activeBar.highlightFill;
            activeBar.strokeColor = activeBar.highlightStroke;
          });
          this.showTooltip(activeBars);
        });
      }

      //Declare the extension of the default point, to cater for the options passed in to the constructor
      this.BarClass = Chart.Rectangle.extend({
        strokeWidth : this.options.barStrokeWidth,
        showStroke : this.options.barShowStroke,
        ctx : this.chart.ctx
      });

      //Iterate through each of the datasets, and build this into a property of the chart
      helpers.each(data.datasets,function(dataset,datasetIndex){

        var datasetObject = {
          label : dataset.label || null,
          fillColor : dataset.fillColor,
          strokeColor : dataset.strokeColor,
          bars : []
        };

        this.datasets.push(datasetObject);

        helpers.each(dataset.data,function(dataPoint,index){
          //Add a new point for each piece of data, passing any required data to draw.
          datasetObject.bars.push(new this.BarClass({
            value : dataPoint,
            label : data.labels[index],
            datasetLabel: dataset.label,
            strokeColor : dataset.strokeColor,
            fillColor : dataset.fillColor,
            highlightFill : dataset.highlightFill || dataset.fillColor,
            highlightStroke : dataset.highlightStroke || dataset.strokeColor
          }));
        },this);

      },this);

      this.buildScale(data.labels);

      this.BarClass.prototype.base = this.scale.endPoint;

      this.eachBars(function(bar, index, datasetIndex){
        helpers.extend(bar, {
          width : this.scale.calculateBarWidth(this.datasets.length),
          x: this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
          y: this.scale.endPoint
        });
        bar.save();
      }, this);

      this.render();
    },
    update : function(){
      this.scale.update();
      // Reset any highlight colours before updating.
      helpers.each(this.activeElements, function(activeElement){
        activeElement.restore(['fillColor', 'strokeColor']);
      });

      this.eachBars(function(bar){
        bar.save();
      });
      this.render();
    },
    eachBars : function(callback){
      helpers.each(this.datasets,function(dataset, datasetIndex){
        helpers.each(dataset.bars, callback, this, datasetIndex);
      },this);
    },
    getBarsAtEvent : function(e){
      var barsArray = [],
        eventPosition = helpers.getRelativePosition(e),
        datasetIterator = function(dataset){
          barsArray.push(dataset.bars[barIndex]);
        },
        barIndex;

      for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
        for (barIndex = 0; barIndex < this.datasets[datasetIndex].bars.length; barIndex++) {
          if (this.datasets[datasetIndex].bars[barIndex].inRange(eventPosition.x,eventPosition.y)){
            helpers.each(this.datasets, datasetIterator);
            return barsArray;
          }
        }
      }

      return barsArray;
    },
    buildScale : function(labels){
      var self = this;

      var dataTotal = function(){
        var values = [];
        self.eachBars(function(bar){
          values.push(bar.value);
        });
        return values;
      };

      var scaleOptions = {
        templateString : this.options.scaleLabel,
        height : this.chart.height,
        width : this.chart.width,
        ctx : this.chart.ctx,
        textColor : this.options.scaleFontColor,
        fontSize : this.options.scaleFontSize,
        fontStyle : this.options.scaleFontStyle,
        fontFamily : this.options.scaleFontFamily,
        valuesCount : labels.length,
        beginAtZero : this.options.scaleBeginAtZero,
        integersOnly : this.options.scaleIntegersOnly,
        calculateYRange: function(currentHeight){
          var updatedRanges = helpers.calculateScaleRange(
            dataTotal(),
            currentHeight,
            this.fontSize,
            this.beginAtZero,
            this.integersOnly
          );
          helpers.extend(this, updatedRanges);
        },
        xLabels : labels,
        font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
        lineWidth : this.options.scaleLineWidth,
        lineColor : this.options.scaleLineColor,
        showHorizontalLines : this.options.scaleShowHorizontalLines,
        showVerticalLines : this.options.scaleShowVerticalLines,
        gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
        gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
        padding : (this.options.showScale) ? 0 : (this.options.barShowStroke) ? this.options.barStrokeWidth : 0,
        showLabels : this.options.scaleShowLabels,
        display : this.options.showScale
      };

      if (this.options.scaleOverride){
        helpers.extend(scaleOptions, {
          calculateYRange: helpers.noop,
          steps: this.options.scaleSteps,
          stepValue: this.options.scaleStepWidth,
          min: this.options.scaleStartValue,
          max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
        });
      }

      this.scale = new this.ScaleClass(scaleOptions);
    },
    addData : function(valuesArray,label){
      //Map the values array for each of the datasets
      helpers.each(valuesArray,function(value,datasetIndex){
        //Add a new point for each piece of data, passing any required data to draw.
        this.datasets[datasetIndex].bars.push(new this.BarClass({
          value : value,
          label : label,
          x: this.scale.calculateBarX(this.datasets.length, datasetIndex, this.scale.valuesCount+1),
          y: this.scale.endPoint,
          width : this.scale.calculateBarWidth(this.datasets.length),
          base : this.scale.endPoint,
          strokeColor : this.datasets[datasetIndex].strokeColor,
          fillColor : this.datasets[datasetIndex].fillColor
        }));
      },this);

      this.scale.addXLabel(label);
      //Then re-render the chart.
      this.update();
    },
    removeData : function(){
      this.scale.removeXLabel();
      //Then re-render the chart.
      helpers.each(this.datasets,function(dataset){
        dataset.bars.shift();
      },this);
      this.update();
    },
    reflow : function(){
      helpers.extend(this.BarClass.prototype,{
        y: this.scale.endPoint,
        base : this.scale.endPoint
      });
      var newScaleProps = helpers.extend({
        height : this.chart.height,
        width : this.chart.width
      });
      this.scale.update(newScaleProps);
    },
    draw : function(ease){
      var easingDecimal = ease || 1;
      this.clear();

      var ctx = this.chart.ctx;

      this.scale.draw(easingDecimal);

      //Draw all the bars for each dataset
      helpers.each(this.datasets,function(dataset,datasetIndex){
        helpers.each(dataset.bars,function(bar,index){
          if (bar.hasValue()){
            bar.base = this.scale.endPoint;
            //Transition then draw
            bar.transition({
              x : this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
              y : this.scale.calculateY(bar.value),
              width : this.scale.calculateBarWidth(this.datasets.length)
            }, easingDecimal).draw();
          }
        },this);

      },this);
    }
  });


}).call(this);

(function(){
  "use strict";

  var root = this,
    Chart = root.Chart,
    //Cache a local reference to Chart.helpers
    helpers = Chart.helpers;

  var defaultConfig = {
    //Boolean - Whether we should show a stroke on each segment
    segmentShowStroke : true,

    //String - The colour of each segment stroke
    segmentStrokeColor : "#fff",

    //Number - The width of each segment stroke
    segmentStrokeWidth : 2,

    //The percentage of the chart that we cut out of the middle.
    percentageInnerCutout : 50,

    //Number - Amount of animation steps
    animationSteps : 100,

    //String - Animation easing effect
    animationEasing : "easeOutBounce",

    //Boolean - Whether we animate the rotation of the Doughnut
    animateRotate : true,

    //Boolean - Whether we animate scaling the Doughnut from the centre
    animateScale : false,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

  };


  Chart.Type.extend({
    //Passing in a name registers this chart in the Chart namespace
    name: "Doughnut",
    //Providing a defaults will also register the deafults in the chart namespace
    defaults : defaultConfig,
    //Initialize is fired when the chart is initialized - Data is passed in as a parameter
    //Config is automatically merged by the core of Chart.js, and is available at this.options
    initialize:  function(data){

      //Declare segments as a static property to prevent inheriting across the Chart type prototype
      this.segments = [];
      this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) - this.options.segmentStrokeWidth/2)/2;

      this.SegmentArc = Chart.Arc.extend({
        ctx : this.chart.ctx,
        x : this.chart.width/2,
        y : this.chart.height/2
      });

      //Set up tooltip events on the chart
      if (this.options.showTooltips){
        helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
          var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];

          helpers.each(this.segments,function(segment){
            segment.restore(["fillColor"]);
          });
          helpers.each(activeSegments,function(activeSegment){
            activeSegment.fillColor = activeSegment.highlightColor;
          });
          this.showTooltip(activeSegments);
        });
      }
      this.calculateTotal(data);

      helpers.each(data,function(datapoint, index){
        this.addData(datapoint, index, true);
      },this);

      this.render();
    },
    getSegmentsAtEvent : function(e){
      var segmentsArray = [];

      var location = helpers.getRelativePosition(e);

      helpers.each(this.segments,function(segment){
        if (segment.inRange(location.x,location.y)) segmentsArray.push(segment);
      },this);
      return segmentsArray;
    },
    addData : function(segment, atIndex, silent){
      var index = atIndex || this.segments.length;
      this.segments.splice(index, 0, new this.SegmentArc({
        value : segment.value,
        outerRadius : (this.options.animateScale) ? 0 : this.outerRadius,
        innerRadius : (this.options.animateScale) ? 0 : (this.outerRadius/100) * this.options.percentageInnerCutout,
        fillColor : segment.color,
        highlightColor : segment.highlight || segment.color,
        showStroke : this.options.segmentShowStroke,
        strokeWidth : this.options.segmentStrokeWidth,
        strokeColor : this.options.segmentStrokeColor,
        startAngle : Math.PI * 1.5,
        circumference : (this.options.animateRotate) ? 0 : this.calculateCircumference(segment.value),
        label : segment.label
      }));
      if (!silent){
        this.reflow();
        this.update();
      }
    },
    calculateCircumference : function(value){
      return (Math.PI*2)*(Math.abs(value) / this.total);
    },
    calculateTotal : function(data){
      this.total = 0;
      helpers.each(data,function(segment){
        this.total += Math.abs(segment.value);
      },this);
    },
    update : function(){
      this.calculateTotal(this.segments);

      // Reset any highlight colours before updating.
      helpers.each(this.activeElements, function(activeElement){
        activeElement.restore(['fillColor']);
      });

      helpers.each(this.segments,function(segment){
        segment.save();
      });
      this.render();
    },

    removeData: function(atIndex){
      var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length-1;
      this.segments.splice(indexToDelete, 1);
      this.reflow();
      this.update();
    },

    reflow : function(){
      helpers.extend(this.SegmentArc.prototype,{
        x : this.chart.width/2,
        y : this.chart.height/2
      });
      this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) - this.options.segmentStrokeWidth/2)/2;
      helpers.each(this.segments, function(segment){
        segment.update({
          outerRadius : this.outerRadius,
          innerRadius : (this.outerRadius/100) * this.options.percentageInnerCutout
        });
      }, this);
    },
    draw : function(easeDecimal){
      var animDecimal = (easeDecimal) ? easeDecimal : 1;
      this.clear();
      helpers.each(this.segments,function(segment,index){
        segment.transition({
          circumference : this.calculateCircumference(segment.value),
          outerRadius : this.outerRadius,
          innerRadius : (this.outerRadius/100) * this.options.percentageInnerCutout
        },animDecimal);

        segment.endAngle = segment.startAngle + segment.circumference;

        segment.draw();
        if (index === 0){
          segment.startAngle = Math.PI * 1.5;
        }
        //Check to see if it's the last segment, if not get the next and update the start angle
        if (index < this.segments.length-1){
          this.segments[index+1].startAngle = segment.endAngle;
        }
      },this);

    }
  });

  Chart.types.Doughnut.extend({
    name : "Pie",
    defaults : helpers.merge(defaultConfig,{percentageInnerCutout : 0})
  });

}).call(this);
(function(){
  "use strict";

  var root = this,
    Chart = root.Chart,
    helpers = Chart.helpers;

  var defaultConfig = {

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : true,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,

    //Boolean - Whether the line is curved between points
    bezierCurve : true,

    //Number - Tension of the bezier curve between points
    bezierCurveTension : 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot : true,

    //Number - Radius of each point dot in pixels
    pointDotRadius : 4,

    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth : 1,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius : 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 2,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill : true,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

  };


  Chart.Type.extend({
    name: "Line",
    defaults : defaultConfig,
    initialize:  function(data){
      //Declare the extension of the default point, to cater for the options passed in to the constructor
      this.PointClass = Chart.Point.extend({
        strokeWidth : this.options.pointDotStrokeWidth,
        radius : this.options.pointDotRadius,
        display: this.options.pointDot,
        hitDetectionRadius : this.options.pointHitDetectionRadius,
        ctx : this.chart.ctx,
        inRange : function(mouseX){
          return (Math.pow(mouseX-this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius,2));
        }
      });

      this.datasets = [];

      //Set up tooltip events on the chart
      if (this.options.showTooltips){
        helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
          var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
          this.eachPoints(function(point){
            point.restore(['fillColor', 'strokeColor']);
          });
          helpers.each(activePoints, function(activePoint){
            activePoint.fillColor = activePoint.highlightFill;
            activePoint.strokeColor = activePoint.highlightStroke;
          });
          this.showTooltip(activePoints);
        });
      }

      //Iterate through each of the datasets, and build this into a property of the chart
      helpers.each(data.datasets,function(dataset){

        var datasetObject = {
          label : dataset.label || null,
          fillColor : dataset.fillColor,
          strokeColor : dataset.strokeColor,
          pointColor : dataset.pointColor,
          pointStrokeColor : dataset.pointStrokeColor,
          points : []
        };

        this.datasets.push(datasetObject);


        helpers.each(dataset.data,function(dataPoint,index){
          //Add a new point for each piece of data, passing any required data to draw.
          datasetObject.points.push(new this.PointClass({
            value : dataPoint,
            label : data.labels[index],
            datasetLabel: dataset.label,
            strokeColor : dataset.pointStrokeColor,
            fillColor : dataset.pointColor,
            highlightFill : dataset.pointHighlightFill || dataset.pointColor,
            highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
          }));
        },this);

        this.buildScale(data.labels);


        this.eachPoints(function(point, index){
          helpers.extend(point, {
            x: this.scale.calculateX(index),
            y: this.scale.endPoint
          });
          point.save();
        }, this);

      },this);


      this.render();
    },
    update : function(){
      this.scale.update();
      // Reset any highlight colours before updating.
      helpers.each(this.activeElements, function(activeElement){
        activeElement.restore(['fillColor', 'strokeColor']);
      });
      this.eachPoints(function(point){
        point.save();
      });
      this.render();
    },
    eachPoints : function(callback){
      helpers.each(this.datasets,function(dataset){
        helpers.each(dataset.points,callback,this);
      },this);
    },
    getPointsAtEvent : function(e){
      var pointsArray = [],
        eventPosition = helpers.getRelativePosition(e);
      helpers.each(this.datasets,function(dataset){
        helpers.each(dataset.points,function(point){
          if (point.inRange(eventPosition.x,eventPosition.y)) pointsArray.push(point);
        });
      },this);
      return pointsArray;
    },
    buildScale : function(labels){
      var self = this;

      var dataTotal = function(){
        var values = [];
        self.eachPoints(function(point){
          values.push(point.value);
        });

        return values;
      };

      var scaleOptions = {
        templateString : this.options.scaleLabel,
        height : this.chart.height,
        width : this.chart.width,
        ctx : this.chart.ctx,
        textColor : this.options.scaleFontColor,
        fontSize : this.options.scaleFontSize,
        fontStyle : this.options.scaleFontStyle,
        fontFamily : this.options.scaleFontFamily,
        valuesCount : labels.length,
        beginAtZero : this.options.scaleBeginAtZero,
        integersOnly : this.options.scaleIntegersOnly,
        calculateYRange : function(currentHeight){
          var updatedRanges = helpers.calculateScaleRange(
            dataTotal(),
            currentHeight,
            this.fontSize,
            this.beginAtZero,
            this.integersOnly
          );
          helpers.extend(this, updatedRanges);
        },
        xLabels : labels,
        font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
        lineWidth : this.options.scaleLineWidth,
        lineColor : this.options.scaleLineColor,
        showHorizontalLines : this.options.scaleShowHorizontalLines,
        showVerticalLines : this.options.scaleShowVerticalLines,
        gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
        gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
        padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
        showLabels : this.options.scaleShowLabels,
        display : this.options.showScale
      };

      if (this.options.scaleOverride){
        helpers.extend(scaleOptions, {
          calculateYRange: helpers.noop,
          steps: this.options.scaleSteps,
          stepValue: this.options.scaleStepWidth,
          min: this.options.scaleStartValue,
          max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
        });
      }


      this.scale = new Chart.Scale(scaleOptions);
    },
    addData : function(valuesArray,label){
      //Map the values array for each of the datasets

      helpers.each(valuesArray,function(value,datasetIndex){
        //Add a new point for each piece of data, passing any required data to draw.
        this.datasets[datasetIndex].points.push(new this.PointClass({
          value : value,
          label : label,
          x: this.scale.calculateX(this.scale.valuesCount+1),
          y: this.scale.endPoint,
          strokeColor : this.datasets[datasetIndex].pointStrokeColor,
          fillColor : this.datasets[datasetIndex].pointColor
        }));
      },this);

      this.scale.addXLabel(label);
      //Then re-render the chart.
      this.update();
    },
    removeData : function(){
      this.scale.removeXLabel();
      //Then re-render the chart.
      helpers.each(this.datasets,function(dataset){
        dataset.points.shift();
      },this);
      this.update();
    },
    reflow : function(){
      var newScaleProps = helpers.extend({
        height : this.chart.height,
        width : this.chart.width
      });
      this.scale.update(newScaleProps);
    },
    draw : function(ease){
      var easingDecimal = ease || 1;
      this.clear();

      var ctx = this.chart.ctx;

      // Some helper methods for getting the next/prev points
      var hasValue = function(item){
        return item.value !== null;
      },
      nextPoint = function(point, collection, index){
        return helpers.findNextWhere(collection, hasValue, index) || point;
      },
      previousPoint = function(point, collection, index){
        return helpers.findPreviousWhere(collection, hasValue, index) || point;
      };

      this.scale.draw(easingDecimal);


      helpers.each(this.datasets,function(dataset){
        var pointsWithValues = helpers.where(dataset.points, hasValue);

        //Transition each point first so that the line and point drawing isn't out of sync
        //We can use this extra loop to calculate the control points of this dataset also in this loop

        helpers.each(dataset.points, function(point, index){
          if (point.hasValue()){
            point.transition({
              y : this.scale.calculateY(point.value),
              x : this.scale.calculateX(index)
            }, easingDecimal);
          }
        },this);


        // Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
        // This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
        if (this.options.bezierCurve){
          helpers.each(pointsWithValues, function(point, index){
            var tension = (index > 0 && index < pointsWithValues.length - 1) ? this.options.bezierCurveTension : 0;
            point.controlPoints = helpers.splineCurve(
              previousPoint(point, pointsWithValues, index),
              point,
              nextPoint(point, pointsWithValues, index),
              tension
            );

            // Prevent the bezier going outside of the bounds of the graph

            // Cap puter bezier handles to the upper/lower scale bounds
            if (point.controlPoints.outer.y > this.scale.endPoint){
              point.controlPoints.outer.y = this.scale.endPoint;
            }
            else if (point.controlPoints.outer.y < this.scale.startPoint){
              point.controlPoints.outer.y = this.scale.startPoint;
            }

            // Cap inner bezier handles to the upper/lower scale bounds
            if (point.controlPoints.inner.y > this.scale.endPoint){
              point.controlPoints.inner.y = this.scale.endPoint;
            }
            else if (point.controlPoints.inner.y < this.scale.startPoint){
              point.controlPoints.inner.y = this.scale.startPoint;
            }
          },this);
        }


        //Draw the line between all the points
        ctx.lineWidth = this.options.datasetStrokeWidth;
        ctx.strokeStyle = dataset.strokeColor;
        ctx.beginPath();

        helpers.each(pointsWithValues, function(point, index){
          if (index === 0){
            ctx.moveTo(point.x, point.y);
          }
          else{
            if(this.options.bezierCurve){
              var previous = previousPoint(point, pointsWithValues, index);

              ctx.bezierCurveTo(
                previous.controlPoints.outer.x,
                previous.controlPoints.outer.y,
                point.controlPoints.inner.x,
                point.controlPoints.inner.y,
                point.x,
                point.y
              );
            }
            else{
              ctx.lineTo(point.x,point.y);
            }
          }
        }, this);

        ctx.stroke();

        if (this.options.datasetFill && pointsWithValues.length > 0){
          //Round off the line by going to the base of the chart, back to the start, then fill.
          ctx.lineTo(pointsWithValues[pointsWithValues.length - 1].x, this.scale.endPoint);
          ctx.lineTo(pointsWithValues[0].x, this.scale.endPoint);
          ctx.fillStyle = dataset.fillColor;
          ctx.closePath();
          ctx.fill();
        }

        //Now draw the points over the line
        //A little inefficient double looping, but better than the line
        //lagging behind the point positions
        helpers.each(pointsWithValues,function(point){
          point.draw();
        });
      },this);
    }
  });


}).call(this);

(function(){
  "use strict";

  var root = this,
    Chart = root.Chart,
    //Cache a local reference to Chart.helpers
    helpers = Chart.helpers;

  var defaultConfig = {
    //Boolean - Show a backdrop to the scale label
    scaleShowLabelBackdrop : true,

    //String - The colour of the label backdrop
    scaleBackdropColor : "rgba(255,255,255,0.75)",

    // Boolean - Whether the scale should begin at zero
    scaleBeginAtZero : true,

    //Number - The backdrop padding above & below the label in pixels
    scaleBackdropPaddingY : 2,

    //Number - The backdrop padding to the side of the label in pixels
    scaleBackdropPaddingX : 2,

    //Boolean - Show line for each value in the scale
    scaleShowLine : true,

    //Boolean - Stroke a line around each segment in the chart
    segmentShowStroke : true,

    //String - The colour of the stroke on each segement.
    segmentStrokeColor : "#fff",

    //Number - The width of the stroke value in pixels
    segmentStrokeWidth : 2,

    //Number - Amount of animation steps
    animationSteps : 100,

    //String - Animation easing effect.
    animationEasing : "easeOutBounce",

    //Boolean - Whether to animate the rotation of the chart
    animateRotate : true,

    //Boolean - Whether to animate scaling the chart from the centre
    animateScale : false,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
  };


  Chart.Type.extend({
    //Passing in a name registers this chart in the Chart namespace
    name: "PolarArea",
    //Providing a defaults will also register the deafults in the chart namespace
    defaults : defaultConfig,
    //Initialize is fired when the chart is initialized - Data is passed in as a parameter
    //Config is automatically merged by the core of Chart.js, and is available at this.options
    initialize:  function(data){
      this.segments = [];
      //Declare segment class as a chart instance specific class, so it can share props for this instance
      this.SegmentArc = Chart.Arc.extend({
        showStroke : this.options.segmentShowStroke,
        strokeWidth : this.options.segmentStrokeWidth,
        strokeColor : this.options.segmentStrokeColor,
        ctx : this.chart.ctx,
        innerRadius : 0,
        x : this.chart.width/2,
        y : this.chart.height/2
      });
      this.scale = new Chart.RadialScale({
        display: this.options.showScale,
        fontStyle: this.options.scaleFontStyle,
        fontSize: this.options.scaleFontSize,
        fontFamily: this.options.scaleFontFamily,
        fontColor: this.options.scaleFontColor,
        showLabels: this.options.scaleShowLabels,
        showLabelBackdrop: this.options.scaleShowLabelBackdrop,
        backdropColor: this.options.scaleBackdropColor,
        backdropPaddingY : this.options.scaleBackdropPaddingY,
        backdropPaddingX: this.options.scaleBackdropPaddingX,
        lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
        lineColor: this.options.scaleLineColor,
        lineArc: true,
        width: this.chart.width,
        height: this.chart.height,
        xCenter: this.chart.width/2,
        yCenter: this.chart.height/2,
        ctx : this.chart.ctx,
        templateString: this.options.scaleLabel,
        valuesCount: data.length
      });

      this.updateScaleRange(data);

      this.scale.update();

      helpers.each(data,function(segment,index){
        this.addData(segment,index,true);
      },this);

      //Set up tooltip events on the chart
      if (this.options.showTooltips){
        helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
          var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];
          helpers.each(this.segments,function(segment){
            segment.restore(["fillColor"]);
          });
          helpers.each(activeSegments,function(activeSegment){
            activeSegment.fillColor = activeSegment.highlightColor;
          });
          this.showTooltip(activeSegments);
        });
      }

      this.render();
    },
    getSegmentsAtEvent : function(e){
      var segmentsArray = [];

      var location = helpers.getRelativePosition(e);

      helpers.each(this.segments,function(segment){
        if (segment.inRange(location.x,location.y)) segmentsArray.push(segment);
      },this);
      return segmentsArray;
    },
    addData : function(segment, atIndex, silent){
      var index = atIndex || this.segments.length;

      this.segments.splice(index, 0, new this.SegmentArc({
        fillColor: segment.color,
        highlightColor: segment.highlight || segment.color,
        label: segment.label,
        value: segment.value,
        outerRadius: (this.options.animateScale) ? 0 : this.scale.calculateCenterOffset(segment.value),
        circumference: (this.options.animateRotate) ? 0 : this.scale.getCircumference(),
        startAngle: Math.PI * 1.5
      }));
      if (!silent){
        this.reflow();
        this.update();
      }
    },
    removeData: function(atIndex){
      var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length-1;
      this.segments.splice(indexToDelete, 1);
      this.reflow();
      this.update();
    },
    calculateTotal: function(data){
      this.total = 0;
      helpers.each(data,function(segment){
        this.total += segment.value;
      },this);
      this.scale.valuesCount = this.segments.length;
    },
    updateScaleRange: function(datapoints){
      var valuesArray = [];
      helpers.each(datapoints,function(segment){
        valuesArray.push(segment.value);
      });

      var scaleSizes = (this.options.scaleOverride) ?
        {
          steps: this.options.scaleSteps,
          stepValue: this.options.scaleStepWidth,
          min: this.options.scaleStartValue,
          max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
        } :
        helpers.calculateScaleRange(
          valuesArray,
          helpers.min([this.chart.width, this.chart.height])/2,
          this.options.scaleFontSize,
          this.options.scaleBeginAtZero,
          this.options.scaleIntegersOnly
        );

      helpers.extend(
        this.scale,
        scaleSizes,
        {
          size: helpers.min([this.chart.width, this.chart.height]),
          xCenter: this.chart.width/2,
          yCenter: this.chart.height/2
        }
      );

    },
    update : function(){
      this.calculateTotal(this.segments);

      helpers.each(this.segments,function(segment){
        segment.save();
      });

      this.reflow();
      this.render();
    },
    reflow : function(){
      helpers.extend(this.SegmentArc.prototype,{
        x : this.chart.width/2,
        y : this.chart.height/2
      });
      this.updateScaleRange(this.segments);
      this.scale.update();

      helpers.extend(this.scale,{
        xCenter: this.chart.width/2,
        yCenter: this.chart.height/2
      });

      helpers.each(this.segments, function(segment){
        segment.update({
          outerRadius : this.scale.calculateCenterOffset(segment.value)
        });
      }, this);

    },
    draw : function(ease){
      var easingDecimal = ease || 1;
      //Clear & draw the canvas
      this.clear();
      helpers.each(this.segments,function(segment, index){
        segment.transition({
          circumference : this.scale.getCircumference(),
          outerRadius : this.scale.calculateCenterOffset(segment.value)
        },easingDecimal);

        segment.endAngle = segment.startAngle + segment.circumference;

        // If we've removed the first segment we need to set the first one to
        // start at the top.
        if (index === 0){
          segment.startAngle = Math.PI * 1.5;
        }

        //Check to see if it's the last segment, if not get the next and update the start angle
        if (index < this.segments.length - 1){
          this.segments[index+1].startAngle = segment.endAngle;
        }
        segment.draw();
      }, this);
      this.scale.draw();
    }
  });

}).call(this);
(function(){
  "use strict";

  var root = this,
    Chart = root.Chart,
    helpers = Chart.helpers;



  Chart.Type.extend({
    name: "Radar",
    defaults:{
      //Boolean - Whether to show lines for each scale point
      scaleShowLine : true,

      //Boolean - Whether we show the angle lines out of the radar
      angleShowLineOut : true,

      //Boolean - Whether to show labels on the scale
      scaleShowLabels : false,

      // Boolean - Whether the scale should begin at zero
      scaleBeginAtZero : true,

      //String - Colour of the angle line
      angleLineColor : "rgba(0,0,0,.1)",

      //Number - Pixel width of the angle line
      angleLineWidth : 1,

      //String - Point label font declaration
      pointLabelFontFamily : "'Arial'",

      //String - Point label font weight
      pointLabelFontStyle : "normal",

      //Number - Point label font size in pixels
      pointLabelFontSize : 10,

      //String - Point label font colour
      pointLabelFontColor : "#666",

      //Boolean - Whether to show a dot for each point
      pointDot : true,

      //Number - Radius of each point dot in pixels
      pointDotRadius : 3,

      //Number - Pixel width of point dot stroke
      pointDotStrokeWidth : 1,

      //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
      pointHitDetectionRadius : 20,

      //Boolean - Whether to show a stroke for datasets
      datasetStroke : true,

      //Number - Pixel width of dataset stroke
      datasetStrokeWidth : 2,

      //Boolean - Whether to fill the dataset with a colour
      datasetFill : true,

      //String - A legend template
      legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

    },

    initialize: function(data){
      this.PointClass = Chart.Point.extend({
        strokeWidth : this.options.pointDotStrokeWidth,
        radius : this.options.pointDotRadius,
        display: this.options.pointDot,
        hitDetectionRadius : this.options.pointHitDetectionRadius,
        ctx : this.chart.ctx
      });

      this.datasets = [];

      this.buildScale(data);

      //Set up tooltip events on the chart
      if (this.options.showTooltips){
        helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
          var activePointsCollection = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];

          this.eachPoints(function(point){
            point.restore(['fillColor', 'strokeColor']);
          });
          helpers.each(activePointsCollection, function(activePoint){
            activePoint.fillColor = activePoint.highlightFill;
            activePoint.strokeColor = activePoint.highlightStroke;
          });

          this.showTooltip(activePointsCollection);
        });
      }

      //Iterate through each of the datasets, and build this into a property of the chart
      helpers.each(data.datasets,function(dataset){

        var datasetObject = {
          label: dataset.label || null,
          fillColor : dataset.fillColor,
          strokeColor : dataset.strokeColor,
          pointColor : dataset.pointColor,
          pointStrokeColor : dataset.pointStrokeColor,
          points : []
        };

        this.datasets.push(datasetObject);

        helpers.each(dataset.data,function(dataPoint,index){
          //Add a new point for each piece of data, passing any required data to draw.
          var pointPosition;
          if (!this.scale.animation){
            pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(dataPoint));
          }
          datasetObject.points.push(new this.PointClass({
            value : dataPoint,
            label : data.labels[index],
            datasetLabel: dataset.label,
            x: (this.options.animation) ? this.scale.xCenter : pointPosition.x,
            y: (this.options.animation) ? this.scale.yCenter : pointPosition.y,
            strokeColor : dataset.pointStrokeColor,
            fillColor : dataset.pointColor,
            highlightFill : dataset.pointHighlightFill || dataset.pointColor,
            highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
          }));
        },this);

      },this);

      this.render();
    },
    eachPoints : function(callback){
      helpers.each(this.datasets,function(dataset){
        helpers.each(dataset.points,callback,this);
      },this);
    },

    getPointsAtEvent : function(evt){
      var mousePosition = helpers.getRelativePosition(evt),
        fromCenter = helpers.getAngleFromPoint({
          x: this.scale.xCenter,
          y: this.scale.yCenter
        }, mousePosition);

      var anglePerIndex = (Math.PI * 2) /this.scale.valuesCount,
        pointIndex = Math.round((fromCenter.angle - Math.PI * 1.5) / anglePerIndex),
        activePointsCollection = [];

      // If we're at the top, make the pointIndex 0 to get the first of the array.
      if (pointIndex >= this.scale.valuesCount || pointIndex < 0){
        pointIndex = 0;
      }

      if (fromCenter.distance <= this.scale.drawingArea){
        helpers.each(this.datasets, function(dataset){
          activePointsCollection.push(dataset.points[pointIndex]);
        });
      }

      return activePointsCollection;
    },

    buildScale : function(data){
      this.scale = new Chart.RadialScale({
        display: this.options.showScale,
        fontStyle: this.options.scaleFontStyle,
        fontSize: this.options.scaleFontSize,
        fontFamily: this.options.scaleFontFamily,
        fontColor: this.options.scaleFontColor,
        showLabels: this.options.scaleShowLabels,
        showLabelBackdrop: this.options.scaleShowLabelBackdrop,
        backdropColor: this.options.scaleBackdropColor,
        backdropPaddingY : this.options.scaleBackdropPaddingY,
        backdropPaddingX: this.options.scaleBackdropPaddingX,
        lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
        lineColor: this.options.scaleLineColor,
        angleLineColor : this.options.angleLineColor,
        angleLineWidth : (this.options.angleShowLineOut) ? this.options.angleLineWidth : 0,
        // Point labels at the edge of each line
        pointLabelFontColor : this.options.pointLabelFontColor,
        pointLabelFontSize : this.options.pointLabelFontSize,
        pointLabelFontFamily : this.options.pointLabelFontFamily,
        pointLabelFontStyle : this.options.pointLabelFontStyle,
        height : this.chart.height,
        width: this.chart.width,
        xCenter: this.chart.width/2,
        yCenter: this.chart.height/2,
        ctx : this.chart.ctx,
        templateString: this.options.scaleLabel,
        labels: data.labels,
        valuesCount: data.datasets[0].data.length
      });

      this.scale.setScaleSize();
      this.updateScaleRange(data.datasets);
      this.scale.buildYLabels();
    },
    updateScaleRange: function(datasets){
      var valuesArray = (function(){
        var totalDataArray = [];
        helpers.each(datasets,function(dataset){
          if (dataset.data){
            totalDataArray = totalDataArray.concat(dataset.data);
          }
          else {
            helpers.each(dataset.points, function(point){
              totalDataArray.push(point.value);
            });
          }
        });
        return totalDataArray;
      })();


      var scaleSizes = (this.options.scaleOverride) ?
        {
          steps: this.options.scaleSteps,
          stepValue: this.options.scaleStepWidth,
          min: this.options.scaleStartValue,
          max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
        } :
        helpers.calculateScaleRange(
          valuesArray,
          helpers.min([this.chart.width, this.chart.height])/2,
          this.options.scaleFontSize,
          this.options.scaleBeginAtZero,
          this.options.scaleIntegersOnly
        );

      helpers.extend(
        this.scale,
        scaleSizes
      );

    },
    addData : function(valuesArray,label){
      //Map the values array for each of the datasets
      this.scale.valuesCount++;
      helpers.each(valuesArray,function(value,datasetIndex){
        var pointPosition = this.scale.getPointPosition(this.scale.valuesCount, this.scale.calculateCenterOffset(value));
        this.datasets[datasetIndex].points.push(new this.PointClass({
          value : value,
          label : label,
          x: pointPosition.x,
          y: pointPosition.y,
          strokeColor : this.datasets[datasetIndex].pointStrokeColor,
          fillColor : this.datasets[datasetIndex].pointColor
        }));
      },this);

      this.scale.labels.push(label);

      this.reflow();

      this.update();
    },
    removeData : function(){
      this.scale.valuesCount--;
      this.scale.labels.shift();
      helpers.each(this.datasets,function(dataset){
        dataset.points.shift();
      },this);
      this.reflow();
      this.update();
    },
    update : function(){
      this.eachPoints(function(point){
        point.save();
      });
      this.reflow();
      this.render();
    },
    reflow: function(){
      helpers.extend(this.scale, {
        width : this.chart.width,
        height: this.chart.height,
        size : helpers.min([this.chart.width, this.chart.height]),
        xCenter: this.chart.width/2,
        yCenter: this.chart.height/2
      });
      this.updateScaleRange(this.datasets);
      this.scale.setScaleSize();
      this.scale.buildYLabels();
    },
    draw : function(ease){
      var easeDecimal = ease || 1,
        ctx = this.chart.ctx;
      this.clear();
      this.scale.draw();

      helpers.each(this.datasets,function(dataset){

        //Transition each point first so that the line and point drawing isn't out of sync
        helpers.each(dataset.points,function(point,index){
          if (point.hasValue()){
            point.transition(this.scale.getPointPosition(index, this.scale.calculateCenterOffset(point.value)), easeDecimal);
          }
        },this);



        //Draw the line between all the points
        ctx.lineWidth = this.options.datasetStrokeWidth;
        ctx.strokeStyle = dataset.strokeColor;
        ctx.beginPath();
        helpers.each(dataset.points,function(point,index){
          if (index === 0){
            ctx.moveTo(point.x,point.y);
          }
          else{
            ctx.lineTo(point.x,point.y);
          }
        },this);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = dataset.fillColor;
        ctx.fill();

        //Now draw the points over the line
        //A little inefficient double looping, but better than the line
        //lagging behind the point positions
        helpers.each(dataset.points,function(point){
          if (point.hasValue()){
            point.draw();
          }
        });

      },this);

    }

  });


}).call(this);


(function($){$.extend({tablesorter:new
function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[£$€?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$€]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if (c.dateFormat == "pt") {s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, "$3/$2/$1");} else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);
var App = {

  _isWithTooltips: false,

  init: function () {
    App._tableSorters()
    App._tooltips()
    App._navDoc()

    $(window).on('resize', App._tooltips)

    $(document).on('shown.bs.tab', function () {
      $(document).trigger('redraw.bs.charts')
    })

    // docs top button
    if ($('.docs-top').length) {
      App._backToTopButton()
      $(window).on('scroll', App._backToTopButton)
    }
  },

  _navDoc: function () {
    // doc nav js
    var $toc    = $('#markdown-toc')
    var $window = $(window)

    if ($toc[0]) {

      maybeActivateDocNavigation()
      $window.on('resize', maybeActivateDocNavigation)

      function maybeActivateDocNavigation () {
        if ($window.width() > 768) {
          activateDocNavigation()
        } else {
          deactivateDocNavigation()
        }
      }

      function deactivateDocNavigation() {
        $window.off('resize.theme.nav')
        $window.off('scroll.theme.nav')
        $toc.css({
          position: '',
          left: '',
          top: ''
        })
      }

      function activateDocNavigation() {

        var cache = {}

        function updateCache() {
          cache.containerTop   = $('.docs-content').offset().top - 40
          cache.containerRight = $('.docs-content').offset().left + $('.docs-content').width() + 45
          measure()
        }

        function measure() {
          var scrollTop = $window.scrollTop()
          var distance =  Math.max(scrollTop - cache.containerTop, 0)

          if (!distance) {
            $($toc.find('li')[1]).addClass('active')
            return $toc.css({
              position: '',
              left: '',
              top: ''
            })
          }

          $toc.css({
            position: 'fixed',
            left: cache.containerRight,
            top: 40
          })
        }

        updateCache()

        $(window)
          .on('resize.theme.nav', updateCache)
          .on('scroll.theme.nav', measure)

        $('body').scrollspy({
          target: '#markdown-toc',
          selector: 'li > a'
        })

        setTimeout(function () {
          $('body').scrollspy('refresh')
        }, 1000)
      }
    }
  },

  _backToTopButton: function () {
    if ($(window).scrollTop() > $(window).height()) {
      $('.docs-top').fadeIn()
    } else {
      $('.docs-top').fadeOut()
    }
  },

  _tooltips: function () {
    if ($(window).width() > 768) {
      if (App._isWithTooltips) return
      App._isWithTooltips = true
      $('[data-toggle="tooltip"]').tooltip()

    } else {
      if (!App._isWithTooltips) return
      App._isWithTooltips = false
      $('[data-toggle="tooltip"]').tooltip('destroy')
    }

  },

  _tableSorters: function () {
    $('[data-sort="table"]').tablesorter( {sortList: [[1,0]]} )
  }
}

App.init()

$(function () {

  var Charts = {

    _HYPHY_REGEX: /-([a-z])/g,

    _cleanAttr: function (obj) {
      delete obj["chart"]
      delete obj["value"]
      delete obj["labels"]
    },

    doughnut: function (element) {
      var attrData = $.extend({}, $(element).data())
      var data     = eval(attrData.value)

      Charts._cleanAttr(attrData)

      var options = $.extend({
        responsive: true,
        animation: false,
        segmentStrokeColor: '#fff',
        segmentStrokeWidth: 2,
        percentageInnerCutout: 80,
      }, attrData)

      new Chart(element.getContext('2d')).Doughnut(data, options)
    },

    bar: function (element) {
      var attrData = $.extend({}, $(element).data())

      var data = {
        labels   : eval(attrData.labels),
        datasets : eval(attrData.value).map(function (set, index) {
          return $.extend({
            fillColor   : (index % 2 ? '#42a5f5' : '#1bc98e'),
            strokeColor : 'transparent'
          }, set)
        })
      }

      Charts._cleanAttr(attrData)

      var options = $.extend({
        responsive: true,
        animation: false,
        scaleShowVerticalLines: false,
        scaleOverride: true,
        scaleSteps: 4,
        scaleStepWidth: 25,
        scaleStartValue: 0,
        barValueSpacing: 10,
        scaleFontColor: 'rgba(0,0,0,.4)',
        scaleFontSize: 14,
        scaleLineColor: 'rgba(0,0,0,.05)',
        scaleGridLineColor: 'rgba(0,0,0,.05)',
        barDatasetSpacing: 2
      }, attrData)

      new Chart(element.getContext('2d')).Bar(data, options)
    },

    line: function (element) {
      var attrData = $.extend({}, $(element).data())

      var data = {
        labels   : eval(attrData.labels),
        datasets : eval(attrData.value).map(function (set) {
          return $.extend({
            fillColor: 'rgba(66, 165, 245, .2)',
            strokeColor: '#42a5f5',
            pointStrokeColor: '#fff'
          }, set)
        })
      }

      Charts._cleanAttr(attrData)

      var options = $.extend({
        animation: false,
        responsive: true,
        bezierCurve : true,
        bezierCurveTension : 0.25,
        scaleShowVerticalLines: false,
        pointDot: false,
        tooltipTemplate: "<%= value %>",
        scaleOverride: true,
        scaleSteps: 3,
        scaleStepWidth: 1000,
        scaleStartValue: 2000,
        scaleLineColor: 'rgba(0,0,0,.05)',
        scaleGridLineColor: 'rgba(0,0,0,.05)',
        scaleFontColor: 'rgba(0,0,0,.4)',
        scaleFontSize: 14,
        scaleLabel: function (label) {
          return label.value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        }
      }, attrData)

      new Chart(element.getContext('2d')).Line(data, options)
    },

    'spark-line': function (element) {
      var attrData = $.extend({}, $(element).data())

      var data = {
        labels   : eval(attrData.labels),
        datasets : eval(attrData.value).map(function (set) {
          return $.extend({
            fillColor: 'rgba(255,255,255,.3)',
            strokeColor: '#fff',
            pointStrokeColor: '#fff'
          }, set)
        })
      }

      Charts._cleanAttr(attrData)

      var options = $.extend({
        animation: false,
        responsive: true,
        bezierCurve : true,
        bezierCurveTension : 0.25,
        showScale: false,
        pointDotRadius: 0,
        pointDotStrokeWidth: 0,
        pointDot: false,
        showTooltips: false
      }, attrData)

      new Chart(element.getContext('2d')).Line(data, options)
    }
  }

  $(document)
    .on('redraw.bs.charts', function () {
      $('[data-chart]').each(function () {
        if ($(this).is(':visible')) {
          Charts[$(this).attr('data-chart')](this)
        }
      })
    })
    .trigger('redraw.bs.charts')
});


/* =========================================================
 * bootstrap-datepicker.js
 * Repo: https://github.com/eternicode/bootstrap-datepicker/
 * Demo: http://eternicode.github.io/bootstrap-datepicker/
 * Docs: http://bootstrap-datepicker.readthedocs.org/
 * Forked from http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Started by Stefan Petre; improvements by Andrew Rowls + contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

(function($, undefined){

	function UTCDate(){
		return new Date(Date.UTC.apply(Date, arguments));
	}
	function UTCToday(){
		var today = new Date();
		return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
	}
	function isUTCEquals(date1, date2) {
		return (
			date1.getUTCFullYear() === date2.getUTCFullYear() &&
			date1.getUTCMonth() === date2.getUTCMonth() &&
			date1.getUTCDate() === date2.getUTCDate()
		);
	}
	function alias(method){
		return function(){
			return this[method].apply(this, arguments);
		};
	}

	var DateArray = (function(){
		var extras = {
			get: function(i){
				return this.slice(i)[0];
			},
			contains: function(d){
				// Array.indexOf is not cross-browser;
				// $.inArray doesn't work with Dates
				var val = d && d.valueOf();
				for (var i=0, l=this.length; i < l; i++)
					if (this[i].valueOf() === val)
						return i;
				return -1;
			},
			remove: function(i){
				this.splice(i,1);
			},
			replace: function(new_array){
				if (!new_array)
					return;
				if (!$.isArray(new_array))
					new_array = [new_array];
				this.clear();
				this.push.apply(this, new_array);
			},
			clear: function(){
				this.length = 0;
			},
			copy: function(){
				var a = new DateArray();
				a.replace(this);
				return a;
			}
		};

		return function(){
			var a = [];
			a.push.apply(a, arguments);
			$.extend(a, extras);
			return a;
		};
	})();


	// Picker object

	var Datepicker = function(element, options){
		this._process_options(options);

		this.dates = new DateArray();
		this.viewDate = this.o.defaultViewDate;
		this.focusDate = null;

		this.element = $(element);
		this.isInline = false;
		this.isInput = this.element.is('input');
		this.component = this.element.hasClass('date') ? this.element.find('.add-on, .input-group-addon, .btn') : false;
		this.hasInput = this.component && this.element.find('input').length;
		if (this.component && this.component.length === 0)
			this.component = false;

		this.picker = $(DPGlobal.template);
		this._buildEvents();
		this._attachEvents();

		if (this.isInline){
			this.picker.addClass('datepicker-inline').appendTo(this.element);
		}
		else {
			this.picker.addClass('datepicker-dropdown dropdown-menu');
		}

		if (this.o.rtl){
			this.picker.addClass('datepicker-rtl');
		}

		this.viewMode = this.o.startView;

		if (this.o.calendarWeeks)
			this.picker.find('tfoot .today, tfoot .clear')
						.attr('colspan', function(i, val){
							return parseInt(val) + 1;
						});

		this._allow_update = false;

		this.setStartDate(this._o.startDate);
		this.setEndDate(this._o.endDate);
		this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);
		this.setDatesDisabled(this.o.datesDisabled);

		this.fillDow();
		this.fillMonths();

		this._allow_update = true;

		this.update();
		this.showMode();

		if (this.isInline){
			this.show();
		}
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		_process_options: function(opts){
			// Store raw options for reference
			this._o = $.extend({}, this._o, opts);
			// Processed options
			var o = this.o = $.extend({}, this._o);

			// Check if "de-DE" style date is available, if not language should
			// fallback to 2 letter code eg "de"
			var lang = o.language;
			if (!dates[lang]){
				lang = lang.split('-')[0];
				if (!dates[lang])
					lang = defaults.language;
			}
			o.language = lang;

			switch (o.startView){
				case 2:
				case 'decade':
					o.startView = 2;
					break;
				case 1:
				case 'year':
					o.startView = 1;
					break;
				default:
					o.startView = 0;
			}

			switch (o.minViewMode){
				case 1:
				case 'months':
					o.minViewMode = 1;
					break;
				case 2:
				case 'years':
					o.minViewMode = 2;
					break;
				default:
					o.minViewMode = 0;
			}

			o.startView = Math.max(o.startView, o.minViewMode);

			// true, false, or Number > 0
			if (o.multidate !== true){
				o.multidate = Number(o.multidate) || false;
				if (o.multidate !== false)
					o.multidate = Math.max(0, o.multidate);
			}
			o.multidateSeparator = String(o.multidateSeparator);

			o.weekStart %= 7;
			o.weekEnd = ((o.weekStart + 6) % 7);

			var format = DPGlobal.parseFormat(o.format);
			if (o.startDate !== -Infinity){
				if (!!o.startDate){
					if (o.startDate instanceof Date)
						o.startDate = this._local_to_utc(this._zero_time(o.startDate));
					else
						o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
				}
				else {
					o.startDate = -Infinity;
				}
			}
			if (o.endDate !== Infinity){
				if (!!o.endDate){
					if (o.endDate instanceof Date)
						o.endDate = this._local_to_utc(this._zero_time(o.endDate));
					else
						o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
				}
				else {
					o.endDate = Infinity;
				}
			}

			o.daysOfWeekDisabled = o.daysOfWeekDisabled||[];
			if (!$.isArray(o.daysOfWeekDisabled))
				o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
			o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function(d){
				return parseInt(d, 10);
			});

			o.datesDisabled = o.datesDisabled||[];
			if (!$.isArray(o.datesDisabled)) {
				var datesDisabled = [];
				datesDisabled.push(DPGlobal.parseDate(o.datesDisabled, format, o.language));
				o.datesDisabled = datesDisabled;
			}
			o.datesDisabled = $.map(o.datesDisabled,function(d){
				return DPGlobal.parseDate(d, format, o.language);
			});

			var plc = String(o.orientation).toLowerCase().split(/\s+/g),
				_plc = o.orientation.toLowerCase();
			plc = $.grep(plc, function(word){
				return /^auto|left|right|top|bottom$/.test(word);
			});
			o.orientation = {x: 'auto', y: 'auto'};
			if (!_plc || _plc === 'auto')
				; // no action
			else if (plc.length === 1){
				switch (plc[0]){
					case 'top':
					case 'bottom':
						o.orientation.y = plc[0];
						break;
					case 'left':
					case 'right':
						o.orientation.x = plc[0];
						break;
				}
			}
			else {
				_plc = $.grep(plc, function(word){
					return /^left|right$/.test(word);
				});
				o.orientation.x = _plc[0] || 'auto';

				_plc = $.grep(plc, function(word){
					return /^top|bottom$/.test(word);
				});
				o.orientation.y = _plc[0] || 'auto';
			}
			if (o.defaultViewDate) {
				var year = o.defaultViewDate.year || new Date().getFullYear();
				var month = o.defaultViewDate.month || 0;
				var day = o.defaultViewDate.day || 1;
				o.defaultViewDate = UTCDate(year, month, day);
			} else {
				o.defaultViewDate = UTCToday();
			}
			o.showOnFocus = o.showOnFocus !== undefined ? o.showOnFocus : true;
		},
		_events: [],
		_secondaryEvents: [],
		_applyEvents: function(evs){
			for (var i=0, el, ch, ev; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.on(ev, ch);
			}
		},
		_unapplyEvents: function(evs){
			for (var i=0, el, ev, ch; i < evs.length; i++){
				el = evs[i][0];
				if (evs[i].length === 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length === 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.off(ev, ch);
			}
		},
		_buildEvents: function(){
            var events = {
                keyup: $.proxy(function(e){
                    if ($.inArray(e.keyCode, [27, 37, 39, 38, 40, 32, 13, 9]) === -1)
                        this.update();
                }, this),
                keydown: $.proxy(this.keydown, this)
            };

            if (this.o.showOnFocus === true) {
                events.focus = $.proxy(this.show, this);
            }

            if (this.isInput) { // single input
                this._events = [
                    [this.element, events]
                ];
            }
            else if (this.component && this.hasInput) { // component: input + button
                this._events = [
                    // For components that are not readonly, allow keyboard nav
                    [this.element.find('input'), events],
                    [this.component, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            }
			else if (this.element.is('div')){  // inline datepicker
				this.isInline = true;
			}
			else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			this._events.push(
				// Component: listen for blur on element descendants
				[this.element, '*', {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}],
				// Input: listen for blur on element
				[this.element, {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}]
			);

			this._secondaryEvents = [
				[this.picker, {
					click: $.proxy(this.click, this)
				}],
				[$(window), {
					resize: $.proxy(this.place, this)
				}],
				[$(document), {
					'mousedown touchstart': $.proxy(function(e){
						// Clicked outside the datepicker, hide it
						if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).length ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).length
						)){
							this.hide();
						}
					}, this)
				}]
			];
		},
		_attachEvents: function(){
			this._detachEvents();
			this._applyEvents(this._events);
		},
		_detachEvents: function(){
			this._unapplyEvents(this._events);
		},
		_attachSecondaryEvents: function(){
			this._detachSecondaryEvents();
			this._applyEvents(this._secondaryEvents);
		},
		_detachSecondaryEvents: function(){
			this._unapplyEvents(this._secondaryEvents);
		},
		_trigger: function(event, altdate){
			var date = altdate || this.dates.get(-1),
				local_date = this._utc_to_local(date);

			this.element.trigger({
				type: event,
				date: local_date,
				dates: $.map(this.dates, this._utc_to_local),
				format: $.proxy(function(ix, format){
					if (arguments.length === 0){
						ix = this.dates.length - 1;
						format = this.o.format;
					}
					else if (typeof ix === 'string'){
						format = ix;
						ix = this.dates.length - 1;
					}
					format = format || this.o.format;
					var date = this.dates.get(ix);
					return DPGlobal.formatDate(date, format, this.o.language);
				}, this)
			});
		},

		show: function(){
			if (this.element.attr('readonly'))
				return;
			if (!this.isInline)
				this.picker.appendTo(this.o.container);
			this.place();
			this.picker.show();
			this._attachSecondaryEvents();
			this._trigger('show');
			if ((window.navigator.msMaxTouchPoints || 'ontouchstart' in document) && this.o.disableTouchKeyboard) {
				$(this.element).blur();
			}
			return this;
		},

		hide: function(){
			if (this.isInline)
				return this;
			if (!this.picker.is(':visible'))
				return this;
			this.focusDate = null;
			this.picker.hide().detach();
			this._detachSecondaryEvents();
			this.viewMode = this.o.startView;
			this.showMode();

			if (
				this.o.forceParse &&
				(
					this.isInput && this.element.val() ||
					this.hasInput && this.element.find('input').val()
				)
			)
				this.setValue();
			this._trigger('hide');
			return this;
		},

		remove: function(){
			this.hide();
			this._detachEvents();
			this._detachSecondaryEvents();
			this.picker.remove();
			delete this.element.data().datepicker;
			if (!this.isInput){
				delete this.element.data().date;
			}
			return this;
		},

		_utc_to_local: function(utc){
			return utc && new Date(utc.getTime() + (utc.getTimezoneOffset()*60000));
		},
		_local_to_utc: function(local){
			return local && new Date(local.getTime() - (local.getTimezoneOffset()*60000));
		},
		_zero_time: function(local){
			return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
		},
		_zero_utc_time: function(utc){
			return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
		},

		getDates: function(){
			return $.map(this.dates, this._utc_to_local);
		},

		getUTCDates: function(){
			return $.map(this.dates, function(d){
				return new Date(d);
			});
		},

		getDate: function(){
			return this._utc_to_local(this.getUTCDate());
		},

		getUTCDate: function(){
			var selected_date = this.dates.get(-1);
			if (typeof selected_date !== 'undefined') {
				return new Date(selected_date);
			} else {
				return null;
			}
		},

		clearDates: function(){
			var element;
			if (this.isInput) {
				element = this.element;
			} else if (this.component) {
				element = this.element.find('input');
			}

			if (element) {
				element.val('').change();
			}

			this.update();
			this._trigger('changeDate');

			if (this.o.autoclose) {
				this.hide();
			}
		},
		setDates: function(){
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, args);
			this._trigger('changeDate');
			this.setValue();
			return this;
		},

		setUTCDates: function(){
			var args = $.isArray(arguments[0]) ? arguments[0] : arguments;
			this.update.apply(this, $.map(args, this._utc_to_local));
			this._trigger('changeDate');
			this.setValue();
			return this;
		},

		setDate: alias('setDates'),
		setUTCDate: alias('setUTCDates'),

		setValue: function(){
			var formatted = this.getFormattedDate();
			if (!this.isInput){
				if (this.component){
					this.element.find('input').val(formatted).change();
				}
			}
			else {
				this.element.val(formatted).change();
			}
			return this;
		},

		getFormattedDate: function(format){
			if (format === undefined)
				format = this.o.format;

			var lang = this.o.language;
			return $.map(this.dates, function(d){
				return DPGlobal.formatDate(d, format, lang);
			}).join(this.o.multidateSeparator);
		},

		setStartDate: function(startDate){
			this._process_options({startDate: startDate});
			this.update();
			this.updateNavArrows();
			return this;
		},

		setEndDate: function(endDate){
			this._process_options({endDate: endDate});
			this.update();
			this.updateNavArrows();
			return this;
		},

		setDaysOfWeekDisabled: function(daysOfWeekDisabled){
			this._process_options({daysOfWeekDisabled: daysOfWeekDisabled});
			this.update();
			this.updateNavArrows();
			return this;
		},

		setDatesDisabled: function(datesDisabled){
			this._process_options({datesDisabled: datesDisabled});
			this.update();
			this.updateNavArrows();
		},

		place: function(){
			if (this.isInline)
				return this;
			var calendarWidth = this.picker.outerWidth(),
				calendarHeight = this.picker.outerHeight(),
				visualPadding = 10,
				windowWidth = $(this.o.container).width(),
				windowHeight = $(this.o.container).height(),
				scrollTop = $(this.o.container).scrollTop(),
				appendOffset = $(this.o.container).offset();

			var parentsZindex = [];
			this.element.parents().each(function(){
				var itemZIndex = $(this).css('z-index');
				if (itemZIndex !== 'auto' && itemZIndex !== 0) parentsZindex.push(parseInt(itemZIndex));
			});
			var zIndex = Math.max.apply(Math, parentsZindex) + 10;
			var offset = this.component ? this.component.parent().offset() : this.element.offset();
			var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
			var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
			var left = offset.left - appendOffset.left,
				top = offset.top - appendOffset.top;

			this.picker.removeClass(
				'datepicker-orient-top datepicker-orient-bottom '+
				'datepicker-orient-right datepicker-orient-left'
			);

			if (this.o.orientation.x !== 'auto'){
				this.picker.addClass('datepicker-orient-' + this.o.orientation.x);
				if (this.o.orientation.x === 'right')
					left -= calendarWidth - width;
			}
			// auto x orientation is best-placement: if it crosses a window
			// edge, fudge it sideways
			else {
				if (offset.left < 0) {
					// component is outside the window on the left side. Move it into visible range
					this.picker.addClass('datepicker-orient-left');
					left -= offset.left - visualPadding;
				} else if (left + calendarWidth > windowWidth) {
					// the calendar passes the widow right edge. Align it to component right side
					this.picker.addClass('datepicker-orient-right');
					left = offset.left + width - calendarWidth;
				} else {
					// Default to left
					this.picker.addClass('datepicker-orient-left');
				}
			}

			// auto y orientation is best-situation: top or bottom, no fudging,
			// decision based on which shows more of the calendar
			var yorient = this.o.orientation.y,
				top_overflow, bottom_overflow;
			if (yorient === 'auto'){
				top_overflow = -scrollTop + top - calendarHeight;
				bottom_overflow = scrollTop + windowHeight - (top + height + calendarHeight);
				if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
					yorient = 'top';
				else
					yorient = 'bottom';
			}
			this.picker.addClass('datepicker-orient-' + yorient);
			if (yorient === 'top')
				top += height;
			else
				top -= calendarHeight + parseInt(this.picker.css('padding-top'));

			if (this.o.rtl) {
				var right = windowWidth - (left + width);
				this.picker.css({
					top: top,
					right: right,
					zIndex: zIndex
				});
			} else {
				this.picker.css({
					top: top,
					left: left,
					zIndex: zIndex
				});
			}
			return this;
		},

		_allow_update: true,
		update: function(){
			if (!this._allow_update)
				return this;

			var oldDates = this.dates.copy(),
				dates = [],
				fromArgs = false;
			if (arguments.length){
				$.each(arguments, $.proxy(function(i, date){
					if (date instanceof Date)
						date = this._local_to_utc(date);
					dates.push(date);
				}, this));
				fromArgs = true;
			}
			else {
				dates = this.isInput
						? this.element.val()
						: this.element.data('date') || this.element.find('input').val();
				if (dates && this.o.multidate)
					dates = dates.split(this.o.multidateSeparator);
				else
					dates = [dates];
				delete this.element.data().date;
			}

			dates = $.map(dates, $.proxy(function(date){
				return DPGlobal.parseDate(date, this.o.format, this.o.language);
			}, this));
			dates = $.grep(dates, $.proxy(function(date){
				return (
					date < this.o.startDate ||
					date > this.o.endDate ||
					!date
				);
			}, this), true);
			this.dates.replace(dates);

			if (this.dates.length)
				this.viewDate = new Date(this.dates.get(-1));
			else if (this.viewDate < this.o.startDate)
				this.viewDate = new Date(this.o.startDate);
			else if (this.viewDate > this.o.endDate)
				this.viewDate = new Date(this.o.endDate);

			if (fromArgs){
				// setting date by clicking
				this.setValue();
			}
			else if (dates.length){
				// setting date by typing
				if (String(oldDates) !== String(this.dates))
					this._trigger('changeDate');
			}
			if (!this.dates.length && oldDates.length)
				this._trigger('clearDate');

			this.fill();
			return this;
		},

		fillDow: function(){
			var dowCnt = this.o.weekStart,
				html = '<tr>';
			if (this.o.calendarWeeks){
				this.picker.find('.datepicker-days thead tr:first-child .datepicker-switch')
					.attr('colspan', function(i, val){
						return parseInt(val) + 1;
					});
				var cell = '<th class="cw">&#160;</th>';
				html += cell;
			}
			while (dowCnt < this.o.weekStart + 7){
				html += '<th class="dow">'+dates[this.o.language].daysMin[(dowCnt++)%7]+'</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},

		fillMonths: function(){
			var html = '',
			i = 0;
			while (i < 12){
				html += '<span class="month">'+dates[this.o.language].monthsShort[i++]+'</span>';
			}
			this.picker.find('.datepicker-months td').html(html);
		},

		setRange: function(range){
			if (!range || !range.length)
				delete this.range;
			else
				this.range = $.map(range, function(d){
					return d.valueOf();
				});
			this.fill();
		},

		getClassNames: function(date){
			var cls = [],
				year = this.viewDate.getUTCFullYear(),
				month = this.viewDate.getUTCMonth(),
				today = new Date();
			if (date.getUTCFullYear() < year || (date.getUTCFullYear() === year && date.getUTCMonth() < month)){
				cls.push('old');
			}
			else if (date.getUTCFullYear() > year || (date.getUTCFullYear() === year && date.getUTCMonth() > month)){
				cls.push('new');
			}
			if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
				cls.push('focused');
			// Compare internal UTC date with local today, not UTC today
			if (this.o.todayHighlight &&
				date.getUTCFullYear() === today.getFullYear() &&
				date.getUTCMonth() === today.getMonth() &&
				date.getUTCDate() === today.getDate()){
				cls.push('today');
			}
			if (this.dates.contains(date) !== -1)
				cls.push('active');
			if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
				$.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1){
				cls.push('disabled');
			}
			if (this.o.datesDisabled.length > 0 &&
				$.grep(this.o.datesDisabled, function(d){
					return isUTCEquals(date, d); }).length > 0) {
				cls.push('disabled', 'disabled-date');
			}

			if (this.range){
				if (date > this.range[0] && date < this.range[this.range.length-1]){
					cls.push('range');
				}
				if ($.inArray(date.valueOf(), this.range) !== -1){
					cls.push('selected');
				}
			}
			return cls;
		},

		fill: function(){
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
				endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
				endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
				todaytxt = dates[this.o.language].today || dates['en'].today || '',
				cleartxt = dates[this.o.language].clear || dates['en'].clear || '',
				tooltip;
			if (isNaN(year) || isNaN(month))
				return;
			this.picker.find('.datepicker-days thead .datepicker-switch')
						.text(dates[this.o.language].months[month]+' '+year);
			this.picker.find('tfoot .today')
						.text(todaytxt)
						.toggle(this.o.todayBtn !== false);
			this.picker.find('tfoot .clear')
						.text(cleartxt)
						.toggle(this.o.clearBtn !== false);
			this.updateNavArrows();
			this.fillMonths();
			var prevMonth = UTCDate(year, month-1, 28),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
			prevMonth.setUTCDate(day);
			prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName;
			while (prevMonth.valueOf() < nextMonth){
				if (prevMonth.getUTCDay() === this.o.weekStart){
					html.push('<tr>');
					if (this.o.calendarWeeks){
						// ISO 8601: First week contains first thursday.
						// ISO also states week starts on Monday, but we can be more abstract here.
						var
							// Start of current week: based on weekstart/current date
							ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
							// Thursday of this week
							th = new Date(Number(ws) + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
							// First Thursday of year, year from thursday
							yth = new Date(Number(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay())%7*864e5),
							// Calendar week: ms between thursdays, div ms per day, div 7 days
							calWeek =  (th - yth) / 864e5 / 7 + 1;
						html.push('<td class="cw">'+ calWeek +'</td>');

					}
				}
				clsName = this.getClassNames(prevMonth);
				clsName.push('day');

				if (this.o.beforeShowDay !== $.noop){
					var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
					if (before === undefined)
						before = {};
					else if (typeof(before) === 'boolean')
						before = {enabled: before};
					else if (typeof(before) === 'string')
						before = {classes: before};
					if (before.enabled === false)
						clsName.push('disabled');
					if (before.classes)
						clsName = clsName.concat(before.classes.split(/\s+/));
					if (before.tooltip)
						tooltip = before.tooltip;
				}

				clsName = $.unique(clsName);
				html.push('<td class="'+clsName.join(' ')+'"' + (tooltip ? ' title="'+tooltip+'"' : '') + '>'+prevMonth.getUTCDate() + '</td>');
				tooltip = null;
				if (prevMonth.getUTCDay() === this.o.weekEnd){
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate()+1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));

			var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');

			$.each(this.dates, function(i, d){
				if (d.getUTCFullYear() === year)
					months.eq(d.getUTCMonth()).addClass('active');
			});

			if (year < startYear || year > endYear){
				months.addClass('disabled');
			}
			if (year === startYear){
				months.slice(0, startMonth).addClass('disabled');
			}
			if (year === endYear){
				months.slice(endMonth+1).addClass('disabled');
			}

			if (this.o.beforeShowMonth !== $.noop){
				var that = this;
				$.each(months, function(i, month){
					if (!$(month).hasClass('disabled')) {
						var moDate = new Date(year, i, 1);
						var before = that.o.beforeShowMonth(moDate);
						if (before === false)
							$(month).addClass('disabled');
					}
				});
			}

			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			var years = $.map(this.dates, function(d){
					return d.getUTCFullYear();
				}),
				classes;
			for (var i = -1; i < 11; i++){
				classes = ['year'];
				if (i === -1)
					classes.push('old');
				else if (i === 10)
					classes.push('new');
				if ($.inArray(year, years) !== -1)
					classes.push('active');
				if (year < startYear || year > endYear)
					classes.push('disabled');
				html += '<span class="' + classes.join(' ') + '">' + year + '</span>';
				year += 1;
			}
			yearCont.html(html);
		},

		updateNavArrows: function(){
			if (!this._allow_update)
				return;

			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
			switch (this.viewMode){
				case 0:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()){
						this.picker.find('.prev').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()){
						this.picker.find('.next').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
				case 1:
				case 2:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()){
						this.picker.find('.prev').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()){
						this.picker.find('.next').css({visibility: 'hidden'});
					}
					else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
			}
		},

		click: function(e){
			e.preventDefault();
			var target = $(e.target).closest('span, td, th'),
				year, month, day;
			if (target.length === 1){
				switch (target[0].nodeName.toLowerCase()){
					case 'th':
						switch (target[0].className){
							case 'datepicker-switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1);
								switch (this.viewMode){
									case 0:
										this.viewDate = this.moveMonth(this.viewDate, dir);
										this._trigger('changeMonth', this.viewDate);
										break;
									case 1:
									case 2:
										this.viewDate = this.moveYear(this.viewDate, dir);
										if (this.viewMode === 1)
											this._trigger('changeYear', this.viewDate);
										break;
								}
								this.fill();
								break;
							case 'today':
								var date = new Date();
								date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

								this.showMode(-2);
								var which = this.o.todayBtn === 'linked' ? null : 'view';
								this._setDate(date, which);
								break;
							case 'clear':
								this.clearDates();
								break;
						}
						break;
					case 'span':
						if (!target.hasClass('disabled')){
							this.viewDate.setUTCDate(1);
							if (target.hasClass('month')){
								day = 1;
								month = target.parent().find('span').index(target);
								year = this.viewDate.getUTCFullYear();
								this.viewDate.setUTCMonth(month);
								this._trigger('changeMonth', this.viewDate);
								if (this.o.minViewMode === 1){
									this._setDate(UTCDate(year, month, day));
								}
							}
							else {
								day = 1;
								month = 0;
								year = parseInt(target.text(), 10)||0;
								this.viewDate.setUTCFullYear(year);
								this._trigger('changeYear', this.viewDate);
								if (this.o.minViewMode === 2){
									this._setDate(UTCDate(year, month, day));
								}
							}
							this.showMode(-1);
							this.fill();
						}
						break;
					case 'td':
						if (target.hasClass('day') && !target.hasClass('disabled')){
							day = parseInt(target.text(), 10)||1;
							year = this.viewDate.getUTCFullYear();
							month = this.viewDate.getUTCMonth();
							if (target.hasClass('old')){
								if (month === 0){
									month = 11;
									year -= 1;
								}
								else {
									month -= 1;
								}
							}
							else if (target.hasClass('new')){
								if (month === 11){
									month = 0;
									year += 1;
								}
								else {
									month += 1;
								}
							}
							this._setDate(UTCDate(year, month, day));
						}
						break;
				}
			}
			if (this.picker.is(':visible') && this._focused_from){
				$(this._focused_from).focus();
			}
			delete this._focused_from;
		},

		_toggle_multidate: function(date){
			var ix = this.dates.contains(date);
			if (!date){
				this.dates.clear();
			}

			if (ix !== -1){
				if (this.o.multidate === true || this.o.multidate > 1 || this.o.toggleActive){
					this.dates.remove(ix);
				}
			} else if (this.o.multidate === false) {
				this.dates.clear();
				this.dates.push(date);
			}
			else {
				this.dates.push(date);
			}

			if (typeof this.o.multidate === 'number')
				while (this.dates.length > this.o.multidate)
					this.dates.remove(0);
		},

		_setDate: function(date, which){
			if (!which || which === 'date')
				this._toggle_multidate(date && new Date(date));
			if (!which || which  === 'view')
				this.viewDate = date && new Date(date);

			this.fill();
			this.setValue();
			if (!which || which  !== 'view') {
				this._trigger('changeDate');
			}
			var element;
			if (this.isInput){
				element = this.element;
			}
			else if (this.component){
				element = this.element.find('input');
			}
			if (element){
				element.change();
			}
			if (this.o.autoclose && (!which || which === 'date')){
				this.hide();
			}
		},

		moveMonth: function(date, dir){
			if (!date)
				return undefined;
			if (!dir)
				return date;
			var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
			dir = dir > 0 ? 1 : -1;
			if (mag === 1){
				test = dir === -1
					// If going back one month, make sure month is not current month
					// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function(){
						return new_date.getUTCMonth() === month;
					}
					// If going forward one month, make sure month is as expected
					// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function(){
						return new_date.getUTCMonth() !== new_month;
					};
				new_month = month + dir;
				new_date.setUTCMonth(new_month);
				// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
				if (new_month < 0 || new_month > 11)
					new_month = (new_month + 12) % 12;
			}
			else {
				// For magnitudes >1, move one month at a time...
				for (var i=0; i < mag; i++)
					// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
					new_date = this.moveMonth(new_date, dir);
				// ...then reset the day, keeping it in the new month
				new_month = new_date.getUTCMonth();
				new_date.setUTCDate(day);
				test = function(){
					return new_month !== new_date.getUTCMonth();
				};
			}
			// Common date-resetting loop -- if date is beyond end of month, make it
			// end of month
			while (test()){
				new_date.setUTCDate(--day);
				new_date.setUTCMonth(new_month);
			}
			return new_date;
		},

		moveYear: function(date, dir){
			return this.moveMonth(date, dir*12);
		},

		dateWithinRange: function(date){
			return date >= this.o.startDate && date <= this.o.endDate;
		},

		keydown: function(e){
			if (!this.picker.is(':visible')){
				if (e.keyCode === 27) // allow escape to hide and re-show picker
					this.show();
				return;
			}
			var dateChanged = false,
				dir, newDate, newViewDate,
				focusDate = this.focusDate || this.viewDate;
			switch (e.keyCode){
				case 27: // escape
					if (this.focusDate){
						this.focusDate = null;
						this.viewDate = this.dates.get(-1) || this.viewDate;
						this.fill();
					}
					else
						this.hide();
					e.preventDefault();
					break;
				case 37: // left
				case 39: // right
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 37 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					}
					else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					}
					else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir);
					}
					if (this.dateWithinRange(newViewDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 38: // up
				case 40: // down
					if (!this.o.keyboardNavigation)
						break;
					dir = e.keyCode === 38 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					}
					else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					}
					else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir * 7);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir * 7);
					}
					if (this.dateWithinRange(newViewDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 32: // spacebar
					// Spacebar is used in manually typing dates in some formats.
					// As such, its behavior should not be hijacked.
					break;
				case 13: // enter
					focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
					if (this.o.keyboardNavigation) {
						this._toggle_multidate(focusDate);
						dateChanged = true;
					}
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.setValue();
					this.fill();
					if (this.picker.is(':visible')){
						e.preventDefault();
						if (typeof e.stopPropagation === 'function') {
							e.stopPropagation(); // All modern browsers, IE9+
						} else {
							e.cancelBubble = true; // IE6,7,8 ignore "stopPropagation"
						}
						if (this.o.autoclose)
							this.hide();
					}
					break;
				case 9: // tab
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.fill();
					this.hide();
					break;
			}
			if (dateChanged){
				if (this.dates.length)
					this._trigger('changeDate');
				else
					this._trigger('clearDate');
				var element;
				if (this.isInput){
					element = this.element;
				}
				else if (this.component){
					element = this.element.find('input');
				}
				if (element){
					element.change();
				}
			}
		},

		showMode: function(dir){
			if (dir){
				this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
			}
			this.picker
				.children('div')
				.hide()
				.filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName)
					.css('display', 'block');
			this.updateNavArrows();
		}
	};

	var DateRangePicker = function(element, options){
		this.element = $(element);
		this.inputs = $.map(options.inputs, function(i){
			return i.jquery ? i[0] : i;
		});
		delete options.inputs;

		datepickerPlugin.call($(this.inputs), options)
			.bind('changeDate', $.proxy(this.dateUpdated, this));

		this.pickers = $.map(this.inputs, function(i){
			return $(i).data('datepicker');
		});
		this.updateDates();
	};
	DateRangePicker.prototype = {
		updateDates: function(){
			this.dates = $.map(this.pickers, function(i){
				return i.getUTCDate();
			});
			this.updateRanges();
		},
		updateRanges: function(){
			var range = $.map(this.dates, function(d){
				return d.valueOf();
			});
			$.each(this.pickers, function(i, p){
				p.setRange(range);
			});
		},
		dateUpdated: function(e){
			// `this.updating` is a workaround for preventing infinite recursion
			// between `changeDate` triggering and `setUTCDate` calling.  Until
			// there is a better mechanism.
			if (this.updating)
				return;
			this.updating = true;

			var dp = $(e.target).data('datepicker'),
				new_date = dp.getUTCDate(),
				i = $.inArray(e.target, this.inputs),
				j = i - 1,
				k = i + 1,
				l = this.inputs.length;
			if (i === -1)
				return;

			$.each(this.pickers, function(i, p){
				if (!p.getUTCDate())
					p.setUTCDate(new_date);
			});

			if (new_date < this.dates[j]){
				// Date being moved earlier/left
				while (j >= 0 && new_date < this.dates[j]){
					this.pickers[j--].setUTCDate(new_date);
				}
			}
			else if (new_date > this.dates[k]){
				// Date being moved later/right
				while (k < l && new_date > this.dates[k]){
					this.pickers[k++].setUTCDate(new_date);
				}
			}
			this.updateDates();

			delete this.updating;
		},
		remove: function(){
			$.map(this.pickers, function(p){ p.remove(); });
			delete this.element.data().datepicker;
		}
	};

	function opts_from_el(el, prefix){
		// Derive options from element data-attrs
		var data = $(el).data(),
			out = {}, inkey,
			replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
		prefix = new RegExp('^' + prefix.toLowerCase());
		function re_lower(_,a){
			return a.toLowerCase();
		}
		for (var key in data)
			if (prefix.test(key)){
				inkey = key.replace(replace, re_lower);
				out[inkey] = data[key];
			}
		return out;
	}

	function opts_from_locale(lang){
		// Derive options from locale plugins
		var out = {};
		// Check if "de-DE" style date is available, if not language should
		// fallback to 2 letter code eg "de"
		if (!dates[lang]){
			lang = lang.split('-')[0];
			if (!dates[lang])
				return;
		}
		var d = dates[lang];
		$.each(locale_opts, function(i,k){
			if (k in d)
				out[k] = d[k];
		});
		return out;
	}

	var old = $.fn.datepicker;
	var datepickerPlugin = function(option){
		var args = Array.apply(null, arguments);
		args.shift();
		var internal_return;
		this.each(function(){
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option === 'object' && option;
			if (!data){
				var elopts = opts_from_el(this, 'date'),
					// Preliminary otions
					xopts = $.extend({}, defaults, elopts, options),
					locopts = opts_from_locale(xopts.language),
					// Options priority: js args, data-attrs, locales, defaults
					opts = $.extend({}, defaults, locopts, elopts, options);
				if ($this.hasClass('input-daterange') || opts.inputs){
					var ropts = {
						inputs: opts.inputs || $this.find('input').toArray()
					};
					$this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
				}
				else {
					$this.data('datepicker', (data = new Datepicker(this, opts)));
				}
			}
			if (typeof option === 'string' && typeof data[option] === 'function'){
				internal_return = data[option].apply(data, args);
				if (internal_return !== undefined)
					return false;
			}
		});
		if (internal_return !== undefined)
			return internal_return;
		else
			return this;
	};
	$.fn.datepicker = datepickerPlugin;

	var defaults = $.fn.datepicker.defaults = {
		autoclose: false,
		beforeShowDay: $.noop,
		beforeShowMonth: $.noop,
		calendarWeeks: false,
		clearBtn: false,
		toggleActive: false,
		daysOfWeekDisabled: [],
		datesDisabled: [],
		endDate: Infinity,
		forceParse: true,
		format: 'mm/dd/yyyy',
		keyboardNavigation: true,
		language: 'en',
		minViewMode: 0,
		multidate: false,
		multidateSeparator: ',',
		orientation: "auto",
		rtl: false,
		startDate: -Infinity,
		startView: 0,
		todayBtn: false,
		todayHighlight: false,
		weekStart: 0,
		disableTouchKeyboard: false,
		container: 'body'
	};
	var locale_opts = $.fn.datepicker.locale_opts = [
		'format',
		'rtl',
		'weekStart'
	];
	$.fn.datepicker.Constructor = Datepicker;
	var dates = $.fn.datepicker.dates = {
		en: {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			today: "Today",
			clear: "Clear"
		}
	};

	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		isLeapYear: function(year){
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
		},
		getDaysInMonth: function(year, month){
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
		},
		validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
		nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
		parseFormat: function(format){
			// IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length === 0){
				throw new Error("Invalid date format.");
			}
			return {separators: separators, parts: parts};
		},
		parseDate: function(date, format, language){
			if (!date)
				return undefined;
			if (date instanceof Date)
				return date;
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var part_re = /([\-+]\d+)([dmwy])/,
				parts = date.match(/([\-+]\d+)([dmwy])/g),
				part, dir, i;
			if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)){
				date = new Date();
				for (i=0; i < parts.length; i++){
					part = part_re.exec(parts[i]);
					dir = parseInt(part[1]);
					switch (part[2]){
						case 'd':
							date.setUTCDate(date.getUTCDate() + dir);
							break;
						case 'm':
							date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
							break;
						case 'w':
							date.setUTCDate(date.getUTCDate() + dir * 7);
							break;
						case 'y':
							date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
							break;
					}
				}
				return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
			}
			parts = date && date.match(this.nonpunctuation) || [];
			date = new Date();
			var parsed = {},
				setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
				setters_map = {
					yyyy: function(d,v){
						return d.setUTCFullYear(v);
					},
					yy: function(d,v){
						return d.setUTCFullYear(2000+v);
					},
					m: function(d,v){
						if (isNaN(d))
							return d;
						v -= 1;
						while (v < 0) v += 12;
						v %= 12;
						d.setUTCMonth(v);
						while (d.getUTCMonth() !== v)
							d.setUTCDate(d.getUTCDate()-1);
						return d;
					},
					d: function(d,v){
						return d.setUTCDate(v);
					}
				},
				val, filtered;
			setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
			setters_map['dd'] = setters_map['d'];
			date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
			var fparts = format.parts.slice();
			// Remove noop parts
			if (parts.length !== fparts.length){
				fparts = $(fparts).filter(function(i,p){
					return $.inArray(p, setters_order) !== -1;
				}).toArray();
			}
			// Process remainder
			function match_part(){
				var m = this.slice(0, parts[i].length),
					p = parts[i].slice(0, m.length);
				return m.toLowerCase() === p.toLowerCase();
			}
			if (parts.length === fparts.length){
				var cnt;
				for (i=0, cnt = fparts.length; i < cnt; i++){
					val = parseInt(parts[i], 10);
					part = fparts[i];
					if (isNaN(val)){
						switch (part){
							case 'MM':
								filtered = $(dates[language].months).filter(match_part);
								val = $.inArray(filtered[0], dates[language].months) + 1;
								break;
							case 'M':
								filtered = $(dates[language].monthsShort).filter(match_part);
								val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
								break;
						}
					}
					parsed[part] = val;
				}
				var _date, s;
				for (i=0; i < setters_order.length; i++){
					s = setters_order[i];
					if (s in parsed && !isNaN(parsed[s])){
						_date = new Date(date);
						setters_map[s](_date, parsed[s]);
						if (!isNaN(_date))
							date = _date;
					}
				}
			}
			return date;
		},
		formatDate: function(date, format, language){
			if (!date)
				return '';
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var val = {
				d: date.getUTCDate(),
				D: dates[language].daysShort[date.getUTCDay()],
				DD: dates[language].days[date.getUTCDay()],
				m: date.getUTCMonth() + 1,
				M: dates[language].monthsShort[date.getUTCMonth()],
				MM: dates[language].months[date.getUTCMonth()],
				yy: date.getUTCFullYear().toString().substring(2),
				yyyy: date.getUTCFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			date = [];
			var seps = $.extend([], format.separators);
			for (var i=0, cnt = format.parts.length; i <= cnt; i++){
				if (seps.length)
					date.push(seps.shift());
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		headTemplate: '<thead>'+
							'<tr>'+
								'<th class="prev">&#171;</th>'+
								'<th colspan="5" class="datepicker-switch"></th>'+
								'<th class="next">&#187;</th>'+
							'</tr>'+
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate: '<tfoot>'+
							'<tr>'+
								'<th colspan="7" class="today"></th>'+
							'</tr>'+
							'<tr>'+
								'<th colspan="7" class="clear"></th>'+
							'</tr>'+
						'</tfoot>'
	};
	DPGlobal.template = '<div class="datepicker">'+
							'<div class="datepicker-days">'+
								'<table class=" table-condensed">'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-months">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-years">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
						'</div>';

	$.fn.datepicker.DPGlobal = DPGlobal;


	/* DATEPICKER NO CONFLICT
	* =================== */

	$.fn.datepicker.noConflict = function(){
		$.fn.datepicker = old;
		return this;
	};


	/* DATEPICKER DATA-API
	* ================== */

	$(document).on(
		'focus.datepicker.data-api click.datepicker.data-api',
		'[data-provide="datepicker"]',
		function(e){
			var $this = $(this);
			if ($this.data('datepicker'))
				return;
			e.preventDefault();
			// component click requires us to explicitly show it
			datepickerPlugin.call($this, 'show');
		}
	);
	$(function(){
		datepickerPlugin.call($('[data-provide="datepicker-inline"]'));
	});

}(window.jQuery));

/**
/* FUNKTIONER
/**/

function checkForm(thisField) {
	
	formOK = true;
	
	gotValue = thisField.val();
	
	if(gotValue.length == 0) {
		
		//thisField.parent('div').removeClass('has-success');
		thisField.parent('div').addClass('has-error');
		$('[type=submit]').attr('disabled', 'disabled');
		
	}
	
	else {
		
		thisField.parent('div').removeClass('has-error');
		//thisField.parent('div').addClass('has-success');
		
	}
		
	$('.req').each(function() {
		
		if($(this).val().length == 0) { formOK = false; }
		
	});
	
	if(formOK) {
		
		$('[type=submit]').removeAttr('disabled');
		
	}
	
}
/**
/* VARIABLER
/**/

var gotReq = false;