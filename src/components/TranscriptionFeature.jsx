// src/components/TranscriptionFeature.jsx
import React, { useState, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import TranscriptViewer from './TranscriptViewer';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

// Initialize ffmpeg with your core file from public.
const ffmpeg = createFFmpeg({
  log: true,
  corePath: '/ffmpeg-core.js',
});

// Optionally, you can set a progress callback here if desired.
// (Our extractAudio function simulates progress instead.)

const TranscriptionFeature = ({
  videoUrl,
  videoFile,
  editedMapping,
  transcript,
  onTranscribe,
  loading,
  onSegmentClick,
  currentPlaybackTime, // NEW: receive the current playback time
  isPlaying           // NEW: if needed for additional logic
}) => {
  const [localTranscript, setLocalTranscript] = useState(transcript || []);
  const [progress, setProgress] = useState(0);

  // Update local transcript when transcript prop changes.
  useEffect(() => {
    setLocalTranscript(transcript);
  }, [transcript]);

  // Extract audio using ffmpeg.wasm with simulated progress.
  const extractAudio = async () => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
    setProgress(0);
    const fileData = await fetchFile(videoFile);
    ffmpeg.FS('writeFile', 'input.mp4', fileData);

    // Simulate slower progress: update progress by 1% every 300ms until 95%.
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 1 : prev));
    }, 300);

    await ffmpeg.run(
      '-i',
      'input.mp4',
      '-vn',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-b:a',
      '192k',
      'output.wav'
    );

    clearInterval(progressInterval);
    // Extraction is complete; set progress to 100%.
    setProgress(100);

    const data = ffmpeg.FS('readFile', 'output.wav');
    const blob = new Blob([data.buffer], { type: 'audio/wav' });
    ffmpeg.FS('unlink', 'input.mp4');
    ffmpeg.FS('unlink', 'output.wav');
    return blob;
  };

  const transcribeVideo = async () => {
    if (!videoFile) return;
    // Notify parent that transcription is starting, if needed.
    onTranscribe && onTranscribe();
    try {
      let audioToSend = await extractAudio();
      const formData = new FormData();
      formData.append('file', audioToSend, 'output.wav');
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
              <p className="mb-2">Transcribing... {progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </>
      ) : (
        // When a transcript exists, show it in a scrollable container.
        <div className="h-full overflow-y-auto w-full">
          <TranscriptViewer 
            transcriptSegments={localTranscript}
            onSegmentClick={onSegmentClick}
            currentPlaybackTime={currentPlaybackTime} // NEW: Pass current playback time for active highlighting
          />
        </div>
      )}
    </div>
  );
};

export default TranscriptionFeature;
