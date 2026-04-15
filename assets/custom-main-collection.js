(function () {
  var SCROLL_STORAGE_KEY = 'custom-main-collection-scroll:';

  function scrollStorageKey() {
    return SCROLL_STORAGE_KEY + window.location.pathname;
  }

  function storeCustomMainCollectionScroll() {
    try {
      sessionStorage.setItem(
        scrollStorageKey(),
        JSON.stringify({ x: window.scrollX, y: window.scrollY })
      );
    } catch (e) {}
  }

  function restoreCustomMainCollectionScroll() {
    var raw;
    try {
      raw = sessionStorage.getItem(scrollStorageKey());
    } catch (e) {
      return;
    }
    if (!raw) {
      return;
    }
    try {
      sessionStorage.removeItem(scrollStorageKey());
    } catch (e) {}
    var pos;
    try {
      pos = JSON.parse(raw);
    } catch (e) {
      return;
    }
    var x = typeof pos.x === 'number' ? pos.x : 0;
    var y = typeof pos.y === 'number' ? pos.y : 0;

    function applyScroll() {
      window.scrollTo(x, y);
    }

    applyScroll();
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(applyScroll);
    });
    window.addEventListener('load', applyScroll, { once: true });
  }

  function CustomMainCollection(element) {
    this.element = element;
    this.filtersForms = element.querySelectorAll('[data-custom-main-filters-form]');
    this.sortSelects = element.querySelectorAll('[data-custom-main-sort-select]');
    this.swatchLists = element.querySelectorAll('.product-item__swatch-list');
    this.mobileDrawerTrigger = element.querySelector('[data-action="open-drawer"][aria-controls="mobile-collection-filters"]');
    this.mobileDrawer = element.querySelector('#mobile-collection-filters');
    this.isMobileDrawerOpen = false;
    this._attachListeners();
  }

  CustomMainCollection.prototype._attachListeners = function () {
    this.filtersForms.forEach(function (form) {
      form.addEventListener('change', this._onFilterChanged.bind(this, form));
      form.addEventListener('submit', storeCustomMainCollectionScroll);
    }, this);

    this.sortSelects.forEach(function (sortSelect) {
      sortSelect.addEventListener('change', this._onSortChanged.bind(this));
    }, this);

    this.element.addEventListener('change', this._onSwatchChanged.bind(this));

    this._enableSwatchDragScroll();
    this._attachMobileDrawerListeners();
  };

  CustomMainCollection.prototype._onFilterChanged = function (form, event) {
    if (
      event.target &&
      event.target.matches('input[type="checkbox"], input[type="number"]')
    ) {
      storeCustomMainCollectionScroll();
      form.submit();
    }
  };

  CustomMainCollection.prototype._onSortChanged = function (event) {
    var sortBy = event.target && event.target.value;

    if (!sortBy) {
      return;
    }

    storeCustomMainCollectionScroll();

    var url = new URL(window.location.href);
    url.searchParams.set('sort_by', sortBy);
    window.location.assign(url.toString());
  };

  CustomMainCollection.prototype._attachMobileDrawerListeners = function () {
    if (!this.mobileDrawerTrigger || !this.mobileDrawer) {
      return;
    }

    this.mobileDrawerTrigger.addEventListener('click', this._openMobileDrawer.bind(this));
    this.mobileDrawer.addEventListener('click', this._onMobileDrawerClick.bind(this));
    document.addEventListener('click', this._onMobileOutsideClick.bind(this));
    window.addEventListener('resize', this._setMobileDrawerHeight.bind(this));
  };

  CustomMainCollection.prototype._setMobileDrawerHeight = function () {
    var drawerPanel = this.mobileDrawer.querySelector('.collection-drawer');

    if (!drawerPanel) {
      return;
    }

    drawerPanel.style.maxHeight = window.innerHeight + 'px';
  };

  CustomMainCollection.prototype._openMobileDrawer = function (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this._setMobileDrawerHeight();
    this.isMobileDrawerOpen = true;
    this.mobileDrawerTrigger.setAttribute('aria-expanded', 'true');
    this.mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-mobile-scroll');
  };

  CustomMainCollection.prototype._closeMobileDrawer = function (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.isMobileDrawerOpen = false;
    this.mobileDrawerTrigger.setAttribute('aria-expanded', 'false');
    this.mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-mobile-scroll');
  };

  CustomMainCollection.prototype._onMobileDrawerClick = function (event) {
    if (event.target.closest('[data-action="close-drawer"]')) {
      this._closeMobileDrawer(event);
    }
  };

  CustomMainCollection.prototype._onMobileOutsideClick = function (event) {
    if (!this.isMobileDrawerOpen) {
      return;
    }

    if (event.target.closest('.collection-drawer__inner')) {
      return;
    }

    if (event.target.closest('[data-action="open-drawer"][aria-controls="mobile-collection-filters"]')) {
      return;
    }

    this._closeMobileDrawer();
  };

  CustomMainCollection.prototype._onSwatchChanged = function (event) {
    var target = event.target;

    if (!target || !target.matches('.product-item__swatch-list .color-swatch__radio')) {
      return;
    }

    var productItem = target.closest('.product-item');

    if (!productItem) {
      return;
    }

    var variantUrl = target.getAttribute('data-variant-url');
    var imageWrapper = productItem.querySelector('.product-item__image-wrapper');
    var titleLink = productItem.querySelector('.product-item__title');

    if (variantUrl) {
      if (imageWrapper) {
        imageWrapper.setAttribute('href', variantUrl);
      }

      if (titleLink) {
        titleLink.setAttribute('href', variantUrl);
      }
    }

    this._swapProductImage(productItem, target);
  };

  CustomMainCollection.prototype._swapProductImage = function (productItem, target) {
    var originalImageElement = productItem.querySelector('.product-item__primary-image');
    var mediaId = target.getAttribute('data-media-id');
    var imageUrl = target.getAttribute('data-image-url');

    if (!originalImageElement || !mediaId || !imageUrl) {
      return;
    }

    if (mediaId === originalImageElement.getAttribute('data-media-id')) {
      return;
    }

    var newImageElement = document.createElement('img');
    var imageAspectRatio = parseFloat(target.getAttribute('data-image-aspect-ratio'));
    var imageContainer = originalImageElement.parentNode;

    newImageElement.className = 'product-item__primary-image lazyload image--fade-in';
    newImageElement.setAttribute('data-media-id', mediaId);
    newImageElement.setAttribute('data-src', imageUrl);
    newImageElement.setAttribute('data-widths', target.getAttribute('data-image-widths'));
    newImageElement.setAttribute('data-sizes', 'auto');
    newImageElement.setAttribute(
      'src',
      imageUrl.indexOf('{width}') > -1 ? imageUrl.replace('{width}', '600') : imageUrl
    );

    if (imageContainer && imageAspectRatio > 0) {
      imageContainer.style.paddingBottom = (100 / imageAspectRatio) + '%';
    }

    if (imageContainer) {
      imageContainer.replaceChild(newImageElement, originalImageElement);
    }
  };

  CustomMainCollection.prototype._enableSwatchDragScroll = function () {
    this.swatchLists.forEach(function (list) {
      if (list.dataset.dragScrollReady === 'true') {
        return;
      }

      list.dataset.dragScrollReady = 'true';
      list.style.touchAction = 'pan-y';

      var isPointerDown = false;
      var isDragging = false;
      var startX = 0;
      var startScrollLeft = 0;
      var suppressClick = false;
      var dragThreshold = 8;

      list.addEventListener('pointerdown', function (event) {
        if (event.pointerType === 'mouse' && event.button !== 0) {
          return;
        }

        isPointerDown = true;
        isDragging = false;
        suppressClick = false;
        startX = event.clientX;
        startScrollLeft = list.scrollLeft;
      });

      list.addEventListener('pointermove', function (event) {
        if (!isPointerDown) {
          return;
        }

        var distance = event.clientX - startX;

        if (!isDragging && Math.abs(distance) >= dragThreshold) {
          isDragging = true;
          list.classList.add('is-dragging');
        }

        if (!isDragging) {
          return;
        }

        list.scrollLeft = startScrollLeft - distance;
        event.preventDefault();
      });

      function stopDragging() {
        if (!isPointerDown) {
          return;
        }

        if (isDragging) {
          suppressClick = true;
        }

        isPointerDown = false;
        isDragging = false;
        list.classList.remove('is-dragging');
      }

      list.addEventListener('pointerup', stopDragging);
      list.addEventListener('pointercancel', stopDragging);
      list.addEventListener('pointerleave', stopDragging);

      list.addEventListener('click', function (event) {
        if (suppressClick) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick = false;
        }
      }, true);
    });
  };

  function initCustomMainCollection() {
    var sections = document.querySelectorAll('[data-custom-main-collection]');

    sections.forEach(function (section) {
      if (!section.customMainCollection) {
        section.customMainCollection = new CustomMainCollection(section);
      }
    });
  }

  function onDocumentReady() {
    restoreCustomMainCollectionScroll();
    initCustomMainCollection();
  }

  document.addEventListener('DOMContentLoaded', onDocumentReady);
  document.addEventListener('shopify:section:load', initCustomMainCollection);
})();
