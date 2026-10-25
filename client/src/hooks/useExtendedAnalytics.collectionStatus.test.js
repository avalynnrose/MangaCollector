import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useExtendedAnalytics } from "./useExtendedAnalytics.js";

/*
 * 収 · A dropped series stays in the inventory figures (owned volumes,
 * series count) but leaves the completion figures on both sides, so a
 * stopped 5-of-20 does not drag its author's or publisher's percentage
 * down, and is never one of the "fully owned" series.
 */

const author = { id: 1, mal_id: 10, name: "Oda" };
const series = (mal_id, volumes, volumes_owned, over = {}) => ({
  mal_id,
  name: `S${mal_id}`,
  volumes,
  volumes_owned,
  author,
  publisher: "Glénat",
  ...over,
});
const owned = (mal_id, n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `${mal_id}-${i + 1}`,
    mal_id,
    vol_num: i + 1,
    owned: true,
    read_at: "2025-01-01",
  }));

function run(library, volumes) {
  return renderHook(() => useExtendedAnalytics({ library, volumes })).result
    .current;
}

describe("useExtendedAnalytics and the collection status", () => {
  const volumes = [...owned(1, 10), ...owned(2, 5)];

  it("keeps a dropped series in the author's inventory but not its percentage", () => {
    const out = run(
      [series(1, 10, 10), series(2, 20, 5, { collection_status: "dropped" })],
      volumes,
    );
    const [a] = out.authors;
    expect(a.ownedVolumes).toBe(15);
    expect(a.seriesCount).toBe(2);
    // 10 of 10 for the series still being collected, not 15 of 30.
    expect(a.completionPct).toBe(100);
    const [p] = out.publishers;
    expect(p.ownedVolumes).toBe(15);
    expect(p.completionPct).toBe(100);
  });

  it("counts a paused series in the percentage, as it is expected back", () => {
    const out = run(
      [series(1, 10, 10), series(2, 20, 5, { collection_status: "paused" })],
      volumes,
    );
    expect(out.authors[0].completionPct).toBe(50);
  });

  it("does not take a dropped series as one of the fully owned", () => {
    const out = run(
      [series(1, 10, 10), series(2, 5, 5, { collection_status: "dropped" })],
      volumes,
    );
    expect(out.dokuhaRatio.total).toBe(1);
  });

  it("is unchanged without any status", () => {
    const out = run([series(1, 10, 10), series(2, 20, 5)], volumes);
    expect(out.authors[0].completionPct).toBe(50);
    expect(out.dokuhaRatio.total).toBe(1);
  });
});
