
export function renderSpeseCosti() {
    const user_name = localStorage.getItem('nome');
    const house_name = "";

    const dom = document.createElement('div');
    dom.innerHTML = `
            <div class="overview">
                <h1>${user_name}</h1>
                <h3>Devi <strong>10€</strong> a [nome]</h3>
                <h3>[nome] ti deve <strong>20€</strong></h3>
            </div>
            <!-- sezione riguardante la lista della spesa -->
            <!-- 
                tobuy-card example: 
                <div class="tobuy-card">
                    <label id="tobuy-label">
                        <h3>Prodotto</h3>
                        <button id="set-bought">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check preview-icon"><path d="M20 6 9 17l-5-5"/></svg>
                        </button>
                    </label>
                </div>
            -->
            <!-- TODO: Modificare HTML: mettere pulsante per aggiungere elemento-->
            <!-- TODO: Aggiungere modal per la conferma di acquisto -->
            <section>
                <h3>Lista della spesa:</h3>
                <div class="grocery-start-helper">
                    <h3>Per iniziare aggiungi qualcosa</h3>
                    <button id="add-grocery">Aggiungi +</button>
                </div>
            </section>
            <!-- sezione riguardante le spese della casa -->
            <!--
                cost-card example: 
                <div class="cost-card">
                    <label id="cost-label">
                        <h3>Spesa</h3>
                        <h3>30€</h3>
                    </label>
                </div>
            -->
            <section>
                <h3>Spese di ${house_name}</h3>
                <div class="cost-start-helper">
                    <h3>Per iniziare aggiungi una spesa</h3>
                    <button id="add-cost">Aggiungi +</button>
                </div>
            </section>
    `;

    //Implementare features!
    return dom;
}
