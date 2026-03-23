const serverUrl = "http://127.0.0.1:3000";

const dbCollectionActorinfo = "actorinfo";
const dbCollectionBechdel = "bechdel";
const dbCollectionImdb = "imdb";

document.addEventListener("DOMContentLoaded", () => {

});

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

var points = 0;
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

  
}