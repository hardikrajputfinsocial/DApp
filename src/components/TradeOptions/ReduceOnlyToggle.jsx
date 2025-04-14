import React, { useState, useRef } from "react";

const ReduceOnlyToggle = ({ reduceOnly, setReduceOnly }) => {
  const [showInfo, setShowInfo] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowInfo(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowInfo(false), 200);
  };

  return (
    <div className="relative flex items-center justify-between mt-2 text-sm">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={reduceOnly}
          onChange={() => setReduceOnly(!reduceOnly)}
        />
        <span>Reduce-Only</span>
      </div>

      {/* Info Icon */}
      <div
        className="ml-2 cursor-pointer text-gray-400 hover:text-white"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        ℹ️

        {showInfo && (
          <div
            className="absolute right-0 top-6 z-20 w-72 bg-gray-900 text-white text-xs p-4 rounded-lg shadow-lg"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p className="font-semibold mb-2">Time in Force (TIF)</p>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>GTC</strong> (Good Till Cancel): Order stays active until filled or canceled.</li>
              <li><strong>IOC</strong> (Immediate Or Cancel): Fills all or part immediately, cancels the rest.</li>
              <li><strong>FOK</strong> (Fill Or Kill): Must fill completely or not at all.</li>
              <li><strong>GTD</strong> (Good Till Date): Active until a set date/time or until filled/canceled.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReduceOnlyToggle;
