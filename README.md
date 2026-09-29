# ResearchAI Studio Core — AI Research Workspace

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-v6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-v7-black?style=for-the-badge&logo=vercel)](https://sdk.vercel.ai/)
[![Tests Passing](https://img.shields.io/badge/Tests-69%20Passed-success?style=for-the-badge&logo=jest)](https://jestjs.io/)

**ResearchAI Studio Core** là không gian làm việc và nghiên cứu đa tài liệu chuyên sâu (Multi-Document Synthesis Workspace). Nền tảng cho phép tải lên, bóc tách và đối chiếu đồng thời nhiều tài liệu kỹ thuật, báo cáo khoa học (PDF, DOCX, TXT), sau đó chuyển hóa thành các báo cáo tổng hợp có cấu trúc chuẩn hóa, được trích dẫn nguồn xác thực và truyền tải theo thời gian thực (Real-Time Streaming).

---

## 📌 Liên kết tài liệu chuyên sâu

- 🏛️ **Bản mô tả kiến trúc kỹ thuật chi tiết:** [ARCHITECTURE.md](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/ARCHITECTURE.md)
- 🤖 **Báo cáo sử dụng AI, bài học & khắc phục lỗi:** [AI_USAGES.md](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/AI_USAGES.md)

---

## Mục lục

1. [Vấn đề & Thách thức thực tế (Problem)](#1-vấn-đề--thách-thức-thực-tế-problem)
2. [Giải pháp toàn diện (Solution)](#2-giải-pháp-toàn-diện-solution)
3. [Kiến trúc hệ thống (Architecture)](#3-kiến-trúc-hệ-thống-architecture)
4. [Ứng dụng Trí tuệ nhân tạo (AI Usage)](#4-ứng-dụng-trí-tuệ-nhân-tạo-ai-usage)
5. [Hạn chế hiện tại & Định hướng mở rộng (Limitations)](#5-hạn-chế-hiện-tại--định-hướng-mở-rộng-limitations)
6. [Công nghệ sử dụng (Tech Stack)](#6-công-nghệ-sử-dụng-tech-stack)
7. [Hướng dẫn cài đặt & Khởi chạy (Installation & Setup)](#7-hướng-dẫn-cài-đặt--khởi-chạy-installation--setup)
8. [Cấu trúc mã nguồn (Project Structure)](#8-cấu-trúc-mã-nguồn-project-structure)

---

## 1. Vấn đề & Thách thức thực tế (Problem)

Trong kỷ nguyên bùng nổ dữ liệu và nghiên cứu kỹ thuật, các nhà nghiên cứu, kỹ sư phần mềm và nhà quản lý thường xuyên đối mặt với các rào cản nghiêm trọng:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           CÁC VẤN ĐỀ TRỌNG TÂM CẦN GIẢI QUYẾT                    │
├─────────────────────┬──────────────────────┬─────────────────────────────────────┤
│ 1. Quá tải tài liệu │ 2. Phản hồi LLM dạng │ 3. Nguy cơ ảo giác (Hallucination)  │
│    và phân mảnh     │    văn bản thô       │    và thiếu căn cứ trích dẫn        │
│ Hàng trăm trang PDF │ Trả lời dài dòng,    │ LLM tự bịa số liệu, trích dẫn sai   │
│ DOCX phức tạp, khó  │ thiếu cấu trúc, khó  │ số trang, không thể kiểm chứng lại  │
│ đối chiếu chéo      │ ứng dụng ngay        │ trong tài liệu gốc                  │
├─────────────────────┼──────────────────────┼─────────────────────────────────────┤
│ 4. Bỏ sót rủi ro kỹ │ 5. Trễ phản hồi cao  │ 6. Hạ tầng phụ thuộc dễ sập         │
│    thuật & giải pháp│    và giới hạn token │    (Single Point of Failure)        │
│ Không phân cấp được │ Chờ đợi lâu khi đọc  │ Ứng dụng sập khi mất kết nối mạng,  │
│ rủi ro và các bước  │ văn bản lớn nếu      │ lỗi PostgreSQL hoặc hết quota API   │
│ thực thi chi tiết   │ không có streaming   │                                     │
└─────────────────────┴──────────────────────┴─────────────────────────────────────┘
```

1. **Quá tải thông tin và phân mảnh tài liệu:** Các nghiên cứu chuyên sâu thường phân bổ rải rác trên nhiều tài liệu định dạng khác nhau (báo cáo PDF nhiều cột, văn bản DOCX kỹ thuật, bảng dữ liệu JSON, tài liệu ghi chép TXT). Việc đọc và tổng hợp thủ công tiêu tốn hàng chục giờ làm việc.
2. **Phản hồi của AI thông thường thiếu cấu trúc:** Các chatbot AI phổ biến chỉ trả về các khối văn bản thô (unstructured text blocks). Khi cần ra quyết định kỹ thuật, người dùng cần một báo cáo mạch lạc gồm tóm tắt điều hành, chỉ số then chốt, rủi ro tiềm ẩn và các bước hành động cụ thể.
3. **Hiện tượng ảo giác (Hallucination) và thiếu trích dẫn căn cứ:** LLM có xu hướng tự tạo ra dữ liệu không có thật nếu không được ràng buộc chặt chẽ vào ngữ cảnh tài liệu (Grounding), gây mất tin cậy trong các quyết định kỹ thuật trọng yếu.
4. **Bỏ sót rủi ro kỹ thuật và thiếu lời giải trực tiếp:** Khi người dùng đưa tài liệu bài tập, đặc tả hệ thống hoặc thuật toán, AI thông thường chỉ tóm tắt hời hợt vài gạch đầu dòng thay vì cung cấp lời giải đầy đủ, phân tích trường hợp biên và mã nguồn hoàn chỉnh.
5. **Độ trễ và rào cản hạ tầng:** Việc gửi toàn bộ tài liệu dung lượng lớn qua API thường gây trễ phản hồi lâu nếu không có giao thức Streaming từng token. Hơn nữa, các hệ sinh thái demo thường bị crash hoàn toàn nếu cơ sở dữ liệu hoặc API Key gặp sự cố.

---

## 2. Giải pháp toàn diện (Solution)

**ResearchAI Studio Core** giải quyết triệt để các vấn đề trên thông qua một nền tảng nghiên cứu tài liệu thông minh, tích hợp sâu:

### 2.1 Bóc tách tài liệu đa định dạng với kiến trúc Worker cách ly
- Hỗ trợ tải lên và xử lý tự động các tệp `.pdf`, `.docx`, `.txt`, `.md`, `.json` lên đến 25MB.
- **Cách ly tiến trình (Worker Isolation):** Sử dụng Node.js child process chuyên biệt ([lib/documents/pdf-worker-runner.cjs](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/documents/pdf-worker-runner.cjs)) để bóc tách tệp PDF nhị phân, giải quyết triệt để xung đột module với Next.js Turbopack và hỗ trợ font tiếng Việt với bảng mã `/ToUnicode` CMap và UTF-16BE.
- **Phân đoạn thích ứng (Adaptive Chunking):** Thuật toán cửa sổ trượt (Sliding Window: 1000 ký tự, 200 ký tự overlap) bảo toàn ngữ nghĩa tại các ranh giới câu.

### 2.2 Quản trị ngữ cảnh linh hoạt (Active Corpus Rail & Context Toggle)
- Cho phép người dùng bật/tắt chính xác tài liệu nào sẽ tham gia vào ngữ cảnh truy vấn (`inContext: boolean`) chỉ với 1 click.
- Ngăn ngừa tình trạng loãng ngữ cảnh và tối ưu chi phí token khi người dùng chỉ muốn tập trung vào một tập tài liệu cụ thể.
- Ngăn xem trước nhanh ([DocumentPreviewDrawer.tsx](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/components/documents/DocumentPreviewDrawer.tsx)) hỗ trợ xem Markdown đã trích xuất, văn bản thô, danh sách bảng biểu và phân đoạn vector chunks kèm nút xuất file Markdown.

### 2.3 Chuẩn hóa Báo cáo Nghiên cứu có cấu trúc (`ResearchResponse`)
Mọi phản hồi từ hệ thống bắt buộc phải tuân thủ hợp đồng dữ liệu nghiêm ngặt ([types/research.ts](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/types/research.ts)), hiển thị trực quan qua 5 thành phần chuyên biệt:
- **`<SummaryCard />` (Bản tổng hợp điều hành / Lời giải chi tiết):** Đưa ra câu trả lời trực tiếp, đầy đủ cho bài toán, bao gồm phân tích thuật toán từng bước và **khối mã nguồn Markdown hoàn chỉnh (runnable code blocks)** có chú thích rõ ràng.
- **`<KeyPointsCard />` (Phát hiện cốt lõi):** Các phát hiện thực nghiệm, công thức và thông số kỹ thuật then chốt được trích xuất từ tài liệu.
- **`<RisksCard />` (Ma trận rủi ro):** Nhận diện lỗi logic, ngoại lệ biên (như tràn số, chuỗi rỗng, lỗi mảng, độ trôi mô hình...) được mã hóa màu theo cấp độ nghiêm trọng (`low`, `medium`, `high`) kèm giải pháp khắc phục.
- **`<ActionsCard />` (Lộ trình hành động):** Hướng dẫn từng bước triển khai kỹ thuật cụ thể.
- **`<SourcesCard />` (Căn cứ trích dẫn chính xác):** Trích dẫn minh bạch ID tài liệu, tên file, số trang chính xác và đoạn văn bản trích dẫn nguyên văn (excerpt), triệt tiêu hoàn toàn hiện tượng ảo giác.

### 2.4 Truyền tải thời gian thực (Real-Time Streaming via SSE)
- Sử dụng chuẩn `ReadableStream` và Server-Sent Events (SSE) để truyền từng token phản hồi trực tiếp tới giao diện người dùng theo thời gian thực.
- Người dùng nhận được phản hồi ngay lập tức sau vài mili-giây, kèm theo trạng thái chỉ báo tiến độ gõ sinh động.

### 2.5 Kiến trúc Chịu lỗi Kép (Dual-Mode Resilience)
- **Tầng dữ liệu:** Tự động kiểm tra cổng kết nối TCP PostgreSQL trong 300ms ([lib/prisma.ts](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/prisma.ts)). Nếu database online, ghi dữ liệu qua Prisma ORM; nếu database offline, tự động chuyển đổi sang bộ nhớ đệm trong RAM ([lib/documents/cache.ts](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/documents/cache.ts)).
- **Tầng AI:** Hỗ trợ linh hoạt Google Gemini và OpenAI. Nếu không có khóa API nào được thiết lập, hệ thống kích hoạt bộ sinh ngoại tuyến (`Deterministic Fallback Generator`) mô phỏng tốc độ gõ phím chân thực, giúp môi trường kiểm thử và chấm điểm luôn hoạt động trơn tru.

---

## 3. Kiến trúc hệ thống (Architecture)

Hệ thống được thiết kế theo mô hình **Layered Architecture** với nguyên tắc phân tách trách nhiệm rõ ràng (Separation of Concerns):

```mermaid
flowchart TB
    subgraph ClientLayer["1. TẦNG GIAO DIỆN (Presentation Layer)"]
        UI_Dash["/dashboard - Tổng quan & Telemetry"]
        UI_Docs["/documents - Active Corpus Rail & Preview Drawer"]
        UI_Research["/research/[id] - Multi-Turn Streaming Chat"]
        UI_Hist["/history - Lịch sử tổng hợp & Tìm kiếm"]
    end

    subgraph RouteLayer["2. TẦNG ĐIỀU PHỐI (Next.js 16 Route Handlers)"]
        API_Chat["POST /api/chat (ReadableStream SSE)"]
        API_Docs["GET/POST/DELETE /api/documents"]
        API_Conv["GET/POST/DELETE /api/conversations"]
    end

    subgraph CoreEngine["3. TẦNG SUY LUẬN & XỬ LÝ (Domain Core)"]
        subgraph AIEngine["AI Synthesis Engine"]
            Dispatcher["runResearchStream()"]
            PromptEng["DAY2_SYSTEM_PROMPT & ContextBuilder"]
            SafeParser["safeParseResearchResponse() (4-Stage Rescue)"]
            SourceValidator["validateAndMapSources()"]
            FallbackGen["buildDeterministicResponse()"]
        end
        subgraph DocEngine["Document Ingestion Pipeline"]
            DocProc["processDocumentFile()"]
            PDFWorker["extractPdfWithWorker() (Child Process)"]
            DocxParser["Mammoth DOCX Parser"]
            Chunker["chunkText() (Sliding Window)"]
        end
    end

    subgraph StorageLayer["4. TẦNG LƯU TRỮ LAI (Dual-Mode Persistence)"]
        HealthCheck["isDatabaseAvailable() (Socket Ping 300ms)"]
        PrismaORM["Prisma Client v6"]
        Postgres[(PostgreSQL DB)]
        MemCache["In-Memory Hybrid Cache"]
    end

    subgraph AIProviders["5. NHÀ CUNG CẤP AI (External Providers)"]
        Gemini["Google Gemini (3.8-flash, 3.1-flash-lite)"]
        OpenAI["OpenAI (gpt-4o, gpt-4o-mini)"]
    end

    ClientLayer --> RouteLayer
    RouteLayer --> CoreEngine
    Dispatcher --> AIProviders
    Dispatcher --> StorageLayer
    DocProc --> StorageLayer
    HealthCheck -- "Online" --> PrismaORM --> Postgres
    HealthCheck -- "Offline" --> MemCache
```

> 📖 **Xem bản phân tích kiến trúc chi tiết, sơ đồ C4 và sequence diagrams tại:**  
> 👉 [ARCHITECTURE.md](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/ARCHITECTURE.md)

---

## 4. Ứng dụng Trí tuệ nhân tạo (AI Usage)

Dự án áp dụng quy trình kỹ thuật **Human-in-the-Loop AI Collaboration**:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   ỨNG DỤNG AI TRONG TOÀN BỘ VÒNG ĐỜI DỰ ÁN                       │
├────────────────────────────────────────┬─────────────────────────────────────────┤
│ 1. AI THIẾT KẾ & PHÁT TRIỂN            │ 2. AI TRONG TÍNH NĂNG LÕI (Core Product)│
├────────────────────────────────────────┼─────────────────────────────────────────┤
│ • Stitch AI (stitchAI): Tạo bản thiết  │ • Gemini AI (Google Gemini API:         │
│   kế giao diện mẫu (UI Prototype/Wire) │   gemini-3.8-flash, 3.1-flash-lite)     │
│ • DeepMind Antigravity / Coding Agent  │ • ChatGPT / OpenAI (gpt-4o, gpt-4o-mini)│
│   (Gemini 3.8 Flash High-reasoning)    │ • Vercel AI SDK: Luồng streaming SSE    │
│ • ChatGPT & Gemini AI: Tư vấn kiến trúc│ • Đọc hiểu đa tài liệu & bảng biểu      │
│   và thiết kế Prompt Engineering       │ • Báo cáo có cấu trúc JSON 100% tiếng V │
│ • Thiết kế 69 bài test Jest tự động    │ • Lời giải chi tiết + Code block runnable│
└────────────────────────────────────────┴─────────────────────────────────────────┘
```

### Các đóng góp & kinh nghiệm xử lý lỗi AI tiêu biểu:
1. **Khắc phục lỗi Jest với thư viện Pure ESM:** Xây dựng hệ thống module mocks tùy biến trong `lib/__mocks__/` và cấu hình `moduleNameMapper` để vượt qua giới hạn của Jest trên Node.js.
2. **Bộ giải cứu cú pháp JSON 4 tầng (`safeParseResearchResponse`):** Xử lý triệt để hiện tượng LLM bọc markdown code fences hoặc sinh ký tự xuống dòng thô trong mã nguồn markdown.
3. **Triệt tiêu ảo giác trích dẫn:** Thuật toán `validateAndMapSources` kiểm tra chéo ID tài liệu và tên file thực tế trước khi xuất bản báo cáo.

> 📖 **Xem báo cáo chi tiết về công cụ AI, 6 ca lỗi kinh điển và cách xử lý tại:**  
> 👉 [AI_USAGES.md](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/AI_USAGES.md)

---

## 5. Hạn chế hiện tại & Định hướng mở rộng (Limitations)

Mặc dù hệ thống đã hoạt động ổn định và vượt qua toàn bộ 69 ca kiểm thử tự động, dự án vẫn ghi nhận các giới hạn kỹ thuật hiện tại cùng định hướng hoàn thiện:

### Hạn chế hiện tại:
1. **Xử lý tài liệu PDF Scan / Viết tay thuần ảnh:**
   - Hệ thống hiện tại trích xuất văn bản dựa trên lớp ký tự số hóa (digital text layer) của PDF. Đối với các tệp scan thuần túy bằng máy quét hình ảnh không có lớp văn bản (OCR text layer), hệ thống sẽ cảnh báo tệp không chứa văn bản đọc được thay vì cố gắng nhận diện ký tự quang học.
2. **Giới hạn cửa sổ ngữ cảnh khi nạp số lượng lớn tài liệu:**
   - Phiên bản hiện tại truyền tải toàn bộ văn bản của các tài liệu được chọn (`inContext: true`) vào prompt của LLM. Khi người dùng chọn đồng thời hàng chục tài liệu dài hàng trăm trang, dung lượng token có thể tiến sát giới hạn ngữ cảnh của mô hình.
3. **Cấu trúc bảng biểu phức tạp (Merged Cells):**
   - Với các bảng biểu trong PDF có cấu trúc ô gộp phức tạp hoặc thiếu đường kẻ ranh giới cột, bộ phân giải có thể chuyển đổi thành chuỗi văn bản dòng thay vì bảng Markdown phân cột hoàn hảo.
4. **Mô hình định danh người dùng đơn (Single Default User):**
   - Phiên bản hiện tại phục vụ nghiên cứu cá nhân với hồ sơ mặc định ("Dr. Elena Vance"), chưa tích hợp hệ thống xác thực tài khoản nhiều người dùng (Multi-tenant OAuth).

### Định hướng phát triển tương lai (Roadmap):
- [ ] **Tích hợp OCR Tesseract / Google Cloud Vision:** Nhận diện ký tự quang học cho các tài liệu scan cũ và bản thảo viết tay.
- [ ] **Lập chỉ mục Vector chuyên dụng (`pgvector` / Pinecone):** Áp dụng Semantic Retrieval để chỉ gửi các phân đoạn (chunks) liên quan nhất vào LLM thay vì toàn bộ tài liệu, cho phép tra cứu trên kho lưu trữ hàng triệu trang.
- [ ] **Xác thực đa người dùng (Multi-Tenancy with NextAuth / Supabase):** Phân quyền vai trò Lead Investigator, Research Associate, và quản lý không gian tài liệu theo từng dự án nhóm.
- [ ] **Mở rộng tính năng tìm kiếm Agentic Web Grounding:** Cho phép AI tự động tra cứu thêm các bài báo khoa học mới nhất từ arXiv, PubMed để đối chiếu với tài liệu nội bộ.

---

## 6. Công nghệ sử dụng (Tech Stack)

| Phân hệ | Công nghệ | Phiên bản | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `16.3.6` | Server Components, Turbopack, Streaming Handlers |
| **Giao diện** | React | `19.2.8` | React Server Actions, Concurrent Mode |
| **Ngôn ngữ** | TypeScript | `5.0+` | Chế độ kiểm tra kiểu nghiêm ngặt (Strict Mode) |
| **Định kiểu (CSS)** | Tailwind CSS | `v4` | Hệ thống Cyber-Research Design Tokens `@theme` |
| **Biểu tượng** | Lucide React | `1.48.0` | Material Symbols Outlined |
| **Cơ sở dữ liệu** | PostgreSQL | `15+` | Quản trị quan hệ dữ liệu nghiên cứu |
| **Tầng ORM** | Prisma ORM | `6.4.1` | Type-safe Database Client |
| **AI Integration** | Vercel AI SDK | `ai` 7.x | `@ai-sdk/google`, `@ai-sdk/openai` |
| **Trích xuất tệp** | `mammoth`, `pdf-parse` | Mới nhất | Node.js Worker Process cách ly |
| **Kiểm định Schema**| Zod | `4.x` | Ràng buộc hợp đồng dữ liệu `ResearchResponse` |
| **Kiểm thử (QA)** | Jest & ts-jest | `30.5.2` | 69 unit tests tự động hóa |

---

## 7. Hướng dẫn cài đặt & Khởi chạy (Installation & Setup)

### Yêu cầu tiên quyết
- **Node.js:** Phiên bản `18.x`, `20.x` hoặc mới hơn.
- **Trình quản lý gói:** `npm` (đi kèm Node.js) hoặc `pnpm`.
- **Cơ sở dữ liệu (Tùy chọn):** PostgreSQL (Nếu không có, hệ thống tự động chạy trên In-Memory Hybrid Cache).

### Bước 1: Sao chép mã nguồn và cài đặt dependencies
```bash
git clone https://github.com/DuongCongTien/AI-RESEARCH-WORKSPACE.git
cd ai-research-workspace
npm install
```

### Bước 2: Cấu hình biến môi trường
Tạo tệp `.env.local` từ mẫu `.env.example`:
```bash
cp .env.example .env.local
```

Cập nhật thông tin cấu hình trong tệp `.env.local`:
```env
# Cơ sở dữ liệu PostgreSQL (Tùy chọn - Tự động fallback RAM nếu chưa bật)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_research_db?schema=public"

# Khóa API trí tuệ nhân tạo (Google Gemini hoặc OpenAI)
GEMINI_API_KEY="AIzaSy..."
# Hoặc: OPENAI_API_KEY="sk-..."

# Cấu hình máy chủ
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Ghi chú:** Nếu không điền `GEMINI_API_KEY` hay `OPENAI_API_KEY`, ứng dụng sẽ tự động kích hoạt **Deterministic Fallback Engine** để người dùng vẫn trải nghiệm đầy đủ giao diện và tính năng.

### Bước 3: Khởi tạo Prisma Client
```bash
npx prisma generate
```
*(Nếu có PostgreSQL và muốn áp dụng migrations: `npx prisma db push`)*

### Bước 4: Chạy bộ kiểm thử tự động (Jest)
Xác minh toàn bộ 69 test suites:
```bash
npm test
```
*Kết quả kỳ vọng: 4/4 Test Suites Passed, 69/69 Tests Passed.*

### Bước 5: Khởi chạy máy chủ phát triển (Development Server)
```bash
npm run dev
```
Mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**

### Bước 6: Biên dịch cho môi trường Production
```bash
npm run build
npm run start
```

---

## 8. Cấu trúc mã nguồn (Project Structure)

```
ai-research-workspace/
├── app/                              # Next.js 16 App Router
│   ├── globals.css                   # Tailwind v4 Cyber-Research theme tokens
│   ├── layout.tsx                    # Root layout & Fonts (Geist, Material Symbols)
│   ├── page.tsx                      # Trang điều hướng chính
│   ├── dashboard/                    # Trang tổng quan Telemetry & Quick Prompt
│   ├── documents/                    # Hub quản lý Corpus & Preview Drawer
│   ├── research/                     # Khởi tạo phiên nghiên cứu
│   │   └── [id]/                     # Giao diện nghiên cứu tương tác Streaming
│   ├── history/                      # Kho lưu trữ lịch sử tổng hợp
│   └── api/                          # Route Handlers
│       ├── chat/route.ts             # POST streaming response (SSE / ReadableStream)
│       ├── documents/                # Quản lý tài liệu (upload multipart, delete)
│       └── conversations/            # Quản lý phiên nghiên cứu
├── components/                       # Giao diện người dùng tái sử dụng
│   ├── layout/                       # AppShell, Sidebar, Header, MobileDrawer
│   ├── documents/                    # ActiveCorpusRail, DocumentCard, PreviewDrawer...
│   ├── research/                     # SummaryCard, KeyPointsCard, RisksCard, ActionsCard, SourcesCard...
│   ├── chat/                         # ChatBox, MessageItem, EmptyState
│   └── ui/                           # Thành phần Base UI
├── lib/                              # Mã logic nghiệp vụ cốt lõi
│   ├── ai/                           # AI Engine
│   │   ├── client.ts                 # Dynamic Multi-Provider loader (Gemini / OpenAI)
│   │   ├── prompt.ts                 # DAY2_SYSTEM_PROMPT & Context Prompts
│   │   ├── research.ts               # runResearchStream & Controller
│   │   └── __tests__/                # Unit tests cho AI Engine
│   ├── documents/                    # Document Processing Pipeline
│   │   ├── parser.ts                 # PDF Worker child process & Mammoth DOCX
│   │   ├── chunker.ts                # Sliding Window Chunker
│   │   ├── processor.ts              # File validation & orchestration
│   │   ├── pdf-worker-runner.cjs     # Isolated Node.js PDF runner
│   │   └── __tests__/                # Unit tests cho Parser, Chunker, Processor
│   ├── prisma.ts                     # Prisma Singleton & 300ms TCP Healthcheck
│   └── __mocks__/                    # Jest ESM Mocks (ai, @ai-sdk/openai, prisma)
├── prisma/
│   └── schema.prisma                 # Schema thực thể User, Document, Conversation...
├── types/
│   └── research.ts                   # Hợp đồng Zod Schema ResearchResponse & safeParse
├── ARCHITECTURE.md                   # Tài liệu kiến trúc kỹ thuật chi tiết
├── AI_USAGES.md                      # Báo cáo sử dụng AI & khắc phục lỗi
├── jest.config.js                    # Cấu hình Jest test runner
└── package.json                      # Danh mục gói phụ thuộc dự án
```

---

## 9. Bản quyền & Đóng góp (License & Credits)

- Phát triển và đóng góp bởi **Dương Công Tiến** ([@DuongCongTien](https://github.com/DuongCongTien)).
- Giấy phép phân phối: [MIT License](https://opensource.org/licenses/MIT).
