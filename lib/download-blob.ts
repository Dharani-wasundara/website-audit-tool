/**
 * Browser-only: trigger a file download from string contents.
 * Used by client components (export + prompt log).
 */
export function downloadBlob(
  content: string,
  filename: string,
  mime: string
): void {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
