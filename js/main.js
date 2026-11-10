/* =========================================================
   Ladipo News Report — interactions
   ========================================================= */

/* The documentary on YouTube. To change it, paste the new video ID here
   (for https://youtu.be/V7I5MCCqkts the ID is "V7I5MCCqkts"). */
const VIDEOS = {
  documentary: { id: "V7I5MCCqkts", title: "Beyond the Spare Parts: Environmental Challenges Around Ladipo Market, Lagos" }
};

function embedHtml(vid) {
  return `<iframe src="https://www.youtube-nocookie.com/embed/${vid.id}?autoplay=1&rel=0&playsinline=1&modestbranding=1"
    title="${vid.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

const SLIDE_SECONDS = 7;

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Date + year ---------- */
  const now = new Date();
  $("#year").textContent = now.getFullYear();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menuBtn");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));

  /* ---------- Views: home / story ---------- */
  const home = $("#home"), story = $("#story"), team = $("#team"), research = $("#research"), closure = $("#closure");
  const PAGES = ["team", "research", "closure"];
  function show(view, jump) {
    const isStory = view === "story";
    home.hidden = view !== "home";
    story.hidden = !isStory;
    team.hidden = view !== "team";
    research.hidden = view !== "research";
    closure.hidden = view !== "closure";
    resetPlayers();
    schedule();
    $$(".nav a").forEach(a => a.classList.toggle("on", isStory ? a.getAttribute("href") === "#story" && !a.dataset.jump : (view === "home" && a.hasAttribute("data-home")) || (PAGES.includes(view) && a.getAttribute("href") === "#" + view)));
    setMenu(false);
    requestAnimationFrame(() => {
      const target = jump && document.getElementById(jump);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      else window.scrollTo(0, 0);
      onScroll();
    });
  }
  function route() { show(location.hash === "#story" ? "story" : PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home"); }

  document.addEventListener("click", e => {
    const a = e.target.closest("a");
    if (!a || a.hasAttribute("data-video")) return;
    const href = a.getAttribute("href");
    if (a.hasAttribute("data-home") || href === "#") {
      e.preventDefault();
      if (location.hash) history.pushState(null, "", location.pathname + location.search);
      show("home");
    } else if (href === "#story") {
      e.preventDefault();
      if (location.hash !== "#story") history.pushState(null, "", "#story");
      show("story", a.dataset.jump);
    } else if (PAGES.includes((href || "").slice(1))) {
      e.preventDefault();
      if (location.hash !== href) history.pushState(null, "", href);
      show(href.slice(1));
    }
  });
  addEventListener("popstate", route);
  addEventListener("hashchange", route);

  /* ---------- Team search ---------- */
  const find = $("#teamFind"), members = $$(".member"), count = $("#teamCount");
  find.addEventListener("input", () => {
    const q = find.value.trim().toLowerCase();
    let n = 0;
    members.forEach(m => { const hit = !q || m.dataset.search.includes(q); m.hidden = !hit; if (hit) n++; });
    count.textContent = q ? `${n} of ${members.length}` : `${members.length} members`;
    $("#teamEmpty").hidden = n > 0;
  });

  /* ---------- Reading progress + TOC ---------- */
  const bar = $("#progress");
  const secIds = ["intro", "waste", "history", "aranotu", "next", "beyond", "sources"];
  function onScroll() {
    if (story.hidden) { bar.style.width = "0"; return; }
    const total = story.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, (scrollY - story.offsetTop) / Math.max(1, total)));
    bar.style.width = p * 100 + "%";
    let cur = null;
    secIds.forEach(id => { const el = document.getElementById(id); if (el.getBoundingClientRect().top < innerHeight * .35) cur = id; });
    $$(".toc a").forEach(a => a.classList.toggle("on", a.dataset.jump === cur));
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Carousel ---------- */
  const carousel = $("#carousel"), track = $("#track");
  const slides = $$(".slide", track);
  const index = $("#cIndex");
  const thumbs = $$("#cThumbs button");
  let i = 0, timer = null, paused = false, onScreen = true;
  // only advance while the carousel is on screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; schedule(); }, { threshold: 0.3 }).observe(carousel);
  }

  slides.forEach((s, n) => {
    const li = document.createElement("li");
    li.innerHTML = `<button aria-label="Go to slide ${n + 1}">${n + 1}<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22"/></svg></button>`;
    index.appendChild(li);
  });
  const dots = $$("button", index);
  carousel.style.setProperty("--dur", SLIDE_SECONDS + "s");

  function go(n) {
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-i * 100}%)`;
    slides.forEach((s, k) => { s.classList.toggle("active", k === i); s.setAttribute("aria-hidden", k !== i); s.inert = k !== i; });
    [...dots, ...thumbs].forEach((d, k) => d.setAttribute("aria-current", k % slides.length === i));
    // restart the ring animation
    dots.forEach(d => { const c = d.querySelector("circle"); c.style.animation = "none"; c.offsetWidth; c.style.animation = ""; });
    const list = $("#cThumbs"), li = thumbs[i] && thumbs[i].parentElement;
    if (li && list.scrollWidth > list.clientWidth) {
      const left = list.scrollLeft + li.getBoundingClientRect().left - list.getBoundingClientRect().left;
      list.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
    }
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (!paused && onScreen && !reduceMotion && !home.hidden) timer = setTimeout(() => go(i + 1), SLIDE_SECONDS * 1000);
  }
  function pause(p) { paused = p; carousel.classList.toggle("paused", p); schedule(); }

  $("#cPrev").addEventListener("click", () => go(i - 1));
  $("#cNext").addEventListener("click", () => go(i + 1));
  dots.forEach((d, n) => d.addEventListener("click", () => go(n)));
  thumbs.forEach((t, n) => t.addEventListener("click", () => go(n)));
  // pause on mouse hover or keyboard focus (not on touch, which never "leaves")
  carousel.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") pause(true); });
  carousel.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") pause(false); });
  carousel.addEventListener("focusin", e => { if (e.target.matches(":focus-visible")) pause(true); });
  carousel.addEventListener("focusout", () => { if (paused) pause(false); });
  document.addEventListener("visibilitychange", () => pause(document.hidden));
  addEventListener("keydown", e => {
    if (home.hidden || !$("#lb").hidden) return;
    if (!carousel.contains(document.activeElement)) return;
    if (e.key === "ArrowLeft") go(i - 1);
    if (e.key === "ArrowRight") go(i + 1);
  });

  // swipe
  let x0 = null, dx = 0;
  carousel.addEventListener("pointerdown", e => { if (e.pointerType === "mouse") return; x0 = e.clientX; dx = 0; track.style.transition = "none"; });
  carousel.addEventListener("pointermove", e => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    track.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`;
  });
  const end = () => {
    if (x0 === null) return;
    track.style.transition = "";
    x0 = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1); else go(i);
  };
  carousel.addEventListener("pointerup", end);
  carousel.addEventListener("pointercancel", end);

  go(0);

  /* ---------- On-page video players ---------- */
  const players = $$(".player").map(p => ({ el: p, cover: p.innerHTML }));
  function resetPlayers() {
    players.forEach(p => { if (!p.el.querySelector(".player-cover")) p.el.innerHTML = p.cover; });
  }

  /* ---------- Lightbox: photos + videos ---------- */
  const lb = $("#lb"), stage = $("#lbStage"), cap = $("#lbCap");
  let lastFocus = null;
  function openLb(html, caption) {
    lastFocus = document.activeElement;
    stage.innerHTML = html;
    cap.textContent = caption || "";
    lb.hidden = false;
    pause(true);
    $("#lbClose").focus();
  }
  function closeLb() {
    lb.hidden = true;
    stage.innerHTML = "";
    pause(false);
    lastFocus && lastFocus.focus();
  }
  $("#lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !lb.hidden) closeLb(); });

  document.addEventListener("click", e => {
    const v = e.target.closest("[data-video]");
    if (v) {
      e.preventDefault();
      const vid = VIDEOS[v.dataset.video] || VIDEOS.documentary;
      const box = v.dataset.target && document.getElementById(v.dataset.target);
      resetPlayers();
      if (box) {
        box.innerHTML = embedHtml(vid);
      } else {
        openLb(embedHtml(vid), vid.title);
      }
      return;
    }
    const p = e.target.closest("[data-photo]");
    if (p) {
      const fig = p.closest("figure");
      openLb(`<div class="ph lb-photo">${p.innerHTML}</div>`, p.dataset.cap || (fig ? fig.querySelector("figcaption").textContent : ""));
    }
  });

  route();
})();
