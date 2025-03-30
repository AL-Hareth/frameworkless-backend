import http from "node:http";
import Todo from "./routes/todo.js";
import Users from "./routes/users.js";
import { initDatabase } from "./lib/db.js";
import { withBodyParser } from "./lib/bodyParser.js";
import { checkAuth } from "./lib/authMiddleware.js";

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer();

/**
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
*/
function handleRequestUrl(req, res) {
    if (req.url.startsWith("/users")) {
        Users.handleRoute(req, res);
    } else if (req.url.startsWith("/todo")) {
        const authedTodosRoute = checkAuth(Todo.handleRoute);
        authedTodosRoute(req, res);
    } else {
        res.end(JSON.stringify({
            error: "Making request to a non existing route"
        }));
    }
}

server.on("request", withBodyParser((req, res) => {
    handleRequestUrl(req, res);
}));

initDatabase();

server.listen(port, hostname, () => {
    console.log("server running at http://" + hostname + ":" + port);
});
