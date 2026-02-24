const http = require("node:http");
const MongoClient = require("mongodb").MongoClient;

const hostname = "127.0.0.1";
const port = 3000;
const serverUrl = "http://" + hostname + ":" + port + "";

const dbHostname = hostname;
const dbPort = 27017;
const dbServerUrl = "mongodb://" + dbHostname + ":" + dbPort + "";
const dbClient = new MongoClient(dbServerUrl);
const dbName = "tnm121-project";
const dbCollectionActorinfo = "actorinfo";
const dbCollectionBechdel = "bechdel";
const dbCollectionImdb = "imdb";

const server = http.createServer((req, res) => {

    const requestUrl = new URL(serverUrl + req.url);
    const pathComponents = requestUrl.pathname.split("/");

    if (req.method == "GET") {
        console.log(pathComponents);
        console.log(req.method);

        route(res, pathComponents);

    } else if (req.method == "OPTIONS"){
        // default preflight response: 204 (No Content); docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#successful_responses
        sendResponse(res, 204, null, null);
    }
    else {
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
    dbClient.connect();
    const db = dbClient.db(dbName);
    const dbCollection = db.collection(dbCollectionName);

    const artists = await dbCollection.find(findQuery).toArray();
    const resultingJSON = JSON.stringify(artists);
    await dbClient.close();

    return resultingJSON;
}

// ------ ROUTING FUNCTIONS ------

async function route(res, pathComponents) {
    dbCollectionName = pathComponents[1];

    if (pathComponents[2] != null && pathComponents[2] != undefined &&
        pathComponents[3] != null && pathComponents[3] != undefined) {
        switch (pathComponents[2]) {
            case "id":
                routeByID(res, dbCollectionName, pathComponents[3]);
                break;
            default:
                break;
        }
    } else {
        sendResponse(res, 404, "text/plain", "Bad url");
    }
}

async function routeByID(res, collectionName, id) {
    findQuery = { _id: {$eq: id}};

    resultingJSON = await requestDBJSON(findQuery, collectionName);
    sendResponse(res, 200, "application/json", resultingJSON);
}
