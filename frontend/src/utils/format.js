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
  return value.charAt(0).toUpperCase() + value.slice(1);
}
