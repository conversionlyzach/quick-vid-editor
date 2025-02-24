// src/components/Timeline.jsx
import React, { useState, useRef, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import TimelineHeader from './TimelineHeader';
import TimelineRuler from './TimelineRuler';
import TimelineTrack from './TimelineTrack';
import Playhead from './Playhead';

const ALL_PRESETS = [5, 15, 30, 45, 60, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600];

const computeInitialPreset = (duration) => {
  if (duration < 60) return 60;
  else return 600;
};

const generateAllowedPresets = (duration) => {
  let presets = ALL_PRESETS.filter(x => x <= duration);
  if (presets.length === 0) return [duration];
  if (presets[presets.length - 1] < duration) {
    presets.push(duration);
  }
  return presets;
};

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Timeline = ({ 
  videoDuration = 600, 
  segments: initialSegmentsProp = [], 
  playbackTime = 0, 
  onSeek,
  onPlayPause,       // new prop
  isPlaying,         // new prop
  playbackSpeed,     // new prop
  onSpeedChange      // new prop
}) => {
  // Store segments in state.
  const [segments, setSegments] = useState(
    initialSegmentsProp.length > 0
      ? initialSegmentsProp
      : [{
          id: 'seg1',
          start: 0,
          end: videoDuration,
          label: `00:00:00 - ${formatTime(videoDuration)}`
        }]
  );
  
  // Reset segments if videoDuration changes.
  useEffect(() => {
    setSegments([{
      id: 'seg1',
      start: 0,
      end: videoDuration,
      label: `00:00:00 - ${formatTime(videoDuration)}`
    }]);
  }, [videoDuration]);

  // Visible time range for zooming.
  const [visibleTimeRange, setVisibleTimeRange] = useState(computeInitialPreset(videoDuration));
  useEffect(() => {
    setVisibleTimeRange(computeInitialPreset(videoDuration));
  }, [videoDuration]);
  const allowedPresets = generateAllowedPresets(videoDuration);

  // Measure container width.
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // effectiveScale: pixels per second = containerWidth / visibleTimeRange.
  const effectiveScale = containerWidth ? containerWidth / visibleTimeRange : 1;
  // Full timeline width.
  const fullTimelineWidth = videoDuration > 0 ? videoDuration * effectiveScale : 60 * effectiveScale;
  // Ensure inner timeline width is at least containerWidth.
  const innerWidth = fullTimelineWidth < containerWidth ? containerWidth : fullTimelineWidth;

  const currentTime = formatTime(playbackTime);
  const totalTime = videoDuration > 0 ? formatTime(videoDuration) : "00:00:00";

  // Zoom in/out handlers.
  const handleZoomIn = () => {
    const idx = allowedPresets.indexOf(visibleTimeRange);
    if (idx > 0) setVisibleTimeRange(allowedPresets[idx - 1]);
  };
  const handleZoomOut = () => {
    const idx = allowedPresets.indexOf(visibleTimeRange);
    if (idx < allowedPresets.length - 1) setVisibleTimeRange(allowedPresets[idx + 1]);
  };

  const handlePan = () => alert("Pan timeline");

  // Update playback time when the playhead is dragged.
  const handleDragEnd = (event) => {
    const { active, delta } = event;
    if (active.id === 'playhead') {
      let newTime = playbackTime + delta.x / effectiveScale;
      if (newTime < 0) newTime = 0;
      if (newTime > videoDuration) newTime = videoDuration;
      if (onSeek) onSeek(newTime);
    }
  };

  // Split functionality.
  const handleSplit = () => {
    const splitTime = playbackTime;
    const segIndex = segments.findIndex(seg => seg.start < splitTime && seg.end > splitTime);
    if (segIndex === -1) {
      alert("No segment found at current playhead.");
      return;
    }
    const seg = segments[segIndex];
    const newSegment1 = {
      id: seg.id + "-1",
      start: seg.start,
      end: splitTime,
      label: `${formatTime(seg.start)} - ${formatTime(splitTime)}`
    };
    const newSegment2 = {
      id: seg.id + "-2",
      start: splitTime,
      end: seg.end,
      label: `${formatTime(splitTime)} - ${formatTime(seg.end)}`
    };
    const newSegments = [
      ...segments.slice(0, segIndex),
      newSegment1,
      newSegment2,
      ...segments.slice(segIndex + 1)
    ];
    setSegments(newSegments);
  };

  // Auto-scroll: ensure playhead remains visible.
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const playheadPos = playbackTime * effectiveScale;
      const padding = 50;
      if (playheadPos < container.scrollLeft + padding) {
        container.scrollLeft = playheadPos - padding;
      } else if (playheadPos > container.scrollLeft + container.clientWidth - padding) {
        container.scrollLeft = playheadPos - container.clientWidth + padding;
      }
    }
  }, [playbackTime, effectiveScale]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ height: "230px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Timeline Header: fixed at 48px */}
        <div style={{ height: "48px" }}>
          <TimelineHeader 
            currentTimeSec={playbackTime}
            totalTimeSec={videoDuration}
            onPan={handlePan}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onSplit={handleSplit}
            onPlayPause={onPlayPause}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onSpeedChange={onSpeedChange}
          />
        </div>
        {/* Timeline Scroll Area: fixed height = 230px - 48px = 182px */}
        <div style={{ width: "100%", height: "182px", overflow: "hidden" }}>
          <div 
            ref={containerRef} 
            style={{ position: 'relative', width: "100%", overflowX: "auto", height: "100%" }}
          >
            {/* Inner timeline container with left padding of 5px */}
            <div style={{ position: 'absolute', top: 0, left: "5px", width: innerWidth, minWidth: containerWidth ? `${containerWidth}px` : "100%" }}>
              {/* Timeline Ruler: fixed height 60px */}
              <div style={{ height: "60px" }}>
                <TimelineRuler 
                  videoDuration={videoDuration}
                  visibleTimeRange={visibleTimeRange}
                  effectiveScale={effectiveScale}
                />
              </div>
              {/* Timeline Track: fixed height 122px, vertically centered segments */}
              <div style={{ 
                position: "relative", 
                height: "122px", 
                backgroundColor: "#03132F", 
                overflow: "hidden",
                display: "flex",
                alignItems: "center"
              }}>
                <TimelineTrack 
                  segments={segments}
                  effectiveScale={effectiveScale}
                  gap={2}
                  onSegmentResize={() => {}}
                />
                <Playhead 
                  position={playbackTime * effectiveScale} 
                  effectiveScale={effectiveScale} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default Timeline;
