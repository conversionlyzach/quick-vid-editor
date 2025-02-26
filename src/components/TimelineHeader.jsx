// src/components/TimelineHeader.jsx
import React, { useState } from 'react';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded'; // Scissor icon for split
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const TimelineHeader = ({
  currentTimeSec,
  totalTimeSec,
  onPan,
  onZoomIn,
  onZoomOut,
  onSplit,
  onDeleteSegment = () => {}, // Ensure onDeleteSegment is defined
  onPlayPause,
  isPlaying,
  playbackSpeed,
  onSpeedChange
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleSpeedSelect = (speed) => {
    onSpeedChange(speed);
    setDropdownOpen(false);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

  return (
    <div style={{
      padding: '4px',
      borderBottom: '1px solid var(--transcript-border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: "var(--timeline-bg)",  // white
      color: "var(--timeline-header-icon)",    // #090C14
      position: 'relative'
    }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <UndoRoundedIcon style={{ cursor: 'pointer', color: "var(--timeline-header-icon)" }} />
        <RedoRoundedIcon style={{ cursor: 'pointer', color: "var(--timeline-header-icon)" }} />
        <ContentCutRoundedIcon style={{ cursor: 'pointer', color: "var(--timeline-header-icon)" }} onClick={onSplit} />
        <ContentCopyOutlinedIcon style={{ cursor: 'pointer', color: "var(--timeline-header-icon)" }} />
        <DeleteOutlineRoundedIcon style={{ cursor: 'pointer', color: "var(--timeline-header-icon)" }} onClick={() => {
          console.log("Delete icon clicked, calling onDeleteSegment(9,15)");
          onDeleteSegment(9, 15);
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
        <div onClick={onPlayPause} style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              backgroundColor: "var(--timeline-header-icon)", // Circle background: #090C14
              borderRadius: "50%",
              padding: "8px"
            }}
          >
            {isPlaying ? (
              <PauseIcon style={{ color: "#FFFFFF" }} />
            ) : (
              <PlayArrowIcon style={{ color: "#FFFFFF" }} />
            )}
          </div>
        </div>
        <div>
          <span style={{ color: "var(--timeline-header-current)" }}>{formatTime(currentTimeSec)}</span>
          {" / "}
          <span style={{ color: "var(--timeline-header-total)" }}>{formatTime(totalTimeSec)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={toggleDropdown}>
          <span>{playbackSpeed}x</span>
          <ArrowDropDownIcon style={{ color: "var(--timeline-header-icon)" }} />
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: "var(--timeline-bg)",
              border: '1px solid var(--transcript-border)',
              zIndex: 10,
              padding: '4px'
            }}>
              {speedOptions.map((speed) => (
                <div 
                  key={speed} 
                  onClick={() => handleSpeedSelect(speed)}
                  style={{
                    padding: '2px 4px',
                    cursor: 'pointer',
                    backgroundColor: speed === playbackSpeed ? "#03132F" : 'transparent',
                    color: speed === playbackSpeed ? "#FFFFFF" : "var(--timeline-header-icon)"
                  }}
                >
                  {speed}x
                </div>
              ))}
            </div>
          )}
        </div>
        <ZoomInIcon style={{ cursor: 'pointer', color: "var(--timeline-header-icon)" }} onClick={onZoomIn} />
        <ZoomOutIcon style={{ cursor: 'pointer', color: "var(--timeline-header-icon)" }} onClick={onZoomOut} />
        <DragIndicatorIcon style={{ cursor: 'pointer', color: "var(--timeline-header-icon)" }} onClick={onPan} />
      </div>
    </div>
  );
};

export default TimelineHeader;
