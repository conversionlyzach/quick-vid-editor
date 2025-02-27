import os
import subprocess
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import openai  # Ensure you're using openai==0.28.0 for legacy transcription support
import re

app = Flask(__name__)
CORS(app)

load_dotenv('backend.env')
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024 * 1024  # 25GB

UPLOAD_FOLDER = "uploads"
AUDIO_FOLDER = "audio"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

openai.api_key = os.getenv('OPENAI_API_KEY')

def format_time(seconds):
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hrs:02d}:{mins:02d}:{secs:02d}"

@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)
    print(f"Saved file to: {filepath}, size: {os.path.getsize(filepath)} bytes")

    # Always convert to mp3 to compress file size
    name, _ = os.path.splitext(filename)
    audio_filename = name + ".mp3"
    audio_filepath = os.path.join(AUDIO_FOLDER, audio_filename)
    try:
        cmd = [
            "ffmpeg",
            "-y",  # Overwrite if exists
            "-i", filepath,
            "-vn",
            "-ar", "44100",
            "-ac", "2",
            "-b:a", "128k",  # Use 128 kbps for better compression
            audio_filepath
        ]
        print("Running FFmpeg command:", cmd)
        subprocess.run(cmd, check=True)
        print("FFmpeg completed. Audio saved to:", audio_filepath)
    except subprocess.CalledProcessError as e:
        print("FFmpeg error:", e)
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"FFmpeg failed: {e}"}), 500

    try:
        with open(audio_filepath, "rb") as audio_file:
            transcript_response = openai.Audio.transcribe(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
                language="en",
                task="transcribe"
            )
        print("Transcript response:", transcript_response)
        transcript = []
        if "segments" in transcript_response and transcript_response["segments"]:
            for seg in transcript_response["segments"]:
                transcript.append({
                    "effectiveStart": seg.get("start", 0),
                    "effectiveEnd": seg.get("end", 0),
                    "startFormatted": format_time(seg.get("start", 0)),
                    "endFormatted": format_time(seg.get("end", 0)),
                    "text": seg.get("text", "").strip()
                })
        else:
            transcript_text = transcript_response.get("text", "")
            transcript = [{
                "effectiveStart": 0,
                "effectiveEnd": transcript_response.get("duration", 0),
                "startFormatted": "00:00:00",
                "endFormatted": format_time(transcript_response.get("duration", 0)),
                "text": transcript_text
            }]
        print("Transcription successful.")
    except Exception as e:
        print("Error during transcription:", e)
        if os.path.exists(filepath):
            os.remove(filepath)
        if os.path.exists(audio_filepath):
            os.remove(audio_filepath)
        return jsonify({"error": str(e)}), 500

    # Clean up files
    if os.path.exists(filepath):
        os.remove(filepath)
    if os.path.exists(audio_filepath):
        os.remove(audio_filepath)
    return jsonify({"transcript": transcript})

@app.route("/api/detect-dead-space", methods=["POST"])
def detect_dead_space():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Save the uploaded file to disk
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(filepath)
    print(f"Saved file for dead space detection: {filepath}")

    # Build FFmpeg command to detect silence
    cmd = [
         "ffmpeg",
         "-i", filepath,
         "-af", "silencedetect=n=-30dB:d=0.5",
         "-f", "null",
         "-"
    ]
    try:
         # Run FFmpeg and capture stderr output (which contains silencedetect logs)
         process = subprocess.run(cmd, check=True, stderr=subprocess.PIPE, text=True)
         stderr_output = process.stderr
         print("FFmpeg silencedetect output:", stderr_output)
    except subprocess.CalledProcessError as e:
         print("FFmpeg error:", e)
         if os.path.exists(filepath):
             os.remove(filepath)
         return jsonify({"error": f"FFmpeg error: {e}"}), 500

    # Parse the stderr output to extract dead space segments.
    dead_spaces = []
    silence_start = None
    # Look for lines with "silence_start:" and "silence_end:".
    for line in stderr_output.splitlines():
         if "silence_start:" in line:
             match = re.search(r"silence_start:\s*(\d+\.?\d*)", line)
             if match:
                  silence_start = float(match.group(1))
         if "silence_end:" in line and silence_start is not None:
             match = re.search(r"silence_end:\s*(\d+\.?\d*)", line)
             if match:
                  silence_end = float(match.group(1))
                  dead_spaces.append({"start": silence_start, "end": silence_end})
                  silence_start = None  # Reset for next segment

    # Clean up the uploaded file.
    if os.path.exists(filepath):
         os.remove(filepath)

    print("Detected dead space segments:", dead_spaces)
    return jsonify({"deadSpaces": dead_spaces})

if __name__ == "__main__":
    app.run(debug=True, port=5001)
