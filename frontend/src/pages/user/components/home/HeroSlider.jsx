import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  applyImageFallback,
  DEFAULT_IMAGE_FALLBACK,
  isInternalAppPath,
  isValidBannerLink,
  resolveBannerImageUrl,
} from "../../../../utils/imageFallback";
import "./HeroSlider.css";

const AUTOPLAY_MS = 6000; // trong khoảng 5–7 giây
const SWIPE_THRESHOLD = 48;

/**
 * Sắp xếp banner theo sortOrder / displayOrder tăng dần (ổn định theo id).
 */
function sortBanners(list) {
  return [...list].sort((a, b) => {
    const orderA = Number(a?.sortOrder ?? a?.displayOrder ?? 0);
    const orderB = Number(b?.sortOrder ?? b?.displayOrder ?? 0);
    if (orderA !== orderB) return orderA - orderB;
    return Number(a?.id ?? 0) - Number(b?.id ?? 0);
  });
}

/**
 * Chỉ giữ banner active (phòng khi API không lọc đủ).
 */
function filterActiveBanners(list) {
  return list.filter((b) => {
    if (!b) return false;
    if (b.active === false || b.active === 0 || b.active === "false") return false;
    if (b.deleted === true || b.isDeleted === true) return false;
    const url = b.imageUrl || b.imgUrl || b.desktopImageUrl || b.bannerUrl;
    return Boolean(url && String(url).trim());
  });
}

function HeroSlider({ banners = [] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1680 / 945);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);
  const trackRef = useRef(null);

  const slides = useMemo(() => {
    const raw = Array.isArray(banners) ? banners : [];
    return sortBanners(filterActiveBanners(raw));
  }, [banners]);

  const count = slides.length;

  const goTo = useCallback(
    (idx) => {
      if (count === 0) return;
      setCurrentIdx(((idx % count) + count) % count);
    },
    [count]
  );

  const goPrev = useCallback(
    (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      goTo(currentIdx - 1);
    },
    [currentIdx, goTo]
  );

  const goNext = useCallback(
    (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      goTo(currentIdx + 1);
    },
    [currentIdx, goTo]
  );

  // Autoplay — tạm dừng khi hover / touch đang kéo
  useEffect(() => {
    if (count <= 1 || isPaused) return undefined;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev >= count - 1 ? 0 : prev + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, isPaused]);

  // Preload các ảnh còn lại (không nén / không resize URL)
  useEffect(() => {
    slides.forEach((banner, idx) => {
      if (idx === 0) return;
      const src = resolveBannerImageUrl(banner);
      if (!src || src === DEFAULT_IMAGE_FALLBACK) return;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, [slides]);

  if (count === 0) {
    return (
      <div className="hero-slider hero-slider--loading" aria-hidden="true">
        <div className="hero-slider__skeleton" />
      </div>
    );
  }

  const safeIdx = Math.min(currentIdx, count - 1);
  const current = slides[safeIdx];
  const desktopSrc = resolveBannerImageUrl(current, { mobile: false });
  const mobileSrc = resolveBannerImageUrl(current, { mobile: true });
  const hasSeparateMobile =
    Boolean(current.mobileImageUrl || current.mobileImgUrl || current.imageMobileUrl) &&
    mobileSrc !== desktopSrc;
  const altText = current.title || "Banner trang chủ";
  const rawLink = current.targetUrl || current.linkUrl || "";
  const canNavigate = isValidBannerLink(rawLink);
  let targetUrl = canNavigate ? String(rawLink).trim() : "";
  // Path nội bộ không bắt đầu bằng / → thêm /
  if (canNavigate && !/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith("/")) {
    targetUrl = `/${targetUrl}`;
  }
  const isInternal = canNavigate && isInternalAppPath(targetUrl);

  const handleImageError = (event) => {
    if (import.meta.env.DEV) {
      console.warn("[HeroSlider] Banner image failed:", event?.currentTarget?.src, current);
    }
    applyImageFallback(event, DEFAULT_IMAGE_FALLBACK);
  };

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget || {};
    if (!naturalWidth || !naturalHeight) return;
    const nextRatio = naturalWidth / naturalHeight;
    if (!Number.isFinite(nextRatio) || nextRatio <= 0) return;
    setAspectRatio(nextRatio);
  };

  const imageEl = (
    <picture className="hero-slider__picture">
      {hasSeparateMobile && (
        <source media="(max-width: 767.98px)" srcSet={mobileSrc} />
      )}
      <img
        src={desktopSrc}
        alt={altText}
        className="hero-slider__image"
        loading={safeIdx === 0 ? "eager" : "lazy"}
        fetchPriority={safeIdx === 0 ? "high" : "low"}
        decoding="async"
        draggable={false}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </picture>
  );

  const slideBody = canNavigate ? (
    isInternal ? (
      <Link to={targetUrl} className="hero-slider__link" aria-label={altText}>
        {imageEl}
      </Link>
    ) : (
      <a
        href={targetUrl}
        className="hero-slider__link"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={altText}
      >
        {imageEl}
      </a>
    )
  ) : (
    <div className="hero-slider__link hero-slider__link--static">{imageEl}</div>
  );

  const onTouchStart = (e) => {
    const x = e.touches?.[0]?.clientX;
    if (x == null) return;
    touchStartX.current = x;
    touchDeltaX.current = 0;
    setIsPaused(true);
  };

  const onTouchMove = (e) => {
    if (touchStartX.current == null) return;
    const x = e.touches?.[0]?.clientX;
    if (x == null) return;
    touchDeltaX.current = x - touchStartX.current;
  };

  const onTouchEnd = () => {
    const dx = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
    if (Math.abs(dx) < SWIPE_THRESHOLD || count <= 1) return;
    if (dx < 0) {
      goTo(safeIdx + 1);
    } else {
      goTo(safeIdx - 1);
    }
  };

  return (
    <section
      className="hero-slider"
      aria-roledescription="carousel"
      aria-label="Banner trang chủ"
      style={{ "--hero-aspect-ratio": aspectRatio }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackRef}
        className="hero-slider__track"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={current.id ?? safeIdx}
            className="hero-slider__slide hero-slider__fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${safeIdx + 1} / ${count}: ${altText}`}
          >
            {slideBody}
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <div className="hero-slider__indicators" role="tablist" aria-label="Chọn banner">
            {slides.map((banner, idx) => (
              <button
                key={banner.id ?? idx}
                type="button"
                role="tab"
                aria-selected={idx === safeIdx}
                aria-label={`Banner ${idx + 1}${banner.title ? `: ${banner.title}` : ""}`}
                className={`hero-slider__dot${idx === safeIdx ? " is-active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(idx);
                }}
              />
            ))}
          </div>

          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--prev"
            aria-label="Banner trước"
            onClick={goPrev}
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="hero-slider__nav hero-slider__nav--next"
            aria-label="Banner tiếp"
            onClick={goNext}
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </>
      )}
    </section>
  );
}

export default HeroSlider;
