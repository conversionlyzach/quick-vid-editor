// src/components/Playhead.jsx
import React from 'react';
import { useDraggable } from '@dnd-kit/core';

const Playhead = ({ position = 50, effectiveScale }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: 'playhead' });
  // Calculate the playhead's current left position (accounting for any drag offset)
  const currentLeft = position + (transform ? transform.x : 0);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        position: 'absolute',
        left: `${currentLeft}px`,
        top: 0,
        bottom: 0,
        width: '20px',            // Wider container for a larger click target
        marginLeft: '-10px',       // Center the container horizontally on currentLeft
        zIndex: 100,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Flag at the top */}
      <div
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: "var(--playhead-color)",
          transform: 'rotate(45deg)',
          marginBottom: '4px'
        }}
      />
      {/* Vertical playhead line */}
      <div
        style={{
          width: '2px',
          flexGrow: 1,
          backgroundColor: "var(--playhead-color)"
        }}
      />
    </div>
  );
};

export default Playhead;
