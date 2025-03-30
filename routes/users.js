import http from "node:http"; //import for types
const { createHash } = await import("node:crypto");
import { getUser, insertUser } from "../lib/db.js";
import { generateToken } from "../lib/jwt.js";
import { verify } from "node:crypto";


export default class Users {

    /**
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    */
    static handleRoute(req, res) {
        switch (req.url.split("/")[2]) {
            case "auth": // POST request
                if (req.method === "POST") {
                    Users.auth(req, res);
                }
                break;
            case "login":
                if (req.method === "POST") {
                    Users.login(req, res);
                }
                break;
            default:
                res.end(JSON.stringify({
                    error: "Making request to a non existing route"
                }));
        }
    }

    /**
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    */
    static auth(req, res) {
        const { username, password } = req.body;

        if (getUser(username)) { // check if the user is already in the database
            res.end(JSON.stringify({
                error: "This username is already in use"
            }));
            return;
        }

        // Hash the password
        const hashCreator = createHash('sha256');
        hashCreator.update(password);
        const hashedPassword = hashCreator.digest('hex');

        insertUser(username, hashedPassword); // insert the user to the database
        const user = getUser(username);

        const tokenPayload = { // payload to be parsed in a JWT
            sub: user.username.toString(),
            uid: user.id.toString()
        };

        const jwt = generateToken(tokenPayload);

        res.end(JSON.stringify({
            message: `Successfully authenticated ${username}`,
            token: jwt
        }));

    }


    /**
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    */
    static login(req, res) {
        if (req.headers['authorization'] && verify(req.headers['authorization'].split(' ')[1])) {
            res.end(JSON.stringify({
                error: "You already have an authorization token"
            }));
            return;
        }

        const { username, password } = req.body;
        const user = getUser(username);

        if (!user) {
            res.end(JSON.stringify({
                error: "There are no users with this username"
            }));
            return;
        }

        // Hash the password
        const hashCreator = createHash('sha256');
        hashCreator.update(password);
        const hashedPassword = hashCreator.digest('hex');

        if (user.password !== hashedPassword) {
            res.end(JSON.stringify({
                error: "Wrong Password"
            }));
            return;
        }

        // Generating a new token
        const tokenPayload = {
            sub: user.username.toString(),
            uid: user.id.toString()
        };
        const jwt = generateToken(tokenPayload);

        res.end(JSON.stringify({
            message: `Logged in user ${username}`,
            token: jwt
        }));
    }
}
