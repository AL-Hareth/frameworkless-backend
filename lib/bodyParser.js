// Body parser decorator/middleware
export function withBodyParser(handler) {
    return async (req, res) => {
        try {
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                req.body = await parseBody(req);
            } else {
                req.body = null;
            }
            return handler(req, res);
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request body', details: error }));
        }
    };
}

// Helper function to parse body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                if (!body) return resolve(null);

                if (req.headers['content-type'] === 'application/json') {
                    resolve(JSON.parse(body));
                } else {
                    resolve(body);
                }
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}
