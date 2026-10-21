import { PROXY_URL } from "./utils/utils.js";

export function renderOnboarding() {
    const dom = document.createElement('div');
    dom.innerHTML = `
        <div id="onboarding-step-choice">
            <h1>Benvenuto su ChoreFlow!</h1>
            <h2>Per iniziare a organizzare le faccende hai bisogno di una casa</h2>

            <div class="onboarding-container">
                <div class="create-house-card">
                    <h1>Crea una nuova casa</h1>
                    <p>Sei il primo del tuo appartamento? Configura la casa e invita i tuoi coinquilini</p>
                    <button type="button" id="create-house">
                        Crea la tua casa
                    </button>
                </div>

                <div class="join-house-card">
                    <h1>Entra in una casa esistente</h1>
                    <p>I tuoi coinquilini sono già qua? Inserisci il codice univoco per accedere</p>
                    <button type="button" id="join-house">
                        Entra in una casa
                    </button>
                </div>
            </div>
        </div>

        <!-- creazione della casa -->
        <div class="hidden" id="onboarding-step-create">
            <button type="button" class="btn-back"> ← Torna alla scelta</button>
            <h1>Come vuoi chiamare la tua casa?</h1>
            <p>Scegli bene, non potrai cambiare questa scelta in futuro!</p>

            <div class="form-group">
                <input type="text" id="house-name" placeholder="Casa di ..." required>
            </div>

            <button type="button" id="submit-create-house">Crea la mia casa!</button>
        </div>

        <!-- unione ad una casa --> 
        <div class="hidden" id="onboarding-step-join">
            <button type="button" class="btn-back"> ← Torna alla scelta</button>
            <h1>Inserisci il codice della casa!</h1>
            <p>I tuoi coinquilini ti aspettano...</p>

            <div class="form-group">
                <input type="text" id="house-url" placeholder="CHORE-..." required>
                </div>
            <button type="button" id="submit-join-house">Unisciti!</button>
        </div>
    `;

    
    const choiceStep = dom.querySelector('#onboarding-step-choice');
    const createStep = dom.querySelector('#onboarding-step-create');
    const joinStep = dom.querySelector('#onboarding-step-join');

    // Creazione della casa
    dom.querySelector('#create-house').addEventListener('click', (e) => {
        e.preventDefault();

        choiceStep.classList.add('hidden');
        createStep.classList.remove('hidden');
        createStep.classList.add('fade-in');
    });

    dom.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            joinStep.classList.add('hidden');
            createStep.classList.add('hidden');

            choiceStep.classList.remove('hidden');
            choiceStep.classList.add('fade-in');
            return;    
        });
    });

    dom.querySelector('#submit-create-house').addEventListener('click', async (e) => {
        e.preventDefault();
        const house_name = dom.querySelector('#house-name').value ?? null;
        if (!house_name) {
            console.error('Inserire il nome della casa!');
            return;
        }

        const response = await fetch(`${PROXY_URL}/api/create_house`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                house_name: house_name
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Errore durante la creazione della casa');
            return;
        }

        
        const house_url = data.created.house_url;
        const nome = localStorage.getItem('nome');
        await join_house(nome, house_url);

        console.info('Casa creata!\n', data);
        localStorage.setItem('house_url', house_url);
        window.location.hash = "#dashboard";
        return;
    });

    // Unione ad una casa
    dom.querySelector('#join-house').addEventListener('click', (e) => {
        e.preventDefault();

        choiceStep.classList.add('hidden');
        joinStep.classList.remove('hidden');
        joinStep.classList.add('fade-in');
    });

    dom.querySelector('#submit-join-house').addEventListener('click', async (e) => {
        e.preventDefault();
        const house_url = dom.querySelector('#house-url').value ?? null;

        if (!house_url) {
            console.error('Inserire il codice della casa');
            return;
        }

        const name = localStorage.getItem('nome');
        await join_house(name, house_url);

        console.info('Unione alla casa avvenuta con successo');
        localStorage.setItem('house_url', house_url);
        window.location.hash = '#dashboard';
        return;
    });

    return dom;
}

async function join_house(name, house_url) {
    const response = await fetch(`${PROXY_URL}/api/join_house`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            house_url: house_url
        })
    });

    const data = await response.json();
    if (!response.ok) {
        console.error('Errore durante la unione alla casa');
        return;
    }
} 