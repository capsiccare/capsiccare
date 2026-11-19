import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export function FormattedText({ text, className = '' }: FormattedTextProps) {
  if (!text) return null;

  // Split by **text** and return array of nodes
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Remove the ** from start and end
          const content = part.slice(2, -2);
          return <strong key={index} className="font-bold text-inherit">{content}</strong>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
