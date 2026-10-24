import { PROXY_URL, sleep } from "./utils/utils.js";

export function renderLogin() {
    const dom = document.createElement('div');
    dom.innerHTML = `
        <h1>ChoreFlow</h1>
        <form>
            <div class="auth-container">
                <label>Username</label>
                <input type="text" placeholder="Username" required>

                <label>Password</label>
                <input type="password" placeholder="Password" required>

                <button id="login-button">Accedi</button>
                <p>Non hai ancora un'account? <a href="#register">Registrati</a></p>
            </div>
        </form>

        <div class="toast hidden">
            <p id="info"></p>
        </div>
    `; 

    // Flusso login:  
    //  1. Inserimento password 
    //  2. Chiamata alla Proxy 
    //  3. Impostazione del Token JWT nei Cookies Privati 
    
    dom.querySelector('#login-button').addEventListener('click', async (e) => {
        e.preventDefault();
        
        dom.querySelector('#login-button').disabled = true;
        dom.querySelector('#login-button').opacity = '0.7';
        dom.querySelector('#login-button').textContent = 'Accesso in corso...';
        
        const nome = dom.querySelector('input[type="text"]').value;
        const password = dom.querySelector('input[type="password"]').value;

        if (!nome || !password) {
            dom.querySelector('#login-button').disabled = false;
            dom.querySelector('#login-button').opacity = '1';
            dom.querySelector('#login-button').textContent = 'Accedi';
            
            dom.querySelector('.toast').classList.remove('hidden');
            dom.querySelector('#info').innerHTML = 'Compilare tutti i campi';

            await sleep(3500);

            dom.querySelector('.toast').classList.add('hidden');
            dom.querySelector('#info').innerHTML = '';

            return;
        }

        const response = await fetch(`${PROXY_URL}/api/auth`, {
            method: 'POST',
            credentials: "include",
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
        console.log(data);
        console.log(data.error);
        console.log(response.status);

        if (data.error == 'Credenziali non valide') {
            dom.querySelector('#login-button').disabled = false;
            dom.querySelector('#login-button').opacity = '1';
            dom.querySelector('#login-button').textContent = 'Accedi';

            dom.querySelector('.toast').classList.remove('hidden');
            dom.querySelector('#info').innerHTML = 'Credenziali non trovate';

            await sleep(3500);

            dom.querySelector('.toast').classList.add('hidden');
            dom.querySelector('#info').innerHTML = '';

            return;
        }

        if (!response.ok && response.status !== 401) {
            dom.querySelector('#login-button').disabled = false;
            dom.querySelector('#login-button').opacity = '1';
            dom.querySelector('#login-button').textContent = 'Accedi';

            dom.querySelector('.toast').classList.remove('hidden');
            dom.querySelector('#info').innerHTML = 'Errore del server';

            await sleep(3500);

            dom.querySelector('.toast').classList.add('hidden');
            dom.querySelector('#info').innerHTML = '';

            return;
        }
        

        dom.querySelector('input[type="text"]').value = '';
        dom.querySelector('input[type="password"]').value = '';

        const house_name = await getHouseName(data.house_url);

        localStorage.setItem('id', data.id);
        localStorage.setItem('nome', data.nome);
        localStorage.setItem('house_url', data.house_url);
        localStorage.setItem('house_name', house_name);
        localStorage.setItem('logged', true);
        
        if (!data.house_url) {
            window.location.hash = '#onboarding';
            return;
        }
        

        window.location.hash = '#dashboard';
    });

    return dom;
}

async function getHouseName(house_url) {
    const response = await fetch(`${PROXY_URL}/api/get_house?house_url=${house_url}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('Errore durante il recupero del nome della casa');
        return;
    }

    const house_name = data.houses?.nome_casa;
    return house_name;
}
