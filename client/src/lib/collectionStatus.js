/**
 * 収 · Collection status — whether the reader is still collecting a
 * series, as a manual override on top of what the shelf already says.
 *
 * Ongoing, Wishlist and Complete are derived from how many tomes are
 * owned. That cannot express "I stopped buying this" without deleting
 * the tomes that prove the opposite, so the library row carries an
 * optional `collection_status`:
 *
 *   null / absent → Automatic: follow ownership, exactly as before
 *   "paused"      → not buying for now, expected to resume
 *   "dropped"     → stopped for good
 *
 * It overrides *where a series is listed*, nothing else. Volumes,
 * ownership, prices, reading data and the wanted / skipped flags are
 * never touched, and the owned / total count keeps being the physical
 * truth (5 / 20 stays 5 / 20).
 *
 * Pure and import-free, so `gaps.js` and `libraryStats.js` can read it
 * without a cycle; the shelf rules built on it are in `shelfStatus.js`.
 */
/** Not "being collected" right now, for a while or for good. */
export function isStopped(series) {
  const s = series?.collection_status;
  return s === "paused" || s === "dropped";
}

/** Stopped for good: out of the active collection's figures. */
export function isDropped(series) {
  return series?.collection_status === "dropped";
}

/** The glyph and label key of each override, for chips and badges. */
export const COLLECTION_STATUSES = [
  { id: "paused", glyph: "留", key: "manga.collectionStatusPaused" },
  { id: "dropped", glyph: "降", key: "manga.collectionStatusDropped" },
];

/** The glyph and label key of a stored status, or null for Automatic. */
export const collectionOption = (id) =>
  COLLECTION_STATUSES.find((o) => o.id === id) ?? null;

const TONES = {
  paused: "border-gold/60 bg-gold/10 text-gold",
  dropped: "border-washi/50 bg-washi/10 text-washi",
};

/** Chip and card-badge classes of a status; neutral for Automatic. */
export const collectionBadgeTone = (id) =>
  TONES[id] ?? "border-washi/40 bg-ink-0/40 text-washi";
