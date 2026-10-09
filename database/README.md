# BookClub Management System — Database Design

SQLite database design for the Book Club Management System. This document
covers the schema, table descriptions, keys, relationships, and an ER
diagram. The runnable SQL lives in `schema.sql` in this same folder.

---

## 1. Overview

| # | Table | Purpose |
|---|-------|---------|
| 1 | Users | Registered members, group organizers, and admins |
| 2 | Books | Catalog of all books on the platform |
| 3 | Reading_Groups | Scheduled groups reading a book together |
| 4 | Group_Members | Which users belong to which reading groups |
| 5 | Reading_Progress | Each user's personal progress on a book |
| 6 | Reviews | Star ratings and written reviews on books |
| 7 | Discussions | Discussion threads started about a book |
| 8 | Comments | Replies posted under a discussion |
| 9 | Events | Book club events (discussions, meetups, author visits) |
| 10 | Event_Registrations | Which users have registered for which events |

---

## 2. Table Descriptions, Primary Keys & Foreign Keys

### Users
Stores every registered person on the platform.
- **Primary Key:** `user_id`
- No foreign keys (this is a root table)
- `username` and `email` are unique
- `role` is constrained to `member`, `organizer`, or `admin`

### Books
The catalog of books available for discovery, groups, progress tracking, reviews, and discussions.
- **Primary Key:** `book_id`
- No foreign keys (this is a root table)

### Reading_Groups
A group of users reading a specific book on a shared schedule.
- **Primary Key:** `group_id`
- **Foreign Keys:**
  - `book_id` → `Books(book_id)` — the book this group is reading
  - `created_by` → `Users(user_id)` — the organizer who created the group

### Group_Members
Join table connecting users to the reading groups they've joined (many-to-many).
- **Primary Key:** `membership_id`
- **Foreign Keys:**
  - `group_id` → `Reading_Groups(group_id)`
  - `user_id` → `Users(user_id)`
- `UNIQUE(group_id, user_id)` — prevents joining the same group twice

### Reading_Progress
Tracks an individual user's progress through an individual book.
- **Primary Key:** `progress_id`
- **Foreign Keys:**
  - `user_id` → `Users(user_id)`
  - `book_id` → `Books(book_id)`
- `status` is constrained to `want_to_read`, `currently_reading`, or `completed`
- `UNIQUE(user_id, book_id)` — one progress record per user per book

### Reviews
A star rating (1–5) and optional written review left by a user on a book.
- **Primary Key:** `review_id`
- **Foreign Keys:**
  - `user_id` → `Users(user_id)`
  - `book_id` → `Books(book_id)`

### Discussions
A discussion thread a user starts about a specific book.
- **Primary Key:** `discussion_id`
- **Foreign Keys:**
  - `user_id` → `Users(user_id)` — thread starter
  - `book_id` → `Books(book_id)`

### Comments
Replies posted underneath a discussion thread.
- **Primary Key:** `comment_id`
- **Foreign Keys:**
  - `discussion_id` → `Discussions(discussion_id)`
  - `user_id` → `Users(user_id)` — comment author

### Events
Book club events such as discussions, reading sessions, author meets, and book exchanges.
- **Primary Key:** `event_id`
- **Foreign Keys:**
  - `organizer_id` → `Users(user_id)` — the user who organizes the event

### Event_Registrations
Join table connecting users to the events they've registered for (many-to-many).
- **Primary Key:** `registration_id`
- **Foreign Keys:**
  - `event_id` → `Events(event_id)`
  - `user_id` → `Users(user_id)`
- `UNIQUE(event_id, user_id)` — prevents registering for the same event twice

---

## 3. Relationships Summary

```
Users (1) ───< Reading_Progress (M) >─── (1) Books
Users (1) ───< Reviews (M)          >─── (1) Books
Users (1) ───< Discussions (M)      >─── (1) Books
Users (1) ───< Comments (M)         >─── (1) Discussions
Users (1) ───< Group_Members (M)    >─── (1) Reading_Groups
Books (1) ───< Reading_Groups (M)
Users (1) ───< Event_Registrations (M) >─── (1) Events
Users (1) ───< Events (M)   [organizer]
```

