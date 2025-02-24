// src/components/TimelineHeader.jsx
import React, { useState } from 'react';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ContentCutIcon from '@mui/icons-material/ContentCut'; // Scissor icon for split
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
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
  onPlayPause,
  isPlaying,
  playbackSpeed,
  onSpeedChange = () => {} // default to no-op if not provided
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleSpeedSelect = (speed) => {
    onSpeedChange(speed);
    setDropdownOpen(false);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

  return (
    <div
      style={{
        padding: '4px',
        borderBottom: '1px solid #B7B5B3',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1D2840',
        color: '#E5E7E6',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', gap: '8px' }}>
        <UndoIcon style={{ cursor: 'pointer', color: '#E5E7E6' }} />
        <RedoIcon style={{ cursor: 'pointer', color: '#E5E7E6' }} />
        <ContentCutIcon style={{ cursor: 'pointer', color: '#E5E7E6' }} onClick={onSplit} />
        <FileCopyIcon style={{ cursor: 'pointer', color: '#E5E7E6' }} />
        <DeleteIcon style={{ cursor: 'pointer', color: '#E5E7E6' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace' }}>
        {/* Play/Pause Button */}
        <div onClick={onPlayPause} style={{ cursor: 'pointer' }}>
          {isPlaying ? (
            <PauseIcon style={{ color: '#E5E7E6' }} />
          ) : (
            <PlayArrowIcon style={{ color: '#E5E7E6' }} />
          )}
        </div>
        <div>
          {formatTime(currentTimeSec)} / {formatTime(totalTimeSec)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Playback speed controller placed to the left of the zoom icons */}
        <div
          style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={toggleDropdown}
        >
          <span>{playbackSpeed}x</span>
          <ArrowDropDownIcon style={{ color: '#E5E7E6' }} />
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#1D2840',
                border: '1px solid #B7B5B3',
                zIndex: 10,
                padding: '4px'
              }}
            >
              {speedOptions.map((speed) => (
                <div
                  key={speed}
                  onClick={() => handleSpeedSelect(speed)}
                  style={{
                    padding: '2px 4px',
                    cursor: 'pointer',
                    backgroundColor: speed === playbackSpeed ? '#03132F' : 'transparent'
                  }}
                >
                  {speed}x
                </div>
              ))}
            </div>
          )}
        </div>
        <ZoomInIcon style={{ cursor: 'pointer', color: '#E5E7E6' }} onClick={onZoomIn} />
        <ZoomOutIcon style={{ cursor: 'pointer', color: '#E5E7E6' }} onClick={onZoomOut} />
        <DragIndicatorIcon style={{ cursor: 'pointer', color: '#E5E7E6' }} onClick={onPan} />
      </div>
    </div>
  );
};

export default TimelineHeader;
