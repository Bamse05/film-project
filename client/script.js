const serverUrl = "http://127.0.0.1:3000";

const dbCollectionActorinfo = "actorinfo";
const dbCollectionBechdel = "bechdel";
const dbCollectionImdb = "imdb";

const movieIdList = await reqIdList(dbCollectionImdb);

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

// =============================

async function getRandomMovie() {
    let movieNumber = Math.random(0, movieIdList.length - 1);
    let movieInfo = reqMovieData(movieIdList[movieNumber]);
    return movieInfo;
}

function buildMovieBox(movieBox, movieInfo) {

}

document.addEventListener("DOMContentLoaded", async function() {
    console.log("HTML DOM tree loaded, and ready for manipulation.");

    const leftMovie = document.getElementById("leftMovieInfo");
    let leftInfo = await getRandomMovie();
    buildMovieBox(leftMovie, leftInfo);
    // let leftMovieId = rightInfo.id;

    const rightMovie = document.getElementById("rightMovieInfo");
    let rightInfo = await getRandomMovie();
    buildMovieBox(rightMovie, rightInfo);
    // let rightMovieId = rightInfo.id;


    // How to get id of each movie from the already retrieved movies data

    const leftInfoButton = document.getElementById("infoLeft");
    const rightInfoButton = document.getElementById("infoRight");

    const leftInfoContainer = document.createElement("div");
    leftInfoContainer.className = "infoBox";
    const leftInfoInner = document.createElement("div");
    leftInfoContainer.appendChild(leftInfoInner);

    const rightInfoContainer = document.createElement("div");
    rightInfoContainer.className = "infoBox";
    const rightInfoInner = document.createElement("div");
    rightInfoContainer.appendChild(rightInfoInner);


    leftInfoButton.addEventListener("click", () => {
        // Implement a function call to get the movie id to find the movie information
        if (leftInfoContainer.style.display === "block") {
            leftInfoContainer.style.display === "none";
        }
        else {
            fillInfoBox(leftMovie, leftInfo, gameMode);
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
            fillInfoBox(rightMovie, rightInfo, gameMode);
            // Display is set to "none" by default
            rightInfoContainer.style.display = "block";
        }
    });

});

// Function to fill the "More info" box
function fillInfoBox(infoBox, movieInfo, gameMode) {
    // Placeholder to get info for the movie with the id movieId
    const movieInfo = getMovieInfo(movieId).json();

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
    stars.className("infoStars");
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