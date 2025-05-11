from flask import Flask, request, jsonify, send_file
import yt_dlp
import os
from uuid import uuid4

app = Flask(__name__)
DOWNLOAD_FOLDER = "downloads"
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

@app.route("/download", methods=["POST"])
def download_audio():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    temp_id = str(uuid4())
    output_path = os.path.join(DOWNLOAD_FOLDER, f"{temp_id}.%(ext)s")

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'quiet': True,
        'noplaylist': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info).replace(".webm", ".mp3").replace(".m4a", ".mp3")
            return jsonify({
                "title": info.get("title"),
                "artist": info.get("uploader"),
                "file": f"/file/{os.path.basename(filename)}"
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/file/<filename>")
def serve_file(filename):
    path = os.path.join(DOWNLOAD_FOLDER, filename)
    return send_file(path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
