let gamemode;
let previousMovie;
let currentMovie;
let nextMovie;
let currentScore = 0;
let isGameOver = false;

async function startGame(selectedGamemode) {
  removeTheCorn();
  isGameOver = false;

  gamemode = selectedGamemode;
  gamemodeHeader = document.getElementById("selectedGamemode");
  switch (gamemode) {
    case "releaseYear":
      gamemodeHeader.textContent = "Release year";
      break;
    case "rating":
      gamemodeHeader.textContent = "Rating";
      break;
    case "runtime":
      gamemodeHeader.textContent = "Runtime";
      break;
    default:
      break;
  }

  await createMovieBoxes();

  gameStartAnimation();
}

function gameStartAnimation() {
  fadeBoxes();

  document.getElementById("popcorn-container").classList.add("visible");
  document.querySelector("header").classList.add("visible");
  document.getElementById("centerBox").classList.add("visible");

  document.getElementById("gamemodeContainer").style.display = "none";
  document.getElementById("higherLowerContainer").style.display = "flex";

  document.getElementById("score").classList.add("visible");
}

function fadeBoxes() {
  document.querySelectorAll(".movieinfo").forEach((elem) => {
    elem.classList.add("visible");
  });

  document.querySelectorAll(".infoButton").forEach((elem) => {
    elem.classList.add("visible");
  });
}

function guessHigherOrLower(guess) {
  if (isGameOver) return;
  let guessedRight = higherOrLower(guess);

  if (guessedRight) {
    currentScore++;
    spawnPopcorn(calculatePopcornAmount(currentScore));
    updateScore();
    nextRound();
  } else {
    // BOMBA SLUTA SPELET
    isGameOver = true;
    handleGameOver(); // <-- New function call
  }
}

// --- NEW GAME OVER AND LEADERBOARD LOGIC ---

async function handleGameOver() {
  // Hide the guess buttons and show game over container
  await popTheCorn();

  document.getElementById("higherLowerContainer").style.display = "none";
  const gameOverContainer = document.getElementById("gameOverContainer");
  gameOverContainer.style.display = "flex";

  // Display the final score
  document.getElementById("finalScoreText").textContent = "Your Score: " + currentScore;
  document.getElementById("cornsPoppedText").textContent = "Corns popped: " + getPopcornAmount();

  // Check leaderboard
  try {
    const response = await fetch("http://127.0.0.1:3000/leaderboard/top");
    if (response.ok) {
      const topScores = await response.json();
      let isTop10 = false;

      // If there are less than 10 scores, they automatically make the top 10
      if (topScores.length < 10) {
        isTop10 = true;
      } else {
        // Compare with the lowest score in the top 10 (last element since it's sorted descending)
        const lowestTopScore = topScores[topScores.length - 1].score;
        if (currentScore > lowestTopScore) {
          isTop10 = true;
        }
      }

      // Show leaderboard prompt if they qualify and actually got a score above 0
      if (isTop10 && currentScore > 0) {
        document.getElementById("leaderboardPrompt").style.display = "flex";
      }
    }
  } catch (error) {
    console.error("Could not fetch leaderboard", error);
  }
}

async function submitScore() {
  const nameInput = document.getElementById("playerName");
  const name = nameInput.value.trim() || "Anonymous";

  try {
    await fetch("http://127.0.0.1:3000/leaderboard/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, score: currentScore })
    });

    // Hide the prompt once submitted
    document.getElementById("leaderboardPrompt").style.display = "none";
    nameInput.value = "";

  } catch (error) {
    console.error("Failed to submit score", error);
  }
}

async function resetGame() {
  // Reset score
  currentScore = 0;
  updateScore();

  // Reset UI components
  document.getElementById("gameOverContainer").style.display = "none";
  document.getElementById("leaderboardPrompt").style.display = "none";

  // Bring back the gamemode container
  document.getElementById("gamemodeContainer").style.display = "flex";

  // Hide the game elements (undoing gameStartAnimation)
  document.getElementById("popcorn-container").classList.remove("visible");
  document.querySelector("header").classList.remove("visible");
  document.getElementById("centerBox").classList.remove("visible");
  document.getElementById("score").classList.remove("visible");

  document.querySelectorAll(".movieinfo").forEach((elem) => {
    elem.classList.remove("visible");
  });

  document.querySelectorAll(".infoButton").forEach((elem) => {
    elem.classList.remove("visible");
  });

  // Cycle movies so you get fresh matchups for the next game
  await nextRound();
}

function higherOrLower(guess) {
  switch (gamemode) {
    case "releaseYear": {
      if (
        (guess === "h" && currentMovie.year >= previousMovie.year) ||
        (guess === "l" && currentMovie.year <= previousMovie.year)
      ) {
        return true;
      }
      return false;
    }
    case "rating": {
      if (
        (guess === "h" && currentMovie.rating >= previousMovie.rating) ||
        (guess === "l" && currentMovie.rating <= previousMovie.rating)
      ) {
        return true;
      }
      return false;
    }
    case "runtime": {
      if (
        (guess === "h" && currentMovie.runtime >= previousMovie.runtime) ||
        (guess === "l" && currentMovie.runtime <= previousMovie.runtime)
      ) {
        return true;
      }
      return false;
    }
    default: {
      return true;
    }
  }
}

