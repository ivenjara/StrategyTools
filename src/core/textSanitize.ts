/**
 * Text written into shapes or table cells is serialized into slide XML,
 * where control characters are invalid and make the host throw
 * (InvalidArgument/GeneralException). PowerPoint's own text ranges
 * return paragraph breaks as \r and soft line breaks as \x0B, so any
 * text read from one shape and written into another must pass through
 * here: line breaks are normalized to \n, other control chars dropped.
 */
export function sanitizeXmlText(text: string): string {
  return (
    text
      .replace(/\r\n|\r|\x0B/g, "\n")
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0C\x0E-\x1F\x7F]/g, "")
  );
}
