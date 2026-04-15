(function () {
  var sectionSelector = '[data-section-type="featured-collection"]';

  function enableSwatchDragScroll(section) {
    var swatchLists = section.querySelectorAll('.product-item__swatch-list');

    swatchLists.forEach(function (list) {
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

      list.addEventListener(
        'click',
        function (event) {
          if (suppressClick) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick = false;
          }
        },
        true
      );
    });
  }

  function initSection(section) {
    if (!section || section.dataset.featuredScrollInit === 'true') {
      return;
    }

    enableSwatchDragScroll(section);

    var scrollerInner = section.querySelector('.scroller__inner');
    var controls = section.querySelector('[data-featured-scroll-controls]');

    if (!scrollerInner || !controls) {
      return;
    }

    var leftButton = controls.querySelector('[data-scroll-direction="left"]');
    var rightButton = controls.querySelector('[data-scroll-direction="right"]');

    if (!leftButton || !rightButton) {
      return;
    }

    section.dataset.featuredScrollInit = 'true';

    var getStep = function () {
      return Math.max(Math.round(scrollerInner.clientWidth * 0.6), 220);
    };

    var updateControls = function () {
      var maxScroll = scrollerInner.scrollWidth - scrollerInner.clientWidth;
      var hasOverflow = maxScroll > 2;

      controls.hidden = !hasOverflow;

      if (!hasOverflow) {
        return;
      }

      leftButton.disabled = scrollerInner.scrollLeft <= 2;
      rightButton.disabled = scrollerInner.scrollLeft >= maxScroll - 2;
    };

    leftButton.addEventListener('click', function () {
      scrollerInner.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    rightButton.addEventListener('click', function () {
      scrollerInner.scrollBy({ left: getStep(), behavior: 'smooth' });
    });

    scrollerInner.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);

    updateControls();
  }

  function initAll(root) {
    var scope = root || document;
    var sections = scope.querySelectorAll(sectionSelector);

    sections.forEach(function (section) {
      initSection(section);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAll(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
