import React from "react";
import katex from "katex";

interface KaTeXRendererProps {
  content: string;
  className?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  const renderFormatted = () => {
    const parts: (string | React.ReactNode)[] = [];
    const regex = /($$[^$]+$$|$[^$]+$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const formula = match[0];
      const isDisplay = formula.startsWith("$$");
      const cleanFormula = isDisplay ? formula.slice(2, -2) : formula.slice(1, -1);

      try {
        const html = katex.renderToString(cleanFormula, {
          displayMode: isDisplay,
          throwOnError: false
        });
        parts.push(<span key={match.index} dangerouslySetInnerHTML={{ __html: html }} />);
      } catch (err) {
        parts.push(<span key={match.index} className="text-red-500 font-mono text-xs">{formula}</span>);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  return <div className={`inline-block leading-relaxed ${className}`}>{renderFormatted()}</div>;
};
