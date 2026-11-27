const letterIntro = document.querySelector("#letter-intro");
const introEnvelope = letterIntro?.querySelector(".intro-envelope");
const heroScene = document.querySelector(".hero-scene");

if (
    letterIntro instanceof HTMLDialogElement &&
    introEnvelope instanceof HTMLButtonElement &&
    heroScene instanceof HTMLElement
) {
    letterIntro.showModal();
    window.scrollTo({ top: 0, behavior: "instant" });

    letterIntro.addEventListener("close", () => {
        window.scrollTo({ top: 0, behavior: "instant" });
        heroScene.classList.add("is-active");
        if ("IntersectionObserver" in window) {
            const heroObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        heroScene.classList.toggle("is-active", entry.intersectionRatio >= 0.6);
                    });
                },
                { threshold: 0.6 }
            );
            heroObserver.observe(heroScene);
        }
    });

    introEnvelope.addEventListener("click", async () => {
        if (introEnvelope.disabled) {
            return;
        }

        introEnvelope.disabled = true;
        letterIntro.classList.add("is-closing");
        letterIntro.getBoundingClientRect();
        const animations = letterIntro.getAnimations({ subtree: true });
        await Promise.allSettled(animations.map((animation) => animation.finished));
        if (letterIntro.open) {
            letterIntro.close();
        }
    });
}

const messageEnvelope = document.querySelector(".message-envelope");
const friendLetterDialog = document.querySelector("#friend-letter-dialog");
const friendLetterClose = friendLetterDialog?.querySelector(".friend-letter-close");

if (
    messageEnvelope instanceof HTMLButtonElement &&
    friendLetterDialog instanceof HTMLDialogElement &&
    friendLetterClose instanceof HTMLButtonElement
) {
    messageEnvelope.addEventListener("click", () => {
        friendLetterDialog.showModal();
        messageEnvelope.setAttribute("aria-expanded", "true");
    });

    friendLetterClose.addEventListener("click", () => friendLetterDialog.close());

    friendLetterDialog.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            friendLetterDialog.close();
        }
    });

    friendLetterDialog.addEventListener("click", (event) => {
        if (event.target === friendLetterDialog) {
            friendLetterDialog.close();
        }
    });

    friendLetterDialog.addEventListener("close", () => {
        messageEnvelope.setAttribute("aria-expanded", "false");
        messageEnvelope.focus();
    });
}

const galleryMedia = window.galleryMedia;
const photoGrid = document.querySelector(".gallery-grid");
const videoGrid = document.querySelector(".video-grid");

if (
    !galleryMedia ||
    !Array.isArray(galleryMedia.photos) ||
    !Array.isArray(galleryMedia.videos) ||
    !(photoGrid instanceof HTMLElement) ||
    !(videoGrid instanceof HTMLElement)
) {
    throw new Error("Gallery media data or gallery containers are missing.");
}

galleryMedia.photos.forEach((photo) => {
    const button = document.createElement("button");
    button.className = "photo-space has-photo";
    button.type = "button";
    button.dataset.mediaKind = "photo";
    button.dataset.mediaSrc = photo.src;
    button.dataset.aspect = String(photo.width / photo.height);
    button.setAttribute("aria-label", `Perbesar ${photo.alt}`);

    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = "";
    image.width = photo.width;
    image.height = photo.height;
    image.loading = "lazy";
    image.decoding = "async";
    button.append(image);
    photoGrid.append(button);
});

/* Masonry: foto tersusun mengikuti rasio aslinya supaya tidak ter-crop
   dan tampil lebih besar dari grid lama yang memaksakan rasio. */
function layoutGalleryMasonry() {
    const items = Array.from(photoGrid.children);
    if (!items.length || !photoGrid.clientWidth) {
        return;
    }

    const isCompact = window.matchMedia("(max-width: 700px)").matches;
    const gap = isCompact ? 10 : 16;
    const containerWidth = photoGrid.clientWidth;
    const columns = containerWidth >= 1000 ? 3 : 2;
    const columnWidth = (containerWidth - gap * (columns - 1)) / columns;
    const columnHeights = new Array(columns).fill(0);

    photoGrid.classList.add("is-masonry");

    items.forEach((item) => {
        const aspect = Number.parseFloat(item.dataset.aspect) || 1;
        const itemHeight = columnWidth / aspect;
        const target = columnHeights.indexOf(Math.min(...columnHeights));
        const x = target * (columnWidth + gap);
        const y = columnHeights[target];

        item.style.width = `${columnWidth}px`;
        item.style.aspectRatio = `${aspect}`;
        item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        columnHeights[target] += itemHeight + gap;
    });

    photoGrid.style.height = `${Math.max(...columnHeights) - gap}px`;
}

