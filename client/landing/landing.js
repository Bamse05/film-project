
document.addEventListener("DOMContentLoaded", () => {
  loadLeaderboard();
  randomizeReelPosters();
});

let currentTopScores = [];
let pendingPlayerScore = 0;

async function loadLeaderboard() {
  const response = await fetch(serverUrl + "/leaderboard/top", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    currentTopScores = await response.json();
    const tbody = document.getElementById("leaderboardBody");

    currentTopScores.forEach((entry, index) => {
      const tr = document.createElement("tr");

      const rankTd = document.createElement("td");
      rankTd.textContent = index + 1;
      tr.appendChild(rankTd);

      const nameTd = document.createElement("td");
      nameTd.textContent = entry.name;
      tr.appendChild(nameTd);

      const scoreTd = document.createElement("td");
      scoreTd.textContent = entry.score;
      tr.appendChild(scoreTd);

      tbody.appendChild(tr);
    });
  }
}
async function randomizeReelPosters() {
  const sidebars = document.querySelectorAll(".movieSideBar");
  if (sidebars.length === 0) return;

  try {
    const response = await fetch(serverUrl + "/imdb/list");
    if (!response.ok) throw new Error("Could not fetch ID list");
    const idList = await response.json();

    for (const sidebar of sidebars) {
      const posters = sidebar.querySelectorAll(".movie-poster");

      for (let i = 0; i < 6; i++) {
        if (posters[i]) {
          const randomIndex = Math.floor(Math.random() * idList.length);
          const randomMovieId = idList[randomIndex];

          const movieInfo = await reqMovieData(randomMovieId);

          if (movieInfo && movieInfo.normalized_id) {
            posters[i].src =
              serverUrl + "/imdb/image/" + movieInfo.normalized_id;
          }

          posters[i].onerror = function () {
            this.src = placeholderImgUrl;
          };
        }
      }

      setTimeout(() => {
        for (let j = 0; j < 4; j++) {
          if (posters[j] && posters[j + 6]) {
            posters[j + 6].src = posters[j].src;
            posters[j + 6].onerror = function () {
              this.src = placeholderImgUrl;
            };
          }
        }
      }, 500);
    }
  } catch (error) {
    console.error("Failed to randomize posters:", error);
  }
}

function playGame(event) {
  event.preventDefault();

  document.getElementById("left").style.display = "none";
  document.getElementById("right").style.display = "none";
  document.getElementById("center-content").style.display = "none";
  document.getElementById("mainBody").style.background = "none";

  const animContainer = document.getElementById("curtain-animation-container");
  animContainer.style.display = "block";
  animContainer.style.opacity = "1";

  const gifImage = document.getElementById("curtain-gif");
  gifImage.src = "../../server/Images/curtaingif.gif?t=" + new Date().getTime();

  const totalGifTime = 3000;

  setTimeout(() => {
    window.location.href = "../game/game.html";
  }, totalGifTime);
}
