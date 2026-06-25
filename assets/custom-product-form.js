(function () {
  function formatLinePrice(cents) {
    var format = window.theme.currencyCodeEnabled
      ? window.theme.moneyWithCurrencyFormat
      : window.theme.moneyFormat;

    return Currency.formatMoney(cents, format);
  }

  function getQuantity(section) {
    var input = section.querySelector(".quantity-selector__value");

    if (!input) {
      return 1;
    }

    var quantity = parseInt(input.value, 10);

    return isNaN(quantity) || quantity < 1 ? 1 : quantity;
  }

  function getSelectedVariant(section) {
    var jsonElement = section.querySelector("[data-product-json]");
    var idInput = section.querySelector('[name="id"]');

    if (!jsonElement || !idInput) {
      return null;
    }

    try {
      var data = JSON.parse(jsonElement.textContent);
      var variantId = parseInt(idInput.value, 10);

      return data.product.variants.find(function (variant) {
        return variant.id === variantId;
      });
    } catch (error) {
      return null;
    }
  }

  function updateAddToCartButton(section, variant) {
    var button = section.querySelector(
      '.product-form__add-button[data-action="add-to-cart"]',
    );

    if (!button || !variant || !variant.available) {
      return;
    }

    var label = button.getAttribute("data-add-button-label") || "ADD TO CART";
    var totalCents = variant.price * getQuantity(section);
    var nextText = label + " - " + formatLinePrice(totalCents);

    if (button.textContent !== nextText) {
      button.textContent = nextText;
    }
  }

  function updateSoldOutNotifyButton(section) {
    var form = section.querySelector(".product-form");
    var addButton = form && form.querySelector(".product-form__add-button");
    var notifyButton =
      form && form.querySelector(".email-me-button, .email-me-inlineButton");

    if (!form || !addButton) {
      return;
    }

    if (addButton.disabled) {
      form.classList.add("product-form--sold-out");
    } else {
      form.classList.remove("product-form--sold-out");
    }

    if (!addButton.disabled) {
      return;
    }

    if (notifyButton) {
      var notifyText = "NOTIFY ME WHEN AVAILABLE";

      if (notifyButton.textContent.trim() !== notifyText) {
        notifyButton.textContent = notifyText;
      }
    }
  }

  function syncProductFormState(section) {
    var form = section.querySelector(".product-form");
    var variant = getSelectedVariant(section);
    var addButton = form && form.querySelector(".product-form__add-button");
    var isSoldOut = addButton && addButton.disabled;

    if (form) {
      form.classList.toggle("product-form--sold-out", !!isSoldOut);
    }

    if (variant && variant.available) {
      updateAddToCartButton(section, variant);
    } else {
      updateSoldOutNotifyButton(section);
    }
  }

  function bindProductForm(section) {
    var form = section.querySelector(".product-form");

    if (!form || !form.querySelector(".product-form__info-item--quantity")) {
      return;
    }

    section.addEventListener("variant:changed", function () {
      window.requestAnimationFrame(function () {
        syncProductFormState(section);
      });
    });

    var addButton = form.querySelector(".product-form__add-button");
    var paymentContainer = form.querySelector(
      ".product-form__payment-container",
    );

    if (addButton) {
      var buttonObserver = new MutationObserver(function () {
        syncProductFormState(section);
      });

      buttonObserver.observe(addButton, {
        attributes: true,
        attributeFilter: ["disabled", "class"],
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    if (paymentContainer) {
      var paymentObserver = new MutationObserver(function () {
        syncProductFormState(section);
      });

      paymentObserver.observe(paymentContainer, {
        childList: true,
        subtree: true,
      });
    }

    var quantityInput = form.querySelector(".quantity-selector__value");

    if (quantityInput) {
      quantityInput.addEventListener("change", function () {
        syncProductFormState(section);
      });

      quantityInput.addEventListener("input", function () {
        syncProductFormState(section);
      });
    }

    form.addEventListener("click", function (event) {
      var target = event.target.closest(
        '[data-action="decrease-picker-quantity"], [data-action="increase-picker-quantity"]',
      );

      if (!target) {
        return;
      }

      window.requestAnimationFrame(function () {
        syncProductFormState(section);
      });
    });

    syncProductFormState(section);
  }

  function init(root) {
    var context = root || document;

    context
      .querySelectorAll('[data-section-type="product"]')
      .forEach(bindProductForm);
  }

  document.addEventListener("DOMContentLoaded", function () {
    init(document);
  });

  document.addEventListener("shopify:section:load", function (event) {
    init(event.target);
  });
})();
