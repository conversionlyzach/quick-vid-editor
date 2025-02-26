// src/components/TimelineRuler.jsx
import React from 'react';

const TimelineRuler = ({ videoDuration = 600, visibleTimeRange = 600, effectiveScale = 1 }) => {
  // Generate markers across the full video duration.
  const startTime = 0;
  const endTime = videoDuration;

  // Determine major marker interval based on visibleTimeRange.
  const getMajorInterval = (visibleRange) => {
    if (visibleRange <= 15) return 1;
    else if (visibleRange <= 30) return 3;
    else if (visibleRange <= 60) return 5;
    else if (visibleRange <= 180) return 10;
    else if (visibleRange <= 300) return 15;
    else if (visibleRange <= 600) return 30;
    else if (visibleRange <= 900) return 60;
    else if (visibleRange <= 1200) return 120;
    else if (visibleRange <= 1800) return 180;
    else if (visibleRange <= 2700) return 300;
    else return 600;
  };

  const majorInterval = getMajorInterval(visibleTimeRange);

  // Build markers from startTime to endTime in steps of majorInterval.
  const markers = [];
  for (let t = startTime; t <= endTime; t += majorInterval) {
    markers.push(t);
  }
  if (markers[markers.length - 1] < endTime) {
    markers.push(endTime);
  }

  // Helper to format seconds as HH:MM:SS.
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Each marker cell's width (in pixels).
  const cellWidth = majorInterval * effectiveScale;

  return (
    <div style={{
      display: "flex",
      width: "100%",
      borderBottom: "1px solid var(--timeline-ruler-marker)",
      paddingBottom: "2px",
      fontSize: "0.85rem",
      color: "var(--timeline-ruler-font)",
      backgroundColor: "var(--timeline-ruler-bg)"
    }}>
      {markers.map((t, idx) => (
        <div
          key={idx}
          style={{
            width: `${cellWidth}px`,
            textAlign: "center",
            borderRight: "1px solid var(--timeline-ruler-marker)",
            padding: "0 2px",
            boxSizing: "border-box"
          }}
        >
          {formatTime(t)}
        </div>
      ))}
    </div>
  );
};

export default TimelineRuler;
