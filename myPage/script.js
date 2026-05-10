const filterButtons = document.querySelectorAll(".filter");
const articleCards = document.querySelectorAll(".article-card");
const copyButtons = document.querySelectorAll(".copy-button");
const audio = document.querySelector(".bg-audio");
const playToggle = document.querySelector(".play-toggle");
const volumeToggle = document.querySelector(".volume-toggle");
const restartButton = document.querySelector(".restart-button");
const volumeSlider = document.querySelector(".volume-slider");
const musicPlayer = document.querySelector(".music-player");
const resourceList = document.querySelector(".resource-list");
const showMoreResources = document.querySelector(".show-more-resources");
const maxVolume = 0.75;

const updateMapParallax = () => {
  document.body.style.setProperty("--map-shift", `${window.scrollY}px`);
};

window.addEventListener("scroll", updateMapParallax, { passive: true });
updateMapParallax();

const revealCards = () => {
  articleCards.forEach((card) => card.classList.add("is-visible"));
};

if ("IntersectionObserver" in window) {
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        cardObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  articleCards.forEach((card) => cardObserver.observe(card));
} else {
  revealCards();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    articleCards.forEach((card) => {
      const shouldShow =
        selectedCategory === "all" || card.dataset.category === selectedCategory;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const originalText = button.textContent;

    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = "已复制";
    } catch {
      button.textContent = "复制失败";
    }

    setTimeout(() => {
      button.textContent = originalText;
    }, 1600);
  });
});

if (resourceList && showMoreResources) {
  showMoreResources.addEventListener("click", () => {
    const isExpanded = resourceList.classList.toggle("is-expanded");
    showMoreResources.textContent = isExpanded ? "收起" : "查看更多";
  });
}

const setPlayIcon = () => {
  if (!audio || !playToggle) return;

  playToggle.innerHTML = audio.paused
    ? '<i class="bi bi-play-fill" aria-hidden="true"></i>'
    : '<i class="bi bi-pause-fill" aria-hidden="true"></i>';
  playToggle.setAttribute("aria-label", audio.paused ? "播放音乐" : "暂停音乐");
  musicPlayer?.classList.toggle("is-playing", !audio.paused);
};

const setVolumeIcon = () => {
  if (!audio || !volumeToggle) return;

  volumeToggle.innerHTML = audio.muted
    ? '<i class="bi bi-volume-mute-fill" aria-hidden="true"></i>'
    : '<i class="bi bi-volume-up-fill" aria-hidden="true"></i>';
  volumeToggle.setAttribute("aria-label", audio.muted ? "取消静音" : "静音");
};

if (audio && playToggle && volumeToggle && restartButton && volumeSlider) {
  audio.volume = Number(volumeSlider.value) / 100;

  const autoplay = audio.play();
  if (autoplay) {
    autoplay.catch(() => {
      setPlayIcon();
    });
  }

  playToggle.addEventListener("click", async () => {
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }

    setPlayIcon();
  });

  restartButton.addEventListener("click", async () => {
    audio.currentTime = 0;

    if (audio.paused) {
      await audio.play();
    }

    setPlayIcon();
  });

  volumeToggle.addEventListener("click", () => {
    audio.muted = !audio.muted;
    setVolumeIcon();
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = Math.min(Number(volumeSlider.value) / 100, maxVolume);

    if (audio.volume > 0 && audio.muted) {
      audio.muted = false;
    }

    setVolumeIcon();
  });

  audio.addEventListener("play", setPlayIcon);
  audio.addEventListener("pause", setPlayIcon);
  setPlayIcon();
  setVolumeIcon();
}
