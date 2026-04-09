(function() {
  function HotspotSection(section) {
    this.section = section;
    this.triggers = Array.prototype.slice.call(section.querySelectorAll('[data-hotspot-trigger]'));
    this.cards = Array.prototype.slice.call(section.querySelectorAll('[data-hotspot-card]'));
    this.activeTrigger = null;

    if (!this.triggers.length) {
      return;
    }

    this.updateAutoDirection();
    this.bindEvents();
  }

  HotspotSection.prototype.bindEvents = function() {
    this.onTriggerClick = this.handleTriggerClick.bind(this);
    this.onDocumentClick = this.handleDocumentClick.bind(this);
    this.onSectionKeydown = this.handleKeydown.bind(this);
    this.onResize = this.updateAutoDirection.bind(this);

    this.section.addEventListener('click', this.onTriggerClick);
    this.section.addEventListener('keydown', this.onSectionKeydown);
    document.addEventListener('click', this.onDocumentClick);
    window.addEventListener('resize', this.onResize);
  };

  HotspotSection.prototype.handleTriggerClick = function(event) {
    var trigger = event.target.closest('[data-hotspot-trigger]');

    if (!trigger || !this.section.contains(trigger)) {
      return;
    }

    event.preventDefault();

    if (this.activeTrigger === trigger) {
      this.closeAll();
      return;
    }

    this.openTrigger(trigger);
  };

  HotspotSection.prototype.handleDocumentClick = function(event) {
    if (!this.section.contains(event.target)) {
      this.closeAll();
    }
  };

  HotspotSection.prototype.handleKeydown = function(event) {
    if (event.key === 'Escape') {
      this.closeAll();
    }
  };

  HotspotSection.prototype.openTrigger = function(trigger) {
    var targetId = trigger.getAttribute('data-hotspot-target');
    var card = targetId ? document.getElementById(targetId) : null;

    this.closeAll();

    if (!card) {
      return;
    }

    trigger.setAttribute('aria-expanded', 'true');
    card.hidden = false;
    this.activeTrigger = trigger;
  };

  HotspotSection.prototype.closeAll = function() {
    this.triggers.forEach(function(trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    });

    this.cards.forEach(function(card) {
      card.hidden = true;
    });

    this.activeTrigger = null;
  };

  HotspotSection.prototype.updateAutoDirection = function() {
    var sectionRect = this.section.getBoundingClientRect();
    var sectionMidpoint = sectionRect.left + sectionRect.width / 2;
    var hotspots = this.section.querySelectorAll('.custom-image-hotspot-products__hotspot');

    hotspots.forEach(function(hotspot) {
      var card = hotspot.querySelector('.custom-image-hotspot-products__card--auto');
      var hotspotRect = hotspot.getBoundingClientRect();
      var hotspotMid = hotspotRect.left + hotspotRect.width / 2;

      hotspot.classList.remove('custom-image-hotspot-products__hotspot--reverse');

      if (!card) {
        return;
      }

      if (hotspotMid > sectionMidpoint) {
        hotspot.classList.add('custom-image-hotspot-products__hotspot--reverse');
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    var sections = document.querySelectorAll('[data-hotspot-section]');

    sections.forEach(function(section) {
      new HotspotSection(section);
    });
  });
})();
