import { useRef, useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export default function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);

  // Intersection Observer to only render when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Define helper functions first
  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  // Memoize map creation to prevent recreation on every render
  const { svgMap, mapData } = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    const svgMap = map.getSVG({
      radius: 0.22,
      color: "#00000040",
      shape: "circle",
      backgroundColor: "white",
    });

    // Pre-calculate all points to avoid recalculation
    const mapData = dots.map((dot) => ({
      start: projectPoint(dot.start.lat, dot.start.lng),
      end: projectPoint(dot.end.lat, dot.end.lng),
      startLabel: dot.start.label || "Unknown",
      endLabel: dot.end.label || "Unknown",
    }));

    return { svgMap, mapData };
  }, [dots]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans"
    >
      {!isVisible ? (
        // Loading placeholder
        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <div className="inline-block animate-pulse rounded-full h-6 w-6 bg-blue-600 mb-2"></div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Preparing map...
            </p>
          </div>
        </div>
      ) : (
        <>
          <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
            className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
            alt="world map"
            height="495"
            width="1056"
            draggable={false}
          />
          <svg
            ref={svgRef}
            viewBox="0 0 800 400"
            className="w-full h-full absolute inset-0 pointer-events-none select-none"
          >
            <defs>
              <linearGradient
                id="path-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
                <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Simplified paths without complex animations */}
            {mapData.map((data, i) => (
              <g key={`path-group-${i}`}>
                <motion.path
                  d={createCurvedPath(data.start, data.end)}
                  fill="none"
                  stroke="url(#path-gradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.6, // Further reduced duration
                    delay: 0.1 * i, // Further reduced delay
                    ease: "easeOut",
                  }}
                />
              </g>
            ))}

            {/* Simplified points with reduced animations */}
            {mapData.map((data, i) => (
              <g key={`points-group-${i}`}>
                {/* Start point */}
                <circle
                  cx={data.start.x}
                  cy={data.start.y}
                  r="3"
                  fill={lineColor}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() =>
                    setHoveredPoint({
                      x: data.start.x,
                      y: data.start.y,
                      label: data.startLabel,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* End point */}
                <circle
                  cx={data.end.x}
                  cy={data.end.y}
                  r="3"
                  fill={lineColor}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() =>
                    setHoveredPoint({
                      x: data.end.x,
                      y: data.end.y,
                      label: data.endLabel,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* Tooltip for hovered points */}
          {hoveredPoint && (
            <div
              className="absolute bg-white/95 text-gray-900 px-3 py-1 rounded-lg text-sm font-medium pointer-events-none z-20 border border-gray-200 shadow-lg"
              style={{
                left: `${(hoveredPoint.x / 800) * 100}%`,
                top: `${(hoveredPoint.y / 400) * 100}%`,
                transform: "translate(-50%, -120%)",
              }}
            >
              {hoveredPoint.label}
            </div>
          )}
        </>
      )}
    </div>
  );
}
