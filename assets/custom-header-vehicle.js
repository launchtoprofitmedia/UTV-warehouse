(function () {
  var VEHICLE_DATA = {
    UTV: {
      makes: {
        "Can-Am": {
          years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
          models: ["Maverick X3", "Defender", "Commander", "Maverick Trail"],
        },
        Polaris: {
          years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
          models: [
            "RZR Pro XP",
            "RZR XP 1000",
            "Ranger 1000",
            "General XP 1000",
          ],
        },
        Kawasaki: {
          years: [2024, 2023, 2022, 2021, 2020],
          models: ["Teryx KRX 1000", "Teryx4 S", "Mule Pro-FXT"],
        },
        Honda: {
          years: [2024, 2023, 2022, 2021, 2020, 2019],
          models: ["Pioneer 1000", "Pioneer 700", "Talon 1000R"],
        },
        Yamaha: {
          years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
          models: ["RMAX4 1000", "RMAX2 1000", "Wolverine X4"],
        },
      },
    },
    ATV: {
      makes: {
        "Can-Am": {
          years: [2024, 2023, 2022, 2021, 2020, 2019],
          models: ["Outlander 850", "Renegade 1000R", "DS 90"],
        },
        Polaris: {
          years: [2024, 2023, 2022, 2021, 2020, 2019],
          models: ["Sportsman 850", "Scrambler 850", "Outlaw 110 EFI"],
        },
        Honda: {
          years: [2024, 2023, 2022, 2021, 2020, 2019],
          models: ["FourTrax Foreman", "FourTrax Rancher", "TRX250X"],
        },
        Yamaha: {
          years: [2024, 2023, 2022, 2021, 2020],
          models: ["Grizzly 700", "Kodiak 700", "Raptor 700R"],
        },
      },
    },
    "Dirt Bike": {
      makes: {
        Honda: {
          years: [2024, 2023, 2022, 2021, 2020, 2019],
          models: ["CRF450R", "CRF250R", "CRF125F", "CRF50F"],
        },
        Yamaha: {
          years: [2024, 2023, 2022, 2021, 2020, 2019],
          models: ["YZ450F", "YZ250F", "WR450F", "TTR-230"],
        },
        KTM: {
          years: [2024, 2023, 2022, 2021, 2020, 2019],
          models: ["450 SX-F", "350 SX-F", "250 SX", "125 SX"],
        },
        Kawasaki: {
          years: [2024, 2023, 2022, 2021, 2020],
          models: ["KX450", "KX250", "KLX300R", "KLX110R"],
        },
        Suzuki: {
          years: [2023, 2022, 2021, 2020, 2019],
          models: ["RM-Z450", "RM-Z250", "DR-Z400S"],
        },
      },
    },
    Street: {
      makes: {
        Honda: {
          years: [2024, 2023, 2022, 2021, 2020, 2019],
          models: ["CBR600RR", "CBR1000RR-R", "CB500F", "Africa Twin"],
        },
        Yamaha: {
          years: [2024, 2023, 2022, 2021, 2020],
          models: ["YZF-R6", "YZF-R1", "MT-07", "MT-09"],
        },
        Kawasaki: {
          years: [2024, 2023, 2022, 2021, 2020],
          models: ["Ninja ZX-6R", "Ninja ZX-10R", "Z900", "Versys 650"],
        },
        Suzuki: {
          years: [2024, 2023, 2022, 2021, 2020],
          models: ["GSX-R750", "GSX-R1000", "V-Strom 1050"],
        },
      },
    },
  };

  function resetSelect(select, placeholder) {
    select.innerHTML = '<option value="">' + placeholder + "</option>";
    select.disabled = true;
    select.value = "";
  }

  function populateSelect(select, items, placeholder) {
    select.innerHTML = '<option value="">' + placeholder + "</option>";
    items.forEach(function (item) {
      var option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      select.appendChild(option);
    });
    select.disabled = false;
  }

  var MOBILE_BREAKPOINT = 1000;

  function positionPanel(root, panel) {
    if (!panel) {
      return;
    }

    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      var desktopTrigger = root.querySelector(
        ".header__vehicle-select-trigger--desktop",
      );
      if (!desktopTrigger) {
        return;
      }

      var headerRect = root.getBoundingClientRect();
      var triggerRect = desktopTrigger.getBoundingClientRect();
      panel.style.left = triggerRect.left - headerRect.left + "px";
      panel.style.right = "auto";
      panel.style.width = "300px";
      return;
    }

    panel.style.left = "0";
    panel.style.right = "0";
    panel.style.width = "100%";
  }

  function resetPanelPosition(panel) {
    if (!panel) {
      return;
    }

    panel.style.left = "";
    panel.style.right = "";
    panel.style.width = "";
  }

  function closePanel(root) {
    var triggers = root.querySelectorAll("[data-custom-vehicle-trigger]");
    var panel = root.querySelector("[data-custom-vehicle-panel]");

    root.classList.remove("is-open");
    triggers.forEach(function (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    });
    panel.setAttribute("aria-hidden", "true");
    resetPanelPosition(panel);
  }

  function openPanel(root) {
    document
      .querySelectorAll("header[data-custom-vehicle-select].is-open")
      .forEach(function (other) {
        if (other !== root) {
          closePanel(other);
        }
      });

    var triggers = root.querySelectorAll("[data-custom-vehicle-trigger]");
    var panel = root.querySelector("[data-custom-vehicle-panel]");

    root.classList.add("is-open");
    triggers.forEach(function (trigger) {
      trigger.setAttribute("aria-expanded", "true");
    });
    panel.setAttribute("aria-hidden", "false");
    positionPanel(root, panel);
  }

  function initVehicleSelect(root) {
    var triggers = root.querySelectorAll("[data-custom-vehicle-trigger]");
    var panel = root.querySelector("[data-custom-vehicle-panel]");
    var typeSelect = root.querySelector("[data-vehicle-type]");
    var yearSelect = root.querySelector("[data-vehicle-year]");
    var makeSelect = root.querySelector("[data-vehicle-make]");
    var modelSelect = root.querySelector("[data-vehicle-model]");
    var submitButton = root.querySelector("[data-vehicle-submit]");
    var fallbackUrl =
      root.getAttribute("data-fallback-url") || "/collections/all";

    if (!triggers.length || !panel || !typeSelect) {
      return;
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.stopPropagation();

        if (root.classList.contains("is-open")) {
          closePanel(root);
        } else {
          openPanel(root);
        }
      });
    });

    panel.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    typeSelect.addEventListener("change", function () {
      var type = this.value;

      resetSelect(yearSelect, yearSelect.options[0].textContent);
      resetSelect(makeSelect, makeSelect.options[0].textContent);
      resetSelect(modelSelect, modelSelect.options[0].textContent);

      if (!type || !VEHICLE_DATA[type]) {
        return;
      }

      var makes = Object.keys(VEHICLE_DATA[type].makes).sort();
      populateSelect(makeSelect, makes, makeSelect.options[0].textContent);

      var allYears = new Set();
      Object.values(VEHICLE_DATA[type].makes).forEach(function (entry) {
        entry.years.forEach(function (year) {
          allYears.add(year);
        });
      });

      var sortedYears = Array.from(allYears).sort(function (a, b) {
        return b - a;
      });
      populateSelect(
        yearSelect,
        sortedYears,
        yearSelect.options[0].textContent,
      );
    });

    makeSelect.addEventListener("change", function () {
      var type = typeSelect.value;
      var make = this.value;

      resetSelect(modelSelect, modelSelect.options[0].textContent);

      if (!type || !make) {
        return;
      }

      var makeData = VEHICLE_DATA[type] && VEHICLE_DATA[type].makes[make];
      if (!makeData) {
        return;
      }

      populateSelect(
        modelSelect,
        makeData.models.slice().sort(),
        modelSelect.options[0].textContent,
      );
    });

    submitButton.addEventListener("click", function () {
      var parts = [
        typeSelect.value,
        yearSelect.value,
        makeSelect.value,
        modelSelect.value,
      ].filter(Boolean);

      if (parts.length === 0) {
        window.location.href = fallbackUrl;
        return;
      }

      window.location.href =
        "/search?q=" + encodeURIComponent(parts.join(" ")) + "&type=product";
    });
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("header[data-custom-vehicle-select]")) {
      return;
    }

    document
      .querySelectorAll("header[data-custom-vehicle-select].is-open")
      .forEach(closePanel);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      document
        .querySelectorAll("header[data-custom-vehicle-select].is-open")
        .forEach(closePanel);
    }
  });

  window.addEventListener("resize", function () {
    document
      .querySelectorAll("header[data-custom-vehicle-select].is-open")
      .forEach(function (root) {
        positionPanel(root, root.querySelector("[data-custom-vehicle-panel]"));
      });
  });

  document
    .querySelectorAll("header[data-custom-vehicle-select]")
    .forEach(initVehicleSelect);
})();
