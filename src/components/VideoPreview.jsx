// src/components/VideoPreview.jsx
import React, { useRef, useEffect } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VideoPreview = ({ videoUrl, onFileDrop, onDurationChange, onTimeUpdate, playbackTime, isPlaying, playbackSpeed }) => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileDrop(file);
    }
  };

  const handleClick = () => {
    if (!videoUrl && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileDrop(file);
    }
  };

  // Sync video currentTime with playbackTime.
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - playbackTime) > 0.1) {
      videoRef.current.currentTime = playbackTime;
    }
  }, [playbackTime]);

  // Update playback rate.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Play or pause based on isPlaying.
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
      style={{ cursor: videoUrl ? "default" : "pointer" }}
    >
      {!videoUrl ? (
        <div className="w-full h-full border-2 border-dashed border-borderSilver flex flex-col items-center justify-center rounded text-fontWhite">
          <CloudUploadIcon style={{ fontSize: 50, color: "#027BCE" }} />
          <p className="mt-2 text-lg">Drag and drop a video file here or click to upload</p>
          <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          // Removed native controls so our custom play/pause control works.
          onLoadedMetadata={(e) => onDurationChange(e.target.duration)}
          onTimeUpdate={(e) => onTimeUpdate(e.target.currentTime)}
          style={{ width: "100%", maxHeight: "600px", objectFit: "contain" }}
        />
      )}
    </div>
  );
};

export default VideoPreview;
