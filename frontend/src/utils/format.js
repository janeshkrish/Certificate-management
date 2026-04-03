export function formatDate(dateValue) {
  if (!dateValue) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateValue));
}

export function truncateHash(hash) {
  if (!hash) {
    return "";
  }
  return `${hash.slice(0, 14)}...${hash.slice(-10)}`;
}

export function toTitleCase(value) {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function isHttpUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getCertificateFileKind(fileUrl, fileFormat, fileResourceType) {
  const normalizedFormat = String(fileFormat || "")
    .trim()
    .toLowerCase()
    .replace(/^\./, "");

  if (normalizedFormat === "pdf") {
    return "pdf";
  }

  if (["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg", "avif"].includes(normalizedFormat)) {
    return "image";
  }

  const normalizedResourceType = String(fileResourceType || "").trim().toLowerCase();
  if (normalizedResourceType === "image") {
    return "image";
  }

  if (!isHttpUrl(fileUrl)) {
    return "unknown";
  }

  try {
    const pathname = new URL(fileUrl).pathname.toLowerCase();
    if (pathname.endsWith(".pdf")) {
      return "pdf";
    }
    if (/\.(png|jpe?g|webp|gif|bmp|svg|avif)$/.test(pathname)) {
      return "image";
    }
    if (pathname.includes("/image/upload/")) {
      return "image";
    }
  } catch {
    return "unknown";
  }

  return "unknown";
}

export function openExternalUrl(url) {
  if (typeof window === "undefined" || !isHttpUrl(url)) {
    return false;
  }

  return Boolean(window.open(url, "_blank", "noopener,noreferrer"));
}
