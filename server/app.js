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

const server = http.createServer((req, res) => {

    const requestUrl = new URL(serverUrl + req.url);
    const pathComponents = requestUrl.pathname.split("/");

    if (req.method == "GET") {
        console.log(pathComponents);
        console.log(req.method);

        switch (pathComponents[1]) {
            case "":
                break;
            default:
                break;
        }

    }else if (req.method == "OPTIONS"){
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



function sendResponse(res, statusCode, contentType, data) {
    res.statusCode = statusCode;
    if (contentType != null) res.setHeader("Content-Type", contentType);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (data != null) res.end(data);
    else res.end();
}
