import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResearchAI Studio | Không Gian Nghiên Cứu & Tổng Hợp Tài Liệu AI',
  description:
    'Không gian nghiên cứu AI hỗ trợ tổng hợp đa tài liệu, chỉ mục ngữ nghĩa, truy xuất thông minh và phân tích chuyên sâu.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="shell-type" content="web_dashboard" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=JetBrains+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
