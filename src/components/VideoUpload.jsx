// src/components/VideoUpload.jsx
import React from 'react';
import Button from '@mui/material/Button';

const VideoUpload = ({ onVideoSelect }) => {
  return (
    <div className="p-4">
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            const videoUrl = URL.createObjectURL(file);
            onVideoSelect(videoUrl);
          }
        }}
      />
      <Button variant="contained" color="primary" className="ml-2">
        Upload Video
      </Button>
    </div>
  );
};

export default VideoUpload;
