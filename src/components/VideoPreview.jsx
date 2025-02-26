// src/components/VideoPreview.jsx
import React, { useRef, useEffect } from 'react';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

/**
 * Given an effective (edited) timeline time and an array of effective segments,
 * returns the corresponding original video time.
 */
const mapEffectiveTimeToOriginalTime = (effectiveTime, segments) => {
  for (const seg of segments) {
    if (effectiveTime >= seg.effectiveStart && effectiveTime < seg.effectiveEnd) {
      const offset = effectiveTime - seg.effectiveStart;
      return seg.originalStart + offset;
    }
  }
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    return last.originalEnd;
  }
  return effectiveTime;
};

/**
 * Given the current video element time and segments,
 * convert the original time to the effective timeline time.
 */
const mapOriginalTimeToEffectiveTime = (originalTime, segments) => {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (originalTime >= seg.originalStart && originalTime < seg.originalEnd) {
      const offset = originalTime - seg.originalStart;
      return seg.effectiveStart + offset;
    }
    if (i < segments.length - 1) {
      const nextSeg = segments[i + 1];
      if (originalTime >= seg.originalEnd && originalTime < nextSeg.originalStart) {
        return nextSeg.effectiveStart;
      }
    }
  }
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    return last.effectiveEnd;
  }
  return originalTime;
};

const VideoPreview = ({
  videoUrl,
  onFileDrop,
  onDurationChange,
  onTimeUpdate,
  playbackTime,
  isPlaying,
  playbackSpeed,
  isDraggingPlayhead,
  editedMapping // Expected to be { segments, effectiveVideoDuration }
}) => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleDragOver = (e) => { 
    e.preventDefault(); 
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileDrop(file);
  };

  const handleClick = () => {
    if (!videoUrl && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileDrop(file);
  };

  // When playbackTime (effective time) changes, update video.currentTime to the mapped original time.
  useEffect(() => {
    if (videoRef.current && editedMapping && editedMapping.segments && editedMapping.segments.length > 0) {
      const originalTime = mapEffectiveTimeToOriginalTime(playbackTime, editedMapping.segments);
      if (Math.abs(videoRef.current.currentTime - originalTime) > 0.1) {
        videoRef.current.currentTime = originalTime;
      }
    }
  }, [playbackTime, editedMapping]);

  // Update effective time based on the video's current time.
  const handleVideoTimeUpdate = (e) => {
    if (!isDraggingPlayhead && editedMapping && editedMapping.segments && editedMapping.segments.length > 0) {
      const originalTime = e.target.currentTime;
      const effectiveTime = mapOriginalTimeToEffectiveTime(originalTime, editedMapping.segments);
      onTimeUpdate(effectiveTime);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className="w-full h-full flex items-center justify-center"
      style={{ 
        cursor: videoUrl ? "default" : "pointer",
        backgroundColor: "var(--video-preview-bg)"
      }}
    >
      {!videoUrl ? (
        <div className="w-full h-full border-2 border-dashed rounded flex flex-col items-center justify-center"
             style={{ 
               borderColor: "var(--upload-border-color)",
               color: "var(--upload-text-color)"
             }}>
          <CloudUploadOutlinedIcon style={{ fontSize: 50, color: "var(--upload-icon-color)" }} />
          <p className="mt-2 text-lg">Drag and drop a video file here or click to upload</p>
          <input 
            type="file" 
            accept="video/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          onLoadedMetadata={(e) => onDurationChange(e.target.duration)}
          onTimeUpdate={handleVideoTimeUpdate}
          style={{ width: "100%", maxHeight: "600px", objectFit: "contain" }}
        />
      )}
    </div>
  );
};

export default VideoPreview;
