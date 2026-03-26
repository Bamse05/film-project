const serverUrl = "http://127.0.0.1:3000";

const dbCollectionActorinfo = "actorinfo";
const dbCollectionBechdel = "bechdel";
const dbCollectionImdb = "imdb";

const placeholderImgUrl = "../../server/Images/PLACEHOLDER.jpg";

let movieIdList = [];

async function reqMovieData(id) {
  const response = await fetch(serverUrl + "/imdb/id/" + id, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: null,
  });

  if (response.ok) {
    return response.json().then((jsonBody) => {
      return jsonBody[0];
    });
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
    body: null,
  });

  if (response.ok) {
    return response.json().then((jsonBody) => {
      return jsonBody[0];
    });
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
    body: null,
  });

  if (response.ok) {
    return response.json().then((jsonBody) => {
      return jsonBody;
    });
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
    },
  });

  if (response.ok) {
    return response.blob().then((blobBody) => {
      const filePath = URL.createObjectURL(blobBody);
      return filePath;
    });
  } else {
    return null;
  }
}
