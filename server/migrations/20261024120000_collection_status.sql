-- 収 · What the reader is doing about *collecting* the series.
--
-- The shelf's Ongoing / Wishlist / Complete states are derived from how
-- many tomes are owned, and they cannot say "I stopped buying this one"
-- without deleting the tomes that prove the opposite. This column is the
-- override, kept apart from the two statuses that already sound alike:
--   reading_status      — where the reader stands with the story
--   publication_status  — what the publisher is doing with the edition
--   collection_status   — whether the reader is still collecting it
--
-- Two values:
--   paused   — not buying for now, expected to resume
--   dropped  — stopped for good
--
-- NULL means "Automatic", which is what every existing row gets: the
-- series behaves exactly as before and follows its ownership. Nothing
-- here touches volumes, ownership, prices or reading data.
ALTER TABLE user_libraries
    ADD COLUMN IF NOT EXISTS collection_status TEXT NULL;

ALTER TABLE user_libraries
    DROP CONSTRAINT IF EXISTS user_libraries_collection_status_check;
ALTER TABLE user_libraries
    ADD CONSTRAINT user_libraries_collection_status_check
    CHECK (collection_status IS NULL OR collection_status IN ('paused', 'dropped'));
