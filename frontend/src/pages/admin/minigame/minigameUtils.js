export function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("vi-VN");
}

export function statusBadgeClass(status) {
  return status === "ACTIVE" ? "is-active" : "is-inactive";
}

export function downloadBlobFile(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function downloadCsv(rows, fileName) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, "\"\"")}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlobFile(blob, fileName);
}

export function parsePlayData(playDataJson) {
  if (!playDataJson) {
    return {};
  }
  try {
    return JSON.parse(playDataJson);
  } catch (error) {
    return {};
  }
}

export function normalizeBooleanFilter(value) {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return null;
}
