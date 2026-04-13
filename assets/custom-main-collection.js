(function () {
  function CustomMainCollection(element) {
    this.element = element;
    this.filtersForm = element.querySelector('[data-custom-main-filters-form]');
    this.swatchLists = element.querySelectorAll('.product-item__swatch-list');
    this._attachListeners();
  }

  CustomMainCollection.prototype._attachListeners = function () {
    if (this.filtersForm) {
      this.filtersForm.addEventListener('change', this._onFilterChanged.bind(this));
    }

    this.element.addEventListener('change', this._onSwatchChanged.bind(this));

    this._enableSwatchDragScroll();
  };

  CustomMainCollection.prototype._onFilterChanged = function (event) {
    if (
      event.target &&
      event.target.matches('input[type="checkbox"], input[type="number"]')
    ) {
      this.filtersForm.submit();
    }
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

  document.addEventListener('DOMContentLoaded', initCustomMainCollection);
  document.addEventListener('shopify:section:load', initCustomMainCollection);
})();
