import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Card({ padding = true, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface-card rounded-card shadow-card ${padding ? "p-4" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
