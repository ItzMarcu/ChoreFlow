// db.js modules 
import { 
    create_house, 
    get_house, 
    create_user, 
    get_users,
    leave_house,
    delete_user,
    join_house,
    login,
    create_room,
    delete_room
    }
from './db.js';

// node.js modules 
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import url from 'url';

dotenv.config();

function log(method, path) {
    console.log(`${new Date().toISOString()}: method = ${method} path = ${path}`);
}

function generateJWT(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '720h'});
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.writeHead(405, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Metodo non consentito'}));
        return;
    }  
    
    const parsed_url = url.parse(req.url, true);
    const path = parsed_url.pathname.replace(/^\/api/, '');
    const method = req.method;

    log(method, path);

    if (method == 'POST' && path == '/auth') {
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
                    'Access-Control-Allow-Origin': 'https://www.choreflow.it',
                    'Access-Control-Allow-Credentials': 'true',
                    'Set-Cookie': `authToken=${generateJWT(data)}; Path=/; SameSite=Lax; HttpOnly; Max-Age=2592000; Secure;`
                });
                res.end(JSON.stringify(data));
                return;
            });
        });
        return;
    }

    if (!req.headers['cookie']) {
        res.writeHead(401, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Non autorizzato'}));
        return;
    }

    //
    // DB METHODS
    // Questi metodi alterano i valori all'interno del DB 
    //
    if (method == 'GET' && path == '/') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({succes: true}));
        return;
    }

    if (method == 'POST' && path == '/create_house') {
        let body = ''; 
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { house_name } = JSON.parse(body);
            create_house(house_name)
            .then(response => {
                console.log(response);
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({created: response}));
            })
            .catch(error => {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(error));
            });
        });
        return;
    }

    // {HOSTNAME}/api/get_house?house_url=URL no ''
    if (method == 'GET' && path == '/get_house') {
        const house_url = parsed_url.query.house_url;
        get_house(house_url)
            .then(response => {
                if (!response.succes) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(response));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
            });
        return;
    }

    if (method == 'POST' && path == '/create_user') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const { nome, password, house_url } = JSON.parse(body);
            const response = await create_user(nome, password, house_url);
            
            if (!response.succes) {
                res.writeHead(401, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(response));
                return;
            }

            res.writeHead(201, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(response));
            return;
        });
        return;
    }

    // {HOSTNAME}/api/get_users?house_url= 
    if (method == 'GET' && path == '/get_users') {
        const house_url = parsed_url.query.house_url;
        get_users(house_url) 
        .then(response => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(response));
        })
        .catch(error => {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(error));
        });
        return;
    }

    if (method == 'POST' && path == '/leave_house') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { name, house_url } = JSON.parse(body);
            leave_house(name, house_url)
            .then(response => {
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(response));
            })
            .catch(error => {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(error));
            });
        });
        return;
    }

    if (method == 'POST' && path == '/delete_user') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { name, password } = JSON.parse(body);
            delete_user(name, password)
            .then(response => {
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(response));
            })
            .catch(error => {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(error));
            });
        });
        return;
    }

    if (method == 'POST' && path == '/join_house') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { name, house_url } = JSON.parse(body);
            join_house(name, house_url)
            .then(response => {
                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(response));
            })
            .catch(error => {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(error));
            })
        });
        return;
    }

    if (method == 'POST' && path == '/create_room') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const { name, house_url } = json.parse(body);
            const response = await create_room(house_url, name);
            
            if (!response.succes) {
                res.writeHead(500, {'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
                return;
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        });
        return;
    }

    if (method == 'POST' && path == '/delete_room') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const { name, house_url } = JSON.parse(body);
            const response = await delete_room(house_url, name);

            if (!response.succes) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
                return;
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        });
        return;
    }


    res.writeHead(400, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Percorso non trovato'}));
    return;
    
}