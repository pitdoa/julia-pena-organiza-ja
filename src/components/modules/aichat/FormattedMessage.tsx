// Em: src/components/modules/aichat/FormattedMessage.tsx

import React from 'react';

interface FormattedMessageProps {
  text: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ text }) => {
  const renderText = () => {
    // Regex para encontrar **texto** ou __texto__
    const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);

    return parts.map((part, index) => {
      // Se a parte for negrito (**texto**)
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      // Se a parte for itálico (__texto__)
      if (part.startsWith('__') && part.endsWith('__')) {
        return <em key={index} className="italic">{part.slice(2, -2)}</em>;
      }
      // Se for texto normal
      return part;
    });
  };

  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{renderText()}</p>;
};  