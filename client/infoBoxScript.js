async function getMovieInfo(movieId) {
    const response = await fetch("");
}

document.addEventListener("DOMContentLoaded", async function() {
    console.log("HTML DOM tree loaded, and ready for manipulation.");

    leftInfo = await getMovieInfo();

    const leftInfoButton = document.getElementById("infoLeft");
    const rightInfoButton = document.getElementById("infoRight");

    const leftInfoContainer = document.createElement("div");
    leftInfoContainer.className = "infoBox";
    const leftInfo = document.createElement("div");
    leftInfoContainer.appendChild(leftInfo);

    const rightInfoContainer = document.createElement("div");
    rightInfoContainer.className = "infoBox";
    const rightInfo = document.createElement("div");
    rightInfoContainer.appendChild(rightInfo);


    leftInfoButton.addEventListener("click", () => {
        // Implement a function call to get the movie id to find the movie information
        let movieId = null;
        fillInfoBox(leftInfo, movieId, gameMode);
        // Display is set to "none" by default
        leftInfoContainer.style.display = "block";
    });

    rightInfoButton.addEventListener("click", () => {
        // Display is set to "none" by default
        rightInfoContainer.style.display = "block";
    });

});

function fillInfoBox(infoBox, movieId, gameMode) {
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