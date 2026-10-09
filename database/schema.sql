-- =========================================================
-- BOOKCLUB MANAGEMENT SYSTEM — SQLite Database Schema
-- =========================================================
-- Notes:
--   * Foreign key enforcement must be turned on per-connection in SQLite.
--   * TEXT is used for dates/times (ISO-8601 strings), which is SQLite's
--     recommended convention since it has no native DATE/DATETIME type.
--   * created_at / joined_at / registered_at default to the current
--     UTC timestamp.
-- =========================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------
-- 1. USERS
-- Stores every registered member, organizer, and admin.
-- ---------------------------------------------------------
CREATE TABLE Users (
    user_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    username        TEXT NOT NULL UNIQUE,
    email           TEXT NOT NULL UNIQUE,
    password        TEXT NOT NULL,               -- store a hashed password, never plain text
    favorite_genre  TEXT,
    bio             TEXT,
    profile_image   TEXT,                        -- file path / URL
    role            TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('member', 'organizer', 'admin')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------
-- 2. BOOKS
-- Catalog of every book available on the platform.
-- ---------------------------------------------------------
CREATE TABLE Books (
    book_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title             TEXT NOT NULL,
    author            TEXT NOT NULL,
    genre             TEXT,
    description       TEXT,
    publication_year  INTEGER,
    total_pages       INTEGER,
    cover_image       TEXT,                      -- file path / URL
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------
-- 3. READING_GROUPS
-- A scheduled group reading a specific book together.
-- ---------------------------------------------------------
CREATE TABLE Reading_Groups (
    group_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name     TEXT NOT NULL,
    description    TEXT,
    book_id        INTEGER NOT NULL,
    created_by     INTEGER NOT NULL,             -- organizer (Users.user_id)
    meeting_date   TEXT,
    meeting_time   TEXT,
    max_members    INTEGER NOT NULL DEFAULT 20,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (book_id)    REFERENCES Books(book_id)    ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES Users(user_id)    ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 4. GROUP_MEMBERS
-- Join table: which users belong to which reading groups.
-- ---------------------------------------------------------
CREATE TABLE Group_Members (
    membership_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id       INTEGER NOT NULL,
    user_id        INTEGER NOT NULL,
    joined_at      TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES Reading_Groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES Users(user_id)           ON DELETE CASCADE,
    UNIQUE (group_id, user_id)                    -- a user can only join a group once
);

-- ---------------------------------------------------------
-- 5. READING_PROGRESS
-- Tracks each user's personal progress through a book.
-- ---------------------------------------------------------
CREATE TABLE Reading_Progress (
    progress_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL,
    book_id          INTEGER NOT NULL,
    pages_read       INTEGER NOT NULL DEFAULT 0,
    status           TEXT NOT NULL DEFAULT 'want_to_read'
                     CHECK (status IN ('want_to_read', 'currently_reading', 'completed')),
    start_date       TEXT,
    target_date      TEXT,
    completion_date  TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE,
    UNIQUE (user_id, book_id)                      -- one progress record per user per book
);

-- ---------------------------------------------------------
-- 6. REVIEWS
-- Star ratings and written reviews left by users on books.
-- ---------------------------------------------------------
CREATE TABLE Reviews (
    review_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL,
    book_id      INTEGER NOT NULL,
    rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text  TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 7. DISCUSSIONS
-- Discussion threads started by users about a book.
-- ---------------------------------------------------------
CREATE TABLE Discussions (
    discussion_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER NOT NULL,
    book_id        INTEGER NOT NULL,
    title          TEXT NOT NULL,
    content        TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 8. COMMENTS
-- Replies posted under a discussion thread.
-- ---------------------------------------------------------
CREATE TABLE Comments (
    comment_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    discussion_id  INTEGER NOT NULL,
    user_id        INTEGER NOT NULL,
    content        TEXT NOT NULL,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (discussion_id) REFERENCES Discussions(discussion_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)       REFERENCES Users(user_id)             ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 9. EVENTS
-- Book club events (discussions, meetups, author visits...).
-- ---------------------------------------------------------
CREATE TABLE Events (
    event_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title             TEXT NOT NULL,
    description       TEXT,
    event_date        TEXT NOT NULL,
    event_time        TEXT,
    location          TEXT,
    organizer_id      INTEGER NOT NULL,
    max_participants  INTEGER,
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (organizer_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 10. EVENT_REGISTRATIONS
-- Join table: which users have registered for which events.
-- ---------------------------------------------------------
CREATE TABLE Event_Registrations (
    registration_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id         INTEGER NOT NULL,
    user_id          INTEGER NOT NULL,
    registered_at    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)  REFERENCES Users(user_id)   ON DELETE CASCADE,
    UNIQUE (event_id, user_id)                     -- a user can only register once per event
);

-- =========================================================
-- HELPFUL INDEXES
-- =========================================================
CREATE INDEX idx_books_genre            ON Books(genre);
CREATE INDEX idx_reading_groups_book    ON Reading_Groups(book_id);
CREATE INDEX idx_group_members_group    ON Group_Members(group_id);
CREATE INDEX idx_group_members_user     ON Group_Members(user_id);
CREATE INDEX idx_progress_user          ON Reading_Progress(user_id);
CREATE INDEX idx_progress_book          ON Reading_Progress(book_id);
CREATE INDEX idx_reviews_book           ON Reviews(book_id);
CREATE INDEX idx_discussions_book       ON Discussions(book_id);
CREATE INDEX idx_comments_discussion    ON Comments(discussion_id);
CREATE INDEX idx_event_registrations_ev ON Event_Registrations(event_id);
