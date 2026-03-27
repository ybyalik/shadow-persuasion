# Shadow Persuasion — Scripts

## Book Ingestion Pipeline

Ingest books into the RAG knowledge base for the AI coach.

### Setup

```bash
cd /root/.openclaw/projects/shadow-persuasion
npm install pdf-parse   # only needed for PDF files
```

### Usage

```bash
# Text/Markdown files
npx tsx scripts/ingest-book.ts ./books/influence.txt --title "Influence" --author "Robert Cialdini"

# PDF files
npx tsx scripts/ingest-book.ts ./books/48-laws.pdf --title "48 Laws of Power" --author "Robert Greene"

# Dry run (see chunks without writing to DB)
npx tsx scripts/ingest-book.ts ./books/influence.txt --title "Influence" --author "Robert Cialdini" --dry-run
```

### What it does

1. **Extracts text** from PDF, TXT, or MD files
2. **Chunks** into ~500-800 token segments (paragraph-aware)
3. **Extracts metadata** per chunk via Claude (technique name, category, difficulty, use cases)
4. **Generates embeddings** via OpenAI text-embedding-3-small
5. **Stores** in Supabase pgvector (`knowledge_chunks` table)

### Supported formats
- `.txt` — plain text
- `.md` — markdown
- `.pdf` — requires `pdf-parse` package

### Cost estimate
- ~30 books × ~15 chapters × ~5 chunks = ~2,250 chunks
- Metadata extraction: ~2,250 Claude Sonnet calls ≈ $2-3
- Embeddings: ~2,250 embedding calls ≈ $0.10
- **Total: ~$3-4 for the entire library**

### Database schema

The `knowledge_chunks` table in Supabase:
- `content` — the actual text chunk
- `embedding` — 1536-dim vector for similarity search
- `technique_name` — extracted technique (e.g., "Reciprocity")
- `category` — influence, persuasion, negotiation, etc.
- `book_title` / `author` — source attribution
- `use_cases` — applicable scenarios
- `difficulty` / `risk_level` — classification

### How it's used in the app

The AI chat API (`/api/chat`) can query the knowledge base:
```sql
SELECT * FROM match_chunks(
  query_embedding := <user_question_embedding>,
  match_threshold := 0.7,
  match_count := 5
);
```

This returns the 5 most relevant book passages, which get injected into the AI prompt as context.

### Place your books here

```
shadow-persuasion/
  books/           ← create this folder, put your files here
    influence.pdf
    48-laws.txt
    never-split.pdf
    ...
```
