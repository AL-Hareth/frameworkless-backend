import { verify } from "./jwt.js";

export function checkAuth(fn) {
    return function(...args) {
        const [req, res] = args
        if (!req.headers['authorization'] || !verify(req.headers['authorization'].split(' ')[1])) {
            res.end(JSON.stringify({
                error: "Please provide your autherization token"
            }));
            return;
        }
        return fn.apply(this, args);
    }
}
