# Showrunner

**AI that remembers.** An AI writers' room that generates episodic content while maintaining persistent memory of characters, world rules, and plot threads across every episode.

Built for the [Qwen Cloud AI Hackathon](https://qwencloud.devpost.com/) — deadline July 9, 2026.

## What it does

Showrunner writes production-ready episodes (script + shot list + director brief) using a **two-call Qwen architecture**:

1. **Context Packet** — Before every generation, the app builds a structured memory packet from the database: show bible, character traits, open plot threads, and a summary of the last episode.
2. **Qwen Call 1 (Write)** — Sends the context packet to `qwen-max`. Returns a full episode as structured JSON: script, shot list with framing types, and a director brief.
3. **Qwen Call 2 (Check)** — A second Qwen call acts as a continuity editor. It compares the new episode against the stored bible and flags contradictions by type and severity.
4. **Persist** — The episode and any continuity flags are saved to Postgres. The next generation automatically incorporates everything that came before.

This is not a chatbot wrapper. It's a memory-first pipeline where the AI checks its own work.

## Architecture

```
User → Context Packet → Qwen (write) → Qwen (check) → Postgres → Dashboard
```

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** Next.js 16 + React 19 + Tailwind CSS
- **Database:** PostgreSQL (shows, characters, plot_threads, episodes, continuity_flags)
- **AI:** Qwen-Max via Alibaba Cloud Model Studio

## Project structure

```
showrunner/
├── backend/
│   └── src/
│       ├── db/           # schema.sql, pool.ts
│       ├── routes/       # shows.ts, episodes.ts
│       ├── services/     # contextPacket.ts, qwenClient.ts, continuityCheck.ts
│       └── server.ts
├── frontend/
│   ├── app/              # Next.js pages
│   ├── components/       # EpisodeCard, ShowBible, ContinuityFlagBadge, etc.
│   └── lib/              # API client
└── README.md
```

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Qwen API key from [Alibaba Cloud Model Studio](https://www.alibabacloud.com/en/solutions/generative-ai/qwen)

### 1. Clone and install

```bash
git clone https://github.com/eyere7/showrunner.git
cd showrunner

cd backend && npm install
cd ../frontend && npm install
```

### 2. Create the database

```bash
psql -U postgres
CREATE DATABASE showrunner;
\q

psql -U postgres -d showrunner -f backend/src/db/schema.sql
```

### 3. Seed demo data

```sql
psql -U postgres -d showrunner

INSERT INTO shows (title, genre, tone, premise)
VALUES ('The Lagos Chronicles', 'drama', 'gritty and real',
  'Three ambitious young professionals navigate loyalty, ambition, and survival in Lagos');

INSERT INTO characters (show_id, name, traits, arc_status)
VALUES
  (1, 'Emeka', ARRAY['ambitious','secretly afraid of failure'], 'emerging'),
  (1, 'Zara', ARRAY['street smart','distrusts authority'], 'emerging');

INSERT INTO plot_threads (show_id, description, status)
VALUES (1, 'Emeka owes a dangerous man money', 'open');
```

### 4. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
DATABASE_URL=postgresql://youruser@localhost:5432/showrunner
QWEN_API_KEY=your_key_here
QWEN_ENDPOINT=https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions
PORT=4000
```

### 5. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/shows` | Create a show |
| POST | `/shows/:id/characters` | Add a character |
| POST | `/shows/:id/threads` | Add a plot thread |
| GET | `/shows/:id/bible` | Full show bible |
| GET | `/shows/:id/context-packet` | Context packet for AI |
| POST | `/shows/:id/episodes/generate` | Generate next episode |
| GET | `/shows/:id/episodes` | List all episodes |
| GET | `/episodes/:id/flags` | Continuity flags for episode |

## The continuity engine

The hero feature. After every episode is generated, a second Qwen call reviews the new script against the show bible and checks for:

- **Character contradictions** — acting against established traits
- **Unresolved threads** — plot lines dropped without acknowledgment
- **Tone drift** — inconsistency with the show's established tone
- **Fact reversals** — contradicting events from previous episodes

Each flag includes a type, description, and severity (low / medium / high). High-severity flags appear as red badges on the dashboard.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Express 5, TypeScript |
| Database | PostgreSQL |
| AI Model | Qwen-Max (Alibaba Cloud Model Studio) |
| Deployment | Alibaba Cloud ECS |

## License

MIT
