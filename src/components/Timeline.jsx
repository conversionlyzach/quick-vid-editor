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

// Helper function to split the full timeline into segments based on dead space boundaries.
const splitSegments = (deadSpaces, videoDuration, formatTime) => {
  const segments = [];
  let currentStart = 0;
  let segCount = 1;
  // Ensure deadSpaces are sorted by start time.
  deadSpaces.sort((a, b) => a.start - b.start);
  for (const ds of deadSpaces) {
    // Create a normal segment before the dead space (if any)
    if (ds.start > currentStart) {
      segments.push({
        id: `seg${segCount}`,
        originalStart: currentStart,
        originalEnd: ds.start,
        effectiveStart: currentStart,
        effectiveEnd: ds.start,
        label: `${formatTime(currentStart)} - ${formatTime(ds.start)}`,
        isDeadSpace: false
      });
      segCount++;
    }
    // Create a dead space segment
    segments.push({
      id: `seg${segCount}`,
      originalStart: ds.start,
      originalEnd: ds.end,
      effectiveStart: ds.start,
      effectiveEnd: ds.end,
      label: `${formatTime(ds.start)} - ${formatTime(ds.end)}`,
      isDeadSpace: true
    });
    segCount++;
    currentStart = ds.end;
  }
  // If there is any remainder after the last dead space, add a final normal segment.
  if (currentStart < videoDuration) {
    segments.push({
      id: `seg${segCount}`,
      originalStart: currentStart,
      originalEnd: videoDuration,
      effectiveStart: currentStart,
      effectiveEnd: videoDuration,
      label: `${formatTime(currentStart)} - ${formatTime(videoDuration)}`,
      isDeadSpace: false
    });
  }
  return segments;
};

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
  videoFile, // Accept videoFile prop from parent
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

  // Local state for multi-select (for dead space selection) and single selection.
  const [selectedSegmentIds, setSelectedSegmentIds] = useState([]);
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
    // Create two new segments, preserving the isDeadSpace property
    const newSeg1 = {
      id: seg.id + "-1",
      originalStart: seg.originalStart,
      originalEnd: originalSplit,
      effectiveStart: 0,
      effectiveEnd: 0,
      label: "",
      isDeadSpace: seg.isDeadSpace
    };
    const newSeg2 = {
      id: seg.id + "-2",
      originalStart: originalSplit,
      originalEnd: seg.originalEnd,
      effectiveStart: 0,
      effectiveEnd: 0,
      label: "",
      isDeadSpace: seg.isDeadSpace
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
    setSelectedSegmentIds([]);
  };

  // Deletion functionality.
  const handleLocalDeleteSegment = () => {
    let idsToDelete = [];
    if (selectedSegmentIds.length > 0) {
      idsToDelete = selectedSegmentIds;
    } else if (selectedSegmentId) {
      idsToDelete = [selectedSegmentId];
    } else {
      alert("No segment selected for deletion.");
      return;
    }

    // Show confirmation based on how many segments are selected.
    if (idsToDelete.length > 1) {
      if (!window.confirm("Are you sure you want to delete all selected segments?")) {
        return;
      }
    } else {
      if (!window.confirm("Are you sure you want to delete this segment?")) {
        return;
      }
    }

    const remaining = segments.filter(seg => !idsToDelete.includes(seg.id));
    const newSegments = recalcEffectiveSegments(remaining);
    setSegments(newSegments);
    setSelectedSegmentIds([]);
    setSelectedSegmentId(null);
    if (onSeek) {
      onSeek(remaining.length > 0 ? remaining[0].effectiveStart : 0);
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

  // --- NEW: Dead Space Detection ---
  const [deadSpaceProcessing, setDeadSpaceProcessing] = useState(false);

  const detectDeadSpace = async (e) => {
    if (e && (e.metaKey || e.ctrlKey)) {
      // Toggle selection of all dead space segments...
      const allDeadIds = segments.filter(s => s.isDeadSpace).map(s => s.id);
      if (selectedSegmentIds.length === allDeadIds.length) {
        setSelectedSegmentIds([]);
      } else {
        setSelectedSegmentIds(allDeadIds);
      }
      return;
    }    
    if (!videoFile) {
      alert("No video file available for dead space detection.");
      return;
    }
    setDeadSpaceProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      const response = await fetch("http://localhost:5001/api/detect-dead-space", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        throw new Error("Dead space detection API request failed");
      }
      const data = await response.json();
      // Automatically split the timeline based on detected dead spaces.
      const newSegments = splitSegments(data.deadSpaces, videoDuration, formatTime);
      setSegments(newSegments);
    } catch (error) {
      console.error("Error in dead space detection:", error);
      alert("Dead space detection failed.");
    } finally {
      setDeadSpaceProcessing(false);
    }
  };
  // --- End Dead Space Detection ---

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
            handleLocalDeleteSegment();
          }}
          onPlayPause={onPlayPause}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onSpeedChange={onSpeedChange}
          onDetectDeadSpace={detectDeadSpace} // Pass dead space detection callback
        />
        <div style={{ width: "100%", height: "182px", overflow: "hidden", position: 'relative' }}>
          {deadSpaceProcessing && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: '#333'
            }}>
              Processing dead space...
            </div>
          )}
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
                  selectedSegmentIds={selectedSegmentIds}
                  setSelectedSegmentIds={setSelectedSegmentIds}
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