- **One-to-Many:** Users → Reviews, Users → Discussions, Users → Events (as organizer),
  Books → Reading_Groups, Books → Reviews, Books → Reading_Progress, Discussions → Comments
- **Many-to-Many (via join tables):**
  - Users ⇄ Reading_Groups (through `Group_Members`)
  - Users ⇄ Events (through `Event_Registrations`)

---

## 4. ER Diagram (ASCII)

```
                                   +----------------+
                                   |     Users      |
                                   |----------------|
                    +--------------| user_id (PK)   |--------------+
                    |              | name           |              |
                    |              | username       |              |
        +-----------+              | email          |              +-----------+
        |           |              | password       |              |           |
        |           |              | favorite_genre |              |           |
        |           |              | bio            |              |           |
        |           |              | profile_image  |              |           |
        |           |              | role           |              |           |
        |           |              | created_at     |              |           |
        |           |              +----------------+              |           |
        |           |                      |                       |           |
        |           |                      |                       |           |
        v           v                      v                       v           v
+---------------+ +----------------+ +----------------+ +----------------+ +---------------+
| Reading_      | | Group_Members  | | Reviews        | | Discussions    | | Events        |
| Progress      | |----------------| |----------------| |----------------| |---------------|
|---------------| | membership_id  | | review_id (PK) | | discussion_id  | | event_id (PK) |
| progress_id   | |   (PK)         | | user_id (FK)   | |   (PK)         | | title         |
| user_id (FK)  | | group_id (FK)  | | book_id (FK)   | | user_id (FK)   | | description   |
| book_id (FK)  | | user_id (FK)   | | rating         | | book_id (FK)   | | event_date    |
| pages_read    | | joined_at      | | review_text    | | title          | | event_time    |
| status        | +--------+-------+ | created_at     | | content        | | location      |
| start_date    |          |         +--------+-------+ | created_at     | | organizer_id  |
| target_date   |          |                  |         +--------+-------+ |   (FK -> Users)|
| completion_   |          |                  |                  |         | max_participants|
|   date        |          |                  |                  |         | created_at    |
+-------+-------+          |                  |                  |         +-------+-------+
        |                  v                  |                  v                 |
        |         +----------------+          |          +----------------+        |
        |         | Reading_Groups |          |          | Comments       |        |
        |         |----------------|          |          |----------------|        |
        |         | group_id (PK)  |          |          | comment_id(PK) |        |
        |         | group_name     |          |          | discussion_id  |        |
        |         | description    |          |          |   (FK)         |        |
        |         | book_id (FK)   |----+     |          | user_id (FK)   |        |
        |         | created_by(FK) |    |     |          | content        |        |
        |         | meeting_date   |    |     |          | created_at     |        |
        |         | meeting_time   |    |     |          +----------------+        |
        |         | max_members    |    |     |                                    |
        |         | created_at     |    |     |                                    v
        |         +----------------+    |     |                          +--------------------+
        |                               |     |                          | Event_Registrations|
        v                               v     v                          |--------------------|
   +----------------------------------------+                            | registration_id(PK)|
   |                 Books                  |                            | event_id (FK)      |
   |-----------------------------------------|                           | user_id (FK)       |
   | book_id (PK)                            |<--------------------------| registered_at      |
   | title                                   |                           +--------------------+
   | author                                  |
   | genre                                   |
   | description                             |
   | publication_year                        |
   | total_pages                             |
   | cover_image                             |
   | created_at                              |
   +-----------------------------------------+
```

**Legend:** `PK` = Primary Key, `FK` = Foreign Key. Lines/arrows point from the
"many" side toward the table it references (the "one" side).

---

## 5. SQLite CREATE TABLE Statements

See [`schema.sql`](./schema.sql) for the full, runnable SQL — it has been
tested and executes cleanly against SQLite (all 10 tables + indexes,
`PRAGMA foreign_keys = ON`). It includes:

- All 10 tables listed above
- Primary keys (`INTEGER PRIMARY KEY AUTOINCREMENT`)
- Foreign keys with `ON DELETE CASCADE`
- `CHECK` constraints for `role`, `status`, and `rating`
- `UNIQUE` constraints to prevent duplicate memberships/registrations/progress records
- Indexes on the columns most commonly filtered or joined on

To create the database from the command line:

```bash
sqlite3 bookclub.db < schema.sql
```
