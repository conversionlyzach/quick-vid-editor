// src/components/NavMenu.jsx
import React from 'react';
import VideocamIcon from '@mui/icons-material/Videocam';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const NavMenu = () => {
  return (
    <div className="flex flex-col items-center justify-start h-full p-2">
      {/* Logo Icon at the top */}
      <div className="mb-4">
        <VideocamIcon style={{ fontSize: '2.5rem', color: '#E5E7E6' }} />
      </div>
      {/* Separator */}
      <div className="w-full h-px bg-gray-500 mb-4" />
      {/* Media Tab */}
      <div className="w-full">
        <div className="flex flex-col items-center justify-center p-2 bg-mediaBg rounded">
          <CloudUploadIcon style={{ fontSize: '2rem', color: '#E5E7E6' }} />
          <span className="text-xs text-white mt-1">Media</span>
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
