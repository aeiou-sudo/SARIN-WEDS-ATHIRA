const weddingDate = new Date("2026-04-15T15:30:00+05:30").getTime();
const AUDIO_START_VOLUME = 0.05;
const AUDIO_TARGET_VOLUME = 0.32;
const AUDIO_FADE_IN_MS = 6000;
const AUDIO_PLAY_WINDOW_MS = 45000;
const AUDIO_FADE_OUT_MS = 7000;

function initPrelude() {
  const body = document.body;
  const prelude = document.getElementById("invitationPrelude");
  const openButton = document.getElementById("openInvitation");
  const backgroundSong = document.getElementById("backgroundSong");
  const musicToggle = document.getElementById("musicToggle");

  if (!body || !prelude || !openButton) {
    return;
  }

  let fadeInIntervalId = null;
  let fadeOutIntervalId = null;
  let fadeOutTimeoutId = null;
  let stopTimeoutId = null;

  const clearAudioTimers = () => {
    if (fadeInIntervalId) {
      window.clearInterval(fadeInIntervalId);
      fadeInIntervalId = null;
    }

    if (fadeOutIntervalId) {
      window.clearInterval(fadeOutIntervalId);
      fadeOutIntervalId = null;
    }

    if (fadeOutTimeoutId) {
      window.clearTimeout(fadeOutTimeoutId);
      fadeOutTimeoutId = null;
    }

    if (stopTimeoutId) {
      window.clearTimeout(stopTimeoutId);
      stopTimeoutId = null;
    }
  };

  const fadeVolume = (targetVolume, duration, onComplete) => {
    if (!backgroundSong) {
      return;
    }

    if (duration <= 0) {
      backgroundSong.volume = targetVolume;
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const startVolume = backgroundSong.volume;
    const startTime = Date.now();
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      backgroundSong.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress >= 1) {
        window.clearInterval(intervalId);

        if (fadeInIntervalId === intervalId) {
          fadeInIntervalId = null;
        }

        if (fadeOutIntervalId === intervalId) {
          fadeOutIntervalId = null;
        }

        if (onComplete) {
          onComplete();
        }
      }
    }, 120);

    return intervalId;
  };

  const scheduleSongEnding = () => {
    if (!backgroundSong) {
      return;
    }

    fadeOutTimeoutId = window.setTimeout(() => {
      fadeOutIntervalId = fadeVolume(0, AUDIO_FADE_OUT_MS, () => {
        backgroundSong.pause();
        backgroundSong.currentTime = 0;
      });
    }, AUDIO_PLAY_WINDOW_MS - AUDIO_FADE_OUT_MS);

    stopTimeoutId = window.setTimeout(() => {
      clearAudioTimers();
      backgroundSong.volume = 0;
      backgroundSong.pause();
      backgroundSong.currentTime = 0;
    }, AUDIO_PLAY_WINDOW_MS);
  };

  const setMusicMuted = (muted) => {
    if (!backgroundSong || !musicToggle) {
      return;
    }

    backgroundSong.muted = muted;
    musicToggle.setAttribute("aria-label", muted ? "Unmute music" : "Mute music");
    musicToggle.setAttribute("title", muted ? "Unmute music" : "Mute music");
    musicToggle.setAttribute("aria-pressed", String(!muted));
    body.classList.toggle("music-muted", muted);
  };

  const playBackgroundSong = () => {
    if (!backgroundSong) {
      return;
    }

    clearAudioTimers();
    backgroundSong.currentTime = 0;
    backgroundSong.volume = AUDIO_START_VOLUME;

    if (!backgroundSong.muted) {
      backgroundSong.play().catch(() => {
        // The placeholder file may not exist yet, or playback may be blocked.
        clearAudioTimers();
      });

      fadeInIntervalId = fadeVolume(AUDIO_TARGET_VOLUME, AUDIO_FADE_IN_MS);
      scheduleSongEnding();
    }
  };

  const stopBackgroundSong = () => {
    if (!backgroundSong) {
      return;
    }

    clearAudioTimers();
    fadeOutIntervalId = fadeVolume(0, 350, () => {
      backgroundSong.pause();
      backgroundSong.currentTime = 0;
      backgroundSong.volume = AUDIO_START_VOLUME;
    });
  };

  backgroundSong?.addEventListener("ended", () => {
    clearAudioTimers();
    backgroundSong.volume = AUDIO_START_VOLUME;
  });

  setMusicMuted(false);

  if (musicToggle && backgroundSong) {
    musicToggle.addEventListener("click", () => {
      const nextMutedState = !backgroundSong.muted;
      setMusicMuted(nextMutedState);

      if (nextMutedState) {
        stopBackgroundSong();
      } else if (!body.classList.contains("has-prelude")) {
        playBackgroundSong();
      } else {
        backgroundSong.volume = AUDIO_START_VOLUME;
        backgroundSong.play().catch(() => {
          // The placeholder file may not exist yet, or playback may be blocked.
          clearAudioTimers();
        });

        fadeInIntervalId = fadeVolume(AUDIO_TARGET_VOLUME, AUDIO_FADE_IN_MS);
        scheduleSongEnding();
      }
    });
  }

  const revealInvitation = () => {
    if (prelude.classList.contains("is-opening")) {
      return;
    }

    prelude.classList.add("is-opening");
    playBackgroundSong();

    window.setTimeout(() => {
      body.classList.add("page-revealed");
    }, 360);

    window.setTimeout(() => {
      prelude.classList.add("is-hidden");
      body.classList.remove("has-prelude");
    }, 1040);

    window.setTimeout(() => {
      prelude.setAttribute("aria-hidden", "true");
    }, 1360);
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
