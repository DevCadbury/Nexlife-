"use client";
import React from "react";

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  ...props
}) => (
  <table className={`w-full border-collapse ${className || ""}`} {...props} />
);
export const TableHeader: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ className, ...props }) => <thead className={className} {...props} />;
export const TableBody: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ className, ...props }) => <tbody className={className} {...props} />;
export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  ...props
}) => <tr className={className} {...props} />;
export const TableHead: React.FC<
  React.ThHTMLAttributes<HTMLTableCellElement>
> = ({ className, ...props }) => (
  <th
    className={`p-2 text-left text-slate-400 ${className || ""}`}
    {...props}
  />
);
export const TableCell: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement>
> = ({ className, ...props }) => (
  <td className={`p-2 ${className || ""}`} {...props} />
);

export default Table;
