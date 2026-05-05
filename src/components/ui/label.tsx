import type { LabelHTMLAttributes } from "react";
import { forwardRef } from "react";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(function Label(
  { className = "", ...props },
  ref
) {
  return <label ref={ref} className={`form-label ${className}`} {...props} />;
});
