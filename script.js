const weddingDate = new Date("2026-04-15T15:30:00+05:30").getTime();

function initPrelude() {
  const body = document.body;
  const prelude = document.getElementById("invitationPrelude");
  const openButton = document.getElementById("openInvitation");
  const backgroundSong = document.getElementById("backgroundSong");

  if (!body || !prelude || !openButton) {
    return;
  }

  const revealInvitation = () => {
    if (prelude.classList.contains("is-opening")) {
      return;
    }

    prelude.classList.add("is-opening");

    if (backgroundSong) {
      backgroundSong.volume = 0.45;
      backgroundSong.play().catch(() => {
        // The placeholder file may not exist yet, or playback may be blocked.
      });
    }

    window.setTimeout(() => {
      prelude.classList.add("is-hidden");
      body.classList.remove("has-prelude");
      body.classList.add("page-revealed");
    }, 1180);

    window.setTimeout(() => {
      prelude.setAttribute("aria-hidden", "true");
    }, 1900);
  };

  openButton.addEventListener("click", revealInvitation);

  document.addEventListener("keydown", (event) => {
    if (
      body.classList.contains("has-prelude") &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      revealInvitation();
    }
  });
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
    return;
  }

  const now = Date.now();
  const distance = Math.max(weddingDate - now, 0);
  const totalSeconds = Math.floor(distance / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = padNumber(days);
  hoursEl.textContent = padNumber(hours);
  minutesEl.textContent = padNumber(minutes);
  secondsEl.textContent = padNumber(seconds);

  if (distance === 0) {
    return;
  }

  const drift = 1000 - (now % 1000);
  window.setTimeout(updateCountdown, drift);
}

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");
  const galleryButtons = document.querySelectorAll(".gallery-item");

  if (!lightbox || !lightboxImage || !lightboxClose || !galleryButtons.length) {
    return;
  }

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    document.body.classList.remove("lightbox-open");
  };

  galleryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const image = button.querySelector("img");
      const fullImage = button.dataset.full;

      lightboxImage.src = fullImage || "";
      lightboxImage.alt = image ? image.alt : "Wedding gallery image";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}

function initScrollReveal() {
  const sections = document.querySelectorAll(".reveal-on-scroll");

  if (!sections.length || !("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));
}

initPrelude();
updateCountdown();
initLightbox();
initScrollReveal();
