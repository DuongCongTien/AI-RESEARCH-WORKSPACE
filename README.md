# ResearchAI Studio Core - AI Research Workspace

A senior-grade, full-stack AI Research Workspace for multi-document synthesis, corpus indexing, semantic retrieval, and structured intelligence. Designed with Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, and Vercel AI SDK with real-time streaming responses.

---

## 1. Overview

**ResearchAI Studio Core** transforms research documents (PDF, DOCX, TXT, JSON) into an interactive, multi-agent intelligence workspace. Rather than returning raw unformatted text blocks, the workspace generates structured, decision-ready reports consisting of:
- **Executive Summaries**: High-level synthesis of complex literature.
- **Key Insights & Empirical Findings**: Verified factual breakthroughs and performance metrics.
- **Risk Assessment**: Categorized by severity (`low`, `medium`, `high`) with clear technical rationales.
- **Recommended Actions**: Concrete, phase-based engineering or research roadmaps.
- **Grounded Citations**: Direct document references with page numbers and exact quotes.

---

## 2. Features

### Corpus & Document Management (`/documents`)
- **Active Corpus Rail**: Real-time status tracker for all uploaded papers and datasets across 4 distinct states:
  - **Ready (Indexed)**: Complete with vector metrics, page counts, word counts, and index health.
  - **Processing**: Live extraction progress with multi-column table OCR and chunk-level tracking.
  - **Uploading**: Network transfer telemetry with transfer rate and ETA.
  - **Failed**: Diagnostics error banner, exit code inspection, and 1-click retry.
- **Search & Omnibar**: Instant search across filenames, tags, and document content with type, status, and sort filters.
- **Context Toggle Bar**: Granular control over which documents participate in the active LLM prompt context.
- **Quick Preview Drawer**: Docked slide-over drawer featuring Parsed Markdown view, Raw Text view, Extracted Tables preview, Vector Chunks inspection, and "Export Extracted Markdown" functionality.
- **Drag-and-Drop Ingestion**: Upload PDF, DOCX, TXT, or JSON files with automated text extraction and vector chunking.

### Multi-Agent Research Workspace (`/research` & `/research/[id]`)
- **Real-Time Streaming Responses**: Token-by-token streaming response using Server-Sent Events / chunked transfer.
- **Structured Report Components**:
  - `<SummaryCard />`: Core synthesis and executive summary with 1-click copy.
  - `<KeyPointsCard />`: Bulleted high-priority insights and findings.
  - `<RisksCard />`: Severity-coded risks with descriptions.
  - `<ActionsCard />`: Actionable implementation steps.
  - `<SourcesCard />`: Grounded citations with document names and page numbers.
- **Regenerate & Copy**: Ability to copy clean markdown or regenerate responses with the same grounding context.
- **Error Recovery State**: In-place error alerts with retry triggers if network or LLM tokens encounter issues.

### Dashboard & Analytics (`/dashboard` & `/`)
- **Active Telemetry**: Indexed tokens count (`text-embedding-3-large`), active corpus count, storage meter, and GAIA-v2 grounding score.
- **Instant Inquiry Omnibar**: Direct prompt bar to launch new research sessions from the home view.
- **Corpus & Syntheses Highlights**: Fast access to recent research inquiries and top indexed documents.

### Synthesis History (`/history`)
- **Chronological Grouping**: Sessions categorized into "Today", "Yesterday", and "Older".
- **Instant Search**: Filter past research sessions by title or inquiry.
- **One-Click Resumption**: Re-opens exact research context, message threads, and grounding files.

---

## 3. Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Components & Route Handlers)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 with custom Cyber-Research Design Tokens & Material Symbols
- **UI Components**: shadcn/ui architectural design, Base UI, Lucide React, Material Symbols Outlined
- **Database & ORM**: PostgreSQL with Prisma ORM (v6)
- **AI SDK**: Vercel AI SDK (`ai`), `@ai-sdk/openai`
- **File Parsers**: `pdf-parse` (PDF binary extraction), `mammoth` (DOCX extraction), Native text decode

---

## 4. Architecture

