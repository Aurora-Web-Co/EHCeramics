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

  const form = document.getElementById("cs-form");
  if (form) {
    const button = form.querySelector('button[type="submit"]');
    const error = document.getElementById("cs-form-error");
    const success = document.getElementById("cs-form-success");

    const wrap = form.parentElement;

    // Fade the form out, then fade the thank-you message in while the
    // wrapper eases from the form's height to the message's height
    const showSuccess = async () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const startHeight = wrap.offsetHeight;

      if (!reduceMotion) {
        await form.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 400,
          easing: "ease",
          fill: "forwards",
        }).finished;
      }

      form.hidden = true;
      success.hidden = false;
      success.focus({ preventScroll: true });

      if (reduceMotion) return;

      const endHeight = wrap.offsetHeight;
      wrap.style.overflow = "hidden";
      wrap.animate([{ height: startHeight + "px" }, { height: endHeight + "px" }], {
        duration: 600,
        easing: "ease-in-out",
      }).finished.then(() => {
        wrap.style.overflow = "";
      });
      success.animate(
        [
          { opacity: 0, transform: "translateY(1rem)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 700, delay: 200, easing: "ease-out", fill: "backwards" }
      );
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      error.hidden = true;
      button.disabled = true;
      button.textContent = "Sending...";

      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (!res.ok) throw new Error(res.status);

        await showSuccess();
      } catch {
        error.hidden = false;
        button.disabled = false;
        button.textContent = "Send message";
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
