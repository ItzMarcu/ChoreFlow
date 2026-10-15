
export function renderNotFound() {
    const dom = document.createElement('div');
    dom.innerHTML = `
        <button type="button" class="btn-back"> ← Torna alla dashboard</button>
        <h1>404 Pagina non trovata...</h1>
        <h2>La pagina che stai cercando sembra non esistere</h2>
        <p> Se pensi che questo sia un errore 
        <button type="button" id="contact-us">contattaci</button> 
    `;

    dom.querySelector('#contact-us').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = "mailto:dev.andreamarcucci@gmail.com";
    });

    dom.querySelector('.btn-back').addEventListener('click', () => {
        window.location.hash = '#dashboard';
    });

    return dom;
}