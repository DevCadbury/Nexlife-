"use client";
import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = "",
  ...props
}) => <table className={`w-full border-collapse ${className}`} {...props} />;

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  ...props
}) => <thead className={className} {...props} />;

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  ...props
}) => <tbody className={className} {...props} />;

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = "",
  style,
  ...props
}) => (
  <tr
    className={className}
    style={{ borderBottom: "1px solid var(--border)", ...style }}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  style,
  ...props
}) => (
  <th
    className={`p-2.5 text-left text-xs font-semibold uppercase tracking-wide ${className}`}
    style={{
      color: "var(--text-muted)",
      background: "var(--bg-inset)",
      borderBottom: "1px solid var(--border)",
      ...style,
    }}
    {...props}
  />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  style,
  ...props
}) => (
  <td
    className={`px-2.5 py-2 text-sm ${className}`}
    style={{ color: "var(--text)", ...style }}
    {...props}
  />
);

export default Table;
