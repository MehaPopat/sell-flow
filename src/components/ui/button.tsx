import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function Button(
  { className = "", ...props },
  ref
) {
  return <button ref={ref} className={`button ${className}`} {...props} />;
});
