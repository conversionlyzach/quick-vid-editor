// src/components/MediaFolder.jsx
import React, { useRef } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const MediaFolder = ({ mediaFiles, onFileDrop }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && onFileDrop) {
      onFileDrop(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileDrop) {
      onFileDrop(file);
    }
  };

  // Helper function to format seconds as HH:MM:SS.
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="w-full max-w-full h-full p-2 flex flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Upload Button */}
      <button 
        onClick={handleButtonClick}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded mb-4 w-full"
      >
        <CloudUploadIcon style={{ fontSize: '1.5rem' }} />
        <span>Upload</span>
      </button>
      <input 
        type="file" 
        accept="video/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Media Files Grid or Drop Zone */}
      {mediaFiles && mediaFiles.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 flex-grow w-full">
          {mediaFiles.map((file, index) => (
            <div key={index} className="flex flex-col">
              <div className="relative w-full h-40 bg-gray-800 rounded overflow-hidden">
                <video 
                  src={file.url} 
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1">
                  {file.duration ? formatTime(file.duration) : "00:00:00"}
                </div>
              </div>
              <div className="mt-2 text-sm text-white break-all">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow border-2 border-dashed border-gray-500 rounded w-full">
          <CloudUploadIcon style={{ fontSize: '3rem', color: '#027BCE' }} />
          <p className="mt-2 text-gray-400">Drop your file here or click Upload</p>
        </div>
      )}
    </div>
  );
};

export default MediaFolder;
