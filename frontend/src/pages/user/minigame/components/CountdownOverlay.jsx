import React, { useEffect, useState } from "react";

export default function CountdownOverlay({ show, onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (!show) {
      setCount(3);
      return;
    }

    if (count > 0) {
      const timer = setTimeout(() => setCount(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [show, count, onComplete]);

  if (!show || count === 0) return null;

  return (
    <div className="mg-countdown-overlay">
      <div key={count} className="mg-countdown-number">
        {count}
      </div>
    </div>
  );
}
