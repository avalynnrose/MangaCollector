/**
 * 棚 · Which shelf filter a series belongs to, with the collection
 * override applied. Pure, so the rules can be tested without React or
 * Dexie; the dashboard and the card both read them from here.
 *
 * Automatic series (no `collection_status`) follow ownership exactly as
 * they always did. See `collectionStatus.js` for the override itself.
 */
import { isDropped, isStopped } from "@/lib/collectionStatus.js";
import { seriesIsComplete, wantedVolumes } from "@/lib/gaps.js";

/**
 * Ongoing (進): something owned, not everything, and still collected.
 * A series with no published total counts as long as the reader owns
 * something, as before.
 */
export function isOngoing(series, skipped = 0) {
  if (isStopped(series)) return false;
  const owned = series?.volumes_owned ?? 0;
  const target = wantedVolumes(series, skipped);
  return owned > 0 && (target === 0 || owned < target);
}

/**
 * Wishlist (願): tracked, nothing owned, a known total — and still
 * wanted. A paused or dropped series is not a wish.
 */
export function isWishlist(series) {
  return (
    !isStopped(series) &&
    (series?.volumes_owned ?? 0) === 0 &&
    (series?.volumes ?? 0) > 0
  );
}

/**
 * Complete (完): every wanted tome owned. A dropped series is never
 * counted as completed, whatever it holds: it is not the collection
 * being finished. A paused one is, since nothing is missing.
 */
export function isComplete(series, skipped = 0) {
  return !isDropped(series) && seriesIsComplete(series, skipped);
}
