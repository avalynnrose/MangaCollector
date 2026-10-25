import { useT } from "@/i18n/index.jsx";
import { useUpdateMangaMeta } from "@/hooks/useLibrary.js";
import {
  COLLECTION_STATUSES,
  collectionBadgeTone,
  collectionOption,
} from "@/lib/collectionStatus.js";

/**
 * 収 · Whether the reader is still collecting this series.
 *
 * Three chips in a radio group, next to the reading progression above
 * it: Automatic (the shelf decides from the tomes owned, as ever),
 * 留 Paused (not buying for now) and 降 Dropped (stopped for good).
 * Choosing one only moves the series between the library's filters —
 * every tome, its ownership, price, reading data and its wanted /
 * skipped flag stay exactly as they were, and going back to Automatic
 * puts the series back where its ownership says it belongs.
 *
 * Saved on click through the offline-first library patch, like the
 * reading status. The glyphs are not the reading or edition ones (休
 * 断 / 停 絶): three axes that all have a "paused" are told apart by
 * their mark as well as by their word.
 *
 * `series` is the live library row (Dexie).
 */

export default function CollectionStatus({ series }) {
  const t = useT();
  const updateMeta = useUpdateMangaMeta();
  if (!series) return null;
  const status = collectionOption(series.collection_status)?.id ?? null;

  const choose = (id) => {
    if (id === status) return;
    // "" is how the offline-first patch says "clear it": Automatic.
    updateMeta.mutate({ mal_id: series.mal_id, collection_status: id ?? "" });
  };

  const options = [
    { id: null, glyph: "自", key: "manga.collectionStatusAutomatic" },
    ...COLLECTION_STATUSES,
  ];

  return (
    <div className="mt-4 border-t border-border/70 pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-washi-dim">
        {t("manga.collectionStatusLabel")}
      </p>
      <div
        role="radiogroup"
        aria-label={t("manga.collectionStatusLabelPlain")}
        className="mt-2.5 flex flex-wrap gap-1.5"
      >
        {options.map((opt) => {
          const active = opt.id === status;
          return (
            <button
              key={opt.id ?? "automatic"}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={updateMeta.isPending}
              onClick={() => choose(opt.id)}
              className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase pointer-coarse:min-h-11 tracking-[0.18em] transition disabled:opacity-50 ${
                active
                  ? collectionBadgeTone(opt.id)
                  : "border-border text-washi-muted hover:border-washi-dim hover:text-washi"
              }`}
            >
              <span
                aria-hidden="true"
                className="font-jp text-[12px] leading-none"
              >
                {opt.glyph}
              </span>
              <span>{t(opt.key)}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 font-display text-[11px] italic leading-snug text-washi-dim">
        {t(
          status === null
            ? "manga.collectionStatusHintAutomatic"
            : "manga.collectionStatusHintSet",
        )}
      </p>
    </div>
  );
}
