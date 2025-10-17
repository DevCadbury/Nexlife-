"use client";

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Line,
  ReferenceDot,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

type SeriesPoint = { _id: string; count: number };

type Props = {
  title?: string;
  description?: string;
  series?: SeriesPoint[];
  bare?: boolean; // if true, render without Card wrapper/header/footer
  timespan?: string; // timespan like '1W', '1M', '3M', etc.
};

const chartConfig: ChartConfig = {
  total: { label: "Total", color: "hsl(240 80% 60%)" },
  baseline: { label: "Baseline", color: "hsl(180 80% 60%)" },
};

export function ChartAreaInteractive({
  title = "Submissions",
  description = "Scroll to zoom, drag to pan",
  series = [],
  bare = false,
  timespan = '1M',
}: Props) {
  const baseData = React.useMemo(
    () => {
      // Generate complete date range for the selected timespan
      const generateDateRange = (timespan: string) => {
        const now = new Date();
        const endDate = new Date(now);
        let startDate = new Date(now);
        
        switch (timespan) {
          case '1W':
            startDate.setDate(now.getDate() - 7);
            break;
          case '1M':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3M':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case '6M':
            startDate.setMonth(now.getMonth() - 6);
            break;
          case '1Y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case 'All':
            // For 'All', use the earliest date from data or go back 2 years
            if (series && series.length > 0) {
              const earliest = series.reduce((earliest, item) => {
                const itemDate = new Date(item._id);
                return itemDate < earliest ? itemDate : earliest;
              }, new Date());
              startDate = new Date(earliest);
              startDate.setMonth(startDate.getMonth() - 1); // Add some buffer
            } else {
              startDate.setFullYear(now.getFullYear() - 2);
            }
            break;
          default:
            startDate.setMonth(now.getMonth() - 1); // Default to 1M
        }

        const dates = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          dates.push({
            date: new Date(currentDate),
            dateString: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
            formattedDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
      };

      const dateRange = generateDateRange(timespan);
      
      // Create a map of actual data for quick lookup
      const dataMap = new Map();
      if (series && series.length > 0) {
        series.forEach(item => {
          dataMap.set(item._id, item.count);
        });
      }

      // Merge date range with actual data
      const processedData = dateRange.map(dateItem => {
        const count = dataMap.get(dateItem.dateString) || 0;
        return {
          month: dateItem.dateString,
          total: count,
          date: dateItem.formattedDate,
          timestamp: dateItem.date.getTime()
        };
      });

      return processedData;
    },
    [series, timespan]
  );
  const [domain, setDomain] = React.useState<{
    start: number;
    end: number;
  } | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const data = baseData;
  const avg = React.useMemo(() => {
    if (!data.length) return 0;
    const sum = data.reduce((a, b) => a + (b.total || 0), 0);
    return Math.round((sum / data.length) * 100) / 100;
  }, [data]);

  // derive current slice and stats for legend
  const slice = React.useMemo(() => {
    const start = domain ? domain.start : 0;
    const end = domain ? domain.end : data.length - 1;
    const items = data.slice(start, end + 1);
    const values = items.map((d) => d.total || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = values.length ? sum / values.length : 0;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let minIdx = -1;
    let maxIdx = -1;
    values.forEach((v, i) => {
      if (v < min) {
        min = v;
        minIdx = i;
      }
      if (v > max) {
        max = v;
        maxIdx = i;
      }
    });
    // moving average (3-point)
    const ma = items.map((_, i) => {
      const a = Math.max(0, i - 1);
      const b = Math.min(items.length - 1, i + 1);
      const sub = items.slice(a, b + 1);
      const s = sub.reduce((acc, p) => acc + (p.total || 0), 0);
      return s / sub.length;
    });
    return {
      start,
      end,
      items,
      values,
      sum,
      mean,
      min: isFinite(min) ? min : 0,
      max: isFinite(max) ? max : 0,
      minLabel: items[minIdx]?.month,
      maxLabel: items[maxIdx]?.month,
      minLocalIndex: minIdx,
      maxLocalIndex: maxIdx,
      ma,
    };
  }, [domain, data]);

  // Wheel zoom (centered)
  function onWheel(e: React.WheelEvent) {
    if (!data.length) return;
    if (e.cancelable) e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9; // zoom out / zoom in
    const startIndex = domain ? domain.start : 0;
    const endIndex = domain ? domain.end : data.length - 1;
    const center = Math.round((startIndex + endIndex) / 2);
    const newHalf = Math.max(
      1,
      Math.round(((endIndex - startIndex + 1) / 2) * factor)
    );
    let newStart = Math.max(0, center - newHalf);
    let newEnd = Math.min(data.length - 1, center + newHalf);
    if (newEnd - newStart < 2) newEnd = Math.min(data.length - 1, newStart + 2);
    setDomain({ start: newStart, end: newEnd });
  }

  // Drag pan
  const drag = React.useRef<{
    startX: number;
    startDomain: { start: number; end: number } | null;
  } | null>(null);

  function onMouseDown(e: React.MouseEvent) {
    drag.current = {
      startX: e.clientX,
      startDomain: domain || { start: 0, end: data.length - 1 },
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!drag.current) return;
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    const pxDelta = e.clientX - drag.current.startX;
    const visible =
      drag.current.startDomain!.end - drag.current.startDomain!.start + 1;
    const pxPerItem = box.width / Math.max(1, visible);
    const itemDelta = Math.round(-pxDelta / pxPerItem);
    let newStart = drag.current.startDomain!.start + itemDelta;
    let newEnd = drag.current.startDomain!.end + itemDelta;
    const maxIndex = data.length - 1;
    if (newStart < 0) {
      newEnd -= newStart;
      newStart = 0;
    }
    if (newEnd > maxIndex) {
      const over = newEnd - maxIndex;
      newStart -= over;
      newEnd = maxIndex;
    }
    setDomain({
      start: Math.max(0, newStart),
      end: Math.max(newStart + 2, newEnd),
    });
  }

  function onMouseUp() {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    drag.current = null;
  }

  const [hoverX, setHoverX] = React.useState<string | null>(null);
  const [hoverY, setHoverY] = React.useState<number | null>(null);

  // Detect dark mode
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  function setLastN(n: number) {
    const len = data.length;
    if (!len) return;
    const start = Math.max(0, len - n);
    const end = len - 1;
    setDomain({ start, end });
  }

  const Content = (
    <div className="p-0">
      {/* Compact legend with selection stats */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--color-total)" }}
          />{" "}
          Total
        </span>
        <span>
          Avg:{" "}
          <span className="text-slate-900 dark:text-slate-200 font-semibold">
            {slice.mean ? slice.mean.toFixed(1) : 0}
          </span>
        </span>
        <span>
          Min:{" "}
          <span className="text-slate-900 dark:text-slate-200 font-semibold">
            {slice.min?.toFixed ? slice.min.toFixed(0) : slice.min}
          </span>
          {slice.minLabel ? ` (${slice.items.find(item => item.month === slice.minLabel)?.date || slice.minLabel})` : ""}
        </span>
        <span>
          Max:{" "}
          <span className="text-slate-900 dark:text-slate-200 font-semibold">
            {slice.max?.toFixed ? slice.max.toFixed(0) : slice.max}
          </span>
          {slice.maxLabel ? ` (${slice.items.find(item => item.month === slice.maxLabel)?.date || slice.maxLabel})` : ""}
        </span>
        <span>
          Range:{" "}
          <span className="text-slate-900 dark:text-slate-200 font-semibold">{slice.items[0]?.date || "-"}</span>{" "}
          →{" "}
          <span className="text-slate-900 dark:text-slate-200 font-semibold">
            {slice.items[slice.items.length - 1]?.date || "-"}
          </span>
        </span>
      </div>
      <div
        className="h-full min-h-[350px]"
        ref={containerRef}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        role="region"
        aria-label="Interactive area chart"
      >
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                No data available
              </h3>
              <p className="text-slate-500 dark:text-slate-500 text-sm">
                Chart data will appear here once enquiries are received
              </p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={data}
                margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              >
                <CartesianGrid 
                  vertical={false} 
                  stroke={isDarkMode ? "rgba(148,163,184,.15)" : "rgba(100,116,139,.2)"}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke={isDarkMode ? "#94a3b8" : "#475569"}
                  style={{ fill: isDarkMode ? "#94a3b8" : "#475569" }}
                />
                <YAxis
                  stroke={isDarkMode ? "#94a3b8" : "#475569"}
                  style={{ fill: isDarkMode ? "#94a3b8" : "#475569" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => Math.round(v).toString()}
                />
                <Tooltip
                  contentStyle={{
                    background: isDarkMode ? "#0b1220" : "#ffffff",
                    border: isDarkMode ? "1px solid #1f2937" : "1px solid #e2e8f0",
                    borderRadius: 12,
                  }}
                  labelStyle={{ 
                    color: isDarkMode ? "#e5e7eb" : "#1e293b", 
                    fontWeight: 600 
                  }}
                  itemStyle={{ 
                    color: isDarkMode ? "#cbd5e1" : "#475569" 
                  }}
                  formatter={(value: any) => [value, "Enquiries"]}
                />
                <Area
                  dataKey="total"
                  type="monotone"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  );

  if (bare) {
    return Content;
  }

  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardHeader className="border-b border-slate-800">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">{Content}</CardContent>
    </Card>
  );
}
