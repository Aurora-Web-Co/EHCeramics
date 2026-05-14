(() => {
  const hamburger = document.querySelector("#cs-hamburger");
  if (!hamburger) return;

  const toggle = hamburger.querySelector(".cs-menu-toggle");
  const menu = hamburger.querySelector(".cs-mobile-menu");

  const closeMenu = () => {
    menu.classList.remove("cs-open");
    toggle.classList.remove("cs-active");
    toggle.setAttribute("aria-expanded", "false");
  };

  const onScroll = () => {
    const wasVisible = hamburger.classList.contains("cs-visible");
    const scrolled = wasVisible ? window.scrollY > 100 : window.scrollY > 200;

    if (scrolled && !wasVisible) {
      hamburger.classList.add("cs-visible");
      hamburger.removeAttribute("aria-hidden");
    } else if (!scrolled && wasVisible) {
      hamburger.classList.remove("cs-visible");
      hamburger.setAttribute("aria-hidden", "true");
      closeMenu();
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("cs-open");
    toggle.classList.toggle("cs-active", open);
    toggle.setAttribute("aria-expanded", open);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
})();
