"use client";
import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={`bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-2 text-sm text-slate-900 dark:text-white ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export default Select;
