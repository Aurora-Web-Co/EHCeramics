(() => {
  const nav = document.querySelector("#cs-navigation");

  const groupMap = new Map();
  document.querySelectorAll(".cs-gallery").forEach((container) => {
    const key = container.dataset.lightboxGroup || container;
    if (!groupMap.has(key)) groupMap.set(key, []);
    container.querySelectorAll("img").forEach((img) => groupMap.get(key).push(img));
  });
  const groups = Array.from(groupMap.values());

  if (!groups.length) return;

  let currentGroup = [];
  let currentIndex = 0;
  let virtualIndex = 1;
  let animating = false;

  const lightbox = document.createElement("div");
  lightbox.className = "cs-lightbox";
  lightbox.innerHTML = `
    <button class="cs-lightbox-close" aria-label="Close">&times;</button>
    <div class="cs-lightbox-inner">
      <div class="cs-lightbox-track">
        <div class="cs-lightbox-slides"></div>
      </div>
      <div class="cs-lightbox-controls">
        <button class="cs-lightbox-prev" aria-label="Previous">&#8592;</button>
        <button class="cs-lightbox-next" aria-label="Next">&#8594;</button>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const slidesEl = lightbox.querySelector(".cs-lightbox-slides");
  const prevBtn = lightbox.querySelector(".cs-lightbox-prev");
  const nextBtn = lightbox.querySelector(".cs-lightbox-next");

  const jump = (vi) => {
    slidesEl.style.transition = "none";
    slidesEl.style.transform = `translateX(-${vi * 100}%)`;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        slidesEl.style.transition = "";
      }),
    );
  };

  const navigate = (dir) => {
    if (animating) return;
    const n = currentGroup.length;
    if (n === 1) return;
    animating = true;
    virtualIndex += dir;
    slidesEl.style.transform = `translateX(-${virtualIndex * 100}%)`;
    currentIndex = (((virtualIndex - 1) % n) + n) % n;

    setTimeout(() => {
      if (virtualIndex <= 0) {
        virtualIndex = n;
        jump(virtualIndex);
      } else if (virtualIndex >= n + 1) {
        virtualIndex = 1;
        jump(virtualIndex);
      }
      animating = false;
    }, 350);
  };

  const openLightbox = (group, index) => {
    currentGroup = group;
    currentIndex = index;
    const n = group.length;
    const imgs = n > 1 ? [group[n - 1], ...group, group[0]] : group;
    slidesEl.innerHTML = imgs
      .map((img) => `<img src="${img.src}" alt="${img.alt || ""}" />`)
      .join("");
    virtualIndex = n > 1 ? index + 1 : 0;
    jump(virtualIndex);
    const solo = n === 1;
    prevBtn.style.visibility = solo ? "hidden" : "visible";
    nextBtn.style.visibility = solo ? "hidden" : "visible";
    lightbox.classList.add("cs-lightbox-open");
    nav?.classList.add("cs-hidden");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("cs-lightbox-open");
    nav?.classList.remove("cs-hidden");
    document.body.style.overflow = "";
  };

  groups.forEach((group) => {
    group.forEach((img, index) => {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => openLightbox(group, index));
    });
  });

  prevBtn.addEventListener("click", () => navigate(-1));
  nextBtn.addEventListener("click", () => navigate(1));

  lightbox
    .querySelector(".cs-lightbox-close")
    .addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigate(-1);
    if (e.key === "ArrowRight") navigate(1);
  });

  let touchStartX = 0;
  lightbox.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  lightbox.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 150) return;
    navigate(diff > 0 ? 1 : -1);
  });
})();
