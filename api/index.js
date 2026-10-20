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
} from './db.js';

// node.js modules 
import dotenv from 'dotenv';
import url from 'url';
import jwt from 'jsonwebtoken';

dotenv.config();

function log(method, path) {
    console.log(`${new Date().toISOString()}: method = ${method} path = ${path}`);
}

function generateJWT(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '720h' });
}

// Estrae e verifica il JWT dal cookie authToken
function verifyAuthToken(req) {
    const cookieHeader = req.headers['cookie'];
    if (!cookieHeader) return null;

    // Cerca authToken=... nei cookie
    const match = cookieHeader.match(/(?:^|;\s*)authToken=([^;]+)/);
    if (!match) return null;

    const token = match[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded; // Ritorna il payload del token verificato
    } catch (err) {
        return null; // Token non valido o scaduto
    }
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
        res.end(JSON.stringify({ error: 'Metodo non consentito' }));
        return;
    }  
    
    const parsed_url = url.parse(req.url, true);
    const path = parsed_url.pathname.replace(/^\/api/, '');
    const method = req.method;

    log(method, path);

    // ==========================================
    // 1. ROUTE PUBBLICHE (NON richiedono il token)
    // ==========================================

    // Login (/api/auth)
    if (method === 'POST' && path === '/auth') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { nome, password } = JSON.parse(body);
                const dbRes = await login(nome, password);

                if (!dbRes || !dbRes.succes) {
                    res.writeHead(401, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                    res.end(JSON.stringify({ error: 'Credenziali non valide' }));
                    return;
                }

                // Genera JWT e invia il Set-Cookie sicuro
                const token = generateJWT({ user: nome });
                res.writeHead(201, {
                    'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it',
                    'Set-Cookie': `authToken=${token}; Path=/; SameSite=Lax; HttpOnly; Max-Age=2592000; Secure;`
                });
                res.end(JSON.stringify(dbRes));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Registrazione nuovo utente (/api/create_user)
    if (method === 'POST' && path === '/create_user') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { nome, password, house_url } = JSON.parse(body);
                const response = await create_user(nome, password, house_url);
                const status = response.succes ? 201 : 401;
                res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify(response));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify({ error: 'Payload JSON non valido' }));
            }
        });
        return;
    }

    // ==========================================
    // 2. CONTROLLO AUTENTICAZIONE (JWT)
    // Da qui in poi tutte le route richiedono authToken valido
    // ==========================================
    const userSession = verifyAuthToken(req);
    if (!userSession) {
        res.writeHead(401, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
        res.end(JSON.stringify({ error: 'Non autorizzato: token assente o non valido' }));
        return;
    }

    // ==========================================
    // 3. ROUTE PROTETTE DAL TOKEN
    // ==========================================

    // Health check root (/api/)
    if (method === 'GET' && (path === '/' || path === '')) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
        res.end(JSON.stringify({ succes: true }));
        return;
    }

    // Recupero casa (/api/get_house)
    if (method === 'GET' && path === '/get_house') {
        const house_url = parsed_url.query.house_url;
        get_house(house_url)
            .then(response => {
                const status = response.succes ? 200 : 500;
                res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify(response));
            })
            .catch(err => {
                res.writeHead(500, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify({ error: err.message }));
            });
        return;
    }

    // Lista utenti della casa (/api/get_users)
    if (method === 'GET' && path === '/get_users') {
        const house_url = parsed_url.query.house_url;
        get_users(house_url) 
            .then(response => {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify(response));
            })
            .catch(error => {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify(error));
            });
        return;
    }

    // Crea casa (/api/create_house)
    if (method === 'POST' && path === '/create_house') {
        let body = ''; 
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { house_name } = JSON.parse(body);
                create_house(house_name)
                    .then(response => {
                        res.writeHead(201, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                        res.end(JSON.stringify({ created: response }));
                    })
                    .catch(error => {
                        res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                        res.end(JSON.stringify(error));
                    });
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify({ error: 'JSON non valido' }));
            }
        });
        return;
    }

    // Unisciti a casa esistente (/api/join_house)
    if (method === 'POST' && path === '/join_house') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { name, house_url } = JSON.parse(body);
                join_house(name, house_url)
                    .then(response => {
                        res.writeHead(201, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                        res.end(JSON.stringify(response));
                    })
                    .catch(error => {
                        res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                        res.end(JSON.stringify(error));
                    });
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify({ error: 'JSON non valido' }));
            }
        });
        return;
    }

    // Abbandona casa (/api/leave_house)
    if (method === 'POST' && path === '/leave_house') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { name, house_url } = JSON.parse(body);
            leave_house(name, house_url)
                .then(response => {
                    res.writeHead(201, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                    res.end(JSON.stringify(response));
                })
                .catch(error => {
                    res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                    res.end(JSON.stringify(error));
                });
        });
        return;
    }

    // Elimina utente (/api/delete_user)
    if (method === 'POST' && path === '/delete_user') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { name, password } = JSON.parse(body);
            delete_user(name, password)
                .then(response => {
                    res.writeHead(201, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                    res.end(JSON.stringify(response));
                })
                .catch(error => {
                    res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                    res.end(JSON.stringify(error));
                });
        });
        return;
    }

    // Crea stanza (/api/create_room)
    if (method === 'POST' && path === '/create_room') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { name, house_url } = JSON.parse(body);
                const response = await create_room(house_url, name);
                const status = response.succes ? 201 : 500;
                res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify(response));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify({ error: 'JSON non valido' }));
            }
        });
        return;
    }

    // Elimina stanza (/api/delete_room)
    if (method === 'POST' && path === '/delete_room') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { name, house_url } = JSON.parse(body);
                const response = await delete_room(house_url, name);
                const status = response.succes ? 201 : 500;
                res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify(response));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
                res.end(JSON.stringify({ error: 'JSON non valido' }));
            }
        });
        return;
    }

    // Se l'endpoint non è riconosciuto
    res.writeHead(404, { 'Content-Type': 'application/json', 'Content-Security-Policy': 'default-src `self`; script-src `self`; https://www.choreflow.it' });
    res.end(JSON.stringify({ error: 'Percorso non trovato' }));
}