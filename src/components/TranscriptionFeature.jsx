// src/components/TranscriptionFeature.jsx
import React, { useState, useEffect } from 'react';
import TranscriptViewer from './TranscriptViewer';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

const TranscriptionFeature = ({
  videoUrl,
  videoFile,
  editedMapping,
  transcript,
  onTranscribe,
  onTranscriptUpdate, // new callback to update parent's transcript state
  loading,
  onSegmentClick,
  currentPlaybackTime,
  isPlaying
}) => {
  const [localTranscript, setLocalTranscript] = useState(transcript || []);

  useEffect(() => {
    setLocalTranscript(transcript);
  }, [transcript]);

  const transcribeVideo = async () => {
    if (!videoFile) return;
    onTranscribe && onTranscribe(); // signal transcription start
    try {
      const formData = new FormData();
      // Upload the original video file directly
      formData.append('file', videoFile);
      formData.append('effectiveMapping', JSON.stringify(editedMapping));

      const response = await fetch('http://localhost:5001/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription API request failed');
      }
      const data = await response.json();
      setLocalTranscript(data.transcript);
      // Update parent's transcript state so deletions work correctly
      onTranscriptUpdate && onTranscriptUpdate(data.transcript);
    } catch (error) {
      console.error('Error during transcription:', error);
    }
  };

  return (
    <div
      className="p-4 h-full flex flex-col justify-center items-center"
      style={{ backgroundColor: "var(--media-bg)" }}
    >
      {localTranscript.length === 0 ? (
        <>
          {!loading ? (
            <div className="flex flex-col items-center">
              <DescriptionOutlinedIcon style={{ fontSize: 80, color: "var(--upload-icon-color)" }} />
              <p className="mt-2 text-lg" style={{ color: "var(--upload-text-color)" }}>
                Generate Transcript
              </p>
              <button
                onClick={transcribeVideo}
                className="mt-4 p-2 rounded w-full"
                style={{
                  backgroundColor: "var(--upload-bg)",
                  color: "var(--upload-font-default)",
                }}
              >
                Transcribe
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className="mb-2">Transcribing...</p>
            </div>
          )}
        </>
      ) : (
        <div className="h-full overflow-y-auto w-full">
          <TranscriptViewer 
            transcriptSegments={localTranscript}
            onSegmentClick={onSegmentClick}
            currentPlaybackTime={currentPlaybackTime}
          />
        </div>
      )}
    </div>
  );
};

export default TranscriptionFeature;
