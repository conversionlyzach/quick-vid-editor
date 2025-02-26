// src/components/Timeline.jsx
import React, { useState, useRef, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import TimelineHeader from './TimelineHeader';
import TimelineRuler from './TimelineRuler';
import TimelineTrack from './TimelineTrack';
import Playhead from './Playhead';

const ALL_PRESETS = [5, 15, 30, 45, 60, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600];

const computeInitialPreset = (duration) => (duration < 60 ? 60 : 600);

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

const createInitialSegment = (duration) => ({
  id: 'seg1',
  originalStart: 0,
  originalEnd: duration,
  effectiveStart: 0,
  effectiveEnd: duration,
  label: `00:00:00 - ${formatTime(duration)}`
});

const recalcEffectiveSegments = (segs) => {
  let cumulative = 0;
  return segs.map(seg => {
    const origStart = seg.originalStart !== undefined ? seg.originalStart : seg.start;
    const origEnd = seg.originalEnd !== undefined ? seg.originalEnd : seg.end;
    const dur = origEnd - origStart;
    const newSeg = {
      ...seg,
      originalStart: origStart,
      originalEnd: origEnd,
      effectiveStart: cumulative,
      effectiveEnd: cumulative + dur,
      label: `${formatTime(cumulative)} - ${formatTime(cumulative + dur)}`
    };
    cumulative += dur;
    return newSeg;
  });
};

const Timeline = ({
  videoDuration = 600,
  segments: initialSegmentsProp = [],
  playbackTime = 0,
  onSeek,
  onPlayPause,
  isPlaying,
  playbackSpeed,
  onSpeedChange,
  isDraggingPlayhead,
  setIsDraggingPlayhead,
  wasPlaying,
  setWasPlaying,
  onEditUpdate,
  onDeleteSegment // Parent callback for transcript update
}) => {
  // Local timeline segments state.
  const [segments, setSegments] = useState(
    initialSegmentsProp.length > 0
      ? initialSegmentsProp.map(seg => ({
          ...seg,
          originalStart: seg.originalStart !== undefined ? seg.originalStart : seg.start,
          originalEnd: seg.originalEnd !== undefined ? seg.originalEnd : seg.end,
          effectiveStart: seg.start,
          effectiveEnd: seg.end,
          label: seg.label || `${formatTime(seg.start)} - ${formatTime(seg.end)}`
        }))
      : [createInitialSegment(videoDuration)]
  );

  // Reset segments when videoDuration changes.
  useEffect(() => {
    setSegments([createInitialSegment(videoDuration)]);
  }, [videoDuration]);

  const [visibleTimeRange, setVisibleTimeRange] = useState(computeInitialPreset(videoDuration));
  useEffect(() => {
    setVisibleTimeRange(computeInitialPreset(videoDuration));
  }, [videoDuration]);
  const allowedPresets = generateAllowedPresets(videoDuration);

  // Local state for the currently selected segment (by id).
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);

  // Split functionality.
  const handleSplit = () => {
    const splitTime = playbackTime;
    const segIndex = segments.findIndex(seg => seg.effectiveStart < splitTime && seg.effectiveEnd > splitTime);
    if (segIndex === -1) {
      alert("No segment found at current playhead.");
      return;
    }
    const seg = segments[segIndex];
    const offset = splitTime - seg.effectiveStart;
    const originalSplit = seg.originalStart + offset;
    const newSeg1 = {
      id: seg.id + "-1",
      originalStart: seg.originalStart,
      originalEnd: originalSplit,
      effectiveStart: 0,
      effectiveEnd: 0,
      label: ""
    };
    const newSeg2 = {
      id: seg.id + "-2",
      originalStart: originalSplit,
      originalEnd: seg.originalEnd,
      effectiveStart: 0,
      effectiveEnd: 0,
      label: ""
    };
    const newSegments = [
      ...segments.slice(0, segIndex),
      newSeg1,
      newSeg2,
      ...segments.slice(segIndex + 1)
    ];
    const recalculated = recalcEffectiveSegments(newSegments);
    setSegments(recalculated);
    setSelectedSegmentId(null);
  };

  // Deletion functionality.
  const handleLocalDeleteSegment = () => {
    if (!selectedSegmentId) {
      alert("No segment selected for deletion.");
      return;
    }
    const deletedSegment = segments.find(seg => seg.id === selectedSegmentId);
    if (!deletedSegment) return;
    const deletedDuration = deletedSegment.effectiveEnd - deletedSegment.effectiveStart;
    let newPlaybackTime = playbackTime;
    if (playbackTime >= deletedSegment.effectiveEnd) {
      newPlaybackTime = playbackTime - deletedDuration;
    } else if (playbackTime >= deletedSegment.effectiveStart && playbackTime < deletedSegment.effectiveEnd) {
      newPlaybackTime = deletedSegment.effectiveStart;
    }
    const remaining = segments.filter(seg => seg.id !== selectedSegmentId);
    const newSegments = recalcEffectiveSegments(remaining);
    setSegments(newSegments);
    setSelectedSegmentId(null);
    if (onSeek) {
      onSeek(newPlaybackTime);
    }
  };

  // Compute effective video duration from the segments.
  let effectiveVideoDuration = segments.length > 0 ? segments[segments.length - 1].effectiveEnd : 0;
  if (effectiveVideoDuration <= 0) effectiveVideoDuration = 1;

  useEffect(() => {
    if (onEditUpdate) {
      onEditUpdate({ segments, effectiveVideoDuration });
    }
  }, [segments, effectiveVideoDuration, onEditUpdate]);

  const safeVisibleTimeRange = visibleTimeRange > 0 ? visibleTimeRange : 1;
  useEffect(() => {
    if (effectiveVideoDuration < safeVisibleTimeRange) {
      setVisibleTimeRange(effectiveVideoDuration);
    }
  }, [effectiveVideoDuration, safeVisibleTimeRange]);

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

  const effectiveScale = containerWidth ? containerWidth / safeVisibleTimeRange : 1;
  const fullTimelineWidth = effectiveVideoDuration * effectiveScale;
  const innerWidth = fullTimelineWidth < containerWidth ? containerWidth : fullTimelineWidth;

  const currentTime = formatTime(playbackTime);
  const totalTime = formatTime(effectiveVideoDuration);

  const handleZoomIn = () => {
    const idx = allowedPresets.indexOf(safeVisibleTimeRange);
    if (idx > 0) setVisibleTimeRange(allowedPresets[idx - 1]);
  };

  const handleZoomOut = () => {
    const idx = allowedPresets.indexOf(safeVisibleTimeRange);
    if (idx < allowedPresets.length - 1) setVisibleTimeRange(allowedPresets[idx + 1]);
  };

  const handlePan = () => alert("Pan timeline");

  // Drag handlers for the playhead.
  const handleDragStart = () => {
    setIsDraggingPlayhead(true);
    if (isPlaying) {
      setWasPlaying(true);
      onPlayPause(); // Pause video during drag.
    }
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    if (active.id === 'playhead') {
      let newTime = playbackTime + delta.x / effectiveScale;
      if (newTime < 0) newTime = 0;
      if (newTime > effectiveVideoDuration) newTime = effectiveVideoDuration;
      if (onSeek) onSeek(newTime);
    }
    setIsDraggingPlayhead(false);
    if (wasPlaying) {
      onPlayPause(); // Resume playback if it was playing.
      setWasPlaying(false);
    }
  };

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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ height: "230px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TimelineHeader 
          currentTimeSec={playbackTime}
          totalTimeSec={effectiveVideoDuration}
          onPan={handlePan}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onSplit={handleSplit}
          onDeleteSegment={() => {
            console.log("TimelineHeader delete icon clicked, calling parent's onDeleteSegment");
            if (selectedSegmentId) {
              const deletedSegment = segments.find(seg => seg.id === selectedSegmentId);
              if (deletedSegment && onDeleteSegment) {
                onDeleteSegment(deletedSegment.effectiveStart, deletedSegment.effectiveEnd);
              }
            }
            handleLocalDeleteSegment();
          }}
          onPlayPause={onPlayPause}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onSpeedChange={onSpeedChange}
        />
        <div style={{ width: "100%", height: "182px", overflow: "hidden" }}>
          <div 
            ref={containerRef} 
            style={{ position: 'relative', width: "100%", overflowX: "auto", height: "100%" }}
          >
            <div style={{ position: 'absolute', top: 0, left: "5px", width: innerWidth, minWidth: containerWidth ? `${containerWidth}px` : "100%" }}>
              <div style={{ height: "60px" }}>
                <TimelineRuler 
                  videoDuration={videoDuration}
                  visibleTimeRange={safeVisibleTimeRange}
                  effectiveScale={effectiveScale}
                />
              </div>
              <div style={{ 
                position: "relative", 
                height: "122px", 
                backgroundColor: "var(--timeline-track)", 
                overflow: "hidden",
                display: "flex",
                alignItems: "center"
              }}>
                <TimelineTrack 
                  segments={segments}
                  effectiveScale={effectiveScale}
                  gap={2}
                  onSegmentResize={() => {}}
                  selectedSegmentId={selectedSegmentId}
                  setSelectedSegmentId={setSelectedSegmentId}
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
