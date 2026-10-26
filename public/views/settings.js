import { PROXY_URL, sleep } from "./utils/utils.js";

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

                <div class="settings-container" id="invite">
                    <div class="settings-item-content">
                        <span class="settings-item-title">Invita nella tua casa</span>
                        <p class="settings-item-desc">Condividi il codice della casa per invitare i tuoi coinquilini</p> 
                    </div>
                    <span class="settings-arrow">→</span>
                </div>

                <div class="settings-container important" id="leave-house">
                    <div class="settings-item-content">
                        <span class="settings-item-title">Abbandona la casa</span>
                        <p class="settings-item-desc">Lascia la casa corrente.</p>
                    </div>
                    <span class="settings-arrow">→</span>
                </div>

                <div class="settings-container important" id="logout">
                    <div class="settings-item-content">
                        <span class="settings-item-title">Esci</span>
                        <p class="settings-item-desc">Una volta uscito dovrai rieffettuare il login</p>
                    </div>
                    <span class="settings-arrow">→</span>
                </div>
            </div>
        </div>

        <!-- Crea/Elimina una stanza -->
        <div class="rooms-settings-modal hidden">
        <h3>Le stanze della casa</h3>
        <button type="button" class="btn-back"> ← Torna alla dashboard</button>
            <div class="rooms-list-container">
                <!-- Qui vengono inserite le stanze -->    
            </div>
            
            <div class="rooms-settings-modal-create-room creation">
                <button type="button" id="create-room">Aggiungi una stanza +</button> 
            </div>
        </div>

        <div class="rooms-settings-creation-modal hidden">
            <h3>Aggiungi una nuova stanza</h3>
            <div class="create-house-confirmation">
                <span class="settings-item-title"> Come si chiama questa stanza?</span>
                <p class="settings-item-desc">Potrai modificare i dettagli in seguito</p>
                <input type="text" placeholder="Bagno" id="room-name" required>
                
                <div class="rooms-settings-creation-modal-buttons> 
                    <button type="button" id="back" class="important">Indietro</button>
                    <button type="button" id="confirm-room-creation">Crea la stanza!</button>
                </div>
            </div>
        </div>

        <!-- Imposta le regole della spazzatura -->
        <div class="trash-settings-modal hidden">
            <h3>Turni spazzatura</h3>
            <div class="trash-list-container">
                <!-- Qua ci sarà una lista -->
            </div>
            <button type="button" class="btn-back"> ← Torna alla dashboard</button>
        </div>

        <div class="leave-house-settings-modal hidden">
            <h3>Abbandona la casa</h3>
            <div class="leave-house-confirmation">
                <span class="important"> Sei sicuro di voler lasciare la casa?</span>
                <p class="settings-item-desc">Quando lasci la casa i tuoi dati verrano disattivati</p>
                <div class="choice-form">
                    <button id="no">No</button>
                    <button id="yes" class="important">Sì</button>
                </div>
            </div>
        </div>

        <div class="toast hidden">
            <p id="info"></p>
        </div>
    `;

    // ==============================================================================
    // ============================= STANZE DELLA CASA ==============================
    // ==============================================================================

    // Quando si clicca su 'Stanze della casa':
    dom.querySelector('#rooms').addEventListener('click', async (e) => {
        e.preventDefault();
        dom.querySelector('.settings-view').classList.add('hidden');
        dom.querySelector('.rooms-settings-modal').classList.remove('hidden');
        dom.querySelector('.rooms-settings-modal').classList.add('fade-in');

        // Recuperare tutte le stanze della casa
        const response = await fetch(`${PROXY_URL}/api/get_rooms?house_url=${localStorage.getItem('house_url')}`, {
            method: 'GET', 
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) {
            dom.querySelector('.toast').classList.remove('hidden');
            dom.querySelector('#info').innerHTML = 'Errore durante il recupero delle stanze';

            await sleep(3500);

            dom.querySelector('.toast').classList.add('hidden');
            dom.querySelector('#info').innerHTML = '';

            return;
        }
        
        if (!data.rooms) {
            return;
        }

        renderRoomsList(data.rooms);
        
    });

    // Attiva il modal per creare una nuova stanza:  
    dom.querySelector('#create-room').addEventListener('click', async (e) => {
        dom.querySelector('.rooms-settings-creation-modal').classList.remove('hidden');
        dom.querySelector('.rooms-settings-creation-modal').classList.add('fade-in');
    });

    // Quando si preme su 'Crea', nel modal di creazione stanza:
    dom.querySelector('#confirm-room-creation').addEventListener('click', async (e) => {
        const name = dom.querySelector('#room-name').value.trim();
        const house_url = localStorage.getItem('house_url');

        const response = await fetch(`${PROXY_URL}/api/create_room`, {
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

        if (!response.ok) {
            dom.querySelector('.toast').classList.remove('hidden');
            dom.querySelector('#info').innerHTML = 'Errore durante la creazione della stanza';

            await sleep(3500);

            dom.querySelector('.toast').classList.add('hidden');
            dom.querySelector('#info').innerHTML = '';

            return;
        }

        dom.querySelector('.toast').classList.remove('hidden');
        dom.querySelector('#info').innerHTML = 'Stanza creata';

        await sleep(3500);

        dom.querySelector('.rooms-settings-creation-modal').classList.add('hidden');

        dom.querySelector('.toast').classList.add('hidden');
        dom.querySelector('#info').innerHTML = '';

        return;
    });

    // Pulsante per uscire dal .room-settings-creation-modal: 
    dom.querySelector('#back').addEventListener('click', (e) => {
        dom.querySelector('.rooms-settings-creation-modal').classList.add('hidden');
        return;
    });

    // renders per 'Stanze della casa':
    function renderRoomsList(rooms) {
        const listContainer = dom.querySelector('.rooms-list-container');
        listContainer.innerHTML = '';

        rooms.forEach(room => {
            const card = dom.createElement('div');
            card.className = 'room-card';
            card.innerHTML = `
                <span class="settings-item-title">${room.name}</span>
                <button type="button" id="confirm-room-creation">
            `;
            listContainer.appendChild(card);
        });
    }

    // ==============================================================================
    // ============================= SPAZZATURA =====================================
    // ==============================================================================

    // Quando si clicca su 'Rotazione spazzatura':
    dom.querySelector('#trash').addEventListener('click', async (e) => {
        e.preventDefault();
        dom.querySelector('.settings-view').classList.add('hidden');
        dom.querySelector('.trash-settings-modal').classList.remove('hidden');
        dom.querySelector('.trash-settings-modal').classList.add('fade-in');
    });

    // Quando si clicca su 'Invita nella tua casa':
    dom.querySelector('#invite').addEventListener('click', async (e) => {
        e.preventDefault();
        await navigator.clipboard.writeText(localStorage.getItem('house_url'));

        dom.querySelector('.toast').classList.remove('hidden');
        dom.querySelector('#info').innerHTML = 'Codice copiato negli appunti';

        await sleep(3500);

        dom.querySelector('.toast').classList.add('hidden');
        dom.querySelector('#info').innerHTML = '';
    });

    // Quando si clicca su 'Abbandona la casa': 
    dom.querySelector('#leave-house').addEventListener('click', async (e) => {
        e.preventDefault();
        dom.querySelector('.settings-view').classList.add('hidden');
        dom.querySelector('.leave-house-settings-modal').classList.remove('hidden');
        dom.querySelector('.leave-house-settings-modal').classList.add('fade-in');

        dom.querySelector('#no').addEventListener('click', (e) => {
            e.preventDefault();
            dom.querySelector('.leave-house-settings-modal').classList.add('hidden');
            dom.querySelector('.settings-view').classList.remove('hidden');
            return;
        });

        dom.querySelector('#yes').addEventListener('click', async (e) => {
            e.preventDefault();
            const response = await fetch(`${PROXY_URL}/api/leave_house`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: localStorage.getItem('nome'),
                    house_url: localStorage.getItem('house_url')
                })
            });

            if (!response.ok) {
                dom.querySelector('.toast').classList.remove('hidden');
                dom.querySelector('#info').innerHTML = "Errore durante l'abbandono della casa";

                await sleep(3500);

                dom.querySelector('.toast').classList.add('hidden');
                dom.querySelector('#info').innerHTML = '';
                return;
            }

            window.location.href = '#login';
            return;
        });
    });

    // Quando si clicca su 'Esci':
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

        window.location.hash = '#login';
        await sleep(3500);

        dom.querySelector('.toast').classList.add('hidden');
        dom.querySelector('#info').innerHTML = '';

    });

    dom.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            dom.querySelector('.settings-view').classList.remove('hidden');
            dom.querySelector('.rooms-settings-modal').classList.add('hidden');
            dom.querySelector('.trash-settings-modal').classList.add('hidden');
            dom.querySelector('.rooms-settings-creation-modal').classList.add('hidden');

            return;
        });
    });

    


    return dom;
}