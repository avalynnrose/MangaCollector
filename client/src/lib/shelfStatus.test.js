import { describe, expect, it } from "vitest";
import { isDropped, isStopped } from "./collectionStatus.js";
import { isComplete, isOngoing, isWishlist } from "./shelfStatus.js";

/*
 * 棚 · The collection status (収) only decides where a series is
 * listed. Automatic series — no status — must behave exactly as the
 * ownership-derived filters always did; Paused and Dropped leave
 * Ongoing and Wishlist and nothing else about the series changes.
 */

const series = (over = {}) => ({
  mal_id: 1,
  volumes: 20,
  volumes_owned: 5,
  ...over,
});

describe("isStopped / isDropped", () => {
  it("treats no status, null and unknown words as Automatic", () => {
    for (const s of [undefined, null, "", "automatic", "bogus"]) {
      expect(isStopped({ collection_status: s })).toBe(false);
      expect(isDropped({ collection_status: s })).toBe(false);
    }
    expect(isStopped(undefined)).toBe(false);
  });

  it("knows paused and dropped", () => {
    expect(isStopped({ collection_status: "paused" })).toBe(true);
    expect(isStopped({ collection_status: "dropped" })).toBe(true);
    expect(isDropped({ collection_status: "paused" })).toBe(false);
    expect(isDropped({ collection_status: "dropped" })).toBe(true);
  });
});

describe("Automatic series follow ownership, as before", () => {
  it("is Ongoing with some but not all owned", () => {
    expect(isOngoing(series())).toBe(true);
    expect(isOngoing(series({ volumes_owned: 20 }))).toBe(false);
    expect(isOngoing(series({ volumes_owned: 0 }))).toBe(false);
  });

  it("counts a series with no published total as Ongoing once something is owned", () => {
    expect(isOngoing(series({ volumes: 0, volumes_owned: 2 }))).toBe(true);
  });

  it("discounts skipped volumes when asking whether it is Ongoing or Complete", () => {
    const s = series({ volumes: 12, volumes_owned: 10 });
    expect(isOngoing(s)).toBe(true);
    expect(isOngoing(s, 2)).toBe(false);
    expect(isComplete(s)).toBe(false);
    expect(isComplete(s, 2)).toBe(true);
  });

  it("is Wishlist with a known total and nothing owned", () => {
    expect(isWishlist(series({ volumes_owned: 0 }))).toBe(true);
    expect(isWishlist(series({ volumes: 0, volumes_owned: 0 }))).toBe(false);
    expect(isWishlist(series())).toBe(false);
  });
});

describe.each(["paused", "dropped"])("a %s series", (status) => {
  it("leaves Ongoing", () => {
    expect(isOngoing(series({ collection_status: status }))).toBe(false);
  });

  it("leaves Wishlist even with nothing owned", () => {
    expect(isWishlist(series({ collection_status: status, volumes_owned: 0 }))).toBe(
      false,
    );
  });

  it("is stopped", () => {
    expect(isStopped(series({ collection_status: status }))).toBe(true);
  });
});

describe("Complete", () => {
  it("is never granted to a dropped series, whatever it holds", () => {
    const full = series({ volumes_owned: 20 });
    expect(isComplete(full)).toBe(true);
    expect(isComplete({ ...full, collection_status: "dropped" })).toBe(false);
  });

  it("stays true for a paused series with every tome", () => {
    expect(isComplete(series({ volumes_owned: 20, collection_status: "paused" }))).toBe(
      true,
    );
  });
});
