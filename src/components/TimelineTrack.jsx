// src/components/TimelineTrack.jsx
import React from 'react';

const TimelineTrack = ({
  segments,
  effectiveScale,
  gap = 3,
  onSegmentResize,
  selectedSegmentId,
  setSelectedSegmentId
}) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {segments.map((segment) => {
        const leftPos = segment.effectiveStart * effectiveScale;
        const width = (segment.effectiveEnd - segment.effectiveStart) * effectiveScale - gap;
        const isSelected = segment.id === selectedSegmentId;
        return (
          <div
            key={segment.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSegmentId(segment.id);
            }}
            style={{
              position: 'absolute',
              left: leftPos,
              top: '10px', // Leaves 10px padding at the top
              width: width,
              height: 'calc(100% - 20px)', // Leaves 10px padding at top and bottom
              backgroundColor: "var(--timeline-segment-bg)",
              borderRadius: '3px',
              border: isSelected ? '3px solid var(--timeline-segment-selected)' : 'none',
              boxSizing: 'border-box',
              cursor: 'pointer',
              marginRight: `${gap}px`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: "var(--timeline-segment-text)" }}>
              {segment.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineTrack;