async function nextRound() {
  previousMovie = currentMovie;
  currentMovie = nextMovie;
  nextMovie = await getRandomMovie();

  await createMovieBoxes();
}

function calculatePopcornAmount(score) {
  if (score <= 1) {
    return 1;
  } else if (score <= 2) {
    return 2;
  } else if (score <= 3) {
    return 3;
  } else if (score <= 5) {
    return 4;
  } else if (score <= 8) {
    return 5;
  } else if (score <= 10) {
    return 6;
  } else if (score <= 15) {
    return 7;
  } else {
    return 8;
  }
}

async function getRandomMovie() {
  let movieNumber = Math.floor(Math.random() * movieIdList.length - 1);
  let movieInfo = await reqMovieData(movieIdList[movieNumber]);
  return movieInfo;
}

function updateScore() {
  scoreElem = document.getElementById("score");
  scoreElem.textContent = "SCORE: " + currentScore;
}

async function buildMovieBox(movieBox, movieInfo, backgroundBox) {
  let moviePoster = null;
  let movieTitle = null;
  let extraInfo = null;

  if (movieBox.id === "leftMovieInfo") {
    moviePoster = document.getElementById("leftPoster");
    movieTitle = document.getElementById("leftTitle");
    extraInfo = document.getElementById("leftSecondInfo");
  } else if (movieBox.id === "rightMovieInfo") {
    moviePoster = document.getElementById("rightPoster");
    movieTitle = document.getElementById("rightTitle");
    extraInfo = document.getElementById("rightSecondInfo");
  }

  let posterSrc = await reqMoviePoster(movieInfo.normalized_id);
  if (!posterSrc) {
    posterSrc = placeholderImgUrl;
  }
  moviePoster.src = posterSrc;
  backgroundBox.style.backgroundImage = "url(" + posterSrc + ")";

  movieTitle.innerHTML = movieInfo.name;

  switch (gamemode) {
    case "releaseYear": {
      extraInfo.innerHTML = "Rating: " + movieInfo.rating;
      extraInfo.appendChild(document.createElement("br"));
      extraInfo.innerHTML += "Runtime: " + movieInfo.runtime;
      break;
    }

    case "rating": {
      extraInfo.innerHTML = "Release year: " + movieInfo.year;
      extraInfo.appendChild(document.createElement("br"));
      extraInfo.innerHTML += "Runtime: " + movieInfo.runtime;
      //extraInfo.appendChild(document.createElement("br")); extraInfo.innerHTML += "Rating: " + movieInfo.rating;
      break;
    }

    case "runtime": {
      extraInfo.innerHTML = "Release year: " + movieInfo.year;
      extraInfo.appendChild(document.createElement("br"));
      extraInfo.innerHTML += "rating: " + movieInfo.rating;
      break;
    }
    default: {
      break;
    }
  }
}

