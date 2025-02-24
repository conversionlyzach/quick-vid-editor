import React from 'react';

const TimelineRuler = ({ videoDuration = 600, visibleTimeRange = 600, effectiveScale = 1 }) => {
  // We generate markers across the full video duration.
  const startTime = 0;
  const endTime = videoDuration;

  // Helper: determine major marker interval based on visibleTimeRange.
  // Using your desired mapping:
  // 0-15 sec: 1 sec markers
  // 15-30 sec: 3 sec markers
  // 30-60 sec: 5 sec markers
  // 60-180 sec (1-3 min): 10 sec markers
  // 180-300 sec (3-5 min): 15 sec markers
  // 300-600 sec (5-10 min): 30 sec markers
  // 600-900 sec (10-15 min): 60 sec markers
  // 900-1200 sec (15-20 min): 120 sec markers
  // 1200-1800 sec (20-30 min): 180 sec markers
  // 1800-2700 sec (30-45 min): 300 sec markers
  // 2700+ sec (45+ min): 600 sec markers
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

  // Build markers from 0 to videoDuration in steps of majorInterval.
  const markers = [];
  for (let t = startTime; t <= endTime; t += majorInterval) {
    markers.push(t);
  }
  if (markers[markers.length - 1] < endTime) {
    markers.push(endTime);
  }

  // Helper: format seconds as HH:MM:SS.
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Each marker cell's width (in pixels) is:
  const cellWidth = majorInterval * effectiveScale;

  return (
    <div style={{
      display: "flex",
      width: "100%",
      borderBottom: "1px solid #B7B5B3",
      paddingBottom: "2px",
      fontSize: "0.85rem",
      color: "#E5E7E6",
      backgroundColor: "#000"
    }}>
      {markers.map((t, idx) => (
        <div
          key={idx}
          style={{
            width: `${cellWidth}px`,
            textAlign: "center",
            borderRight: "1px solid #B7B5B3",
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
