/**
 * MIME types for résumé uploads (Forge upload + admin download Content-Type).
 */
export function mimeTypeForResumeFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
    bmp: "image/bmp",
    tiff: "image/tiff",
    tif: "image/tiff",
  };
  return map[ext] ?? "application/octet-stream";
}

/** Safe basename for storage keys (no path traversal). */
export function sanitizeResumeFileName(name: string, maxLen = 200): string {
  const base = name.replace(/^.*[/\\]/, "").replace(/[^\w.\- ()]+/g, "_");
  return base.slice(0, maxLen) || "resume";
}
