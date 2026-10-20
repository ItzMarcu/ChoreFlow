import { PROXY_URL, sleep } from "./utils/const.js";

export function renderSettings() {
    const dom = document.createElement('div');
    dom.innerHTML = `
        <div class="settings-view">
            <h1 class="settings-title">Impostazioni</h1>

            <!-- METTERE QUA DENTRO LE IMPOSTAZIONI --> 
            <div class="settings-list">
                <div class="settings-container" id="rooms">
                    <div class="settings-item-content">
                        <span class="settings-item-title">Stanze della casa</span>
                        <p class="settings-item-desc">Aggiungi o rimuovi gli ambienti</p>
                    </div>
                    <span class="settings-arrow">→</span>
                </div>

                <div class="settings-container" id="trash">
                    <div class="settings-item-content">
                        <span class="settings-item-title">Rotazione spazzatura</span>
                        <p class="settings-item-desc">Regole di raccolta e turni sacchi</p>
                    </div>
                    <span class="settings-arrow">→</span>
                </div>

                <div class="settings-container" id="logout">
                    <div class="settings-item-content">
                        <span class="settings-item-title">Esci</span>
                        <p class="settings-item-desc">Una volta uscito dovrai rieffettuare il login</p>
                    </div>
                    <span class="settings-arrow">→</span>
                </div>
            </div>
        </div>

        <div class="rooms-settings-modal hidden">
            <h3>Le stanze della casa</h3>
            <div class="rooms-list-container">
                <!-- Qua ci sarà una lista -->
            </div>
            <button type="button" class="btn-back"> ← Torna alla dashboard</button>
        </div>

        <div class="trash-settings-modal hidden">
            <h3>Turni spazzatura</h3>
            <div class="trash-list-container">
                <!-- Qua ci sarà una lista -->
                </div>
            <button type="button" class="btn-back"> ← Torna alla dashboard</button>
        </div>

        <div class="toast hidden">
            <p id="info"></p>
        </div>
    `;

    // Quando si clicca su 'Stanze della casa':
    dom.querySelector('#rooms').addEventListener('click', async (e) => {
        e.preventDefault();
        dom.querySelector('.settings-view').classList.add('hidden');
        dom.querySelector('.rooms-settings-modal').classList.remove('hidden');
        dom.querySelector('.rooms-settings-modal').classList.add('fade-in');
    });

    // Quando si clicca su 'Rotazione spazzatura':
    dom.querySelector('#trash').addEventListener('click', async (e) => {
        e.preventDefault();
        dom.querySelector('.settings-view').classList.add('hidden');
        dom.querySelector('.trash-settings-modal').classList.remove('hidden');
        dom.querySelector('.trash-settings-modal').classList.add('fade-in');
    });

    // Quando si clicca su 'Esci'
    dom.querySelector('#logout').addEventListener('click', async (e) => {
        e.preventDefault();
        const response = await fetch(`${PROXY_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            dom.querySelector('.toast').classList.remove('hidden');
            dom.querySelector('#info').innerHTML = 'Errore durante il logout, riprova più tardi';

            await sleep(3500);

            dom.querySelector('.toast').classList.add('hidden');
            dom.querySelector('#info').innerHTML = '';

            return;
        }
        
        dom.querySelector('.toast').classList.remove('hidden');
        dom.querySelector('#info').innerHTML = 'Logout effettuato';

        await sleep(3500);

        dom.querySelector('.toast').classList.add('hidden');
        dom.querySelector('#info').innerHTML = '';

        window.location.hash = '#login';
    });

    dom.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            dom.querySelector('.settings-view').classList.remove('hidden');
            dom.querySelector('.rooms-settings-modal').classList.add('hidden');
            dom.querySelector('.trash-settings-modal').classList.add('hidden');
            // Aggiungere gli altri modal!

            return;
        });
    });

    


    return dom;
}