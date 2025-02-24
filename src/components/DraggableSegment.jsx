// src/components/DraggableSegment.jsx
import React, { useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

const DraggableSegment = ({ segment, effectiveScale, onSegmentResize }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: segment.id });
  const segRef = useRef(null);

  // Compute the current left position (accounting for any drag offset)
  const left = segment.left + (transform ? transform.x : 0);
  const style = {
    position: 'absolute',
    left: left,
    width: segment.width,
    height: '100%',
    backgroundColor: '#027BCE',
    color: 'black',
    fontSize: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    boxSizing: 'border-box',
    padding: '2px'
  };

  // Helper to format seconds as HH:MM:SS.
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Build the label using the full HH:MM:SS format for start and end times.
  const segmentLabel = `${formatTime(segment.start)} - ${formatTime(segment.end)}`;

  // Resize handling.
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !segRef.current) return;
    const rect = segRef.current.getBoundingClientRect();
    const newWidthPx = e.clientX - rect.left;
    if (newWidthPx > 20) {
      // Convert new width in pixels to seconds.
      const newWidthInSeconds = newWidthPx / effectiveScale;
      onSegmentResize(segment.id, newWidthInSeconds);
    }
  };

  const handleMouseUp = () => {
    if (isResizing) setIsResizing(false);
  };

  return (
    <div
      ref={(node) => { setNodeRef(node); segRef.current = node; }}
      {...listeners}
      {...attributes}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
        {segmentLabel}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'ew-resize',
          backgroundColor: 'rgba(0,0,0,0.3)'
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default DraggableSegment;
