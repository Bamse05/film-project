const serverUrl = "http://127.0.0.1:3000";

const dbCollectionActorinfo = "actorinfo";
const dbCollectionBechdel = "bechdel";
const dbCollectionImdb = "imdb";

const placeholderImgUrl = "../server/Images/PLACEHOLDER.jpg"

let movieIdList = [];

async function getIdList(dbCollectionImdb) {
    const idList = await reqIdList(dbCollectionImdb);
    return idList;
}

let gamemode;
let previousMovie;
let currentMovie;
let nextMovie;
let currentScore = 0;

// ============= DATA IMPORT =============

async function reqMovieData(id) {
    const response = await fetch(serverUrl + "/imdb/id/" + id, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null
    });

    if (response.ok) {
        return response.json().then((jsonBody) => {
            return jsonBody[0];
        })
    } else {
        console.log("Could not get data. Error code: " + response.status);
        return null;
    }
}

async function reqActorData(id) {
    const response = await fetch(serverUrl + "/actorinfo/id/" + id, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null
    });

    if (response.ok) {
        return response.json().then((jsonBody) => {
            return jsonBody[0];
        })
    } else {
        console.log("Could not get data. Error code: " + response.status);
        return null;
    }
}

async function reqIdList(dbCollection) {
    const response = await fetch(serverUrl + "/" + dbCollection + "/list", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null
    });

    if (response.ok) {
        return response.json().then((jsonBody) => {
            return jsonBody;
        })
    } else {
        console.log("Could not get data. Error code: " + response.status);
        return null;
    }
}

async function reqMoviePoster(id) {
    const response = await fetch(serverUrl + "/imdb/image/" + id, {
        method: "GET",
        headers: {
            "Content-Type": "image/png",
        }
    });

    if (response.ok) {
        return response.blob().then((blobBody) => {
            const filePath = URL.createObjectURL(blobBody);
            return filePath;
        })
    } else {
        return null;
    }
}

// =============================

async function startGame(selectedGamemode) {
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
            gamemodeHeader.textContent = "Runcar snowpen";
            break;
        default:
            break;
    }

    await createMovieBoxes();

    gameStartAnimation();
}

function gameStartAnimation() {
    fadeBoxes();

    document.getElementById("popcorn-container").classList.add('visible');
    document.querySelector("header").classList.add('visible');
    document.getElementById("centerBox").classList.add('visible');

    document.getElementById("gamemodeContainer").style.display = "none";
    document.getElementById("higherLowerContainer").style.display = "flex";

    document.getElementById("score").classList.add('visible');
    document.getElementById("highscore").classList.add('visible');
}

function fadeBoxes() {
    document.querySelectorAll('.movieinfo').forEach(elem => {
        elem.classList.add('visible');
    });

    document.querySelectorAll('.infoButton').forEach(elem => {
        elem.classList.add('visible');
    });
}

function guessHigherOrLower(guess) {
    let guessedRight = higherOrLower(guess);

    if (guessedRight) {
        currentScore++
        spawnPopcorn(calculatePopcornAmount(currentScore));
        updateScore();
        nextRound();
    } else {
        //BOMBA SLUTA SPELET
        popTheCorn();
    }
}

