(function () {
  "use strict";

  function getMenu(item) {
    return item.querySelector(":scope > .nav-dropdown, :scope > .mega-menu");
  }

  function getLink(item) {
    return item.querySelector(":scope > .nav-bar__link[aria-haspopup]");
  }

  function closeDropdown(item) {
    var link = getLink(item);
    var menu = getMenu(item);
    if (!menu) return;
    if (
      menu.getAttribute("aria-hidden") === "true" &&
      !item.classList.contains("is-dropdown-open")
    ) {
      return;
    }

    item.classList.remove("is-dropdown-open");
    if (link) {
      link.setAttribute("aria-expanded", "false");
    }
    menu.setAttribute("aria-hidden", "true");

    var parentMenu = item.closest('[data-type="menu"]');
    if (parentMenu) {
      parentMenu.classList.remove("nav-dropdown--glued");
    }
  }

  function closeAllExcept(navBar, exceptItem) {
    navBar.querySelectorAll(".nav-bar__item").forEach(function (item) {
      if (item !== exceptItem) {
        closeDropdown(item);
      }
    });
  }

  function initNavBarDropdowns() {
    var navBar = document.querySelector(".nav-bar");
    if (!navBar) return;

    navBar.querySelectorAll(".nav-bar__item").forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        closeAllExcept(navBar, item);
      });

      if (getLink(item)) {
        item.addEventListener("mouseleave", function () {
          closeDropdown(item);
        });
      }
    });

    navBar.addEventListener("mouseleave", function () {
      closeAllExcept(navBar, null);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavBarDropdowns);
  } else {
    initNavBarDropdowns();
  }
})();
