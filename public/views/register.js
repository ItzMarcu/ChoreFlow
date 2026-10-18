import { PROXY_URL } from "./utils/const.js";

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function renderRegister() {
    const dom = document.createElement('div');
    dom.innerHTML = `
        <h1>ChoreFlow</h1>
        <form>
            <div class="auth-container">
                <label>Username</label>
                <input type="text" placeholder="Username" required>

                <label>Password</label>
                <input type="password" placeholder="Password" required>

                <label>Ripeti Password</label>
                <input type="password" placeholder="Password" id="password-check" required>

                <button id="login-button">Registrati</button>
                <p>Hai già un account? <a href="#login">accedi</a></p>
            </div>
        </form>
    `;

    dom.querySelector('#login-button').addEventListener('click', async (e) => {
        e.preventDefault();
        const nome = dom.querySelector('input[type="text"]').value;
        const password = dom.querySelector('input[type="password"]').value;
        
        if (!nome || !password) {
            console.error('Credenziali non valide');
            return;
        }

        if (password !== document.querySelector('#password-check').value) {
            console.error('Password non corrispondenti');
            return;
        }

        const response = await fetch(`${PROXY_URL}/api/create_user`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                password: password,
                house_url: null
            })
        });

        const data = await response.json();
        if (!data.succes) {
            console.error(data);
            return;
        }

        const login_response = await retry(nome, password, login);
        if (!login_response.succes) {
            console.error(login_response.message);
            return;
        }

        localStorage.setItem('onboarding', true);
        window.location.hash = '#onboarding';
    });

    return dom;
}

async function login(nome, password) {
    const response = await fetch(`${PROXY_URL}/api/auth`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            nome: nome,
            password: password
        })
    });

    const data = await response.json();
    if (!response.ok) {
        // retry function() 
        console.error(`status code: ${response.status}, Errore durante il login`);
        return false;
    }

    console.info('Login riuscito');

    localStorage.setItem('id', data.id);
    localStorage.setItem('nome',data.nome);
    localStorage.setItem('house_url', data.house_url);
    localStorage.setItem('logged', true);

    return { succes: true, message: 'Acesso effettuato' };
}

async function retry(nome, password, loginFn, maxRetry=5) {
    let delay = 500;
    for (let counter = 0; counter < maxRetry; counter++) {
        try {
            const result = await loginFn(nome, password);

            if (result && result.succes) {
                return result;
            }

            if (result && result.message === 'Credenziali non trovate') {
                return result;
            }
        } catch (error) {
            console.warn(`Tentativo ${counter + 1} fallito. Errore: ${error.message}`);
        }

        if (counter < maxRetry - 1) {
            await sleep(delay);
            delay *= 1.5;
        }
    }

    return { succes: false, message: 'Tentativi esauriti: Server non raggiungibile'};
} 
