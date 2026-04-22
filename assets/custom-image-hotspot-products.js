(function () {
  var MOBILE_BP = 740;

  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  function HotspotSection(section) {
    this.section = section;
    this.triggers = Array.prototype.slice.call(
      section.querySelectorAll("[data-hotspot-trigger]"),
    );
    this.cards = Array.prototype.slice.call(
      section.querySelectorAll("[data-hotspot-card]"),
    );
    this.activeTrigger = null;
    this.backdrop = null;

    // Remember each card's original DOM location so we can restore it
    this.cardOrigins = this.cards.map(function (card) {
      return { card: card, parent: card.parentNode, next: card.nextSibling };
    });

    if (!this.triggers.length) return;

    this.injectBackdrop();
    this.updateAutoDirection();
    this.bindEvents();
  }

  /* ── Backdrop ────────────────────────────────────────────── */

  HotspotSection.prototype.injectBackdrop = function () {
    var bd = document.createElement("div");
    bd.className = "custom-image-hotspot-products__backdrop";
    bd.setAttribute("aria-hidden", "true");
    document.body.appendChild(bd);
    this.backdrop = bd;
    bd.addEventListener("click", this.closeAll.bind(this));
  };

  HotspotSection.prototype.showBackdrop = function () {
    if (!this.backdrop) return;
    this.backdrop.classList.add(
      "custom-image-hotspot-products__backdrop--visible",
    );
  };

  HotspotSection.prototype.hideBackdrop = function () {
    if (!this.backdrop) return;
    this.backdrop.classList.remove(
      "custom-image-hotspot-products__backdrop--visible",
    );
  };

  /* ── Event binding ───────────────────────────────────────── */

  HotspotSection.prototype.bindEvents = function () {
    this.section.addEventListener("click", this.handleTriggerClick.bind(this));
    this.section.addEventListener("keydown", this.handleKeydown.bind(this));
    this.section.addEventListener("mouseover", this.handleMouseOver.bind(this));
    this.section.addEventListener("mouseout", this.handleMouseOut.bind(this));
    document.addEventListener("click", this.handleDocumentClick.bind(this));
    document.addEventListener("click", this.handleCloseButtonClick.bind(this));
    window.addEventListener("resize", this.updateAutoDirection.bind(this));
  };

  /* ── Handlers ────────────────────────────────────────────── */

  HotspotSection.prototype.handleCloseButtonClick = function (event) {
    var closeBtn = event.target.closest(
      ".custom-image-hotspot-products__card-close",
    );
    if (closeBtn) {
      event.preventDefault();
      event.stopPropagation();
      this.closeAll();
    }
  };

  HotspotSection.prototype.handleTriggerClick = function (event) {
    var trigger = event.target.closest("[data-hotspot-trigger]");
    var closeBtn = event.target.closest(
      ".custom-image-hotspot-products__card-close",
    );

    if (closeBtn) {
      event.preventDefault();
      this.closeAll();
      return;
    }

    if (!trigger || !this.section.contains(trigger)) return;

    event.preventDefault();

    if (this.activeTrigger === trigger) {
      this.closeAll();
      return;
    }

    this.openTrigger(trigger);
  };

  HotspotSection.prototype.handleDocumentClick = function (event) {
    if (this.section.contains(event.target)) return;
    // Also ignore clicks inside a teleported card
    if (event.target.closest("[data-hotspot-card]")) return;
    this.closeAll();
  };

  HotspotSection.prototype.handleKeydown = function (event) {
    if (event.key === "Escape") this.closeAll();
  };

  HotspotSection.prototype.handleMouseOver = function (event) {
    if (isMobile()) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    var hotspot = event.target.closest(
      ".custom-image-hotspot-products__hotspot",
    );
    var trigger = hotspot
      ? hotspot.querySelector("[data-hotspot-trigger]")
      : null;

    if (!trigger || !this.section.contains(hotspot)) return;
    this.openTrigger(trigger);
  };

  HotspotSection.prototype.handleMouseOut = function (event) {
    if (isMobile()) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    var hotspot = event.target.closest(
      ".custom-image-hotspot-products__hotspot",
    );
    if (!hotspot || !this.section.contains(hotspot)) return;
    if (hotspot.contains(event.relatedTarget)) return;

    this.closeAll();
  };

  /* ── Open ────────────────────────────────────────────────── */

  HotspotSection.prototype.openTrigger = function (trigger) {
    var self = this;
    var targetId = trigger.getAttribute("data-hotspot-target");
    var card = targetId ? document.getElementById(targetId) : null;

    this.closeAll();

    if (!card) return;

    trigger.setAttribute("aria-expanded", "true");
    this.activeTrigger = trigger;

    if (isMobile()) {
      // Teleport card to <body> so position:fixed is NOT trapped
      // inside a transformed/overflow:hidden ancestor
      if (card.parentNode !== document.body) {
        document.body.appendChild(card);
      }

      card.removeAttribute("hidden");

      // Force reflow — lets the browser register the starting
      // translateY(100%) before the transition class is added
      void card.offsetHeight;

      card.classList.add("custom-image-hotspot-products__card--open");
      this.showBackdrop();
      document.body.style.overflow = "hidden";
    } else {
      // Desktop: ensure card is back in its original spot
      self.restoreCard(card);
      card.removeAttribute("hidden");
    }
  };

  /* ── Close ───────────────────────────────────────────────── */

  HotspotSection.prototype.closeAll = function () {
    var self = this;

    this.triggers.forEach(function (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    });

    this.cards.forEach(function (card) {
      if (
        card.classList.contains("custom-image-hotspot-products__card--open")
      ) {
        card.classList.remove("custom-image-hotspot-products__card--open");

        // Wait for slide-down transition to finish, then hide & restore
        card.addEventListener("transitionend", function onEnd(e) {
          if (e.propertyName !== "transform") return;
          card.removeEventListener("transitionend", onEnd);

          if (
            !card.classList.contains(
              "custom-image-hotspot-products__card--open",
            )
          ) {
            card.setAttribute("hidden", "");
            self.restoreCard(card);
          }
        });
      } else {
        card.setAttribute("hidden", "");
        self.restoreCard(card);
      }
    });

    this.hideBackdrop();
    document.body.style.overflow = "";
    this.activeTrigger = null;
  };

  /* ── Restore card to original DOM parent ─────────────────── */

  HotspotSection.prototype.restoreCard = function (card) {
    var origin = null;
    for (var i = 0; i < this.cardOrigins.length; i++) {
      if (this.cardOrigins[i].card === card) {
        origin = this.cardOrigins[i];
        break;
      }
    }
    if (!origin || card.parentNode === origin.parent) return;

    if (origin.next && origin.next.parentNode === origin.parent) {
      origin.parent.insertBefore(card, origin.next);
    } else {
      origin.parent.appendChild(card);
    }
  };

  /* ── Auto direction (desktop) ────────────────────────────── */

  HotspotSection.prototype.updateAutoDirection = function () {
    var sectionRect = this.section.getBoundingClientRect();
    var hotspots = this.section.querySelectorAll(
      ".custom-image-hotspot-products__hotspot",
    );

    hotspots.forEach(function (hotspot) {
      var card = hotspot.querySelector(
        ".custom-image-hotspot-products__card--auto",
      );
      var hotspotRect = hotspot.getBoundingClientRect();
      var hotspotMid = hotspotRect.left + hotspotRect.width / 2;
      var sectionMidpoint = sectionRect.left + sectionRect.width / 2;

      hotspot.classList.remove(
        "custom-image-hotspot-products__hotspot--reverse",
      );

      if (!card) return;

      var wasHidden = card.hasAttribute("hidden");
      card.removeAttribute("hidden");
      var cardRect = card.getBoundingClientRect();
      if (wasHidden) card.setAttribute("hidden", "");

      var wouldOverflowRight =
        hotspotRect.right + cardRect.width + 14 > sectionRect.right;
      var wouldOverflowLeft =
        hotspotRect.left - cardRect.width - 14 < sectionRect.left;

      var shouldReverse = hotspotMid > sectionMidpoint;

      if (shouldReverse && wouldOverflowLeft && !wouldOverflowRight) {
        shouldReverse = false;
      } else if (!shouldReverse && wouldOverflowRight && !wouldOverflowLeft) {
        shouldReverse = true;
      }

      if (shouldReverse) {
        hotspot.classList.add(
          "custom-image-hotspot-products__hotspot--reverse",
        );
      }
    });
  };

  /* ── Init ────────────────────────────────────────────────── */

  document.addEventListener("DOMContentLoaded", function () {
    document
      .querySelectorAll("[data-hotspot-section]")
      .forEach(function (section) {
        new HotspotSection(section);
      });
  });
})();
