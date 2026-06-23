export const DEFAULT_IMAGE_FALLBACK = "/mykingdom_banner.png";

const BLOCKED_IMAGE_HOSTS = [
  "theme.hstatic.net",
];

export const resolveImageUrl = (url, fallback = DEFAULT_IMAGE_FALLBACK) => {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const normalizedUrl = url.trim();
  if (!normalizedUrl) {
    return fallback;
  }

  if (BLOCKED_IMAGE_HOSTS.some((host) => normalizedUrl.includes(host))) {
    return fallback;
  }

  return normalizedUrl;
};

export const applyImageFallback = (event, fallback = DEFAULT_IMAGE_FALLBACK) => {
  const target = event.currentTarget;
  target.onerror = null;
  target.src = fallback;
};
