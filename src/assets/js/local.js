(() => {
  const makeToggle = (hiddenEl, btnEl, moreId) => {
    return () => {
      const isOpen = hiddenEl.classList.contains("cs-visible");

      if (!isOpen) {
        hiddenEl.style.height = hiddenEl.scrollHeight + "px";
        hiddenEl.classList.add("cs-visible");
        hiddenEl.addEventListener("transitionend", () => {
          hiddenEl.style.height = "auto";
        }, { once: true });
      } else {
        const collapsingHeight = hiddenEl.scrollHeight;
        const moreEl = document.querySelector(moreId);
        const btnCenter = moreEl.getBoundingClientRect().top + window.scrollY + moreEl.offsetHeight / 2;
        const targetScroll = btnCenter - collapsingHeight - window.innerHeight / 2;

        hiddenEl.style.height = hiddenEl.scrollHeight + "px";
        void hiddenEl.offsetHeight;
        hiddenEl.style.height = "0";
        hiddenEl.classList.remove("cs-visible");

        const start = window.scrollY;
        const distance = targetScroll - start;
        const duration = 700;
        const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        let startTime = null;
        const step = (now) => {
          if (startTime === null) startTime = now;
          const t = Math.min((now - startTime) / duration, 1);
          window.scrollTo({ top: start + distance * ease(t), behavior: "instant" });
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }

      if (btnEl) btnEl.textContent = isOpen ? "View more" : "View less";
    };
  };

  const message = document.getElementById("message");
  if (message) {
    let prev = "";
    let maxH;
    message.addEventListener("input", function () {
      if (maxH === undefined) maxH = parseFloat(getComputedStyle(message).maxHeight);
      message.style.height = "auto";
      if (message.scrollHeight > maxH) {
        message.value = prev;
        message.style.height = Math.min(message.scrollHeight, maxH) + "px";
      } else {
        prev = message.value;
        message.style.height = message.scrollHeight + "px";
      }
    });
  }

  const hiddenWork = document.querySelector(".hidden-work");
  const hiddenGallery = document.querySelector(".hidden-gallery");

  if (hiddenWork) {
    window.viewWork = makeToggle(hiddenWork, document.querySelector("#work-view-more a"), "#work-view-more");
  }

  if (hiddenGallery) {
    window.viewGallery = makeToggle(hiddenGallery, document.querySelector("#gallery-view-more a"), "#gallery-view-more");
  }
})();
