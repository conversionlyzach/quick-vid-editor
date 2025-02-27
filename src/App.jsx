// src/App.jsx
import React, { useState, useEffect } from 'react';
import NavMenu from './components/NavMenu';
import MediaFolder from './components/MediaFolder';
import VideoPreview from './components/VideoPreview';
import Timeline from './components/Timeline';
import TranscriptionFeature from './components/TranscriptionFeature';
import { adjustTranscriptTimestamps } from './utils/adjustTranscript';

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const App = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [editedMapping, setEditedMapping] = useState({
    segments: [],
    effectiveVideoDuration: 0
  });
  const [transcript, setTranscript] = useState([]);
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);
  const [currentTab, setCurrentTab] = useState("media");

  const handleFileDrop = (file) => {
    setVideoFile(file);
    const fileObj = {
      name: file.name,
      url: URL.createObjectURL(file)
    };
    if (!videoUrl) {
      setVideoUrl(fileObj.url);
    }
    setMediaFiles(prev => [...prev, fileObj]);
  };

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleSpeedChange = (newSpeed) => {
    setPlaybackSpeed(newSpeed);
  };

  const segments = [
    {
      id: 'seg1',
      originalStart: 0,
      originalEnd: videoDuration,
      effectiveStart: 0,
      effectiveEnd: videoDuration,
      label: `00:00:00 - ${videoDuration}`
    }
  ];

  const handleDeleteSegment = (deletionStart, deletionEnd) => {
    console.log("handleDeleteSegment called with:", deletionStart, deletionEnd);
    setTranscript(prevTranscript => {
      console.log("Before deletion, transcript:", prevTranscript.map(seg => `${seg.effectiveStart}-${seg.effectiveEnd}`));
      const updatedTranscript = adjustTranscriptTimestamps(prevTranscript, deletionStart, deletionEnd, formatTime);
      console.log("After deletion, updated transcript:", updatedTranscript.map(seg => `${seg.effectiveStart}-${seg.effectiveEnd}`));
      return updatedTranscript;
    });
  };

  useEffect(() => {
    console.log("Transcript state updated:", transcript);
  }, [transcript]);

  return (
    <div className="flex h-screen min-w-0" style={{ fontFamily: "sans-serif" }}>
      {/* NavMenu Column */}
      <div
        className="w-20 h-full"
        style={{
          backgroundColor: "var(--navmenu-bg)",
          color: "var(--navmenu-text)",
          position: "relative",
          zIndex: 10
        }}
      >
        <NavMenu currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>
      {/* Left Column: Media or Transcript */}
      <div
        className="w-1/5 h-full flex-shrink-0"
        style={{
          backgroundColor: "var(--media-bg)",
          borderRight: "1px solid var(--transcript-border)",
          color: "var(--navmenu-text)"
        }}
      >
        {currentTab === "media" ? (
          <MediaFolder mediaFiles={mediaFiles} onFileDrop={handleFileDrop} />
        ) : (
          <TranscriptionFeature 
            videoUrl={videoUrl}
            videoFile={videoFile}
            editedMapping={editedMapping}
            transcript={transcript}
            // Set loading state when transcription starts
            onTranscribe={() => setTranscriptionLoading(true)}
            // Update parent's transcript state when transcription completes
            onTranscriptUpdate={(newTranscript) => {
              setTranscript(newTranscript);
              setTranscriptionLoading(false);
            }}
            loading={transcriptionLoading}
            onSegmentClick={(effectiveStart) => setPlaybackTime(effectiveStart)}
            currentPlaybackTime={playbackTime}  
            isPlaying={isPlaying}                
          />
        )}
      </div>
      {/* Editor Container */}
      <div className="flex-1 h-full flex flex-col">
        {/* Video Preview Area */}
        <div
          className="flex-1 p-20 min-w-0"
          style={{ backgroundColor: "var(--video-preview-bg)" }}
        >
          <VideoPreview 
            videoUrl={videoUrl}
            onFileDrop={handleFileDrop}
            onDurationChange={setVideoDuration}
            onTimeUpdate={setPlaybackTime}
            playbackTime={playbackTime}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            editedMapping={editedMapping}
          />
        </div>
        {/* Timeline Area */}
        <div
          className="h-[230px] min-w-0"
          style={{ backgroundColor: "var(--timeline-bg)", borderTop: "1px solid var(--transcript-border)" }}
        >
          {videoUrl ? (
            <Timeline 
            videoFile={videoFile} // Pass the uploaded video file here
            videoDuration={videoDuration}
            segments={segments}
            playbackTime={playbackTime}
            onSeek={setPlaybackTime}
            onPlayPause={handlePlayPause}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
            isDraggingPlayhead={isDraggingPlayhead}
            setIsDraggingPlayhead={setIsDraggingPlayhead}
            wasPlaying={wasPlaying}
            setWasPlaying={setWasPlaying}
            onEditUpdate={setEditedMapping}
            onDeleteSegment={handleDeleteSegment}
          />          
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--navmenu-text)" }}>
              Drop your file here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
