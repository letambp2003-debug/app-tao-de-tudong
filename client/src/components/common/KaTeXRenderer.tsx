import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface KaTeXRendererProps {
  content: string | undefined | null;
  className?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  const renderFormatted = () => {
    // If the content is purely a raw LaTeX formula without $ (e.g., "\frac{2}{3}x^2y" or "x^2 - 4")
    const trimmed = content.trim();
    if (
      !trimmed.includes("$") &&
      (trimmed.startsWith("\\frac") ||
        trimmed.startsWith("\\sqrt") ||
        trimmed.includes("\\cdot") ||
        trimmed.includes("\\pm") ||
        trimmed.includes("\\Delta") ||
        trimmed.includes("\\widehat") ||
        trimmed.includes("^{") ||
        trimmed.includes("_{"))
    ) {
      try {
        const html = katex.renderToString(trimmed, {
          displayMode: false,
          throwOnError: false
        });
        return [<span key="single-raw" dangerouslySetInnerHTML={{ __html: html }} />];
      } catch {
        // fallback to standard parser
      }
    }

    const parts: (string | React.ReactNode)[] = [];
    // Regex matching $$...$$, \[...\], $...$, and \(...\)
    const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([\s\S]+?\\\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      const formula = match[0];
      let isDisplay = false;
      let cleanFormula = formula;

      if (formula.startsWith("$$") && formula.endsWith("$$")) {
        isDisplay = true;
        cleanFormula = formula.slice(2, -2).trim();
      } else if (formula.startsWith("\\[") && formula.endsWith("\\]")) {
        isDisplay = true;
        cleanFormula = formula.slice(2, -2).trim();
      } else if (formula.startsWith("$") && formula.endsWith("$")) {
        isDisplay = false;
        cleanFormula = formula.slice(1, -1).trim();
      } else if (formula.startsWith("\\(") && formula.endsWith("\\)")) {
        isDisplay = false;
        cleanFormula = formula.slice(2, -2).trim();
      }

      try {
        const html = katex.renderToString(cleanFormula, {
          displayMode: isDisplay,
          throwOnError: false
        });
        parts.push(
          <span
            key={`katex-${match.index}`}
            className={isDisplay ? "block my-2 text-center" : "inline-block align-baseline mx-0.5"}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        parts.push(
          <span key={`err-${match.index}`} className="text-red-500 font-mono text-xs">
            {formula}
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  return <span className={`inline leading-relaxed ${className}`}>{renderFormatted()}</span>;
};
