import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  isUser = false,
}) => {
  if (!content) return null;

  // Format inline markdown (bold, italic, code)
  const formatInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Inline Code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={keyIdx++}
            className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold ${
              isUser
                ? 'bg-emerald-900/60 text-amber-200 border border-emerald-700/50'
                : 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60'
            }`}
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold: **text** or __text__
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        parts.push(
          <strong
            key={keyIdx++}
            className={`font-black ${
              isUser
                ? 'text-amber-200'
                : 'text-slate-900 dark:text-white font-bold'
            }`}
          >
            {boldMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *text* or _text_
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch) {
        parts.push(
          <em key={keyIdx++} className="italic">
            {italicMatch[2]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Plain text character
      const nextSpecial = remaining.search(/[`*_]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  // Group lines into blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  const flushList = () => {
    if (!currentList) return;
    const { type, items } = currentList;
    const ListTag = type;
    elements.push(
      <ListTag
        key={`list-${elements.length}`}
        className={`my-2 space-y-1.5 ${
          type === 'ul' ? 'list-none pl-0' : 'list-decimal pl-5'
        }`}
      >
        {items.map((itemText, idx) => (
          <li
            key={idx}
            className={`text-xs leading-relaxed flex items-start gap-2 ${
              isUser ? 'text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {type === 'ul' && (
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  isUser
                    ? 'bg-amber-300'
                    : 'bg-emerald-600 dark:bg-emerald-400'
                }`}
              />
            )}
            <div className="flex-1">{formatInline(itemText)}</div>
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code Block Delimiters
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${elements.length}`}
            className="my-3 p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto border border-emerald-950 dark:border-emerald-800"
          >
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(rawLine);
      continue;
    }

    // Empty lines
    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings: #### H4
    if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h5
          key={`h4-${elements.length}`}
          className={`font-display font-bold text-xs uppercase tracking-wider mt-3 mb-1.5 ${
            isUser ? 'text-amber-200' : 'text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {formatInline(trimmed.replace(/^####\s+/, ''))}
        </h5>
      );
      continue;
    }

    // Headings: ### H3
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4
          key={`h3-${elements.length}`}
          className={`font-display font-black text-sm mt-3.5 mb-1.5 flex items-center gap-1.5 ${
            isUser ? 'text-amber-200' : 'text-emerald-950 dark:text-emerald-200'
          }`}
        >
          {formatInline(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
      continue;
    }

    // Headings: ## H2, # H1
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h3
          key={`h2-${elements.length}`}
          className={`font-display font-black text-base mt-4 mb-2 pb-1 border-b border-emerald-900/10 dark:border-emerald-700/20 ${
            isUser ? 'text-amber-100' : 'text-emerald-950 dark:text-white'
          }`}
        >
          {formatInline(trimmed.replace(/^#+\s+/, ''))}
        </h3>
      );
      continue;
    }

    // Standalone Bold Header Line like: **Immediate Action Steps** or **Title:**
    if (/^\*\*([^*]+)\*\*$/.test(trimmed) || /^\*\*([^*]+)\*\*:\s*$/.test(trimmed)) {
      flushList();
      const titleMatch = trimmed.match(/^\*\*([^*]+)\*\*:?\s*$/);
      elements.push(
        <h4
          key={`boldtitle-${elements.length}`}
          className={`font-display font-black text-xs uppercase tracking-wider mt-3.5 mb-1.5 flex items-center gap-1.5 ${
            isUser ? 'text-amber-200' : 'text-emerald-900 dark:text-emerald-300'
          }`}
        >
          <span className="w-2 h-2 rounded bg-amber-400 dark:bg-amber-500 inline-block shrink-0" />
          <span>{titleMatch ? titleMatch[1] : trimmed}</span>
        </h4>
      );
      continue;
    }

    // Unordered List Items: - or * or •
    if (/^[-*•]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*•]\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Ordered List Items: 1. 2. 3.
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Blockquote: > text
    if (trimmed.startsWith('>')) {
      flushList();
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div
          key={`quote-${elements.length}`}
          className="my-2.5 pl-3.5 py-1.5 border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-r-xl text-xs italic text-slate-700 dark:text-slate-300"
        >
          {formatInline(quoteText)}
        </div>
      );
      continue;
    }

    // Standard Paragraph
    flushList();
    elements.push(
      <p
        key={`p-${elements.length}`}
        className={`text-xs leading-relaxed my-1.5 ${
          isUser
            ? 'text-white font-medium'
            : 'text-slate-700 dark:text-slate-300 font-normal'
        }`}
      >
        {formatInline(rawLine)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};

export default MarkdownRenderer;
