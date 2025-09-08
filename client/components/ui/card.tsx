import * as React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
Card.displayName = 'Card';
