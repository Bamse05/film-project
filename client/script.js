const serverUrl = "http://127.0.0.1:3000";

const dbCollectionActorinfo = "actorinfo";
const dbCollectionBechdel = "bechdel";
const dbCollectionImdb = "imdb";

const placeholderImgUrl = "../Images/PLACEHOLDER.jpg"

let movieIdList = [];

async function getIdList(dbCollectionImdb) {
    const idList = await reqIdList(dbCollectionImdb);
    return idList;
}

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

async function startGame(gamemode) {
    console.log(gamemode);

    gameStartAnimation();
}


function gameStartAnimation() {
    fadeBoxes();

    document.getElementById("popcorn-container").classList.add('visible');
    document.querySelector("header").classList.add('visible');
    document.getElementById("centerBox").classList.add('visible');

    document.getElementById("gamemodeContainer").style.display = "none";
    document.getElementById("higherLowerContainer").style.display = "flex";
}

function fadeBoxes() {
    document.querySelectorAll('.movieinfo').forEach(elem => {
        elem.classList.add('visible');
    });

    document.querySelectorAll('.infoButton').forEach(elem => {
        elem.classList.add('visible');
    });
}

async function gameplayLoop(gameMode, leftMovieInfoBox, leftInfo, rightMovieInfoBox, rightInfo, leftMovie, rightMovie) {
    let gameOver = false;
    let score = 0;
    while (!gameOver) {
        leftInfo = rightInfo;
        buildMovieBox(leftMovieInfoBox, rightInfo, gameMode, leftMovie);

        rightInfo = await getRandomMovie();
        buildMovieBox(rightMovieInfoBox, rightInfo, gameMode, rightMovie);

        gameOver = await higherOrLower(gameMode, leftInfo, rightInfo);
        if (gameOver) break;
        score += 1;
    }
    return score;
}

async function higherOrLower(gameMode, leftInfo, rightInfo) {
    let result = await guess();
    switch (gameMode) {
        case "releaseYear": {
            if ((result === "h" && rightInfo.year >= leftInfo.year)
                || (result === "l" && rightInfo.year <= leftInfo.year)) {
                    return false;
            }
            return true;
        }
        case "rating": {
            if ((result === "h" && rightInfo.rating >= leftInfo.rating)
                || (result === "l" && rightInfo.rating <= leftInfo.rating)) {
                    return false;
            }
            return true;
        }
        case "runtime": {
            if ((result === "h" && rightInfo.runtime >= leftInfo.runtime)
                || (result === "l" && rightInfo.runtime <= leftInfo.runtime)) {
                    return false;
            }
            return true;
        }
        default: {
            return true;
        }
    }
}

async function getRandomMovie() {
    let movieNumber = Math.floor(Math.random() * movieIdList.length - 1);
    let movieInfo = await reqMovieData(movieIdList[movieNumber]);
    return movieInfo;
}

async function buildMovieBox(movieBox, movieInfo, gameMode, backgroundBox) {
    let moviePoster = null;
    let movieTitle = null;
    let extraInfo = null;

    console.log(backgroundBox);

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

    

    // ADD A PLACEHOLDER IMAGE OR ERROR HANDLER FOR MISSING IMAGES
    let posterSrc = await reqMoviePoster(movieInfo.normalized_id);
    localImageUrl = "../project-material/media/" + movieInfo.normalized_id + ".png";
    if (!posterSrc) {
        posterSrc = placeholderImgUrl;
        localImageUrl = placeholderImgUrl;
    }
    moviePoster.src = posterSrc;
    backgroundBox.style.backgroundImage = "url(" + localImageUrl + ")";




    movieTitle.innerHTML = movieInfo.name;

    switch (gameMode) {
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

document.addEventListener("DOMContentLoaded", async function() {
    console.log("HTML DOM tree loaded, and ready for manipulation.");

    await randomizeReelPosters();
    // const startButton = document.createElement("button");
    // startButton.id = "startButton";
    // const gameMode = await startGame();

    loadLeaderboard();
    movieIdList = await getIdList(dbCollectionImdb);

    // Make a function to select the gamemode from the "Change gamemode" button
    // const gameMode = "releaseYear"; // Placeholder

    const leftMovie = document.getElementById("leftMovie");
    let leftInfo = await getRandomMovie();
    const leftMovieInfoBox = document.getElementById("leftMovieInfo");
    buildMovieBox(leftMovieInfoBox, leftInfo, gameMode, leftMovie);
    // let leftMovieId = rightInfo.id;

    const rightMovie = document.getElementById("rightMovie");
    const rightMovieInfoBox = document.getElementById("rightMovieInfo");
    let rightInfo = await getRandomMovie();
    buildMovieBox(rightMovieInfoBox, rightInfo, gameMode, rightMovie);
    // let rightMovieId = rightInfo.id;



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
            fillInfoBox(leftInfoInner, leftInfo, gameMode);
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
            fillInfoBox(rightInfoInner, rightInfo, gameMode);
            // Display is set to "none" by default
            rightInfoContainer.style.display = "block";
        }
    });

});

// Function to fill the "More info" box
function fillInfoBox(infoBox, movieInfo, gameMode) {
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

    switch (gameMode) {
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
    gifImage.src = '../Images/curtaingif.gif?t=' + new Date().getTime();

    // The total time your sped-up GIF takes to play (e.g., 1200ms)
    const totalGifTime = 3000; 

    // Navigate to the game page the exact moment the GIF finishes!
    setTimeout(() => {
        window.location.href = "game.html";
    }, totalGifTime); 
}
