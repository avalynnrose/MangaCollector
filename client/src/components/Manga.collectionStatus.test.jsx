import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it } from "vitest";
import { I18nProvider, loadLanguage } from "@/i18n/index.jsx";
import Manga from "./Manga.jsx";

/*
 * 収 · The card's corner badge is a ladder, and the collection status
 * sits just under "Complete": a paused or dropped series says so with
 * its own mark and word and stops reading as Ongoing or Wishlist, while
 * the owned / total counter keeps showing the physical count.
 */

beforeAll(async () => {
  await loadLanguage("en");
});

const card = (over) =>
  render(
    <MemoryRouter>
      <I18nProvider lang="en">
        <Manga
          manga={{ mal_id: 1, name: "Test", volumes: 20, volumes_owned: 5, ...over }}
        />
      </I18nProvider>
    </MemoryRouter>,
  );

describe("Manga card and the collection status", () => {
  it("shows Ongoing for an Automatic series with some tomes", () => {
    card({});
    expect(screen.getByText("Ongoing")).toBeInTheDocument();
    expect(screen.queryByText("Paused")).not.toBeInTheDocument();
  });

  it("shows Paused, not Ongoing, and keeps the 5 / 20 count", () => {
    card({ collection_status: "paused" });
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.queryByText("Ongoing")).not.toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/\/ 20/)).toBeInTheDocument();
  });

  it("shows Dropped with a different mark than Paused", () => {
    const { container } = card({ collection_status: "dropped" });
    expect(screen.getByText("Dropped")).toBeInTheDocument();
    expect(container).toHaveTextContent("降");
    expect(container).not.toHaveTextContent("留");
  });

  it("does not call an unowned paused series a wish", () => {
    card({ collection_status: "paused", volumes_owned: 0 });
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.queryByText("Wishlist")).not.toBeInTheDocument();
  });

  it("still calls an unowned Automatic series a wish", () => {
    card({ volumes_owned: 0 });
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
  });

  it("never calls a fully owned dropped series Complete", () => {
    card({ collection_status: "dropped", volumes_owned: 20 });
    expect(screen.getByText("Dropped")).toBeInTheDocument();
    expect(screen.queryByText("Complete")).not.toBeInTheDocument();
  });

  it("still says Paused on a fully owned paused series", () => {
    // The status is what the reader asked to see on the card; the full
    // bar and the 20 / 20 counter carry the rest.
    const { container } = card({ collection_status: "paused", volumes_owned: 20 });
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(container).toHaveTextContent("留");
    expect(screen.getByText("20")).toBeInTheDocument();
  });
});
