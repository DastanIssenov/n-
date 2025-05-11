const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('https://')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // sanitize file name
  const outPath = path.join(__dirname, 'downloads', '%(title)s.%(ext)s');

  const command = `yt-dlp -x --audio-format mp3 -o "${outPath}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      return res.status(500).json({ error: 'Download failed' });
    }

    console.log(stdout);
    res.json({ message: 'Download started' });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
