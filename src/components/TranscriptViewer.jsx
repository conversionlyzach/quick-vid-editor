// src/components/TranscriptViewer.jsx
import React, { useState, useEffect } from 'react';

const TranscriptViewer = ({ transcriptSegments, onSegmentClick, currentPlaybackTime }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Update active transcript segment based on current playback time.
  useEffect(() => {
    if (transcriptSegments.length > 0) {
      const activeIdx = transcriptSegments.findIndex(
        seg =>
          currentPlaybackTime >= seg.effectiveStart &&
          currentPlaybackTime < seg.effectiveEnd
      );
      if (activeIdx !== -1 && activeIdx !== selectedIndex) {
        setSelectedIndex(activeIdx);
      }
    }
  }, [currentPlaybackTime, transcriptSegments, selectedIndex]);

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4" style={{ color: "var(--transcript-text)" }}>
        Transcript
      </h2>
      {transcriptSegments.length === 0 ? (
        <p style={{ color: "var(--transcript-text)" }}>No transcript available.</p>
      ) : (
        <ul className="space-y-2">
          {transcriptSegments.map((seg, idx) => {
            const isActive = currentPlaybackTime >= seg.effectiveStart && currentPlaybackTime < seg.effectiveEnd;
            const borderStyle = (isActive || selectedIndex === idx)
              ? "var(--transcript-active-border)"
              : "var(--transcript-border)";
            const timestampColor = (isActive || selectedIndex === idx)
              ? "var(--transcript-active-timestamp)"
              : "var(--transcript-default-timestamp)";
            return (
              <li
                key={idx}
                onClick={() => {
                  setSelectedIndex(idx);
                  onSegmentClick(seg.effectiveStart);
                }}
                className="p-2 rounded cursor-pointer hover:bg-[#2C2D33]"
                style={{
                  border: borderStyle,
                  backgroundColor: "var(--transcript-bg)",
                  color: "var(--transcript-text)",
                }}
              >
                <div className="text-sm" style={{ color: timestampColor }}>
                  {seg.startFormatted} - {seg.endFormatted}
                </div>
                <div>{seg.text}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TranscriptViewer;
