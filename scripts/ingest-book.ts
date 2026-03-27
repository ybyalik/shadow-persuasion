/**
 * Shadow Persuasion — Book Ingestion Pipeline
 * 
 * Ingests PDF/text books into the RAG knowledge base.
 * 
 * Usage:
 *   npx tsx scripts/ingest-book.ts <file-path> --title "Book Title" --author "Author Name"
 * 
 * Supported formats: .txt, .md, .pdf (requires pdf-parse)
 * 
 * What it does:
 *   1. Reads the book file
 *   2. Splits into semantic chunks (~500-1000 tokens each)
 *   3. Uses OpenRouter to extract technique metadata per chunk
 *   4. Generates embeddings via OpenRouter
 *   5. Stores everything in Supabase pgvector
 * 
 * Environment variables needed (from .env.local):
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   OPENROUTER_API_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Text extraction ---

async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.txt' || ext === '.md') {
    return fs.readFileSync(filePath, 'utf-8');
  }
  
  if (ext === '.pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    } catch (e) {
      console.error('pdf-parse not installed. Run: npm install pdf-parse');
      process.exit(1);
    }
  }
  
  throw new Error(`Unsupported file format: ${ext}. Use .txt, .md, or .pdf`);
}

// --- Chunking ---

function chunkText(text: string, maxTokens: number = 800): string[] {
  // Split by paragraphs first, then combine into chunks
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const para of paragraphs) {
    const estimatedTokens = (currentChunk + '\n\n' + para).split(/\s+/).length;
    
    if (estimatedTokens > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// --- OpenRouter calls ---

async function callOpenRouter(messages: any[], model: string = 'anthropic/claude-sonnet-4-20250514'): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature: 0.2 }),
  });
  
  if (!res.ok) {
    throw new Error(`OpenRouter error: ${res.status} ${await res.text()}`);
  }
  
  const data = await res.json();
  return data.choices[0].message.content;
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: text,
    }),
  });
  
  if (!res.ok) {
    throw new Error(`Embedding error: ${res.status} ${await res.text()}`);
  }
  
  const data = await res.json();
  return data.data[0].embedding;
}

async function extractMetadata(chunk: string, bookTitle: string, author: string) {
  const prompt = `Analyze this text excerpt from "${bookTitle}" by ${author}. Extract:

1. technique_name: The main technique or concept discussed (or "General" if none specific)
2. technique_id: A slug version (e.g., "reciprocity", "door-in-the-face")
3. category: One of: influence, persuasion, negotiation, body_language, nlp, social_dynamics, power_strategy, dark_psychology, defense
4. subcategory: More specific classification
5. chunk_type: One of: technique_overview, technique_application, example, framework, exercise
6. difficulty: One of: beginner, intermediate, advanced
7. use_cases: Array of applicable situations (e.g., ["sales", "negotiation", "dating"])
8. risk_level: One of: low, medium, high
9. related_techniques: Array of related technique names

Respond ONLY with valid JSON, no markdown:

Text:
${chunk.slice(0, 2000)}`;

  const response = await callOpenRouter([
    { role: 'system', content: 'You are a metadata extraction assistant. Respond only with valid JSON.' },
    { role: 'user', content: prompt }
  ], 'anthropic/claude-sonnet-4-20250514');
  
  try {
    // Strip markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('Failed to parse metadata, using defaults');
    return {
      technique_name: 'General',
      technique_id: 'general',
      category: 'influence',
      subcategory: null,
      chunk_type: 'technique_overview',
      difficulty: 'beginner',
      use_cases: [],
      risk_level: 'low',
      related_techniques: []
    };
  }
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
Shadow Persuasion — Book Ingestion Pipeline

Usage:
  npx tsx scripts/ingest-book.ts <file-path> --title "Book Title" --author "Author Name"

Options:
  --title   Book title (required)
  --author  Author name (required)
  --dry-run Show what would be ingested without writing to DB

Examples:
  npx tsx scripts/ingest-book.ts ./books/influence.txt --title "Influence" --author "Robert Cialdini"
  npx tsx scripts/ingest-book.ts ./books/48-laws.pdf --title "48 Laws of Power" --author "Robert Greene"
`);
    process.exit(0);
  }
  
  const filePath = args[0];
  const titleIdx = args.indexOf('--title');
  const authorIdx = args.indexOf('--author');
  const dryRun = args.includes('--dry-run');
  
  if (titleIdx === -1 || authorIdx === -1) {
    console.error('Both --title and --author are required');
    process.exit(1);
  }
  
  const title = args[titleIdx + 1];
  const author = args[authorIdx + 1];
  
  console.log(`\n📖 Ingesting: "${title}" by ${author}`);
  console.log(`   File: ${filePath}\n`);
  
  // Step 1: Extract text
  console.log('1/5 Extracting text...');
  const text = await extractText(filePath);
  console.log(`   → ${text.length} characters extracted`);
  
  // Step 2: Chunk
  console.log('2/5 Chunking text...');
  const chunks = chunkText(text);
  console.log(`   → ${chunks.length} chunks created`);
  
  if (dryRun) {
    console.log('\n--- DRY RUN ---');
    chunks.slice(0, 3).forEach((c, i) => {
      console.log(`\nChunk ${i + 1} (${c.split(/\s+/).length} words):`);
      console.log(c.slice(0, 200) + '...');
    });
    console.log(`\n... and ${chunks.length - 3} more chunks`);
    process.exit(0);
  }
  
  // Step 3-5: Process each chunk
  let successCount = 0;
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const progress = `[${i + 1}/${chunks.length}]`;
    
    try {
      // Step 3: Extract metadata
      process.stdout.write(`\r3/5 Extracting metadata... ${progress}`);
      const metadata = await extractMetadata(chunk, title, author);
      
      // Step 4: Generate embedding
      process.stdout.write(`\r4/5 Generating embedding... ${progress}`);
      const embedding = await getEmbedding(chunk);
      
      // Step 5: Insert into Supabase
      process.stdout.write(`\r5/5 Storing in database... ${progress}`);
      const { error } = await supabase.from('knowledge_chunks').insert({
        book_title: title,
        author: author,
        chapter: null,
        section: metadata.technique_name,
        chunk_type: metadata.chunk_type,
        technique_name: metadata.technique_name,
        technique_id: metadata.technique_id,
        category: metadata.category,
        subcategory: metadata.subcategory,
        difficulty: metadata.difficulty,
        use_cases: metadata.use_cases,
        risk_level: metadata.risk_level,
        related_techniques: metadata.related_techniques,
        content: chunk,
        token_count: chunk.split(/\s+/).length,
        embedding: embedding,
      });
      
      if (error) {
        console.error(`\n   ❌ DB error on chunk ${i + 1}:`, error.message);
      } else {
        successCount++;
      }
      
      // Rate limit: ~2 requests per second
      await new Promise(r => setTimeout(r, 500));
      
    } catch (e: any) {
      console.error(`\n   ❌ Error on chunk ${i + 1}:`, e.message);
    }
  }
  
  console.log(`\n\n✅ Done! Ingested ${successCount}/${chunks.length} chunks from "${title}"`);
  console.log(`   Database: ${SUPABASE_URL}`);
  console.log(`   Table: knowledge_chunks\n`);
}

main().catch(console.error);
