
export function renderDashboard() {
    const house_name = localStorage.getItem('house_name');
    const user_name = localStorage.getItem('nome');
    const room_shift = "";

    const dom = document.createElement('div');
    dom.innerHTML = `
            <div class="greet">
                <h1>Ciao, ${user_name}</h1>
                <h3>Questa settimana devi pulire: <strong>${room_shift}</strong></h3>
            </div>
            <!-- Sezione riguardante lo stato della pulizia della casa per le varie stanze-->
            <!-- todo-card example: 
                    <div class="todo-card">
                        <label id="todo-label">
                            <input type="checkbox">
                            <h3>Stanza</h3>
                        </label>
                    </div>
                    <div class="todo-start-helper">
                        <h3>Per iniziare aggiungi le stanze</h3>
                        <button type="button" href="#impostazioni#aggiungi-stanze">Aggiungi +</button>
                    </div>
            -->
            <section>
                <h3>${house_name}:</h3>
                <div class="todo-checklist">
                    <div class="todo-start-helper">
                        <h3>Per iniziare aggiungi le stanze</h3>
                        <button id="goto-rooms-settings">Aggiungi +</button>
                    </div>
                </div>
            </section>
            <!-- Sezione riguardante lo stato della spazzatura -->
            <!-- trash-card example: 
                    <div class="trash-card">
                        <label id="trash-label">
                            <input type="checkbox">
                            <h3>Spazzatura</h3>
                        </label>
                    </div>
            -->
            <section>
                <h3>Spazzatura:</h3>
                <div class="trash-checklist">
                    <h3>Per iniziare imposta la spazzatura</h3>
                    <button id="goto-trash-settings">Aggiungi +</button>
                </div>
            </section>
    `;

    dom.querySelector('#goto-rooms-settings').addEventListener('click', () => {
        window.location.hash = '#impostazioni';
        return;
    });

    dom.querySelector('#goto-trash-settings').addEventListener('click', () => {
        window.location.hash = '#impostazioni';
        return;
    });
    
    return dom;
}