async function createMovieBoxes() {
  const leftMovie = document.getElementById("leftMovie");
  let leftInfo = previousMovie;
  const leftMovieInfoBox = document.getElementById("leftMovieInfo");
  buildMovieBox(leftMovieInfoBox, leftInfo, leftMovie);

  const rightMovie = document.getElementById("rightMovie");
  const rightMovieInfoBox = document.getElementById("rightMovieInfo");
  let rightInfo = currentMovie;
  buildMovieBox(rightMovieInfoBox, rightInfo, rightMovie);

  // --- LEFT MOVIE INFO BOX FIX ---
  let leftInfoContainer = leftMovie.querySelector(".infoBox");
  let leftInfoInner;
  
  // If the box doesn't exist yet, create it and attach the event listener
  if (!leftInfoContainer) {
    leftInfoContainer = document.createElement("div");
    leftInfoContainer.className = "infoBox";
    leftInfoContainer.style.display = "none"; // Fixed typo: changed === to =
    
    leftInfoInner = document.createElement("div");
    leftInfoContainer.appendChild(leftInfoInner);
    leftMovie.appendChild(leftInfoContainer);

    const leftInfoButton = document.getElementById("infoLeft");
    leftInfoButton.addEventListener("click", () => {
      if (leftInfoContainer.style.display === "block") {
        leftInfoContainer.style.display = "none";
      } else {
        leftInfoContainer.style.display = "block";
      }
    });
  } else {
    // If it already exists, just clear out the old text so we can refill it
    leftInfoInner = leftInfoContainer.querySelector("div");
    leftInfoInner.innerHTML = ""; 
  }

  // --- RIGHT MOVIE INFO BOX FIX ---
  let rightInfoContainer = rightMovie.querySelector(".infoBox");
  let rightInfoInner;
  
  if (!rightInfoContainer) {
    rightInfoContainer = document.createElement("div");
    rightInfoContainer.className = "infoBox";
    rightInfoContainer.style.display = "none"; // Fixed typo: changed === to =
    
    rightInfoInner = document.createElement("div");
    rightInfoContainer.appendChild(rightInfoInner);
    rightMovie.appendChild(rightInfoContainer);

    const rightInfoButton = document.getElementById("infoRight");
    rightInfoButton.addEventListener("click", () => {
      if (rightInfoContainer.style.display === "block") {
        rightInfoContainer.style.display = "none";
      } else {
        rightInfoContainer.style.display = "block";
      }
    });
  } else {
    // Clear out the old text 
    rightInfoInner = rightInfoContainer.querySelector("div");
    rightInfoInner.innerHTML = ""; 
  }

  // Fill the fresh boxes with the current round's data
  fillInfoBox(leftInfoInner, leftInfo, gamemode);
  fillInfoBox(rightInfoInner, rightInfo, gamemode);
}
document.addEventListener("DOMContentLoaded", async function () {
  console.log("HTML DOM tree loaded, and ready for manipulation.");

  movieIdList = await reqIdList(dbCollectionImdb);

  previousMovie = await getRandomMovie();
  currentMovie = await getRandomMovie();
  nextMovie = await getRandomMovie();

  const leftMovieInfoBox = document.getElementById("leftMovie");
  let leftPosterSrc = await reqMoviePoster(previousMovie.normalized_id);
  if (!leftPosterSrc) {
    leftPosterSrc = placeholderImgUrl;
  }
  leftMovieInfoBox.style.backgroundImage = "url(" + leftPosterSrc + ")";

  const rightMovieInfoBox = document.getElementById("rightMovie");
  let rightPosterSrc = await reqMoviePoster(currentMovie.normalized_id);
  if (!rightPosterSrc) {
    rightPosterSrc = placeholderImgUrl;
  }
  rightMovieInfoBox.style.backgroundImage = "url(" + rightPosterSrc + ")";

  document.body.classList.add("fade-in");
});

// Function to fill the "More info" box
function fillInfoBox(infoBox, movieInfo, gamemode) {
  // Placeholder to get info for the movie with the id movieId
  // const movieInfo = getMovieInfo(movieId).json();

  const headline = document.createElement("h2");
  headline.className = "infoHeadline";
  headline.innerHTML = movieInfo.name;
  infoBox.appendChild(headline);

  const director = document.createElement("p");
  director.className = "infoDirector";
  director.innerHTML = "Director: " + movieInfo.director;
  infoBox.appendChild(director);

  switch (gamemode) {
    case "year": {
      const rating = document.createElement("p");
      rating.className = "infoRating";
      year.innerHTML = "Rating: " + movieInfo.rating;
      infoBox.appendChild(rating);

      const runtime = document.createElement("p");
      runtime.className = "infoRuntime";
      runtime.innerHTML = "Runtime: " + movieInfo.runtime;
      infoBox.appendChild(runtime);
      break;
    }
    case "rating": {
      const year = document.createElement("p");
      year.className = "infoYear";
      year.innerHTML = "Release year: " + movieInfo.year;
      infoBox.appendChild(year);

      const runtime = document.createElement("p");
      runtime.className = "infoRuntime";
      runtime.innerHTML = "Runtime: " + movieInfo.runtime;
      infoBox.appendChild(runtime);
      break;
    }
    case "runtime": {
      const year = document.createElement("p");
      year.className = "infoYear";
      year.innerHTML = "Release year: " + movieInfo.year;
      infoBox.appendChild(year);

      const rating = document.createElement("p");
      rating.className = "infoRating";
      year.innerHTML = "Rating: " + movieInfo.rating;
      infoBox.appendChild(rating);
      break;
    }
    default: {
    }
  }

  const genre = document.createElement("p");
  genre.className = "infoGenre";
  genre.innerHTML = "Genre: ";
  if (movieInfo.genre != null) {
    for (let i = 0; i < movieInfo.genre.length; i++) {
      genre.innerHTML += movieInfo.genre[i];
      if (i != movieInfo.genre.length - 1) {
        genre.innerHTML += ", ";
      }
    }
    infoBox.appendChild(genre);
  }

  const stars = document.createElement("p");
  stars.className = "infoStars";
  stars.innerHTML = "Stars: ";
  if (movieInfo.genre != null) {
    for (let i = 0; i < movieInfo.star.length; i++) {
      stars.innerHTML += movieInfo.star[i];
      if (i != movieInfo.star.length - 1) {
        stars.innerHTML += ", ";
      }
    }
    infoBox.appendChild(stars);
  }

  const description = document.createElement("p");
  description.className = "infoDescription";
  description.innerHTML = "Description:\n" + movieInfo.description;
  infoBox.appendChild(description);
}
function goHome() {
  window.location.href = "../landing/index.html";
}