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
  // DOM
  const grid = document.querySelector(".cards-grid");
  const resultsCount = document.getElementById("resultsCount");
  const loadMoreBtn = document.querySelector(".load");
  const clearBtn = document.getElementById("clearBtn");

  const brandSelect = document.getElementById("brandSelect");
  const modelSelect = document.getElementById("modelSelect");
  const yearSelect  = document.getElementById("yearSelect");
  const priceSelect = document.getElementById("priceSelect");

  if (!grid) return;

  const ALL_CARDS = Array.from(grid.querySelectorAll(':scope > [class*="col-"]'));
  const PAGE_SIZE = 9; // or 6 if you prefer
  let visibleCount = PAGE_SIZE;

  const toInt = (v, d = 0) => (Number.isNaN(parseInt(v,10)) ? d : parseInt(v,10));
  function priceBucketToRange(bucket) {
    switch (bucket) {
      case "under15": return [0, 1500000];
      case "15-25":   return [1500000, 2500000];
      case "25-35":   return [2500000, 3500000];
      case "35-50":   return [3500000, 5000000];
      default:        return [0, Number.MAX_SAFE_INTEGER];
    }
  }

  // Build model/year lists from current brand
  function resetSelect(sel, placeholder) {
    if (!sel) return;
    sel.innerHTML = "";
    const o = document.createElement("option");
    o.value = ""; o.hidden = true; o.selected = true; o.textContent = placeholder;
    sel.appendChild(o);
  }
  function appendOption(sel, value, label) {
    const o = document.createElement("option"); o.value = value; o.textContent = label; sel.appendChild(o);
  }
  function populateModelYear() {
    const b = brandSelect?.value || "";
    const scope = b ? ALL_CARDS.filter(c => (c.dataset.brand||"").toLowerCase() === b.toLowerCase()) : ALL_CARDS;
    const models = [...new Set(scope.map(c => c.dataset.model).filter(Boolean))].sort();
    const years  = [...new Set(scope.map(c => c.dataset.year).filter(Boolean))].sort((a,b)=>b-a);

    resetSelect(modelSelect, "Model");
    models.forEach(m => appendOption(modelSelect, m, m));
    resetSelect(yearSelect, "Year");
    years.forEach(y => appendOption(yearSelect, y, y));
  }

  // Read aside (checkbox/radio) selections
  function readAsideFilters() {
    const filters = {}; // key -> Set(values)
    document.querySelectorAll('.mk-filter-card input[type="checkbox"], .mk-filter-card input[type="radio"]').forEach(inp => {
      const key = inp.getAttribute("data-key");
      if (!key) return;
      if (!filters[key]) filters[key] = new Set();
      if (inp.type === "radio") {
        if (inp.checked) filters[key] = new Set([inp.value]);
      } else {
        if (inp.checked) filters[key].add(inp.value);
      }
    });
    return filters;
  }

  // Read top selects
  function readTopSelects() {
    return {
      brand: brandSelect?.value || "",
      model: modelSelect?.value || "",
      year:  yearSelect?.value  || "",
      priceBucket: priceSelect?.value || ""
    };
  }

  // Check if a card matches current filters
  function cardMatches(card, top, aside) {
    // top selects (AND)
    if (top.brand && (card.dataset.brand||"").toLowerCase() !== top.brand.toLowerCase()) return false;
    if (top.model && (card.dataset.model||"") !== top.model) return false;
    if (top.year  && String(card.dataset.year||"") !== String(top.year)) return false;
    if (top.priceBucket) {
      const [minP, maxP] = priceBucketToRange(top.priceBucket);
      const price = toInt(card.dataset.price, 0);
      if (price < minP || price > maxP) return false;
    }

    // aside filters: OR within the same key, AND across different keys
    for (const [key, set] of Object.entries(aside)) {
      if (set.size === 0) continue; // nothing chosen for this key
      const val = (card.dataset[key] || "").toString();
      if (!val) return false;

      if (key === "features") {
        const feats = val.split(",").map(s => s.trim());
        let ok = false;
        for (const want of set) if (feats.includes(want)) { ok = true; break; }
        if (!ok) return false;
      } else {
        if (!set.has(val)) return false;
      }
    }
    return true;
  }

  function updateCount(total, visible) {
    if (!resultsCount) return;
    const showing = Math.min(visible, total);
    resultsCount.textContent = `Showing ${showing} of ${total}`;
  }

  function renderCurrent() {
    const top = readTopSelects();
    const aside = readAsideFilters();

    // hide/show based on filters
    const included = [];
    ALL_CARDS.forEach(c => {
      const ok = cardMatches(c, top, aside);
      c.style.display = ok ? "" : "none";
      if (ok) included.push(c);
    });

    // pagination on included
    visibleCount = Math.min(PAGE_SIZE, included.length);
    included.forEach((c, i) => c.style.display = (i < visibleCount) ? "" : "none");

    // load-more button + count
    if (loadMoreBtn) loadMoreBtn.style.display = (visibleCount >= included.length) ? "none" : "";
    updateCount(included.length, visibleCount);
  }

  // Events
  brandSelect && brandSelect.addEventListener("change", () => {
    populateModelYear();
    if (modelSelect) modelSelect.value = "";
    if (yearSelect)  yearSelect.value  = "";
    renderCurrent();
  });
  modelSelect && modelSelect.addEventListener("change", renderCurrent);
  yearSelect  && yearSelect.addEventListener("change", renderCurrent);
  priceSelect && priceSelect.addEventListener("change", renderCurrent);

  const aside = document.querySelector(".mk-filter-card");
  if (aside) {
    aside.addEventListener("change", (e) => {
      const t = e.target;
      if (t && (t.matches('input[type="checkbox"]') || t.matches('input[type="radio"]'))) {
        renderCurrent();
      }
    });
  }

  loadMoreBtn && loadMoreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const top = readTopSelects();
    const aside = readAsideFilters();
    const included = ALL_CARDS.filter(c => cardMatches(c, top, aside));
    const currentlyVisible = included.filter((c, i) => c.style.display !== "none").length;
    visibleCount = Math.min(currentlyVisible + PAGE_SIZE, included.length);
    included.forEach((c, i) => c.style.display = (i < visibleCount) ? "" : "none");
    if (loadMoreBtn) loadMoreBtn.style.display = (visibleCount >= included.length) ? "none" : "";
    updateCount(included.length, visibleCount);
  });

  clearBtn && clearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // top selects
    if (brandSelect) brandSelect.value = "";
    if (modelSelect) resetSelect(modelSelect, "Model");
    if (yearSelect)  resetSelect(yearSelect, "Year");
    if (priceSelect) priceSelect.value = "";
    populateModelYear();

    // aside
    document.querySelectorAll('.mk-filter-card input[type="checkbox"], .mk-filter-card input[type="radio"]').forEach(i => i.checked = false);

    // show first PAGE_SIZE by default
    ALL_CARDS.forEach((c, i) => c.style.display = (i < PAGE_SIZE) ? "" : "none");
    visibleCount = PAGE_SIZE;
    if (loadMoreBtn) loadMoreBtn.style.display = (ALL_CARDS.length > PAGE_SIZE) ? "" : "none";
    updateCount(ALL_CARDS.length, visibleCount);
  });

  // Initial
  populateModelYear();
  ALL_CARDS.forEach((c, i) => c.style.display = (i < PAGE_SIZE) ? "" : "none");
  if (loadMoreBtn) loadMoreBtn.style.display = (ALL_CARDS.length > PAGE_SIZE) ? "" : "none";
  updateCount(ALL_CARDS.length, PAGE_SIZE);
});
