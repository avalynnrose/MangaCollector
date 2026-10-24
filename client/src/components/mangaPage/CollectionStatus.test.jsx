import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider, loadLanguage } from "@/i18n/index.jsx";

vi.mock("@/hooks/useLibrary.js", () => ({
  useUpdateMangaMeta: vi.fn(),
}));

const { useUpdateMangaMeta } = await import("@/hooks/useLibrary.js");
const CollectionStatus = (await import("./CollectionStatus.jsx")).default;

/*
 * 収 · The selector saves on click through the library patch, like the
 * reading status next to it, and "Automatic" is the absence of a value:
 * it is sent as the empty string the patch treats as "clear".
 */

let meta;

beforeAll(async () => {
  await loadLanguage("en");
});

beforeEach(() => {
  meta = { mutate: vi.fn(), isPending: false };
  useUpdateMangaMeta.mockReturnValue(meta);
});

const series = (over) => ({ mal_id: 13, volumes: 20, ...over });

function renderIt(row) {
  return render(
    <I18nProvider lang="en">
      <CollectionStatus series={row} />
    </I18nProvider>,
  );
}

describe("CollectionStatus", () => {
  it("offers Automatic, Paused and Dropped, Automatic selected by default", () => {
    renderIt(series());
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /automatic/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: /paused/i })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("shows the stored status as selected", () => {
    renderIt(series({ collection_status: "dropped" }));
    expect(screen.getByRole("radio", { name: /dropped/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: /automatic/i })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("saves Paused and Dropped on click, sending only the status", () => {
    renderIt(series());
    fireEvent.click(screen.getByRole("radio", { name: /paused/i }));
    expect(meta.mutate).toHaveBeenCalledWith({
      mal_id: 13,
      collection_status: "paused",
    });
    fireEvent.click(screen.getByRole("radio", { name: /dropped/i }));
    expect(meta.mutate).toHaveBeenLastCalledWith({
      mal_id: 13,
      collection_status: "dropped",
    });
  });

  it("goes back to Automatic by clearing the status", () => {
    renderIt(series({ collection_status: "paused" }));
    fireEvent.click(screen.getByRole("radio", { name: /automatic/i }));
    expect(meta.mutate).toHaveBeenCalledWith({
      mal_id: 13,
      collection_status: "",
    });
  });

  it("does not save when the selected option is clicked again", () => {
    renderIt(series({ collection_status: "paused" }));
    fireEvent.click(screen.getByRole("radio", { name: /paused/i }));
    expect(meta.mutate).not.toHaveBeenCalled();
  });

  it("is disabled while a save is in flight", () => {
    useUpdateMangaMeta.mockReturnValue({ mutate: vi.fn(), isPending: true });
    renderIt(series());
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
  });
});
