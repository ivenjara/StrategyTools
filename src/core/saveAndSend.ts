/* global PowerPoint, Office */

const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

/**
 * Extract the presentation name from the document URL.
 * Falls back to "Presentation" if unavailable.
 */
export function getPresentationName(): string {
  try {
    const url = Office.context.document.url;
    if (!url) return "Presentation";

    // URL might be a local path or web URL — grab the last segment
    const decoded = decodeURIComponent(url);
    const segments = decoded.replace(/\\/g, "/").split("/");
    const last = segments[segments.length - 1] || "Presentation";

    // Strip .pptx extension if present
    return last.replace(/\.pptx$/i, "").trim() || "Presentation";
  } catch {
    return "Presentation";
  }
}

/**
 * Build a safe filename with optional date/time stamp and slide suffix.
 */
export function formatFileName(
  name: string,
  includeDateTime: boolean,
  slideSuffix?: string
): string {
  let base = name.trim() || "Presentation";

  // Remove filesystem-unsafe characters
  base = base.replace(/[<>:"/\\|?*]/g, "-");

  if (slideSuffix) {
    base += ` ${slideSuffix}`;
  }

  if (includeDateTime) {
    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const h = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    base += ` ${y}-${mo}-${d} ${h}-${mi}`;
  }

  return base + ".pptx";
}

/**
 * Format slide numbers into a compact string like "Slides 1-3" or "Slides 1, 3, 5".
 * Consecutive runs are collapsed into ranges.
 */
function formatSlideNumbers(positions: number[]): string {
  if (positions.length === 0) return "";
  const sorted = [...positions].sort((a, b) => a - b);

  const parts: string[] = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === rangeEnd + 1) {
      rangeEnd = sorted[i];
    } else {
      parts.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
      rangeStart = sorted[i];
      rangeEnd = sorted[i];
    }
  }
  parts.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);

  return `Slides ${parts.join(", ")}`;
}

/**
 * Get the 1-based positions of the currently selected slides.
 * Returns both the slide IDs and their positions in the deck.
 */
export async function getSelectedSlideInfo(): Promise<{
  slideIds: string[];
  positions: number[];
  slideSuffix: string;
}> {
  let slideIds: string[] = [];
  let positions: number[] = [];

  await PowerPoint.run(async (context) => {
    const allSlides = context.presentation.slides;
    allSlides.load("items/id");
    const selected = context.presentation.getSelectedSlides();
    selected.load("items/id");
    await context.sync();

    if (selected.items.length === 0) {
      throw new Error("No slides selected. Select one or more slides in the slide panel first.");
    }

    const selectedIds = new Set(selected.items.map((s) => s.id));

    slideIds = selected.items.map((s) => s.id);
    positions = allSlides.items
      .map((s, index) => (selectedIds.has(s.id) ? index + 1 : -1))
      .filter((p) => p !== -1);
  });

  return {
    slideIds,
    positions,
    slideSuffix: formatSlideNumbers(positions),
  };
}

/**
 * Get the full presentation as a Blob via the Common API (getFileAsync).
 * Works across all platforms.
 */
export function getFullPresentation(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    Office.context.document.getFileAsync(
      Office.FileType.Compressed,
      { sliceSize: 4194304 }, // 4 MB slices
      (result) => {
        if (result.status !== Office.AsyncResultStatus.Succeeded) {
          reject(new Error(result.error?.message || "Failed to get presentation file."));
          return;
        }

        const file = result.value;
        const sliceCount = file.sliceCount;
        const slices: Uint8Array[] = [];
        let received = 0;

        const getSlice = (index: number) => {
          file.getSliceAsync(index, (sliceResult) => {
            if (sliceResult.status !== Office.AsyncResultStatus.Succeeded) {
              file.closeAsync();
              reject(new Error(sliceResult.error?.message || `Failed to read slice ${index}.`));
              return;
            }

            slices[index] = new Uint8Array(sliceResult.value.data);
            received++;

            if (received === sliceCount) {
              file.closeAsync();
              // Combine all slices into one array
              const totalLength = slices.reduce((sum, s) => sum + s.length, 0);
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const slice of slices) {
                combined.set(slice, offset);
                offset += slice.length;
              }
              resolve(new Blob([combined], { type: PPTX_MIME }));
            } else {
              getSlice(index + 1);
            }
          });
        };

        if (sliceCount > 0) {
          getSlice(0);
        } else {
          file.closeAsync();
          reject(new Error("Presentation file is empty."));
        }
      }
    );
  });
}

/**
 * Export only the selected slides as a new .pptx Blob.
 * Uses SlideCollection.exportAsBase64Presentation (PowerPointApi 1.10).
 */
export async function getSelectedSlidesPresentation(slideIds: string[]): Promise<Blob> {
  const hasExportApi = Office.context.requirements.isSetSupported("PowerPointApi", "1.10");

  if (!hasExportApi) {
    throw new Error(
      "Selected slide export is not supported in this version of PowerPoint. Use 'Entire presentation' instead."
    );
  }

  let base64: string = "";

  await PowerPoint.run(async (context) => {
    const result = context.presentation.slides.exportAsBase64Presentation(slideIds);
    await context.sync();
    base64 = result.value;
  });

  if (!base64) {
    throw new Error("Failed to export selected slides.");
  }

  // Convert base64 to Blob
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: PPTX_MIME });
}

/**
 * Trigger a browser download for a Blob with the given filename.
 */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Small delay before revoking to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Open the default email client with a pre-filled subject and body.
 */
export function composeEmail(fileName: string): void {
  const subject = encodeURIComponent(`Presentation: ${fileName.replace(/\.pptx$/i, "")}`);
  const body = encodeURIComponent(
    "Please find attached the slides from the presentation for your review.\n\nKind regards"
  );
  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
  window.open(mailtoUrl, "_blank");
}
