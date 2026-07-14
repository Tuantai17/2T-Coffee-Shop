export const DEFAULT_IMAGE_FALLBACK = "/mykingdom_banner.png";

const BLOCKED_IMAGE_HOSTS = [
  "theme.hstatic.net",
];

const GATEWAY_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://localhost:8900";

/**
 * Chuẩn hóa URL ảnh:
 * - Giữ nguyên URL tuyệt đối (Cloudinary, CDN…)
 * - Ghép base cho URL tương đối, tránh lặp domain / thiếu dấu /
 * - Không trả về URL rỗng
 */
export const resolveImageUrl = (url, fallback = DEFAULT_IMAGE_FALLBACK) => {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const normalizedUrl = url.trim();
  if (!normalizedUrl || normalizedUrl === "-" || normalizedUrl.toLowerCase() === "null") {
    return fallback;
  }

  if (BLOCKED_IMAGE_HOSTS.some((host) => normalizedUrl.includes(host))) {
    return fallback;
  }

  // Prevent weird corrupted strings like "27:1" from triggering 404s
  if (!normalizedUrl.includes("/") && !normalizedUrl.includes(".")) {
    return fallback;
  }

  // data: / blob: giữ nguyên
  if (/^(data:|blob:)/i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  // Absolute URL (http/https) — dùng nguyên, đây là URL gốc banner
  if (/^https?:\/\//i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  // Protocol-relative
  if (normalizedUrl.startsWith("//")) {
    return `https:${normalizedUrl}`;
  }

  // Relative path — ghép gateway, tránh //
  const base = String(GATEWAY_BASE).replace(/\/+$/, "");
  const path = normalizedUrl.startsWith("/") ? normalizedUrl : `/${normalizedUrl}`;
  return `${base}${path}`;
};

/**
 * Chọn URL ảnh gốc chất lượng cao cho banner.
 * Ưu tiên imageUrl / desktop / full — KHÔNG dùng thumbnail / preview.
 */
export const resolveBannerImageUrl = (banner, { mobile = false } = {}) => {
  if (!banner || typeof banner !== "object") {
    return DEFAULT_IMAGE_FALLBACK;
  }

  if (mobile) {
    const mobileUrl =
      banner.mobileImageUrl ||
      banner.mobileImgUrl ||
      banner.imageMobileUrl ||
      null;
    if (mobileUrl) {
      return resolveImageUrl(mobileUrl);
    }
  }

  const original =
    banner.desktopImageUrl ||
    banner.imageUrl ||
    banner.imgUrl ||
    banner.bannerUrl ||
    banner.image ||
    banner.url ||
    // chỉ fallback thumbnail nếu không còn field nào khác
    banner.thumbnailUrl ||
    banner.previewUrl ||
    null;

  return resolveImageUrl(original);
};

export const applyImageFallback = (event, fallback = DEFAULT_IMAGE_FALLBACK) => {
  const target = event.currentTarget;
  target.onerror = null;
  target.src = fallback;
};

/** Link banner hợp lệ để điều hướng (không "-", rỗng, null). */
export const isValidBannerLink = (url) => {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  if (!t || t === "-" || t.toLowerCase() === "null" || t.toLowerCase() === "undefined") {
    return false;
  }
  // Cho phép path nội bộ hoặc URL tuyệt đối
  if (t.startsWith("/") && !t.startsWith("//")) return true;
  if (/^https?:\/\//i.test(t)) return true;
  // relative path kiểu products/xyz
  if (/^[a-zA-Z0-9]/.test(t) && !t.includes(" ")) return true;
  return false;
};

export const isInternalAppPath = (url) => {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  return t.startsWith("/") && !t.startsWith("//");
};
