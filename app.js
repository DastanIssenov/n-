const trackListEl = document.getElementById("track-list");
const favoritesListEl = document.getElementById("favorites-list");
const albumsEl = document.getElementById("albums");
const playerEl = document.getElementById("player");
const playerCover = document.getElementById("player-cover");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const progressEl = document.getElementById("progress");
const playPauseBtn = document.getElementById("play-pause");

let currentTrack = null;
const audio = new Audio();
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

function renderTracks(trackArray, container, isFavoriteSection = false) {
  container.innerHTML = "";
  trackArray.forEach((track) => {
    const trackEl = document.createElement("div");
    trackEl.className = isFavoriteSection ? "favorite-track" : "track";

    trackEl.innerHTML = `
      <img src="${track.cover}" alt="cover" />
      <div>
        <div><strong>${track.title}</strong></div>
        <div>${track.artist} | ${track.genre}</div>
      </div>
      <div>
        <button onclick="playTrack(${track.id})">Play</button>
        <button onclick="toggleFavorite(${track.id})">
          ${favorites.includes(track.id) ? "❤️" : "🤍"}
        </button>
      </div>
    `;
    container.appendChild(trackEl);
  });
}

function renderAlbums() {
  albumsEl.innerHTML = "<h2>🎶 Albums</h2>";
  albums.forEach((album) => {
    const el = document.createElement("div");
    el.className = "album";
    el.innerHTML = `
      <img src="${album.cover}" alt="album cover" />
      <div>
        <strong>${album.title}</strong><br />
        <em>${album.artist}</em>
      </div>
      <button onclick="showAlbum(${album.id})">Open</button>
    `;
    albumsEl.appendChild(el);
  });
}

function showAlbum(albumId) {
  const album = albums.find((a) => a.id === albumId);
  const albumTracks = tracks.filter((t) => album.trackIds.includes(t.id));
  alert(`Album: ${album.title}`);
  renderTracks(albumTracks, trackListEl);
}

function playTrack(id) {
  currentTrack = tracks.find((t) => t.id === id);
  audio.src = currentTrack.src;
  audio.play();
  playerCover.src = currentTrack.cover;
  playerTitle.textContent = currentTrack.title;
  playerArtist.textContent = currentTrack.artist;
  playerEl.classList.remove("hidden");
  playPauseBtn.textContent = "Pause";
}

playPauseBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "Pause";
  } else {
    audio.pause();
    playPauseBtn.textContent = "Play";
  }
});

audio.ontimeupdate = () => {
  progressEl.value = (audio.currentTime / audio.duration) * 100 || 0;
};

progressEl.addEventListener("input", () => {
  audio.currentTime = (progressEl.value / 100) * audio.duration;
});

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter((f) => f !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderTracks(tracks, trackListEl);
  renderFavorites();
}

function renderFavorites() {
  const favTracks = tracks.filter((t) => favorites.includes(t.id));
  renderTracks(favTracks, favoritesListEl, true);
}

fetch("http://localhost:5000/download", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url }),
})
  .then(res => res.json())
  .then(data => {
    const newTrack = {
      id: tracks.length + 1,
      title: data.title || "Untitled",
      artist: data.artist || "Unknown",
      genre: "YouTube",
      cover: "https://via.placeholder.com/50x50?text=YT",
      albumId: 3,
      src: data.file
    };

    tracks.push(newTrack);

    let album = albums.find(a => a.id === 3);
    if (!album) {
      album = {
        id: 3,
        title: "YouTube Imports",
        artist: "User Added",
        cover: "https://via.placeholder.com/50x50?text=YT",
        trackIds: []
      };
      albums.push(album);
    }

    album.trackIds.push(newTrack.id);
    renderAlbums();
    renderTracks(tracks, trackListEl);
    urlInput.value = "";
  })
  .catch(err => alert("Error downloading: " + err.message));

renderAlbums();
renderTracks(tracks, trackListEl);
renderFavorites();