```
app/
├── globals.css               # Design tokens & Cyber-Research theme
├── layout.tsx                # Root layout with fonts (Geist, JetBrains Mono, Material Symbols)
├── page.tsx                  # Home redirect to dashboard
├── dashboard/page.tsx        # High-level analytics and quick launch
├── documents/page.tsx        # Complete documents hub with preview drawer
├── research/
│   ├── page.tsx              # Session initializer
│   └── [id]/page.tsx         # Interactive research session with streaming chat
├── history/page.tsx          # Chronological synthesis history archives
└── api/
    ├── documents/            # List, upload (multipart), delete
    │   └── [id]/route.ts     # Document details & PATCH context toggle
    ├── conversations/        # List & create sessions
    │   └── [id]/route.ts     # Get thread & delete
    └── chat/route.ts         # Real-time streaming AI response with structured payload

components/
├── layout/
│   ├── AppShell.tsx          # Responsive layout shell (Sidebar + Header + Mobile Drawer)
│   ├── Sidebar.tsx           # Fixed 72w navigation bar with quick documents & recent chats
│   ├── Header.tsx            # Model selector, Lab indicator, Theme & Telemetry toggles
│   └── MobileDrawer.tsx      # Slide-over sheet for tablet/mobile devices
├── documents/
│   ├── ActiveCorpusRail.tsx  # Sub-rail showing 4 document states & storage meter
│   ├── DocumentCard.tsx      # Multi-state card with metrics, context toggle, and actions
│   ├── DocumentFilters.tsx   # Search omnibar with type, status, and sort filters
│   ├── DocumentToolbar.tsx   # Multi-select, remove, and embedding stats pill
│   ├── DocumentPreviewDrawer.tsx # Right docked drawer with 4 tabs and markdown export
│   └── UploadDialog.tsx      # Drag-and-drop file ingestion modal
├── chat/
│   ├── ChatBox.tsx           # Main chat container with streaming indicator
│   ├── MessageItem.tsx       # Message bubble with Copy and Regenerate
│   └── EmptyState.tsx        # Initial suggested prompt cards
├── research/
│   ├── StructuredResponseView.tsx # Master structured view
│   ├── SummaryCard.tsx       # Executive synthesis card
│   ├── KeyPointsCard.tsx     # Key findings card
│   ├── RisksCard.tsx         # Severity-coded risks card
│   ├── ActionsCard.tsx       # Next steps roadmap card
│   └── SourcesCard.tsx       # Grounded citations card
└── ui/                       # Base UI & utility components

lib/
├── db/prisma.ts              # Global Prisma client singleton
├── documents/
│   ├── parser.ts             # PDF, DOCX, and plain text parsers
│   └── chunker.ts            # Text chunker with configurable overlap
└── ai/
    ├── openai.ts             # AI model client
    └── prompts.ts            # Research synthesis prompt templates
```

---

## 5. Database Schema (Prisma + PostgreSQL)

```prisma
model User {
  id            String         @id @default(cuid())
  name          String         @default("Dr. Elena Vance")
  email         String?        @unique
  role          String         @default("Lead Investigator")
  documents     Document[]
  conversations Conversation[]
  createdAt     DateTime       @default(now())
}

model Document {
  id                    String                 @id @default(cuid())
  name                  String
  fileType              String                 @default("pdf")
  fileSize              Int                    @default(0)
  pages                 Int                    @default(1)
  wordCount             Int                    @default(0)
  indexHealth           Float                  @default(98.4)
  status                String                 @default("ready")
  progress              Int                    @default(100)
  step                  String?
  inContext             Boolean                @default(true)
  textContent           String?                @db.Text
  parsedMarkdown        String?                @db.Text
  chunks                DocumentChunk[]
  conversationDocuments ConversationDocument[]
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
}

model DocumentChunk {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  chunkIndex Int
  content    String   @db.Text
  relevance  Float    @default(0.9)
  createdAt  DateTime @default(now())
}

model Conversation {
  id                    String                 @id @default(cuid())
  title                 String                 @default("New Research Chat")
  messages              Message[]
  conversationDocuments ConversationDocument[]
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // "user" | "assistant"
  content        String       @db.Text
  structuredData Json?
  createdAt      DateTime     @default(now())
}
```

---

## 6. AI Integration & Streaming Pipeline

1. **Request Ingestion**: User inquiry is received at `POST /api/chat` with `{ conversationId, documentIds, message }`.
2. **Context Assembly**: Active documents marked with `inContext: true` have their chunks retrieved and formatted into system prompt context.
3. **Chunked Streaming**: If `OPENAI_API_KEY` is present, `streamText` from the Vercel AI SDK streams response tokens to the client over a `ReadableStream`. In offline/demo mode, a realistic simulated token generator outputs stream tokens without network failure.
4. **Structured Object Serialization**: When the stream completes, a complete structured payload conforming to `ResearchResponse` is emitted as a `done` event.
5. **Persistence**: The completed message and structured data are persisted to PostgreSQL via Prisma.

---

## 7. Setup & Running Locally

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm
- (Optional) PostgreSQL database instance

### Installation
```bash
# Navigate to project directory
cd ai-research-workspace

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate
```

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your keys:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_research_db?schema=public"
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 8. AI Usage Documentation

In compliance with project guidelines, this section outlines where and how AI assisted during the migration process:

### AI Tools Utilized
- **DeepMind / Gemini Coding Agent**: Architecture planning, component migration, theme token synthesis, and TypeScript error resolution.

### Areas of AI Assistance
1. **Design System & Token Extraction**:
   - Analyzed the source HTML's embedded Tailwind configuration (`colors`, `fontFamily`, `fontSize`, `spacing`).
   - Mapped the Material 3 Dark Research theme directly into Tailwind v4 `@theme` variables (`--color-surface`, `--color-primary`, `--color-tertiary`, etc.) to guarantee 100% pixel fidelity.
2. **Component Decomposition**:
   - Decomposed monolithic HTML into reusable React components (`ActiveCorpusRail`, `DocumentCard`, `DocumentPreviewDrawer`, `DocumentFilters`, `DocumentToolbar`, `StructuredResponseView`).
3. **Streaming Route Implementation**:
   - Engineered the `ReadableStream` chunked transfer protocol in `app/api/chat/route.ts` ensuring both real OpenAI streaming and graceful fallback streaming function reliably.
4. **Debugging & Corrections**:
   - Caught a missing `onDelete` property mismatch in `DocumentCardProps` during the initial Next.js build. Corrected by making optional properties flexible across all document card consumers.
   - Identified Windows PowerShell script execution policy restrictions and used `npx.cmd` / `npm.cmd` explicitly to run builds cleanly.
