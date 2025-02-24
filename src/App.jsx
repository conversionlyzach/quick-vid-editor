// src/App.jsx
import React, { useState } from 'react';
import NavMenu from './components/NavMenu';
import MediaFolder from './components/MediaFolder';
import VideoPreview from './components/VideoPreview';
import Timeline from './components/Timeline';

const App = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]); // store { name, url }
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Unified onFileDrop callback – receives a File object.
  const handleFileDrop = (file) => {
    const fileObj = {
      name: file.name,
      url: URL.createObjectURL(file)
    };
    if (!videoUrl) {
      setVideoUrl(fileObj.url);
    }
    setMediaFiles(prev => [...prev, fileObj]);
  };

  // Toggle play/pause state.
  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  // This callback is triggered from TimelineHeader's speed dropdown.
  const handleSpeedChange = (newSpeed) => {
    setPlaybackSpeed(newSpeed);
  };

  const segments = [
    { id: 'seg1', start: 0, end: videoDuration, label: `00:00:00 - ${videoDuration}` }
  ];

  return (
    <div className="flex h-screen min-w-0" style={{ fontFamily: "sans-serif" }}>
      {/* NavMenu Column */}
      <div className="w-20 h-full bg-nav text-fontWhite" style={{ position: 'relative', zIndex: 10 }}>
        <NavMenu />
      </div>
      {/* MediaFolder Column */}
      <div className="w-1/5 h-full flex-shrink-0 bg-mediaBg border-r border-borderSilver text-fontWhite">
        <MediaFolder mediaFiles={mediaFiles} onFileDrop={handleFileDrop} />
      </div>
      {/* Editor Container */}
      <div className="flex-1 h-full flex flex-col">
        <div className="flex-1 bg-previewBg p-20 min-w-0">
          <VideoPreview 
            videoUrl={videoUrl} 
            onFileDrop={handleFileDrop} 
            onDurationChange={setVideoDuration}
            onTimeUpdate={setPlaybackTime}
            playbackTime={playbackTime}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
          />
        </div>
        <div className="h-[260px] bg-previewBg border-t border-borderSilver min-w-0">
          {videoUrl ? (
            <Timeline 
            videoDuration={videoDuration} 
            segments={segments} 
            playbackTime={playbackTime}
            onSeek={setPlaybackTime}
            onPlayPause={handlePlayPause}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
          />
          
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Drop your file here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
