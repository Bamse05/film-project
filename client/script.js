const serverUrl = "http://127.0.0.1:3000";

const dbCollectionActorinfo = "actorinfo";
const dbCollectionBechdel = "bechdel";
const dbCollectionImdb = "imdb";



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



async function deletethis() {
    data1 = await reqMovieData("tt0021739");
    data2 = await reqActorData("nm0000194");
    data3 = await reqIdList(dbCollectionImdb);
    data4 = await reqIdList(dbCollectionActorinfo);

    console.log(data1);
    console.log(data2);
    console.log(data3);
    console.log(data4);
}

deletethis();