# Advanced Web-Based Video Editor

This project is a modern, web-based video editor designed to speed up video editing workflows for teams. It aims to simplify the editing process by providing a clean, intuitive interface inspired by professional editors like Adobe Premiere. The application focuses on rapid editing through features like automated timeline segmentation, drag-and-drop controls, and integrated transcription, allowing for efficient jump cuts and precise trimming.

## Features

- **Intuitive User Interface:**  
  - A dedicated **NavMenu** with multiple tabs (e.g., Media, Transcript) for navigating different media and editing functions.
  - A **Media Folder** that displays uploaded media files with thumbnails, duration, and file names.
  - An **Editor Container** featuring a video preview area and a timeline.

- **Timeline Editing:**  
  - A timeline with a dynamic ruler that adjusts marker intervals based on zoom level.
  - Drag-and-drop playhead for controlling video playback.
  - Split, delete, trim, merge, and multi-select actions for timeline segments.
  - Zoom in/out functionality on the timeline.

- **Video Playback Controls:**  
  - Custom play/pause button and playback speed controller integrated in the timeline header.
  - The playback speed can be adjusted between 0.25x and 3x via a dropdown menu.

- **Transcription Integration (Future Feature):**  
  - A dedicated transcript tab that uses OpenAI Whisper for audio transcription.
  - Ability to edit and delete transcript segments, with corresponding updates to the timeline and preview.

- **Advanced Audio/Video Features (Future Feature):**  
  - Display of an audio waveform for each timeline segment.
  - Automated trimming of dead space or repeated dialogue.

- **Undo/Redo Support (Future Feature):**  
  - Unlimited undo/redo functionality for all editing actions.

## Technology Stack

- **Frontend:**  
  - React for UI development  
  - Material UI (MUI) for icons and components  
  - Tailwind CSS for styling

- **Backend / API (Future):**  
  - Integration with OpenAI Whisper for video transcription  
  - Other APIs for audio processing and advanced editing features

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm start
    ```

4. The application will run on http://localhost:3000.

## Usage
Upload Media:

Drag and drop a video file into the preview area or click to upload.
The first uploaded file will populate the video preview and timeline, while additional files will appear in the Media Folder.
Editing on the Timeline:

Use the playhead to control video playback.
Split, trim, or merge segments using the controls in the timeline header.
Adjust zoom and playback speed using the provided buttons.
Transcription and Advanced Editing:

(Future Feature) Switch to the Transcript tab via the NavMenu to generate and edit a transcription of your video.

## Version Control
The current UI and functionality have been tagged as v1.0. Please refer to the GitHub tags for previous versions as new features are implemented.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
MIT License

Acknowledgments
- Inspired by professional video editing tools like Adobe Premiere.
- Built using React, Material UI, and Tailwind CSS. 