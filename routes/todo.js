import http from "node:http"; //import for types
import { checkAuth } from "../lib/authMiddleware.js";
import { decode } from "../lib/jwt.js";
import { checkTask, deleteTask, getTasksForUser, insertTask } from "../lib/db.js";
export default class Todo {

    /**
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    */
    static handleRoute(req, res) {
        switch (req.url.split("/")[2]) {
            case "task":
                if (req.method === "POST") {
                    Todo.createTask(req, res);
                }
                break;
            case "get": // get tasks for authorized user
                Todo.getTasks(req, res);
                break;
            case "check": // this will be /todo/check/:id
                if (req.method === "PATCH") {
                    Todo.checkTask(req, res);
                }
                break;
            case "delete": // This will be /todo/delete/:id
                if (req.method === "DELETE") {
                    const id = parseInt(req.url.split("/")[3]);

                    if (!id) {
                        res.end(JSON.stringify({
                            error: "Please make sure to pass the task id"
                        }));
                        return;
                    }

                    deleteTask(id);

                    res.end(JSON.stringify({
                        message: "Task deleted"
                    }));
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
    static getTasks(req, res) {
        const { uid } = decode(req.headers['authorization'].split(' ')[1]);

        if (!uid) {
            res.end(JSON.stringify({
                error: "Please re-login"
            }));
            return;
        }

        const tasks = getTasksForUser(uid);
        res.end(JSON.stringify(tasks));

    }

    /**
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    */
    static createTask(req, res) {
        const { task } = req.body;
        const { uid } = decode(req.headers['authorization'].split(' ')[1]);

        if (!uid) {
            res.end(JSON.stringify({
                error: "Please re-login"
            }));
            return;
        }

        insertTask(uid, task);

        res.end(JSON.stringify({
            message: "task created"
        }));
    }

    /**
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    */
    static checkTask(req, res) {
        const id = parseInt(req.url.split("/")[3]);

        if (!id) {
            res.end(JSON.stringify({
                error: "Please make sure to pass the task id"
            }));
            return;
        }

        checkTask(id);

        res.end(JSON.stringify({
            message: "Task updated"
        }));
    }
}

