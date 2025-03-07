// src/components/TimelineTrack.jsx
import React from 'react';

const TimelineTrack = ({
  segments,
  effectiveScale,
  gap = 3,
  onSegmentResize,
  selectedSegmentIds,
  setSelectedSegmentIds
}) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {segments.map((segment) => {
        const leftPos = segment.effectiveStart * effectiveScale;
        const width = (segment.effectiveEnd - segment.effectiveStart) * effectiveScale - gap;
        const isSelected = selectedSegmentIds.includes(segment.id);
        return (
          <div
            key={segment.id}
            onClick={(e) => {
              e.stopPropagation();
              // If meta key is pressed, toggle this segment in multi-select; otherwise, set it as the sole selection.
              if (e.metaKey) {
                if (selectedSegmentIds.includes(segment.id)) {
                  setSelectedSegmentIds(selectedSegmentIds.filter(id => id !== segment.id));
                } else {
                  setSelectedSegmentIds([...selectedSegmentIds, segment.id]);
                }
              } else {
                setSelectedSegmentIds([segment.id]);
              }
            }}
            style={{
              position: 'absolute',
              left: leftPos,
              top: '10px',
              width: width,
              height: 'calc(100% - 20px)',
              backgroundColor: segment.isDeadSpace ? "#FB3B34" : "var(--timeline-segment-bg)",
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