let masonryResizeTimer;

window.addEventListener("resize", () => {
    window.clearTimeout(masonryResizeTimer);
    masonryResizeTimer = window.setTimeout(layoutGalleryMasonry, 120);
});

layoutGalleryMasonry();

galleryMedia.videos.forEach((video) => {
    const link = document.createElement("a");
    link.className = "video-card";
    link.href = video.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", video.label);

    const poster = document.createElement("img");
    poster.src = video.poster;
    poster.alt = "";
    poster.loading = "lazy";
    poster.decoding = "async";

    const caption = document.createElement("span");
    caption.className = "video-card-caption";
    caption.textContent = "Tonton di Google Drive";
    link.append(poster, caption);
    videoGrid.append(link);
});

const filmVideoCard = document.querySelector("[data-film-video]");
if (filmVideoCard instanceof HTMLAnchorElement) {
    const filmVideo = galleryMedia.videos[0];
    const filmPoster = filmVideoCard.querySelector("img");
    if (!filmVideo || !(filmPoster instanceof HTMLImageElement)) {
        throw new Error("Film section video or poster is missing.");
    }

    filmVideoCard.href = filmVideo.href;
    filmVideoCard.setAttribute("aria-label", filmVideo.label);
    filmPoster.src = filmVideo.poster;
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    document.body.classList.add("has-scroll-reveal");

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle("is-visible", entry.isIntersecting);
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
}

const galleryCards = document.querySelectorAll(".media-card");
const galleryPanels = document.querySelectorAll(".gallery-media-panel");

galleryCards.forEach((card) => {
    card.addEventListener("click", () => {
        const panelId = card.getAttribute("aria-controls");

        galleryCards.forEach((item) => {
            const isActive = item === card;
            item.classList.toggle("is-active", isActive);
            item.setAttribute("aria-pressed", String(isActive));
        });

        galleryPanels.forEach((panel) => {
            panel.hidden = panel.id !== panelId;
        });

        if (panelId === "photo-panel") {
            layoutGalleryMasonry();
        }
    });
});

const mediaViewer = document.querySelector(".media-viewer");
const viewerCover = document.querySelector(".viewer-cover");
const viewerImage = document.querySelector(".viewer-image");
const viewerVideo = document.querySelector(".viewer-video");
const viewerCloseButton = document.querySelector(".viewer-close");

document.querySelectorAll("[data-media-kind]").forEach((mediaCard) => {
    mediaCard.addEventListener("click", () => {
        const mediaKind = mediaCard.dataset.mediaKind;
        const mediaSource = mediaCard.dataset.mediaSrc;

        viewerImage.hidden = true;
        viewerVideo.hidden = true;
        viewerCover.hidden = false;
        viewerCover.classList.toggle("is-photo", mediaKind === "photo");
        viewerCover.classList.toggle("is-video", mediaKind === "video");

        if (mediaSource) {
            viewerCover.hidden = true;

            if (mediaKind === "video") {
                viewerVideo.src = mediaSource;
                viewerVideo.hidden = false;
                viewerVideo.load();
            } else {
                viewerImage.src = mediaSource;
                viewerImage.alt = mediaCard.getAttribute("aria-label") || "";
                viewerImage.hidden = false;
            }
        }

        mediaViewer.showModal();
    });
});

viewerCloseButton.addEventListener("click", () => mediaViewer.close());

mediaViewer.addEventListener("click", (event) => {
    if (event.target === mediaViewer) {
        mediaViewer.close();
    }
});

mediaViewer.addEventListener("close", () => {
    viewerVideo.pause();
    viewerVideo.removeAttribute("src");
    viewerVideo.load();
    viewerImage.removeAttribute("src");
    viewerImage.hidden = true;
    viewerVideo.hidden = true;
    viewerCover.hidden = false;
});
