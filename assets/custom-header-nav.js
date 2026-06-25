(function () {
  "use strict";

  function closeDropdown(item) {
    if (!item.classList.contains("is-dropdown-open")) return;

    var link = item.querySelector(":scope > .nav-bar__link[aria-haspopup]");
    var menu = item.querySelector(":scope > .nav-dropdown");
    if (!link || !menu) return;

    item.classList.remove("is-dropdown-open");
    link.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");

    var parentMenu = item.closest('[data-type="menu"]');
    if (parentMenu) {
      parentMenu.classList.remove("nav-dropdown--glued");
    }
  }

  function closeAllExcept(navBar, exceptItem) {
    navBar
      .querySelectorAll(".nav-bar__item.is-dropdown-open")
      .forEach(function (item) {
        if (item !== exceptItem) {
          closeDropdown(item);
        }
      });
  }

  function initNavBarDropdowns() {
    var navBar = document.querySelector(".nav-bar");
    if (!navBar) return;

    navBar.querySelectorAll(".nav-bar__item").forEach(function (item) {
      var link = item.querySelector(":scope > .nav-bar__link[aria-haspopup]");
      if (!link) return;

      link.addEventListener("mouseenter", function () {
        closeAllExcept(navBar, item);
      });
    });

    navBar.addEventListener("mouseleave", function () {
      navBar
        .querySelectorAll(".nav-bar__item.is-dropdown-open")
        .forEach(closeDropdown);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavBarDropdowns);
  } else {
    initNavBarDropdowns();
  }
})();
