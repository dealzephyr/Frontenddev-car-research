// FOr load more 
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".cards-grid");
  const loadBtn = document.querySelector(".load");
  if (!grid || !loadBtn) return;

  const PAGE_SIZE = 9;
  const cards = Array.from(grid.querySelectorAll(':scope > [class*="col-"]'));
  let visibleCount = 0;

  function applyVisibility() {
    cards.forEach((card, idx) => {
      card.style.display = idx < visibleCount ? "" : "none";
    });
    // Hide the button if everything is shown
    loadBtn.style.display = visibleCount >= cards.length ? "none" : "";
  }

  // Initial: show first 6 (or fewer)
  visibleCount = Math.min(PAGE_SIZE, cards.length);
  applyVisibility();

  // On click: reveal 6 more
  loadBtn.addEventListener("click", (e) => {
    e.preventDefault();
    visibleCount = Math.min(visibleCount + PAGE_SIZE, cards.length);
    applyVisibility();
  });
});

//dropdown functionality
// assets/js/explore_cars.js
document.addEventListener("DOMContentLoaded", () => {
  // --- DOM refs ---
  const grid = document.querySelector(".cards-grid");
  const loadBtn = document.querySelector(".load");
  const resultsCount = document.getElementById("resultsCount");

  const brandSelect = document.getElementById("brandSelect");
  const modelSelect = document.getElementById("modelSelect");
  const yearSelect  = document.getElementById("yearSelect");
  const priceSelect = document.getElementById("priceSelect");
  const clearBtn    = document.getElementById("clearBtn");

  if (!grid) return;

  // Gather card items
  const ALL_CARDS = Array.from(grid.querySelectorAll(':scope > [class*="col-"]'));
  const PAGE_SIZE = 9;
  let visibleCount = PAGE_SIZE;

  // Helpers
  const toInt = (v, d = 0) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? d : n;
  };

  function priceBucketToRange(bucket) {
    switch (bucket) {
      case "under15": return [0, 1500000];
      case "15-25":   return [1500000, 2500000];
      case "25-35":   return [2500000, 3500000];
      case "35-50":   return [3500000, 5000000];
      default:        return [0, Number.MAX_SAFE_INTEGER];
    }
  }

  // Build model/year options dynamically based on brand selection + currently visible inventory
  function populateModelAndYearOptions() {
    // Scope by brand if chosen; look at ALL cards’ data
    const b = brandSelect?.value || "";
    const scope = b
      ? ALL_CARDS.filter(c => (c.dataset.brand || "").toLowerCase() === b.toLowerCase())
      : ALL_CARDS;

    // Collect unique models/years
    const models = [...new Set(scope.map(c => c.dataset.model).filter(Boolean))].sort();
    const years  = [...new Set(scope.map(c => toInt(c.dataset.year)).filter(Boolean))].sort((a,b)=>b-a);

    resetSelect(modelSelect, "Model");
    models.forEach(m => appendOption(modelSelect, m, m));

    resetSelect(yearSelect, "Year");
    years.forEach(y => appendOption(yearSelect, String(y), String(y)));
  }

  function resetSelect(sel, placeholder) {
    if (!sel) return;
    sel.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.hidden = true;
    opt.selected = true;
    opt.textContent = placeholder;
    sel.appendChild(opt);
  }

  function appendOption(sel, value, label) {
    if (!sel) return;
    const o = document.createElement("option");
    o.value = value;
    o.textContent = label;
    sel.appendChild(o);
  }

  // Read all sidebar filters (checkboxes/radios with data-key)
  function readAsideFilters() {
    const filters = {}; // { key: Set(values) }
    document
      .querySelectorAll('.mk-filter-card input[type="checkbox"], .mk-filter-card input[type="radio"]')
      .forEach(input => {
        const key = input.getAttribute("data-key");
        if (!key) return;                 // ignore inputs without data-key
        if (!filters[key]) filters[key] = new Set();
        if (input.type === "radio") {
          if (input.checked) {
            filters[key] = new Set([input.value]);
          }
        } else {
          if (input.checked) filters[key].add(input.value);
        }
      });
    return filters;
  }

  // Top-row selects
  function readTopSelects() {
    const brand = brandSelect?.value || "";
    const model = modelSelect?.value || "";
    const year  = yearSelect?.value  || "";
    const priceBucket = priceSelect?.value || "";
    return { brand, model, year, priceBucket };
  }

  // Core filtering logic
  function isCardIncluded(card, top, aside) {
    // Top selects
    if (top.brand) {
      if ((card.dataset.brand || "").toLowerCase() !== top.brand.toLowerCase()) return false;
    }
    if (top.model) {
      if ((card.dataset.model || "") !== top.model) return false;
    }
    if (top.year) {
      if (String(card.dataset.year || "") !== String(top.year)) return false;
    }
    if (top.priceBucket) {
      const [minP, maxP] = priceBucketToRange(top.priceBucket);
      const price = toInt(card.dataset.price, 0);
      if (price < minP || price > maxP) return false;
    }

    // Aside checkbox/radio groups (match if in the selected set; if set is empty, ignore that key)
    for (const [key, set] of Object.entries(aside)) {
      if (set.size === 0) continue; // nothing selected for this key
      const cardVal = (card.dataset[key] || "").toString();
      if (!cardVal) return false;

      // features can be comma-separated on cards
      if (key === "features") {
        const features = cardVal.split(",").map(s => s.trim());
        // require at least one selected feature to be present
        let ok = false;
        for (const want of set) {
          if (features.includes(want)) { ok = true; break; }
        }
        if (!ok) return false;
      } else {
        if (!set.has(cardVal)) return false;
      }
    }

    return true;
  }

  // Apply filters + reset pagination
  function applyFilters() {
    const top = readTopSelects();
    const aside = readAsideFilters();

    // Filter and mark which cards should be shown
    const matching = [];
    ALL_CARDS.forEach(card => {
      const include = isCardIncluded(card, top, aside);
      card.style.display = include ? "" : "none";
      if (include) matching.push(card);
    });

    // Reset pagination on the matching subset
    visibleCount = PAGE_SIZE;
    applyPagination(matching);

    // Update results count
    if (resultsCount) {
      resultsCount.textContent = `${matching.length} match${matching.length === 1 ? "" : "es"}`;
    }
  }

  // Show first N within the currently "included" set; hide the rest
  function applyPagination(includedCards) {
    includedCards.forEach((card, idx) => {
      card.style.display = idx < visibleCount ? "" : "none";
    });
    // Hide load button if all are visible or none
    if (loadBtn) {
      loadBtn.style.display = (visibleCount >= includedCards.length) ? "none" : "";
    }
  }

  // Get currently included (after filters), for load-more step
  function getIncludedCards() {
    return ALL_CARDS.filter(c => c.style.display !== "none");
  }

  // Events: Top selects
  if (brandSelect) {
    brandSelect.addEventListener("change", () => {
      // Rebuild Model/Year based on chosen brand
      populateModelAndYearOptions();
      if (modelSelect) modelSelect.value = "";
      if (yearSelect)  yearSelect.value  = "";
      applyFilters();
    });
  }
  modelSelect && modelSelect.addEventListener("change", applyFilters);
  yearSelect  && yearSelect.addEventListener("change", applyFilters);
  priceSelect && priceSelect.addEventListener("change", applyFilters);

  // Events: Aside (delegate so any input works)
  const aside = document.querySelector(".mk-filter-card");
  if (aside) {
    aside.addEventListener("change", (e) => {
      const t = e.target;
      if (t && (t.matches('input[type="checkbox"]') || t.matches('input[type="radio"]'))) {
        applyFilters();
      }
    });
  }

  // Load more
  if (loadBtn) {
    loadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const included = getIncludedCards();          // includes both shown+hidden within filter
      // Count only those already included by filters (some may be hidden by pagination)
      const totalIncluded = included.length;
      // Find how many currently visible
      const currentlyVisible = included.filter(c => c.offsetParent !== null).length;
      visibleCount = Math.min(currentlyVisible + PAGE_SIZE, totalIncluded);
      applyPagination(included);
    });
  }

  // Clear filters → reset everything to default listing
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Reset top selects
      if (brandSelect) brandSelect.value = "";
      if (priceSelect) priceSelect.value = "";
      if (modelSelect) resetSelect(modelSelect, "Model");
      if (yearSelect)  resetSelect(yearSelect, "Year");
      populateModelAndYearOptions(); // from all items

      // Reset aside inputs
      document
        .querySelectorAll('.mk-filter-card input[type="checkbox"], .mk-filter-card input[type="radio"]')
        .forEach(i => { i.checked = false; });

      // Show default listing (first 6 of ALL_CARDS)
      ALL_CARDS.forEach((card, idx) => {
        card.style.display = idx < PAGE_SIZE ? "" : "none";
      });
      visibleCount = PAGE_SIZE;

      // Count + button
      if (resultsCount) {
        resultsCount.textContent = `${ALL_CARDS.length} match${ALL_CARDS.length === 1 ? "" : "es"}`;
      }
      if (loadBtn) {
        loadBtn.style.display = (ALL_CARDS.length > PAGE_SIZE) ? "" : "none";
      }
    });
  }

  // Initial setup
  populateModelAndYearOptions();
  // Default: show only first 6 (no filters)
  ALL_CARDS.forEach((card, idx) => {
    card.style.display = idx < PAGE_SIZE ? "" : "none";
  });
  if (resultsCount) {
    resultsCount.textContent = `${ALL_CARDS.length} match${ALL_CARDS.length === 1 ? "" : "es"}`;
  }
  if (loadBtn) {
    loadBtn.style.display = (ALL_CARDS.length > PAGE_SIZE) ? "" : "none";
  }
});

