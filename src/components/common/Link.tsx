import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export const Link: React.FC<LinkProps> = ({ to, children, className = '', ...props }) => {
  return (
    <a
      href={to}
      className={`hover:text-violet-400 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};