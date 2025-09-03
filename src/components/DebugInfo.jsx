import React, { useEffect, useState } from "react";

const DebugInfo = () => {
  const [intervalCount, setIntervalCount] = useState(0);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount((prev) => prev + 1);

    // Count active intervals
    const count = setInterval(() => {
      setIntervalCount((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(count);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>Renders: {renderCount}</div>
      <div>Interval Ticks: {intervalCount}</div>
      <div>Time: {new Date().toLocaleTimeString()}</div>
    </div>
  );
};

export default DebugInfo;


