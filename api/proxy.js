import http from 'http';
import dotenv from 'dotenv';
import url from 'url';
import jwt from 'jsonwebtoken';

dotenv.config();

function stringify(hostname, port, path, params) {
    if (!params) { return `http://${hostname}:${port}${path}`; }
    else { return `http://${hostname}:${port}${path}?${params}`; }
}

function log_string(method, path) {
    return `${new Date().getTime()} - method: ${method}, path: ${path}`
}

function generateJWT(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '720h'});
}

const proxy = http.createServer((req, res) => {
    const resHeader = {'Content-Type': 'application/json'};

    const allowedOrigins = `http://127.0.0.1:5500`;
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    
    if (req.method == 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        res.writeHead(403, resHeader);
        res.end(JSON.stringify({error: 'Metodo non consentito'}));
        return;
    }

    const parsed_url = url.parse(req.url, true);
    
    const path = parsed_url.pathname.replace(/^\/+api/, '').replace(/^\/+/, '/');
    const endpoint_path = path;
    const search = parsed_url.search || '';
    
    // Parametri della chiamata 
    const method = req.method;
    let params = '';
    if (parsed_url.searchParams) {
        params = Object.fromEntries(parsed_url.searchParams);   
    }

    const SERVER_HOST = process.env.SERVER_HOST;
    const SERVER_PORT = process.env.SERVER_PORT;
    const API_KEY = process.env.SERVER_API_KEY;

    const serverUrl = stringify(SERVER_HOST, SERVER_PORT, path);

    console.log(log_string(method, endpoint_path));

    // AUTH proxy ENDPOINT
    if (method == 'POST' && endpoint_path == '/auth') {
        let body = ''
        req.on('data', chunk => body += chunk)
        req.on('end', () => {
            fetch (serverUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': API_KEY
                },
                body: body
            })

            .then(async response => {
                const status_code = response.status;
                const data = await response.json();

                if (!response.ok) {
                    res.end(JSON.stringify({error: data.message}));
                    return;
                }

                // Impostare il Cookie come Secure quando va in prod
                res.writeHead(201, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
                    'Access-Control-Allow-Credentials': 'true',
                    'Set-Cookie': `authToken=${generateJWT(data)}; Path=/; SameSite=Lax; HttpOnly; Max-Age=2592000; Secure;`
                });
                res.end(JSON.stringify(data));
                return;
            });
        });
        return;
    }

    // CREATE_USER proxy ENDPOINT
    if (method == 'POST' && path == '/create_user') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const response = await fetch(serverUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': API_KEY
                }, 
                body: body
            });

            const data = await response.json();
            if (!response.ok) {
                res.end(JSON.stringify(data));
                return;
            }

            res.writeHead(201, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
                'Access-Control-Allow-credentials': 'true'
            });
            res.end(JSON.stringify(data));
            return;
        });
        return;
    }

    if (!req.headers['cookie']) {
        res.writeHead(401, resHeader);
        res.end(JSON.stringify({error: 'Non autorizzato'}));
        return;
    }

    if (method == 'GET') {
        fetch(`${serverUrl}${search}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY
            }
        })
        .then(async response => {
            const status_code = response.status;
            const data = await response.json();
            res.writeHead(status_code, resHeader);

            if (!response.ok) {
                res.end(JSON.stringify({error: data.error}));
                return;
            }

            res.end(JSON.stringify(data));
        });
        return;
    }

    if (method == 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const response = await fetch(serverUrl, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': API_KEY
                },
                body: body
            });

            const data = await response.json();

            if (!response.ok) {
                res.writeHead(response.status, resHeader);
                res.end(JSON.stringify(data));
                return;
            }

            res.writeHead(201, resHeader);
            res.end(JSON.stringify(data));
            return;
        });
        return;
    }

    res.writeHead(404, resHeader);
    res.end(JSON.stringify({error: 'Percorso non trovato'}));

});

proxy.listen(process.env.PROXY_PORT, process.env.PROXY_HOST, () => { console.log(process.env.PROXY_PORT) });