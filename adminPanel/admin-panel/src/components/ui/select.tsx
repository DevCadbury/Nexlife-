"use client";
import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`crm-select ${className}`}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export default Select;
