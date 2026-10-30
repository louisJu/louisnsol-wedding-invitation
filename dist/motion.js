(() => {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Content stays visible if motion is disabled or the browser lacks this feature.
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

  const flowerLayer = document.getElementById("flower-effect");
  const flowerToggle = document.getElementById("flower-toggle");
  let flowersEnabled = true;
  for (let i = 0; i < 16; i++) {
    const flower = document.createElement("span");
    flower.className = "flower-particle";
    const duration = 16 + (i % 4) * 4;
    flower.style.setProperty("--flower-x", `${(i * 37 + 9) % 100}%`);
    flower.style.setProperty("--flower-size", `${9 + (i % 5) * 2}px`);
    flower.style.setProperty("--flower-duration", `${duration}s`);
    flower.style.setProperty("--flower-delay", `${-((i * 5.3) % duration)}s`);
    flower.style.setProperty("--flower-drift", `${(i % 2 ? 1 : -1) * (15 + i * 2)}px`);
    flower.style.setProperty("--flower-spin", `${(i % 2 ? 1 : -1) * 240}deg`);
    flower.style.setProperty("--flower-opacity", `${.35 + (i % 4) * .1}`);
    flowerLayer.append(flower);
  }
  function syncFlowers() {
    const enabled = flowersEnabled && !reducedMotion.matches;
    flowerLayer.hidden = !enabled;
    flowerLayer.classList.toggle("is-paused", document.hidden);
    flowerToggle.hidden = reducedMotion.matches;
    flowerToggle.setAttribute("aria-pressed", String(enabled));
    const label = `안개꽃 효과 ${enabled ? "끄기" : "켜기"}`;
    flowerToggle.setAttribute("aria-label", label);
    flowerToggle.title = label;
  }
  flowerToggle.addEventListener("click", () => { flowersEnabled = !flowersEnabled; syncFlowers(); });
  document.addEventListener("visibilitychange", syncFlowers);
  reducedMotion.addEventListener("change", syncFlowers);
  syncFlowers();

  const hero = document.querySelector(".hero-content");
  const names = hero.querySelector(".hero-names");
  const handwriting = hero.querySelector(".hero-handwriting");
  let heroStarted = false, heroInView = false, heroFontReady = false;
  let fontTimeout;
  const heroObserver = new IntersectionObserver((entries) => {
    heroInView = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= .25);
    if (heroInView && heroFontReady) revealHero();
  }, { threshold: .25 });

  function revealHero(immediate = false) {
    if (heroStarted && !immediate) return;
    heroStarted = true;
    clearTimeout(fontTimeout);
    heroObserver.disconnect();
    hero.classList.remove("handwriting-pending");
    hero.classList.toggle("handwriting-writing", !immediate);
  }

  // Wait for the actual lettering and its first appearance, even on short screens.
  // A missing/slow font must never leave the invitation names hidden.
  hero.classList.add("handwriting-pending");
  // Observe the unclipped container so the initially hidden lettering cannot block its own reveal.
  heroObserver.observe(hero);
  fontTimeout = setTimeout(() => revealHero(true), 2000);
  if (document.fonts) {
    Promise.all([
      document.fonts.load(getComputedStyle(names).font, names.textContent),
      document.fonts.load(getComputedStyle(handwriting).font, handwriting.textContent)
    ]).then((fontGroups) => {
        clearTimeout(fontTimeout);
        if (fontGroups.some((fonts) => !fonts.length)) { revealHero(true); return; }
        heroFontReady = true;
        if (heroInView) revealHero();
      }, () => revealHero(true));
  } else revealHero(true);

  const selectors = [
    ".section > .section-eyebrow", ".intro > h2", ".invitation-copy > p", ".invitation-source", ".families",
    ".wedding-day > h2", ".date-line", ".calendar", ".countdown", ".countdown-caption",
    ".gallery > h2", ".gallery-grid > *",
    ".location > h2", ".transport-item",
    ".accounts > h2", ".accounts > .section-subtitle", ".account-group",
    ".notice > p", ".closing-title", ".closing > .signature"
  ];
  const targets = [...document.querySelectorAll(selectors.join(","))]
    .filter((element) => !element.closest("[hidden]") || element.matches(".gallery-item"));
  const pending = new Set();
  const revealThreshold = 0.12;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= revealThreshold) reveal(entry.target);
    });
  }, { threshold: revealThreshold, rootMargin: "0px 0px -64px 0px" });

  function reveal(element, immediate = false) {
    if (immediate) element.classList.add("reveal-immediate");
    if (!pending.delete(element)) return;
    element.classList.add("is-visible");
    observer.unobserve(element);
  }
  function revealAll() {
    revealHero(true);
    pending.forEach((element) => reveal(element, true));
    observer.disconnect();
  }

  // Observe collapsed photos too; they become visible only after the gallery is expanded.
  // Do not hide anything already visible, including direct links and restored scroll positions.
  const belowScreen = targets.filter((element) => element.hidden || element.getBoundingClientRect().top >= window.innerHeight);
  belowScreen.forEach((element) => {
    if (element.parentElement.id === "gallery-grid") {
      const index = [...element.parentElement.children].indexOf(element);
      const column = index % 3, row = Math.min(Math.floor(index / 3), 2);
      element.style.setProperty("--reveal-delay", `${column * 160 + row * 80}ms`);
    }
    pending.add(element);
    element.classList.add("scroll-reveal");
    observer.observe(element);
  });

  // Keyboard navigation must reveal a focused control without an animation delay.
  document.addEventListener("focusin", (event) => {
    const target = event.target.closest(".scroll-reveal");
    if (target) reveal(target, true);
  });
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) revealAll();
  });
  window.addEventListener("beforeprint", revealAll);
})();
