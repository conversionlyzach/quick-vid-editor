// src/components/NavMenu.jsx
import React from 'react';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import logo from "../video-editor-logo.png";

const NavMenu = ({ currentTab, setCurrentTab }) => {
  return (
    <div className="flex flex-col h-full p-2">
      {/* Logo placeholder */}
      <div className="mb-4">
        <img src={logo} alt="Logo" className="mb-2 p-2 text-center" />
      </div>
      {/* Tab buttons */}
      <button
        onClick={() => setCurrentTab("media")}
        className={`mb-2 p-2 text-center ${currentTab === "media" ? "bg-mediaBg" : ""}`}
      >
        <CloudUploadOutlinedIcon />
        <div className="text-xs">Media</div>
      </button>
      <button
        onClick={() => setCurrentTab("transcript")}
        className={`mb-2 p-2 text-center ${currentTab === "transcript" ? "bg-mediaBg" : ""}`}
      >
        <DescriptionOutlinedIcon />
        <div className="text-xs">Transcript</div>
      </button>
    </div>
  );
};

export default NavMenu;
