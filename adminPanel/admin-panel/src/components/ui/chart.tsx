"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
>;

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig;
};

export function ChartContainer({
  config,
  className,
  ...props
}: ChartContainerProps) {
  const styleVars: React.CSSProperties = {};
  for (const [key, value] of Object.entries(config)) {
    const color = value.color;
    (styleVars as any)[`--chart-color-${key}`] = color;
  }
  return (
    <div
      className={cn("w-full h-full", className)}
      style={styleVars}
      {...props}
    />
  );
}

export function ChartTooltip({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function ChartTooltipContent({
  indicator = "line" as const,
}: {
  indicator?: "line" | "dot";
}) {
  return <div data-indicator={indicator} />;
}

export function ChartLegend({ children }: { children?: React.ReactNode }) {
  return <div className="mt-2 text-xs text-slate-400">{children}</div>;
}

export function ChartLegendContent() {
  return null;
}

// simple utility
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export { cx };
