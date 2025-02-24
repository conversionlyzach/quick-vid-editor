import React from 'react';
import DraggableSegment from './DraggableSegment';

const TimelineTrack = ({ segments, effectiveScale, gap = 2, onSegmentResize }) => {
  // Compute each segment's left position and width from its start/end times.
  const computedSegments = segments.map(seg => {
    const left = seg.start * effectiveScale + gap;
    const width = (seg.end - seg.start) * effectiveScale - gap;
    return { ...seg, left, width };
  });

  return (
    <div style={{ position: 'relative', height: '80px', backgroundColor: '#03132F' }}>
      {computedSegments.map(seg => (
        <DraggableSegment 
          key={seg.id}
          segment={seg}
          effectiveScale={effectiveScale}
          onSegmentResize={onSegmentResize}
        />
      ))}
    </div>
  );
};

export default TimelineTrack;
