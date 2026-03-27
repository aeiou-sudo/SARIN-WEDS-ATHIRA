const weddingDate = new Date("2026-04-15T15:30:00+05:30").getTime();
const countdownElements = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

const experienceTrack = document.getElementById("experienceTrack");
const scenes = Array.from(document.querySelectorAll(".scene"));
const sceneCurrent = document.getElementById("sceneCurrent");
const sceneTotal = document.getElementById("sceneTotal");
let activeSceneIndex = 0;
let transitionLock = false;
let touchStartY = 0;
let touchDeltaY = 0;
let wheelDeltaBuffer = 0;
let wheelResetTimeout;

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = Date.now();
  const distance = Math.max(weddingDate - now, 0);

  const totalSeconds = Math.floor(distance / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownElements.days.textContent = padNumber(days);
  countdownElements.hours.textContent = padNumber(hours);
  countdownElements.minutes.textContent = padNumber(minutes);
  countdownElements.seconds.textContent = padNumber(seconds);

  if (distance === 0) {
    return;
  }

  const drift = 1000 - (now % 1000);
  window.setTimeout(updateCountdown, drift);
}

function updateProgress() {
  if (!sceneCurrent || !sceneTotal) {
    return;
  }

  sceneCurrent.textContent = padNumber(activeSceneIndex + 1);
  sceneTotal.textContent = padNumber(scenes.length);
}

function updateActiveScene() {
  scenes.forEach((scene, index) => {
    scene.classList.toggle("is-active", index === activeSceneIndex);
  });
}

function setScene(nextIndex) {
  if (
    !experienceTrack ||
    transitionLock ||
    nextIndex === activeSceneIndex ||
    nextIndex < 0 ||
    nextIndex >= scenes.length
  ) {
    return;
  }

  transitionLock = true;
  activeSceneIndex = nextIndex;
  experienceTrack.style.transform = `translate3d(0, -${activeSceneIndex * 100}vh, 0)`;
  updateActiveScene();
  updateProgress();

  window.setTimeout(() => {
    transitionLock = false;
  }, 1220);
}

function goToNextScene() {
  setScene(activeSceneIndex + 1);
}

function goToPreviousScene() {
  setScene(activeSceneIndex - 1);
}

function initSceneTransitions() {
  if (!experienceTrack) {
    return;
  }

  experienceTrack.style.transform = "translate3d(0, 0, 0)";
  updateActiveScene();
  updateProgress();

  window.addEventListener(
    "wheel",
    (event) => {
      if (document.body.classList.contains("lightbox-open")) {
        return;
      }

      event.preventDefault();

      if (transitionLock) {
        return;
      }

      const normalizedDelta = Math.sign(event.deltaY) * Math.min(Math.abs(event.deltaY), 40);
      wheelDeltaBuffer += normalizedDelta;

      window.clearTimeout(wheelResetTimeout);
      wheelResetTimeout = window.setTimeout(() => {
        wheelDeltaBuffer = 0;
      }, 140);

      if (Math.abs(wheelDeltaBuffer) < 10) {
        return;
      }

      if (wheelDeltaBuffer > 0) {
        goToNextScene();
      } else {
        goToPreviousScene();
      }

      wheelDeltaBuffer = 0;
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (document.body.classList.contains("lightbox-open")) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      goToNextScene();
    }

    if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      goToPreviousScene();
    }
  });

  window.addEventListener(
    "touchstart",
    (event) => {
      touchStartY = event.changedTouches[0].clientY;
      touchDeltaY = 0;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      touchDeltaY = event.changedTouches[0].clientY - touchStartY;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    () => {
      if (transitionLock || Math.abs(touchDeltaY) < 42) {
        return;
      }

      if (touchDeltaY < 0) {
        goToNextScene();
      } else {
        goToPreviousScene();
      }
    },
    { passive: true }
  );
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

updateCountdown();
initSceneTransitions();
initLightbox();