function higherOrLower(guess) {
    switch (gamemode) {
        case "releaseYear": {
            if ((guess === "h" && currentMovie.year >= previousMovie.year)
                || (guess === "l" && currentMovie.year <= previousMovie.year)) {
                    return true;
            }
            return false;
        }
        case "rating": {
            if ((guess === "h" && currentMovie.rating >= previousMovie.rating)
                || (guess === "l" && currentMovie.rating <= previousMovie.rating)) {
                    return true;
            }
            return false;
        }
        case "runtime": {
            if ((guess === "h" && currentMovie.runtime >= previousMovie.runtime)
                || (guess === "l" && currentMovie.runtime <= previousMovie.runtime)) {
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
    if (score <= 3) {
        return 1;
    } else if (score <= 5) {
        return 2;
    } else if (score <= 7) {
        return 3;
    } else if (score <= 10) {
        return 4;
    } else {
        return 5;
    }
}

async function gameplayLoop(gamemode, leftMovieInfoBox, leftInfo, rightMovieInfoBox, rightInfo, leftMovie, rightMovie) {
    let gameOver = false;
    let score = 0;
    while (!gameOver) {
        leftInfo = rightInfo;
        buildMovieBox(leftMovieInfoBox, rightInfo, gamemode, leftMovie);

        rightInfo = await getRandomMovie();
        buildMovieBox(rightMovieInfoBox, rightInfo, gamemode, rightMovie);

        gameOver = await higherOrLower(gamemode, leftInfo, rightInfo);
        if (gameOver) break;
        score += 1;
    }
    return score;
}

async function getRandomMovie() {
    let movieNumber = Math.floor(Math.random() * movieIdList.length - 1);
    let movieInfo = await reqMovieData(movieIdList[movieNumber]);
    return movieInfo;
}

function updateScore() {
    scoreElem = document.getElementById("score")
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
    }
    else if (movieBox.id === "rightMovieInfo") {
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
            break;
        }

        case "runtime": {
            extraInfo.innerHTML = "Release year: " + movieInfo.year;
            extraInfo.appendChild(document.createElement("br"));
            extraInfo.innerHTML += "rating: " + movieInfo.rating;
            break;
        }
        default: {
            // Release year is set as default game mode
            extraInfo.innerHTML = "Rating: " + movieInfo.rating + "/n" + "Runtime: " + movieInfo.runtime;
            break;
        }
    }
}

async function createMovieBoxes () {
    const leftMovie = document.getElementById("leftMovie");
    let leftInfo = previousMovie;
    const leftMovieInfoBox = document.getElementById("leftMovieInfo");
    buildMovieBox(leftMovieInfoBox, leftInfo, leftMovie);

    const rightMovie = document.getElementById("rightMovie");
    const rightMovieInfoBox = document.getElementById("rightMovieInfo");
    let rightInfo = currentMovie;
    buildMovieBox(rightMovieInfoBox, rightInfo, rightMovie);

    // How to get id of each movie from the already retrieved movies data

    const leftInfoButton = document.getElementById("infoLeft");
    const rightInfoButton = document.getElementById("infoRight");

    const leftInfoContainer = document.createElement("div");
    leftInfoContainer.className = "infoBox";
    // leftInfoContainer.style.display === "none";
    const leftInfoInner = document.createElement("div");
    leftInfoContainer.appendChild(leftInfoInner);
    leftMovie.appendChild(leftInfoContainer);

    const rightInfoContainer = document.createElement("div");
    rightInfoContainer.className = "infoBox";
    // rightInfoContainer.style.display === "none";
    const rightInfoInner = document.createElement("div");
    rightInfoContainer.appendChild(rightInfoInner);
    rightMovie.appendChild(rightInfoContainer);


    leftInfoButton.addEventListener("click", () => {
        // Implement a function call to get the movie id to find the movie information
        if (leftInfoContainer.style.display === "block") {
            leftInfoContainer.style.display === "none";
        }
        else {
            fillInfoBox(leftInfoInner, leftInfo, gamemode);
            // Display is set to "none" by default
            leftInfoContainer.style.display = "block";
        }
    });

    rightInfoButton.addEventListener("click", () => {
        // Display is set to "none" by default

        if (rightInfoContainer.style.display === "block") {
            rightInfoContainer.style.display === "none";
        }
        else {
            fillInfoBox(rightInfoInner, rightInfo, gamemode);
            // Display is set to "none" by default
            rightInfoContainer.style.display = "block";
        }
    });
}

document.addEventListener("DOMContentLoaded", async function() {
    console.log("HTML DOM tree loaded, and ready for manipulation.");

    movieIdList = await reqIdList(dbCollectionImdb);

    previousMovie = await getRandomMovie();
    currentMovie = await getRandomMovie();
    nextMovie = await getRandomMovie();

    const leftMovieInfoBox = document.getElementById("leftMovie");
    let leftPosterSrc = await reqMoviePoster(previousMovie.normalized_id);
    if (!leftPosterSrc) { leftPosterSrc = placeholderImgUrl; }
    leftMovieInfoBox.style.backgroundImage = "url(" + leftPosterSrc + ")";

    const rightMovieInfoBox = document.getElementById("rightMovie");
    let rightPosterSrc = await reqMoviePoster(currentMovie.normalized_id);
    if (!rightPosterSrc) { rightPosterSrc = placeholderImgUrl; }
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






/*var points = 0;
var guess = true;
function createButtons(){
    const HigherButton = document.createElement("div");
    const LowerButton = document.createElement("div");

    HigherButton.addEventListener("Click", () => {
        guess = true;
        PLACEHOLDER_NAME_FOR_GUESS(guess);
    });

    LowerButton.addEventListener("Click", () => {
        guess = false;
        PLACEHOLDER_NAME_FOR_GUESS(guess);
    });
}

function PLACEHOLDER_NAME_FOR_GUESS(guess) {


}*/
let currentTopScores = [];
let pendingPlayerScore = 0;
// Fetch top 10 scores from the server
async function loadLeaderboard() {
    const response = await fetch(serverUrl + "/leaderboard/top", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
        currentTopScores = await response.json();
        const tbody = document.getElementById("leaderboardBody");

        // Clear existing rows (innerHTML is still okay here just for emptying the container quickly)

        // Populate table using appendChild
        currentTopScores.forEach((entry, index) => {
            // 1. Create the table row
            const tr = document.createElement("tr");

            // 2. Create and fill the Rank cell
            const rankTd = document.createElement("td");
            rankTd.textContent = index + 1;
            tr.appendChild(rankTd);

            // 3. Create and fill the Name cell
            const nameTd = document.createElement("td");
            nameTd.textContent = entry.name;
            tr.appendChild(nameTd);

            // 4. Create and fill the Score cell
            const scoreTd = document.createElement("td");
            scoreTd.textContent = entry.score;
            tr.appendChild(scoreTd);

            // 5. Finally, append the finished row to the table body
            tbody.appendChild(tr);
        });
    }
}
async function randomizeReelPosters() {
    const sidebars = document.querySelectorAll('.movieSideBar');
    if (sidebars.length === 0) return;

    try {
        const response = await fetch(serverUrl + "/imdb/list");
        if (!response.ok) throw new Error("Could not fetch ID list");
        const idList = await response.json();

        for (const sidebar of sidebars) {
            const posters = sidebar.querySelectorAll('.movie-poster');

            for (let i = 0; i < 6; i++) {
                if (posters[i]) {
                    const randomIndex = Math.floor(Math.random() * idList.length);
                    const randomMovieId = idList[randomIndex];

                    const movieInfo = await reqMovieData(randomMovieId);

                    if (movieInfo && movieInfo.normalized_id) {
                        posters[i].src = serverUrl + "/imdb/image/" + movieInfo.normalized_id;
                    }

                    posters[i].onerror = function() {
                        this.src = placeholderImgUrl;
                    };
                }
            }

            setTimeout(() => {
                for (let j = 0; j < 4; j++) {
                    if (posters[j] && posters[j + 6]) {
                        posters[j + 6].src = posters[j].src;
                        // Ensure the clones also have the placeholder fallback
                        posters[j + 6].onerror = function() { this.src = placeholderImgUrl; };
                    }
                }
            }, 500);
        }
    } catch (error) {
        console.error("Failed to randomize posters:", error);
    }
}
// --- NEW CURTAIN ANIMATION LOGIC ---

// --- NEW CURTAIN ANIMATION LOGIC ---

// --- NEW CURTAIN ANIMATION LOGIC ---

function playGame(event) {
    event.preventDefault();

    // Hide the landing page UI
    document.getElementById('left').style.display = 'none';
    document.getElementById('right').style.display = 'none';
    document.getElementById('center-content').style.display = 'none';
    document.getElementById('mainBody').style.background = 'none';

    // Show the GIF container
    const animContainer = document.getElementById('curtain-animation-container');
    animContainer.style.display = 'block';
    animContainer.style.opacity = '1';

    // Force the GIF to start from frame 1
    const gifImage = document.getElementById('curtain-gif');
    gifImage.src = '../server/Images/curtaingif.gif?t=' + new Date().getTime();

    // The total time your sped-up GIF takes to play (e.g., 1200ms)
    const totalGifTime = 3000;

    // Navigate to the game page the exact moment the GIF finishes!
    setTimeout(() => {
        window.location.href = "game.html";
    }, totalGifTime);
}
