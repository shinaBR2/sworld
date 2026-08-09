# Worked spec examples

A filled-in example for three of the four shapes — Bug, Small feature, User story. Read the one that
matches the shape you're writing when you want to see the template turned into a real spec. The
structures and rules these follow all live in the SKILL.md; these are only the filled-in form. (The
Large-feature shape's structure is shown inline in the SKILL.md with its own sequencing examples.)

## Bug — the library progress bug

Created as a `bug`-labelled issue in the **Main** app's project, ready to pick up, estimate 1 (library
is a feature area of the main app; see `task-tracker` for the create command), where the description
holds:

```markdown
**In plain words**

In the Main app's library, reading a long book loses the progress bar partway through — once you scroll past the first few chapters, the bar that shows your current chapter and how far through the book you are just disappears. You can keep reading, but you lose track of where you are.

**Problem**

When a book in the library app has many chapters, scrolling down to the chapters at the bottom of the reader loses the sticky progress bar that shows current chapter and percentage. The reader can't tell how far through the book they are, making it hard to resume.

Reported by a user during testing on a long audiobook.

**Root cause**

The progress bar relies on `position: sticky; top: 0`, but the reader's parent containers don't constrain height, so the chapter list grows to full content height and the page scrolls rather than the reader's internal scroll container. Since `position: sticky` only works relative to the nearest scrolling ancestor, the bar scrolls away.

**Solution**

Give the reader wrapper a constrained height (e.g. `calc(100vh - <header height>)`) so the reader's built-in `overflow-y: auto` activates and becomes the scroll context. The existing sticky CSS on the progress bar will then keep it pinned at the top.

Key files:
* `apps/main/src/components/ReaderLayout.tsx` — the wrapper has `overflow: 'hidden'` which may also interfere
* `apps/main/src/components/BookReader.tsx` — the Stack wrapping the reader needs a height constraint

**Acceptance criteria**

* Progress bar remains visible when scrolling through a book with many chapters
* The chapter list on the left stays in sync with the progress bar
* No layout regressions on short books
```

## Small feature — bulk import for listen tracks

A **Listen**-project issue, ready to pick up, estimate 4 (see `task-tracker` for the create command),
description:

```markdown
**In plain words**

Building a playlist in the Listen app means adding tracks one at a time, even if you already have a list of 15+ songs written down somewhere. This adds a way to paste that whole list in at once instead of typing each track by hand.

**Problem**

Users building a playlist in the listen app have to add each track individually, which is slow when working from a tracklist they already have written down (15+ tracks).

**Proposed solution**

Add a "Paste tracklist" button to the playlist view. The button opens a dialog where users paste tabular text (from a notes app, a spreadsheet, or a webpage). The parser splits the text into rows and pre-populates a confirmation table where users review, edit, or delete rows before saving.

Behind feature flag `bulk_import_tracks`.

**Acceptance criteria**

* "Paste tracklist" button visible on the playlist view when the flag is on
* Pasting tabular text creates editable rows with title and artist pre-filled where detectable
* User can edit, add, or delete rows before saving
* Saving creates the tracks via the existing mutation flow
* Existing single-track entry continues to work unchanged
```

## User story — document ingestion for the til app

A **Til**-project issue in **`Backlog`** (see `task-tracker` for the create command), description:

```markdown
**The user's problem**

People accumulate "today I learned" notes in all sorts of places — a notes app, a scratch markdown file, the back of a meeting doc. Right now, getting them into the til app means re-typing each entry by hand. For someone migrating a backlog of 40+ notes, this takes hours and introduces transcription errors.

Users have told us they sometimes don't bother capturing learnings at all because the friction of getting them in isn't worth it — the notes just stay scattered.

**The internal problem**

Every migration request becomes a manual cleanup job — pasting, reformatting, fixing tags. This doesn't scale as more people start using the app.

**The opportunity**

If users could paste or upload an existing document and have the individual notes extracted automatically (with a chance to review before saving), we'd remove the biggest friction point in adopting the app. Users would bring their whole backlog instead of starting from scratch.

**Ideas and approaches**

*Option A: Paste from clipboard.* User copies text from their notes app and pastes into a text area. We split on headings or blank lines. Simple, works for plain text, doesn't handle PDFs or rich formatting.

*Option B: File upload with AI extraction.* User uploads a markdown, PDF, or text file. An AI model extracts discrete notes and suggests tags. More powerful, handles more formats, but adds complexity and cost per extraction.

*Option C: Hybrid.* Start with paste-from-clipboard as the baseline. Add AI extraction for files as a second phase. This lets us ship something useful quickly and iterate.

The hybrid approach feels right — paste covers most cases (most people keep notes as plain text), and AI extraction can come later for the richer formats.

**User experience**

1. User is on the til list view
2. Clicks "Import notes"
3. Dialog opens with a paste area and (later) a file upload zone
4. User pastes their notes
5. Preview list shows extracted notes with title and suggested tags pre-filled
6. User reviews, edits, deletes, or adds notes
7. Clicks "Import" — notes are created

**Scope**

In scope: paste-from-clipboard extraction, preview and edit step, creating notes via existing mutations.

Out of scope: file upload, AI extraction, auto-tagging, duplicate detection. These are future enhancements.

**Open questions**

- What separators do we split on? Headings only, blank lines, or both?
- Should we try to auto-suggest tags from the note content, or leave that to the user?
- Do we preserve markdown formatting in the body, or strip to plain text?

**Future possibilities (out of scope)**

- AI extraction from PDFs and rich documents
- Auto-tagging based on note content
- Importing into other apps (journal, library) from the same flow
```
