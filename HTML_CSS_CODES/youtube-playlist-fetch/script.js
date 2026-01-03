const API_KEY = "your_api_key_here"; // Replace with your YouTube Data API v3 key
const PLAYLIST_ID = "your_playlist_id_here"; // Replace with your YouTube playlist ID

const grid = document.getElementById("videoGrid");
const player = document.getElementById("player");

async function loadPlaylist() {
    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`
        );
        const data = await res.json();

        const videos = data.items.map(item => ({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url
        }));

        // First video autoplay
        if (videos.length) {
            playVideo(videos[0].videoId);
        }

        // Render grid
        videos.forEach(video => {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
        <img src="${video.thumbnail}" />
        <div class="title">${video.title}</div>
      `;

            card.onclick = () => playVideo(video.videoId);

            grid.appendChild(card);
        });

    } catch (err) {
        console.error("Failed to load playlist", err);
    }
}

function playVideo(videoId) {
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

loadPlaylist();
