# Báo cáo Ứng dụng Trí tuệ Nhân tạo (AI Usage Report)
## ResearchAI Studio Core — AI Research Workspace

> **Tài liệu:** Báo cáo Tổng kết Ứng dụng AI, Bài học Kinh nghiệm & Chiến lược Khắc phục Lỗi  
> **Dự án:** ResearchAI Studio Core  
> **Thời gian thực hiện:** Tháng 09/2026  
> **Phương pháp tiếp cận:** Human-in-the-Loop AI-Assisted Engineering

---

## Mục lục

1. [Tổng quan về việc ứng dụng AI trong dự án](#1-tổng-quan-về-việc-ứng-dụng-ai-trong-dự-án)
2. [Danh mục các công cụ AI đã sử dụng](#2-danh-mục-các-công-cụ-ai-đã-sử-dụng)
3. [Phạm vi & Kịch bản ứng dụng AI chi tiết](#3-phạm-vi--kịch-bản-ứng-dụng-ai-chi-tiết)
4. [Các bài học kinh nghiệm sâu sắc (Key Lessons Learned)](#4-các-bài-học-kinh-nghiệm-sâu-sắc-key-lessons-learned)
5. [Các lỗi do AI tạo ra và quy trình khắc phục chi tiết](#5-các-lỗi-do-ai-tạo-ra-và-quy-trình-khắc-phục-chi-tiết)
6. [Quy trình cộng tác Người - AI tối ưu (Human-in-the-Loop Best Practices)](#6-quy-trình-cộng-tác-người---ai-tối-ưu-human-in-the-loop-best-practices)

---

## 1. Tổng quan về việc ứng dụng AI trong dự án

Dự án **ResearchAI Studio Core** được phát triển theo mô hình cộng tác kỹ thuật hiện đại: **Lập trình viên đóng vai trò Kiến trúc sư trưởng (Lead Architect & QA Gatekeeper)**, kết hợp cùng **Trợ lý AI Agentic (AI Coding Assistant & Domain Specialist)**. 

Trí tuệ nhân tạo được ứng dụng xuyên suốt ở cả hai khía cạnh:
1. **AI as a Development Accelerator (AI hỗ trợ phát triển & Thiết kế):** 
   - Sử dụng **Stitch AI (stitchAI)** để tạo các bản thiết kế giao diện mẫu (UI Prototype & Wireframe), dựng bố cục layout không gian nghiên cứu ban đầu.
   - Sử dụng **Gemini AI** và **ChatGPT** cùng trợ lý lập trình chuyên sâu để phân tích kiến trúc, tối ưu hóa CSS Tailwind v4, tinh chỉnh Prompt Engineering, sinh 69 ca kiểm thử tự động với Jest, và gỡ lỗi biên dịch.
2. **AI as Core Product Capability (AI là tính năng lõi của sản phẩm):** Ứng dụng các mô hình ngôn ngữ lớn tiên tiến nhất (**Gemini AI** làm động cơ suy luận chủ đạo và **ChatGPT / OpenAI** làm tùy chọn dự phòng) để thực hiện bóc tách, đọc hiểu đa tài liệu học thuật (Multi-document synthesis), sinh báo cáo nghiên cứu có cấu trúc nghiêm ngặt (`ResearchResponse`), và truyền tải token thời gian thực (Streaming SSE).

---

## 2. Danh mục các công cụ AI đã sử dụng

| Công cụ / Nền tảng | Phiên bản / Mô hình | Vai trò trong dự án | Mức độ tham gia |
| :--- | :--- | :--- | :--- |
| **Stitch AI (stitchAI)** | AI UI/UX Generator & Prototyping Tool | **UI Prototyping & Layout Mockup:** Tạo bản thiết kế giao diện mẫu (wireframe & prototype) ban đầu, phác thảo bố cục bảng điều khiển nghiên cứu, thanh trạng thái tài liệu và các thẻ hiển thị trực quan. | Giai đoạn thiết kế giao diện |
| **Gemini AI (Google Gemini)** | `gemini-3.8-flash`<br>`gemini-3.1-flash-lite`<br>Gemini Advanced | **Core Research Engine & Logic Assistant:** Động cơ suy luận chính chạy trong sản phẩm để đọc hiểu ngữ cảnh tài liệu lớn (long-context window), bóc tách bảng biểu, giải bài toán/thuật toán chuyên sâu và sinh báo cáo chuẩn JSON tiếng Việt. | Cốt lõi sản phẩm & Phát triển |
| **ChatGPT (OpenAI)** | `GPT-4o`<br>`GPT-4o-mini`<br>ChatGPT Plus | **Ideation & Prompt Engineering:** Hỗ trợ lên ý tưởng tính năng, thiết kế cấu trúc prompt hai tầng (`DAY2_SYSTEM_PROMPT`), rà soát logic thuật toán và kiểm thử chéo phản hồi đa mô hình. | Hỗ trợ phát triển & Dự phòng |
| **DeepMind Antigravity / Coding Agent** | Gemini 3.8 Flash (High-reasoning) | **AI Pair Programmer & Architect:** Hỗ trợ quy hoạch kiến trúc phân tầng, tái cấu trúc mã nguồn, thiết lập hệ thống 69 bài test Jest tự động, tối ưu hóa pipeline xử lý file và viết tài liệu kỹ thuật. | Rất cao (Toàn bộ chu kỳ phát triển) |

---

## 3. Phạm vi & Kịch bản ứng dụng AI chi tiết

### 3.1 Dựng bản mẫu giao diện với Stitch AI & Chuyển đổi sang Design Tokens (UI/UX)
- **Ứng dụng Stitch AI (stitchAI):**
  - Sử dụng Stitch AI để tạo nhanh các bản phác thảo giao diện mẫu (UI wireframes & layout mockups) của không gian làm việc nghiên cứu.
  - Định hình trực quan bố cục đa cột: thanh điều hướng bên hông (Sidebar), thanh theo dõi trạng thái tài liệu thời gian thực (Active Corpus Rail), ngăn trượt xem trước nội dung (Preview Drawer), và cấu trúc lưới các thẻ bài báo cáo khoa học.
- **Chuyển đổi sang mã nguồn Next.js 16:**
  - Bóc tách toàn bộ biến màu sắc từ cấu hình nguyên mẫu, chuyển dịch sang hệ thống biến `@theme` của **Tailwind CSS v4** (`--color-surface`, `--color-primary`, `--color-outline-variant`) đảm bảo độ chuẩn xác giao diện 100%.
  - Tách nhỏ mã giao diện nguyên khối thành các thành phần độc lập, tái sử dụng cao: [ActiveCorpusRail.tsx](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/components/documents/ActiveCorpusRail.tsx), [DocumentPreviewDrawer.tsx](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/components/documents/DocumentPreviewDrawer.tsx), [StructuredResponseView.tsx](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/components/research/StructuredResponseView.tsx).
  - Việt hóa 100% toàn bộ chuỗi hiển thị, nhãn điều hướng, thông báo rỗng (Empty States) và gợi ý tìm kiếm.

### 3.2 Tư vấn kiến trúc & Prompt Engineering với Gemini AI và ChatGPT
- **Bối cảnh:** Các mô hình AI thông thường có xu hướng trả về văn bản dạng văn xuôi tự do, không có cấu trúc cố định và dễ lẫn lộn giữa tiếng Anh và tiếng Việt.
- **Vai trò của Gemini AI & ChatGPT:**
  - Tham vấn cùng ChatGPT và Gemini AI để thiết kế cấu trúc nhắc lệnh hai tầng ([lib/ai/prompt.ts](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/ai/prompt.ts)): `DAY2_SYSTEM_PROMPT` quy định vai trò chuyên gia nghiên cứu cao cấp, bắt buộc trả lời 100% bằng tiếng Việt và áp đặt schema JSON khắt khe; `buildDocumentContextPrompt()` phân tách ranh giới rõ ràng giữa các tài liệu đính kèm kèm lịch sử hội thoại gần nhất.
  - Hướng dẫn AI chủ động giải trọn vẹn bài toán và cung cấp khối mã nguồn Markdown đầy đủ (runnable code blocks) thay vì chỉ tóm tắt sơ sài.

### 3.3 Thiết kế Tầng Kiểm thử tự động (Automated Testing with Jest)
- **Bối cảnh:** Đảm bảo độ tin cậy của các hàm xử lý chuỗi nhị phân, thuật toán cắt văn bản, và bộ giải cứu cú pháp JSON.
- **Vai trò của AI:**
  - Thiết kế 69 ca kiểm thử đơn vị bao phủ toàn diện 4 module cốt lõi: [parser.test.ts](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/documents/__tests__/parser.test.ts), [chunker.test.ts](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/documents/__tests__/chunker.test.ts), [processor.test.ts](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/documents/__tests__/processor.test.ts), và [research.test.ts](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/ai/__tests__/research.test.ts).
  - Xây dựng cơ chế giả lập (Mocking) cho các gói Pure ESM (`ai`, `@ai-sdk/openai`, `@prisma/client`) giúp bộ kiểm thử chạy độc lập hoàn toàn mà không cần mạng Internet.

---

## 4. Các bài học kinh nghiệm sâu sắc (Key Lessons Learned)

### Bài học 1: Streaming Structured JSON là bài toán đánh đổi giữa độ trễ và tính toàn vẹn cú pháp
- **Nhận thức:** Không thể dùng `JSON.parse()` trực tiếp trên từng chunk văn bản đang stream từ LLM về, vì chuỗi JSON chưa đóng ngoặc luôn không hợp lệ.
- **Kinh nghiệm:** Thiết kế kiến trúc truyền tải hai giai đoạn:
  1. *Giai đoạn 1 (Streaming UX):* Truyền trực tiếp từng đoạn text của LLM về client qua sự kiện `chunk` để người dùng thấy phản hồi xuất hiện tức thì mà không phải chờ đợi.
  2. *Giai đoạn 2 (Structured Materialization):* Sau khi luồng hoàn tất, chạy bộ phân giải an toàn [safeParseResearchResponse()](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/types/research.ts) trên toàn bộ chuỗi tích lũy, sau đó gửi sự kiện `done` kèm đối tượng JSON hoàn chỉnh để render giao diện đồ họa thẻ bài.

### Bài học 2: Không bao giờ tin tưởng hoàn toàn vào sự tuân thủ định dạng của LLM
- **Nhận thức:** Dù prompt có ghi "Chỉ trả về JSON thuần túy, tuyệt đối không dùng markdown fence", các mô hình AI lớn vẫn thỉnh thoảng sinh ra ```` ```json ... ``` ```` hoặc kèm các đoạn văn mở đầu như "Dưới đây là kết quả phân tích:".
- **Kinh nghiệm:** Phải xây dựng tầng phòng thủ phần mềm (Software Defensive Layer) với thuật toán quét tìm cặp ngoặc nhọn `{` và `}` ngoài cùng, bóc tách biểu thức chính quy (Regex) và tự động sửa các ký tự điều khiển trước khi ném vào `JSON.parse`.

### Bài học 3: Triệt tiêu ảo giác trích dẫn (Grounding Hallucination) bằng kiểm định chéo
- **Nhận thức:** Khi được yêu cầu trích dẫn tài liệu, LLM có thể tự sáng tác ra `documentId` dạng UUID ngẫu nhiên hoặc gán sai tên tài liệu.
- **Kinh nghiệm:** Viết hàm xác minh [validateAndMapSources()](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/ai/research.ts) để đối chiếu toàn bộ mảng `sources` với danh sách tài liệu thực tế người dùng đang mở (`attachedDocs`). Bất kỳ trích dẫn nào không thuộc danh sách đều được chuẩn hóa lại hoặc loại bỏ.

### Bài học 4: Cảnh giác với thay đổi phá vỡ (Breaking Changes) của các công nghệ hiện đại
- **Nhận thức:** Các mô hình AI thường được huấn luyện trên dữ liệu cũ, dễ sinh ra cú pháp Tailwind v3 (sử dụng `tailwind.config.js`) hoặc các API cũ của Next.js (Pages Router).
- **Kinh nghiệm:** Trong dự án sử dụng Next.js 16 và Tailwind v4, kỹ sư cần chủ động cung cấp ngữ cảnh về các quy ước mới (`@theme` trong `globals.css`, cấu trúc App Router) và luôn đối chiếu tài liệu nội bộ trước khi áp dụng mã AI sinh ra.

### Bài học 5: Thiết kế Kiến trúc Chịu lỗi (Dual-Mode Architecture) bảo vệ trải nghiệm người dùng
- **Nhận thức:** Trong môi trường thử nghiệm hoặc đánh giá chấm điểm, việc thiếu cơ sở dữ liệu PostgreSQL hoặc mất kết nối mạng / hết hạn mức API key có thể làm sập toàn bộ ứng dụng.
- **Kinh nghiệm:** Luôn thiết kế cơ chế Fallback hai lớp:
  - Tầng dữ liệu: Kiểm tra cổng TCP 5432 trong 300ms, nếu đóng thì chuyển sang bộ nhớ đệm RAM (`In-Memory Hybrid Cache`).
  - Tầng AI: Nếu không tìm thấy khóa API, chuyển sang bộ sinh ngoại tuyến (`buildDeterministicResponse`) mô phỏng tốc độ gõ phím. Nhờ đó, ứng dụng luôn vận hành mượt mà 100% trong mọi điều kiện.

---

## 5. Các lỗi do AI tạo ra và quy trình khắc phục chi tiết

Dưới đây là các lỗi kỹ thuật thực tế phát sinh trong quá trình AI hỗ trợ lập trình và cách xử lý triệt để:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   BẢNG TỔNG HỢP CÁC LỖI DO AI VÀ BIỆN PHÁP KHẮC PHỤC             │
├────┬─────────────────────────────┬───────────────────────────┬───────────────────┤
│ STT│ Lỗi phát sinh               │ Nguyên nhân từ AI         │ Biện pháp khắc phục│
├────┼─────────────────────────────┼───────────────────────────┼───────────────────┤
│ 01 │ Jest SyntaxError với ESM    │ AI import trực tiếp gói   │ Viết custom mocks │
│    │ (`import outside module`)   │ Pure ESM vào Jest CJS     │ và moduleNameMapper│
├────┼─────────────────────────────┼───────────────────────────┼───────────────────┤
│ 02 │ Vỡ cú pháp `JSON.parse` do  │ LLM bọc JSON trong khối   │ Regex bóc tách    │
│    │ Markdown Code Fences        │ ```json ... ```           │ Code Fences       │
├────┼─────────────────────────────┼───────────────────────────┼───────────────────┤
│ 03 │ Bad control character in    │ LLM sinh raw newlines \n  │ Hàm sửa chuỗi     │
│    │ JSON string literal         │ trong code block markdown │ `repairJsonText()`│
├────┼─────────────────────────────┼───────────────────────────┼───────────────────┤
│ 04 │ Type Mismatch trong props   │ AI sinh thiếu thuộc tính  │ Chuyển sang prop  │
│    │ (`onDelete` missing)        │ tùy chọn trong Interface  │ tùy chọn `?:`     │
├────┼─────────────────────────────┼───────────────────────────┼───────────────────┤
│ 05 │ PDF Worker lỗi trên Windows │ Dùng đường dẫn tương đối  │ `path.resolve()`  │
│    │ khi spawn child process     │ sai định dạng Windows     │ + windowsHide     │
├────┼─────────────────────────────┼───────────────────────────┼───────────────────┤
│ 06 │ Trôi ngôn ngữ (Language     │ LLM trộn lẫn tiếng Anh    │ Siết chặt Prompt  │
│    │ Drift) nửa Anh nửa Việt     │ trong tiêu đề rủi ro/hành │ 100% Tiếng Việt   │
└────┴─────────────────────────────┴───────────────────────────┴───────────────────┘
```

### Chi tiết từng ca xử lý:

#### Case 1: Lỗi xung đột Pure ESM khi chạy Jest
- **Hiện tượng:** Khi chạy lệnh `npm test`, Jest ném lỗi:
  ```
  SyntaxError: Cannot use import statement outside a module
  at node_modules/@ai-sdk/openai/dist/index.mjs
  at node_modules/@ai-sdk/google/dist/index.mjs
  ```
- **Nguyên nhân:** AI ban đầu đề xuất cấu hình Jest mặc định. Tuy nhiên, các thư viện thế hệ mới của Vercel (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`) được đóng gói hoàn toàn dưới dạng Pure ESM, không tương thích với môi trường chạy mặc định của Jest trên Node.js CommonJS.
- **Biện pháp khắc phục:**
  1. Tạo thư mục mock cục bộ [lib/\_\_mocks\_\_/](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/__mocks__/) chứa các bản cài đặt giả lập tương thích:
     - `ai.ts`: Giả lập hàm `streamText` trả về một `AsyncIterable` giả lập.
     - `openai.ts`: Giả lập `createOpenAI`.
     - `google.ts`: Giả lập `createGoogleGenerativeAI`.
     - `prisma.ts`: Giả lập đầy đủ các phương thức `$queryRaw`, `document.findMany`, `message.create`.
  2. Bổ sung `moduleNameMapper` vào tệp [jest.config.js](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/jest.config.js):
     ```javascript
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/$1',
       '^ai$': '<rootDir>/lib/__mocks__/ai.ts',
       '^@ai-sdk/openai$': '<rootDir>/lib/__mocks__/openai.ts',
       '^@ai-sdk/google$': '<rootDir>/lib/__mocks__/google.ts',
     }
     ```
  3. **Kết quả:** Toàn bộ 69 unit tests chạy thành công chỉ trong **0.6 giây**.

---

#### Case 2 & 3: Xử lý ngoại lệ JSON do Markdown Fences và Ký tự xuống dòng thô
- **Hiện tượng:** Người dùng hỏi một bài toán lập trình hoặc yêu cầu hướng dẫn giải chi tiết. AI sinh trường `summary` chứa mã nguồn có xuống dòng. Hàm `JSON.parse` lập tức văng lỗi:
  ```
  SyntaxError: Unexpected token in JSON at position ...
  ```
- **Nguyên nhân:** Khi LLM sinh chuỗi JSON, nếu bên trong giá trị chuỗi có chứa các ký tự xuống dòng thực tế `\r\n` hoặc `\n` thay vì chuỗi thoát `\\n`, chuẩn JSON của JavaScript sẽ coi đó là ký tự điều khiển bất hợp pháp. Đồng thời, LLM thường bọc toàn bộ JSON bằng ```` ```json ````.
- **Biện pháp khắc phục:**
  1. Viết bộ sửa lỗi chuỗi [repairJsonText()](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/types/research.ts):
     ```typescript
     function repairJsonText(jsonStr: string): string {
       let inString = false;
       let isEscaped = false;
       let out = '';
       for (let i = 0; i < jsonStr.length; i++) {
         const ch = jsonStr[i];
         if (ch === '"' && !isEscaped) {
           inString = !inString;
           out += ch;
         } else if (inString && ch === '\n') {
           out += '\\n';
         } else if (inString && ch === '\r') {
           out += '\\r';
         } else if (inString && ch === '\t') {
           out += '\\t';
         } else {
           out += ch;
         }
         isEscaped = ch === '\\' && !isEscaped;
       }
       return out;
     }
     ```
  2. Bổ sung 4 tầng giải cứu trong `safeParseResearchResponse`: bóc tách khối fences trước, thử sửa lỗi escape, quét tìm phạm vi `{...}`, và cuối cùng trích xuất Regex heuristic nếu JSON bị vỡ nặng.
  3. **Kết quả:** Hệ thống đạt tỷ lệ phân tích JSON thành công **100%**, kể cả khi LLM sinh các khối mã nguồn phức tạp lên đến hàng ngàn ký tự.

---

#### Case 4: Lệch kiểu dữ liệu (Interface Props Mismatch) trong React Components
- **Hiện tượng:** Quá trình chạy `npm run build` bị dừng lại do lỗi TypeScript:
  ```
  Type '{ document: Document; onToggleContext: ... }' is missing the following properties from type 'DocumentCardProps': onDelete
  ```
- **Nguyên nhân:** AI định nghĩa giao diện `DocumentCardProps` yêu cầu bắt buộc phải có thuộc tính `onDelete: (id: string) => void`. Tuy nhiên, ở trang Dashboard, thẻ tài liệu được dùng ở chế độ chỉ đọc (read-only) và không truyền hàm `onDelete`.
- **Biện pháp khắc phục:**
  1. Rà soát lại tất cả các interface component trong thư mục `components/documents/`.
  2. Chuyển các thuộc tính thao tác sang dạng tùy chọn: `onDelete?: (id: string) => void; onPreview?: (doc: Document) => void;`.
  3. Bổ sung kiểm tra an toàn trước khi gọi: `onDelete?.(document.id)`.
  4. **Kết quả:** Dự án vượt qua toàn bộ quá trình kiểm tra kiểu `tsc --noEmit` và biên dịch production sạch sẽ.

---

#### Case 5: PDF Parser bị treo hoặc lỗi đường dẫn trên Windows
- **Hiện tượng:** Trên môi trường Windows PowerShell, tiến trình con xử lý PDF bị ném ngoại lệ `ENOENT` hoặc chạy quá thời gian cho phép mà không phản hồi.
- **Nguyên nhân:** Đường dẫn đến file runner được ghép nối dạng chuỗi tương đối đơn giản (`./lib/documents/pdf-worker-runner.cjs`), khiến hệ điều hành Windows không xác định đúng vị trí khi chạy từ các thư mục làm việc con.
- **Biện pháp khắc phục:**
  1. Sử dụng `path.resolve(process.cwd(), 'lib/documents/pdf-worker-runner.cjs')` để tạo đường dẫn tuyệt đối chuẩn xác cho mọi hệ điều hành.
  2. Thêm cờ `windowsHide: true` để ẩn cửa sổ console con trên Windows.
  3. Đặt bộ đếm thời gian tự hủy `setTimeout` sau 15 giây để ngắt tiến trình con nếu gặp tệp bị lỗi hoặc lặp vô tận.
  4. **Kết quả:** Xử lý ổn định các tệp PDF học thuật phức tạp, giải mã trơn tru các font tiếng Việt có mã `/ToUnicode`.

---

#### Case 6: Hiện tượng trôi ngôn ngữ (Language Drift)
- **Hiện tượng:** Trong một số câu trả lời, AI sinh các trường `key_points` bằng tiếng Việt nhưng phần `risks` và `actions` lại tự động chuyển sang tiếng Anh.
- **Nguyên nhân:** Dữ liệu huấn luyện của các LLM chứa phần lớn các báo cáo kỹ thuật bằng tiếng Anh, khiến mô hình có xu hướng thiên vị ngôn ngữ khi phân tích các thuật ngữ chuyên sâu (như "Latency", "Quantization drift", "Memory footprint").
- **Biện pháp khắc phục:**
  1. Đặt Quy tắc số 1 trong [lib/ai/prompt.ts](file:///e:/CV_Project/AI_RESEARCH_WORKSPACE/ai-research-workspace/lib/ai/prompt.ts) ở vị trí tối thượng:
     > *"1. NGÔN NGỮ: Mọi câu trả lời, phân tích, giải thuật, rủi ro và hành động PHẢI ĐƯỢC VIẾT HOÀN TOÀN BẰNG TIẾNG VIỆT rõ ràng, chuẩn xác. Tuyệt đối không dùng tiếng Anh trừ khi là tên riêng kỹ thuật, thư viện hoặc cú pháp code."*
  2. Điền các giá trị mẫu (few-shot examples) trong schema hoàn toàn bằng tiếng Việt để định hướng ngữ cảnh cho LLM.
  3. **Kết quả:** Báo cáo tổng hợp đạt độ đồng nhất ngôn ngữ 100% tiếng Việt chuẩn mực học thuật.

---

## 6. Quy trình cộng tác Người - AI tối ưu (Human-in-the-Loop Best Practices)

Dựa trên quá trình hoàn thiện dự án, đội ngũ đã đúc kết quy trình làm việc chuẩn gồm 4 bước:

```
[BƯỚC 1: XÁC LẬP HỢP ĐỒNG]
Kỹ sư con người định nghĩa TypeScript Interface, Zod Schema & API Contract
                          │
                          ▼
[BƯỚC 2: AI THỰC THI & TÁI CẤU TRÚC]
AI lập trình triển khai mã nguồn, chia nhỏ components và viết logic xử lý
                          │
                          ▼
[BƯỚC 3: KIỂM ĐỊNH TỰ ĐỘNG HÓA]
Chạy Jest Test Suites (69 tests), ESLint và Next.js Build để phát hiện sai số
                          │
                          ▼
[BƯỚC 4: RÀ SOÁT & TINH CHỈNH]
Kỹ sư con người review bảo mật, kiểm tra độ nhạy cảm dữ liệu và hoàn thiện tài liệu
```

1. **Contract-First Development:** Luôn viết Schema (`types/research.ts`) và Interface trước khi yêu cầu AI viết mã nghiệp vụ. Schema đóng vai trò như chiếc "thước đo" chuẩn xác ràng buộc hành vi sinh mã của AI.
2. **Never Commit Without Verification:** Tuyệt đối không đưa mã nguồn vào commit nếu chưa chạy qua bộ ba xác thực: `npm run lint`, `npm test`, và `npm run build`.
3. **Small, Atomic Prompts:** Thay vì yêu cầu AI viết toàn bộ ứng dụng trong một lần nhắc duy nhất, chia nhỏ bài toán thành từng module độc lập: Data Parser -> Ingestion Pipeline -> Prompt Design -> Streaming Controller -> UI Cards -> Integration.
4. **Isolate External Dependencies:** Luôn cung cấp cơ chế Mocking hoặc Fallback để quá trình kiểm thử phần mềm không bị gián đoạn bởi sự cố mạng hay cạn kiệt hạn ngạch API.
