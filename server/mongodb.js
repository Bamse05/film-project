const http = require("node:http");
const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");

const hostname = "127.0.0.1";
const port = 3000;
const serverUrl = "http://" + hostname + ":" + port + "";

const dbHostname = hostname;
const dbPort = 27017;
const dbServerUrl = "mongodb://" + dbHostname + ":" + dbPort + "";
const dbClient = new MongoClient(dbServerUrl);
const dbName = "tnm121-project";
const dbCollectionLeaderboard = "leaderboard";

dbClient
  .connect()
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

const server = http.createServer((req, res) => {
  const requestUrl = new URL(serverUrl + req.url);
  const pathComponents = requestUrl.pathname.split("/");

  if (req.method == "GET") {
    console.log(pathComponents);
    console.log(req.method);

    if (pathComponents[1] === "leaderboard" && pathComponents[2] === "top") {
      getTopLeaderboard(res);
      return;
    }
    route(res, pathComponents);
  } else if (req.method == "OPTIONS") {
    // default preflight response: 204 (No Content); docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#successful_responses
    sendResponse(res, 204, null, null);
  } else if (req.method == "POST") {
    if (pathComponents[1] === "leaderboard" && pathComponents[2] === "add") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        const newScoreData = JSON.parse(body);
        await addScoreToLeaderboard(res, newScoreData);
      });
    } else {
      sendResponse(res, 404, "text/plain", "Not Found");
    }
  } else {
    sendResponse(res, 200, "text/plain", "Node js server");
  }
});

server.listen(port, hostname, () => {
  console.log("The server is running and listening at\n" + serverUrl);
});

// USE THIS TO SEND RESPONSES
function sendResponse(res, statusCode, contentType, data) {
  res.statusCode = statusCode;
  if (contentType != null) res.setHeader("Content-Type", contentType);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (data != null) res.end(data);
  else res.end();
}

// USE THIS TO SEND BASIC DB REQUESTS
async function requestDBJSON(findQuery, dbCollectionName) {
  const db = dbClient.db(dbName);
  const dbCollection = db.collection(dbCollectionName);

  const artists = await dbCollection.find(findQuery).toArray();
  const resultingJSON = JSON.stringify(artists);

  return resultingJSON;
}

// ------ ROUTING FUNCTIONS ------

async function route(res, pathComponents) {
  const dbCollectionName = pathComponents[1];

  if (
    pathComponents[2] != null &&
    pathComponents[2] != undefined &&
    pathComponents != ""
  ) {
    switch (pathComponents[2]) {
      case "list":
        getAllIDs(res, dbCollectionName);
        break;
      case "id":
        if (pathComponents[3] != null && pathComponents[3] != undefined) {
          routeByID(res, dbCollectionName, pathComponents[3]);
        } else {
          sendResponse(res, 204, null, null);
        }
        break;
      case "image":
        if (pathComponents[3] != null && pathComponents[3] != undefined) {
          routeByImage(res, pathComponents[3]);
        } else {
          sendResponse(res, 204, null, null);
        }
        break;
      default:
        sendResponse(res, 204, null, null);
        break;
    }
  } else {
    sendResponse(res, 204, null, null);
  }
}

async function routeByID(res, dbCollectionName, id) {
  const db = dbClient.db(dbName);
  const dbCollection = db.collection(dbCollectionName);

  const result = await dbCollection.find({ _id: { $eq: id } }).toArray();
  const resultingJSON = JSON.stringify(result);

  sendResponse(res, 200, "application/json", resultingJSON);
}

async function routeByImage(res, id) {
  const mediaFolder = "./media/";
  const imagePath = mediaFolder + id + ".png";
  fs.readFile(imagePath, (err, data) => {
    if (err) {
      sendResponse(
        res,
        404,
        "text/plain",
        "An error occured when reading the image file",
      );
    } else {
      sendResponse(res, 200, "image/png", data);
    }
  });
}

async function getAllIDs(res, dbCollectionName) {
  const db = dbClient.db(dbName);
  const dbCollection = db.collection(dbCollectionName);

  const result = await dbCollection
    .find({}, { _id: 1 })
    .map((doc) => doc._id)
    .toArray();
  const resultingJSON = JSON.stringify(result);

  sendResponse(res, 200, "application/json", resultingJSON);
}

async function getTopLeaderboard(res) {
  const db = dbClient.db(dbName);
  const dbCollection = db.collection(dbCollectionLeaderboard);

  // Sort by score descending (-1) and limit to top 10
  const result = await dbCollection
    .find()
    .sort({ score: -1 })
    .limit(10)
    .toArray();
  const resultingJSON = JSON.stringify(result);

  sendResponse(res, 200, "application/json", resultingJSON);
}

async function addScoreToLeaderboard(res, data) {
  const db = dbClient.db(dbName);
  const dbCollection = db.collection(dbCollectionLeaderboard);

  // Make sure score is stored as a number so sorting works properly
  data.score = Number(data.score);

  await dbCollection.insertOne(data);
  sendResponse(
    res,
    201,
    "application/json",
    JSON.stringify({ message: "Score saved successfully" }),
  );
}
