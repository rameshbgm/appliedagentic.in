# Technical learning paths

The three technical paths sit beside Organizational Transformation:

| Path | Modules | Lessons | Outcome |
| --- | --- | --- | --- |
| Agentic AI Engineering | 8 | 24 | Build a useful agent with tools and grounded knowledge. |
| AI Evals | 8 | 24 | Build a repeatable evaluation suite and release report. |
| Agent Harness Engineering | 8 | 24 | Build a controlled, observable, resumable agent runtime. |

Source of truth: `content/learning-paths/<path>/curriculum.json` and its Markdown files. Each lesson includes a worked example, practice, completion criteria, primary references, related lesson links, SEO fields, tags and a technical figure. Curriculum validation enforces at least 650 words and two references per lesson.

The JSON manifests define globally unique menu, module and article slugs. Existing routes render the menu, module and article pages; no separate hardcoded navigation list is required. Readers can move through the entire path using the article previous/next links.

## Validate and render

```sh
node scripts/learning-paths.cjs --validate --links --diagrams
node --test tests/learning-paths.test.cjs
npm run build:prod
```

Original accessible SVG diagrams are saved beside each lesson. The diagram renderer creates 1200 × 800 PNG covers under ignored `logs/learning-paths/covers/`. The same figure appears in the written lesson with alternative text and an explanatory caption. Diagram sources are versioned; generated database media is not committed to Git.

## Stage, generate media and publish

Load the intended environment explicitly. Set `LEARNING_TARGET_DATABASE` to the exact database name, matching both `DATABASE_URL` and the database reported by the server. Never copy credentials into a manifest or commit an environment file.

```sh
LEARNING_TARGET_DATABASE=your_database \
  npx dotenv run -q -f .env.production -- node scripts/learning-paths.cjs --apply

LEARNING_TARGET_DATABASE=your_database FFMPEG_PATH=/absolute/path/to/ffmpeg \
  npx dotenv run -q -f .env.production -- node scripts/learning-paths.cjs --media

LEARNING_TARGET_DATABASE=your_database \
  npx dotenv run -q -f .env.production -- node scripts/learning-paths.cjs --verify --publish
```

`--apply` creates hidden menus/modules and draft articles in transactions. Existing matching imports are verified and skipped; conflicting slugs or altered source content cause a failure instead of an overwrite. The importer uses an existing article author and records a pre-import menu/count snapshot under ignored logs.

`--media` creates database-backed covers and full-lesson MP3 narration, attaches audio to both the article and its lesson section, and records a completed audio job. It uses `OPENAI_API_KEY`, `OPENAI_AUDIO_MODEL` (or `LEARNING_AUDIO_MODEL`) and `OPENAI_TTS_VOICE`. The default is the supported Realtime API with PCM output, encoded locally to 64 kbit/s MP3 by FFmpeg. `LEARNING_AUDIO_CONCURRENCY` controls workers, from one to four. Optionally set `LEARNING_MEDIA_PATHS` to a comma-separated list of path slugs to process a subset; final verification still checks all 72 lessons.

Narration uses a supplied `.narration.txt` adaptation when available. Otherwise it preserves the lesson's prose, removes link syntax/reference lists and directs listeners to written code examples. Each recording discloses its AI-generated voice. Chunks are checked for transcript coverage and plausible duration; source/model/voice fingerprints and audio checksums make interrupted runs resumable.

`--verify` compares database content, ordering, SEO and tags against the versioned sources and checks that image/audio bytes exist with the expected formats. `--publish` requires those checks before making all three menus, 24 modules and 72 articles visible. Publication changes only the imported records.

Generated files, audio transcripts, hashes, durations, reference URL results and database state reports stay under `logs/learning-paths/`. Keep these operational reports private; they are not application source.

## Publication dates

At the user's request, publication dates for all published articles are distributed across distinct Singapore calendar days from 1 January 2026 through the current day in 2026. These are editorially assigned dates, not recovered historical publication records. Creation and modification timestamps are retained. Article pages, cards and learning-path lists display publication dates in Asia/Singapore, and article structured data uses the same stored timestamps.

After publishing, preview the allocation with `scripts/learning-paths-dates.cjs`; add `--apply` to write it. Load the same explicit database environment and `LEARNING_TARGET_DATABASE` used for the importer. The script saves the previous dates and allocation under ignored logs and rejects future timestamps or insufficient distinct calendar days.

## Updating a published lesson

The initial importer deliberately refuses to overwrite an existing lesson with changed content. Review changes in Git, back up the affected database records and use the existing admin editor for an intentional update. Regenerate narration when text changes and update the corresponding source manifest. Do not bypass a mismatch by deleting unrelated articles or resetting the database.
