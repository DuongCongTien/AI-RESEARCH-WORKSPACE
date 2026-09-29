'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownContentProps {
  content: string;
  className?: string;
  compact?: boolean;
}

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-border/70 shadow-sm bg-surface-container-lowest dark:bg-zinc-950/60">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-muted/40 border-b border-border/50 text-xs">
        <span className="font-mono text-[11px] font-semibold text-primary/90 uppercase tracking-wider">
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-medium transition-colors cursor-pointer"
          title="Sao chép toàn bộ mã nguồn"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Chép mã</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-foreground whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Renders a subset of markdown: bold, inline code, fenced code blocks, headers, bullet lists, and tables.
 */
export function MarkdownContent({ content, className = '', compact = false }: MarkdownContentProps) {
  if (!content) return null;

  // Split into lines for processing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock key={`code-${i}`} code={codeLines.join('\n')} lang={lang} />
      );
      i++; // skip closing ```
      continue;
    }

    // Markdown Table (| ... | ... |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const headerRow = tableLines[0].split('|').slice(1, -1).map((c) => c.trim());
        const dataRows = tableLines.slice(2).map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));

        elements.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-border/60 shadow-2xs">
            <table className="w-full text-xs text-left text-foreground">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/60">
                <tr>
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="px-3.5 py-2.5 font-semibold">
                      {inlineRender(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-muted/20 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2">
                        {inlineRender(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Heading h4 (####)
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="mt-4 mb-1.5 text-sm font-bold text-foreground tracking-tight">
          {inlineRender(line.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // Heading h3 (###)
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="mt-4 mb-2 text-sm font-bold text-primary tracking-tight">
          {inlineRender(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Heading h2 (##)
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="mt-4 mb-2 text-base font-bold text-foreground tracking-tight border-b border-border/40 pb-1">
          {inlineRender(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // Unordered list item
    if (/^[\s]*[-*+]\s/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[\s]*[-*+]\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^[\s]*[-*+]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 ml-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0" />
              <span className="leading-relaxed">{inlineRender(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list item (1. 2. ...)
    if (/^[\s]*\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      let startNum = 1;
      const firstMatch = line.match(/^[\s]*(\d+)\.\s/);
      if (firstMatch) startNum = parseInt(firstMatch[1]);
      while (i < lines.length && /^[\s]*\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^[\s]*\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 ml-1" start={startNum}>
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                {startNum + idx}
              </span>
              <span className="leading-relaxed">{inlineRender(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      elements.push(<hr key={`hr-${i}`} className="my-3 border-border/40" />);
      i++;
      continue;
    }

    // Empty line — spacing
    if (line.trim() === '') {
      if (compact) {
        i++;
        continue;
      }
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-foreground/90">
        {inlineRender(line)}
      </p>
    );
    i++;
  }

  return (
    <div className={`prose-tight ${className}`}>
      {elements}
    </div>
  );
}

/**
 * Renders inline markdown: **bold**, *italic*, `code`, and plain text.
 */
function inlineRender(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      parts.push(<em key={match.index} className="italic text-foreground/80">{match[3]}</em>);
    } else if (match[4] !== undefined) {
      parts.push(
        <code key={match.index} className="inline-block px-1.5 py-0.5 rounded-md bg-primary/8 border border-primary/15 text-primary font-mono text-[0.8em] font-medium leading-normal">
          {match[4]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
