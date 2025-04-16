import React, { useEffect, useRef, useState } from "react";

// TradingView widget component
const TradingViewChart = ({
  symbol = "BINANCE:ETHUSDT",
  theme = "dark",
  height = 400,
}) => {
  const container = useRef(null);
  const scriptRef = useRef(null);
  const [containerId] = useState(
    `tradingview_${Math.random().toString(36).substring(2, 15)}`
  );

  useEffect(() => {
    // Clean up any existing widget
    if (container.current) {
      container.current.innerHTML = "";
    }

    // Create the script element for TradingView widget
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          width: "100%",
          height,
          symbol,
          interval: "15",
          timezone: "Etc/UTC",
          theme: theme === "dark" ? "dark" : "light",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerId,
          hide_side_toolbar: false,
          studies: ["MASimple@tv-basicstudies", "Volume@tv-basicstudies"],
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
        });
      }
    };

    scriptRef.current = script;
    document.head.appendChild(script);

    return () => {
      // Clean up
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [symbol, theme, height, containerId]);

  return (
    <div className="tradingview-chart-container bg-gray-800 rounded-md">
      <div id={containerId} ref={container} style={{ height }} />
    </div>
  );
};

export default TradingViewChart;
