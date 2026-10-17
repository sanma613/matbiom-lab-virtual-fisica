"use client";

import { useMemo, useRef, useEffect } from "react";
import { marked } from "marked";
import katex from "katex";

// Configure marked with GitHub flavored markdown and line break support
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Pre-processes markdown to protect LaTeX expressions from marked.js parsing,
 * runs marked.parse(), and replaces placeholder tokens with KaTeX rendered HTML.
 * Handles:
 *   - Block:  $$ ... $$  and  \[ ... \]
 *   - Inline: $ ... $    and  \( ... \)
 */
function renderMarkdownWithLatex(content) {
  if (!content) return "";

  const mathStore = [];
  const codeBlocks = [];

  // 1. Protect code blocks and inline code so backticks and internal syntax aren't touched
  let preprocessed = content.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    const id = `KATEXCODEBLOCK${codeBlocks.length}TOKEN`;
    codeBlocks.push(match);
    return id;
  });

  // 2. Display math: $$...$$ or \[...\]
  preprocessed = preprocessed.replace(/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]/g, (match, tex1, tex2) => {
    const tex = (tex1 || tex2).trim();
    const id = `KATEXMATHBLOCK${mathStore.length}TOKEN`;
    mathStore.push({ id, tex, display: true });
    return `\n\n${id}\n\n`;
  });

  // 3. Inline math: \(...\)
  preprocessed = preprocessed.replace(/\\\(([\s\S]+?)\\\)/g, (match, tex) => {
    const id = `KATEXMATHINLINE${mathStore.length}TOKEN`;
    mathStore.push({ id, tex: tex.trim(), display: false });
    return id;
  });

  // 4. Inline math: $...$
  // Rule:
  // - Not preceded by \, $, or digit
  // - Opening $ not followed by digit or $
  // - Closing $ not followed by digit
  // - Avoid currency like "$50"
  preprocessed = preprocessed.replace(/(?<![\\$\d])\$(?!\$|\d)(.+?)(?<![\\$])\$(?!\d)/g, (match, rawInside) => {
    const trimmed = rawInside.trim();
    if (!trimmed) return match;
    // Skip if it has spaces on both ends with no TeX symbols
    if ((rawInside.startsWith(" ") || rawInside.endsWith(" ")) && !/[\\[\]{}_^=+\-*/<>±≈≤≥√π]/.test(trimmed)) {
      return match;
    }
    const id = `KATEXMATHINLINE${mathStore.length}TOKEN`;
    mathStore.push({ id, tex: trimmed, display: false });
    return id;
  });

  // 5. Restore code blocks
  preprocessed = preprocessed.replace(/KATEXCODEBLOCK(\d+)TOKEN/g, (_, idx) => codeBlocks[idx]);

  // 6. Parse Markdown with marked
  let html = marked.parse(preprocessed);

  // 7. Replace math tokens with KaTeX rendered HTML
  mathStore.forEach(({ id, tex, display }) => {
    let rendered;
    try {
      // In inline math, if it contains fractions, roots, sums, integrals, ensure \displaystyle so it doesn't shrink to microscopic size
      let mathTex = tex;
      if (!display && /\\(frac|dfrac|cfrac|sum|int|sqrt|iint|iiint|prod)/.test(tex) && !tex.includes("\\displaystyle")) {
        mathTex = `\\displaystyle ${tex}`;
      }
      rendered = katex.renderToString(mathTex, {
        throwOnError: false,
        displayMode: display,
        output: "html",
      });
    } catch {
      rendered = `<code>${tex}</code>`;
    }

    if (display) {
      // If marked wrapped the block token in <p>KATEXMATHBLOCK...TOKEN</p>, replace the outer <p> to avoid redundant margins
      const pPattern = new RegExp(`<p>\\s*${id}\\s*<\\/p>`, "g");
      if (pPattern.test(html)) {
        html = html.replace(pPattern, rendered);
      } else {
        html = html.split(id).join(rendered);
      }
    } else {
      html = html.split(id).join(rendered);
    }
  });

  return html;
}

export default function MarkdownView({ content, style = {}, className = "", accent }) {
  const html = useMemo(() => {
    if (!content) return "";
    try {
      // Auto-wrap standalone LaTeX equations on their own line that lack delimiters,
      // but NEVER touch sentences or lines that already have \(, \[, or $ delimiters,
      // or lines that contain regular prose words.
      const lines = content.split("\n");
      const normalizedContent = lines
        .map((line) => {
          const trimmed = line.trim();
          if (
            !trimmed ||
            trimmed.includes("$") ||
            trimmed.includes("\\(") ||
            trimmed.includes("\\[") ||
            trimmed.startsWith("```") ||
            trimmed.startsWith("#")
          ) {
            return line;
          }
          // Check if there are prose words outside LaTeX commands
          const textWithoutTex = trimmed.replace(/\\[a-zA-Z]+/g, "");
          const hasTextWords = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}/.test(textWithoutTex);
          if (
            !hasTextWords &&
            /\\(frac|dfrac|cfrac|sqrt|sum|int|times|cdot|pm|approx|neq|le|ge|alpha|beta|theta|omega|pi)\b/.test(trimmed)
          ) {
            return `\n$$${trimmed}$$\n`;
          }
          return line;
        })
        .join("\n");

      return renderMarkdownWithLatex(normalizedContent);
    } catch {
      return content;
    }
  }, [content]);

  return (
    <>
      <div
        className={`markdown-content ${className}`}
        style={{
          fontSize: 14,
          lineHeight: 1.75,
          color: "rgba(255, 255, 255, 0.9)",
          ...(accent ? { "--accent-color": accent } : {}),
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style jsx global>{`
        .markdown-content p {
          margin-bottom: 0.65em;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        .markdown-content strong {
          color: var(--accent-color, #fbbf24);
          font-weight: 700;
        }
        .markdown-content em {
          font-style: italic;
          color: rgba(255, 255, 255, 0.95);
        }
        .markdown-content ul, .markdown-content ol {
          margin: 0.4em 0 0.8em 1.4em;
          padding: 0;
        }
        .markdown-content li {
          margin-bottom: 0.35em;
          line-height: 1.65;
        }
        .markdown-content li::marker {
          color: var(--accent-color, #fbbf24);
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 {
          color: #ffffff;
          margin: 0.8em 0 0.4em 0;
          font-weight: 700;
          font-size: 1.05em;
          letter-spacing: 0.02em;
        }
        .markdown-content code {
          font-family: 'DM Mono', monospace;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
          color: #67e8f9;
        }
        .markdown-content blockquote {
          border-left: 3px solid var(--accent-color, #fbbf24);
          margin: 0.6em 0;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.85);
        }
        /* KaTeX display-mode overrides for dark theme matching Marco Teórico */
        .markdown-content .katex-display {
          margin: 0.85em 0;
          padding: 12px 18px;
          background: rgba(0, 0, 0, 0.35);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          overflow-x: auto;
          font-size: 1.34em;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.38);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .markdown-content .katex {
          color: var(--accent-color, rgba(255, 255, 255, 0.95));
          font-size: 1.2em;
        }
        .markdown-content .katex-display .katex {
          color: var(--accent-color, rgba(255, 255, 255, 0.95));
        }
        /* Ensure fraction divider line is crisp and visible */
        .markdown-content .katex .frac-line {
          border-bottom-width: 0.08em !important;
          opacity: 0.95;
          border-color: var(--accent-color, rgba(255, 255, 255, 0.95));
        }
      `}</style>
    </>
  );
}
