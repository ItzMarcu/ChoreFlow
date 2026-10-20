import { renderDashboard } from "./views/dashboard.js";
import { renderSpeseCosti } from "./views/spese_costi.js";
import { renderLogin } from "./views/login.js";
import { renderRegister } from "./views/register.js";
import { renderOnboarding } from "./views/onboarding.js";
import { renderSettings } from "./views/settings.js";
import { renderNotFound } from "./views/utils/notFound.js";
import { PROXY_URL } from './views/utils/const.js';

// Creare le icone in .png 192x192 e 512x512

const routes = {
    dashboard: renderDashboard,
    spesa_costi: renderSpeseCosti,
    calendario: null,
    impostazioni: renderSettings,
    login: renderLogin,
    register: renderRegister,
    onboarding: renderOnboarding,
    notfound: renderNotFound
};

const hiddenNavRoutes = ['login', 'register', 'onboarding', 'notfound'];


async function router() {
    // Controllo sull # dello URL
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#dashboard';
        return;
    }
    
    const route = window.location.hash.slice(1);
    const isAuthRoute = hiddenNavRoutes.includes(route);
    const isAuthenticated = await checkAuth();

    // Attiva/Disattiva la nav in caso di schermate di login/register
    if (hiddenNavRoutes.includes(route))
        document.body.classList.add('hide-navbar', 'auth-page');
    else 
        document.body.classList.remove('hide-navbar', 'auth-page');

    // Controllo dell'autenticazione, se il proxy da 401 rifare login
    if (!isAuthRoute) {
        if (!isAuthenticated) {
            window.location.hash = '#login';
            localStorage.clear();
            return;
        }
    }

    const render = routes[route];

    // Colora la tab selezionata nella nav 
    document.querySelectorAll('.navbar a').forEach(a => {
        const targetRoute = a.getAttribute('href').slice(1);
        if (targetRoute == route)
            a.classList.add('active');
        else 
            a.classList.remove('active');
    });

    if (render)
        document.querySelector('#app').replaceChildren(render());
    else 
        window.location.hash = '#notfound';
}

window.addEventListener('hashchange', router);
router();

// Ping al proxy per verificare la validità del token
async function checkAuth() {
    try {
        const response = await fetch(`${PROXY_URL}/api/`, {
            method: 'GET',
            credentials: 'include'
        });

        return response.ok;
    } catch (error) {
        return false;
    }
}
