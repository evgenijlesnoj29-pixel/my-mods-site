// Секретный облачный ключ для хранения модов в глобальной сети
const GLOBAL_DB_URL = 'https://jsonbin.io';
const API_KEY = '$2a$10$7Z2ZqVRE4eM/C0Y2L.7lEeX/uRjA.3yS.A2F/7G1vY.C2V3b4N5M6'; // Бесплатный ключ доступа

let shopCatalogDB = [];

// 🛠️ СТАНДАРТНАЯ БАЗА ПОЛЬЗОВАТЕЛЕЙ И ОТЗЫВОВ
let usersDB = JSON.parse(localStorage.getItem('staticUsersDB')) || {
    "admin": "12345",
    "client1": "qwerty"
};

let reviewsDB = JSON.parse(localStorage.getItem('staticReviewsDB')) || [
    { text: "Заказал мод, все работает шикарно. Сделал за пару часов, цена вообще копейки!", author: "Иван К." },
    { text: "Была ошибка в коде, автор исправил за пару минут бесплатно, как и обещал.", author: "Слава 01" }
];

// ГЛОБАЛЬНАЯ ЗАГРУЗКА: Качаем моды из облака, чтобы их видели ВСЕ люди
async function fetchGlobalShopItems() {
    try {
        const response = await fetch(GLOBAL_DB_URL + '/latest', {
            headers: { 'X-Master-Key': API_KEY }
        });
        const resData = await response.json();
        shopCatalogDB = resData.record.mods || [];
        renderShopItems();
    } catch (error) {
        console.error("Ошибка загрузки глобальной базы:", error);
        shopCatalogDB = [];
        renderShopItems();
    }
}

// Функция рендеринга товаров магазина (Для всех юзеров)
function renderShopItems(filterText = '') {
    const shopContainer = document.getElementById('shopItemsContainer');
    if (!shopContainer) return;
    shopContainer.innerHTML = '';

    if (shopCatalogDB.length === 0) {
        shopContainer.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px; font-size: 1.1rem; font-weight: 600;">Модов еще нету</p>`;
        return;
    }

    const filtered = shopCatalogDB.filter(item => 
        item.title.toLowerCase().includes(filterText.toLowerCase()) || 
        item.version.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
        shopContainer.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 20px;">Моды по вашему запросу не найдены...</p>`;
        return;
    }

    filtered.forEach(item => {
        shopContainer.innerHTML += `
            <div class="product-card ${item.color}">
                <div class="product-header">
                    <span class="product-meta">${item.version}</span>
                    <h3>${item.title}</h3>
                </div>
                <p class="product-desc">${item.desc}</p>
                <div class="product-price">${item.price}</div>
                <button class="capsule-btn blue-btn shop-buy-btn" data-link="${item.link}">Купить мод</button>
            </div>`;
    });

    document.querySelectorAll('.shop-buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const loggedUser = localStorage.getItem('loggedUser');
            if (loggedUser) {
                window.open(btn.getAttribute('data-link'), '_blank');
            } else {
                showToast('Зарегистрируйтесь либо войдите в аккаунт, чтобы воспользоваться данной услугой');
            }
        });
    });
}

// Живой поиск
const shopSearchInput = document.getElementById('shopSearchInput');
if (shopSearchInput) {
    shopSearchInput.addEventListener('input', (e) => {
        renderShopItems(e.target.value);
    });
}

// ========================================================
// ⚙️ ЖИВАЯ АДМИНКА: Пушит данные в облако для ВСЕХ
// ========================================================
const addModForm = document.getElementById('addModForm');
if (addModForm) {
    addModForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('modTitle').value.trim();
        const version = document.getElementById('modVersion').value.trim();
        const desc = document.getElementById('modDesc').value.trim();
        const price = document.getElementById('modPrice').value.trim();
        const link = document.getElementById('modLink').value.trim();
        const color = document.getElementById('modColor').value;

        // Временно добавляем на экран для скорости
        shopCatalogDB.unshift({ title, version, desc, price, color, link });
        renderShopItems();
        showToast('Отправка в глобальную сеть...');

        // Сохраняем массив модов в глобальное интернет-облако
        try {
            await fetch(GLOBAL_DB_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify({ mods: shopCatalogDB })
            });
            addModForm.reset();
            showToast('Мод успешно выложен для ВСЕХ!');
        } catch (error) {
            showToast('Ошибка сохранения в облако!');
            console.error(error);
        }
    });
}

function renderReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (!reviewsContainer) return;
    reviewsContainer.innerHTML = '';
    reviewsDB.forEach(rev => {
        reviewsContainer.innerHTML += `
            <div class="review-card">
                <p style="margin:0; line-height:1.5; font-size:0.9rem;">«${rev.text}»</p>
                <div style="font-weight:bold; color: var(--text-muted); margin-top:8px; font-size:0.85rem;">— ${rev.author}</div>
            </div>`;
    });
}

function showToast(text) {
    const container = document.getElementById('notification-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Запуск при старте сайта
window.addEventListener('DOMContentLoaded', () => {
    renderReviews();
    fetchGlobalShopItems(); // Сразу стягиваем моды из интернета
});

const addReviewForm = document.getElementById('addReviewForm');
if (addReviewForm) {
    addReviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const authorInput = document.getElementById('reviewAuthor').value.trim();
        const textInput = document.getElementById('reviewText').value.trim();
        if (textInput.length > 50) {
            showToast('Ошибка: Отзыв должен быть меньше 50 символов!');
            return;
        }
        reviewsDB.unshift({ text: textInput, author: authorInput });
        localStorage.setItem('staticReviewsDB', JSON.stringify(reviewsDB));
        addReviewForm.reset();
        renderReviews();
        showToast('Отзыв успешно добавлен!');
    });
}

// Навигация
const navButtons = document.querySelectorAll('.nav-btn');
const landingContainer = document.getElementById('landing-container');
const shopContainer = document.getElementById('shop-container');
const sections = document.querySelectorAll('.scroll-section');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const targetId = btn.getAttribute('data-target');
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (type === 'scroll') {
            landingContainer.style.display = 'block';
            shopContainer.style.display = 'none';
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 100;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        } else if (type === 'page' && targetId === 'shop') {
            landingContainer.style.display = 'none';
            shopContainer.style.display = 'block';
            window.scrollTo({ top: 0 });
        }
    });
});

window.addEventListener('scroll', () => {
    if (landingContainer.style.display === 'none') return;
    let currentSectionId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 140; 
        if (window.scrollY >= sectionTop) currentSectionId = section.getAttribute('id');
    });
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-type') === 'scroll') {
            btn.classList.remove('active');
            if (btn.getAttribute('data-target') === currentSectionId) btn.classList.add('active');
        }
    });
});

// Тема
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        if (!document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.textContent = 'СВЕТЛАЯ';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.textContent = 'ТЕМНАЯ';
        }
    });
}

// Авторизация
const authModal = document.getElementById('authModal');
const openAuthBtn = document.getElementById('openAuthBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const authForm = document.getElementById('authForm');
const modalTitle = document.getElementById('modalTitle');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const switchFormBtn = document.getElementById('switchFormBtn');
const authSection = document.getElementById('authSection');
const clientZone = document.getElementById('clientZone');
const clientGreeting = document.getElementById('clientGreeting');
const orderTelegramBtn = document.getElementById('orderTelegramBtn');
const adminPanelBlock = document.getElementById('adminPanelBlock');

let authMode = 'login';

function checkUser() {
    const loggedUser = localStorage.getItem('loggedUser');
    if (loggedUser) {
if (authSection) authSection.innerHTML = `<button class="capsule-btn" id="logoutBtn">ВЫЙТИ</button>`;
        if (clientGreeting) clientGreeting.textContent = `Привет, ${loggedUser}! Рады видеть тебя снова.`;
        if (clientZone) clientZone.style.display = 'block';
        
        // ЕСЛИ ТЫ АДМИН — ОФИЦИАЛЬНО ОТКРЫВАЕМ ПАНЕЛЬ СОЗДАНИЯ МОДОВ
        if (loggedUser === 'admin' && adminPanelBlock) {
            adminPanelBlock.style.display = 'block';
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('loggedUser');
                location.reload();
            });
        }
    }
}
checkUser();

if (orderTelegramBtn) {
    orderTelegramBtn.addEventListener('click', () => {
        const loggedUser = localStorage.getItem('loggedUser');
        if (loggedUser) {
            window.open('https://t.me', '_blank');
        } else {
            showToast('Зарегистрируйтесь либо войдите в аккаунт, чтобы воспользоваться данной услугой');
        }
    });
}

if (openAuthBtn) openAuthBtn.addEventListener('click', () => authModal.style.display = 'flex');
if (closeModalBtn) closeModalBtn.addEventListener('click', () => authModal.style.display = 'none');

if (switchFormBtn) {
    switchFormBtn.addEventListener('click', () => {
        if (authMode === 'login') {
            authMode = 'register';
            modalTitle.textContent = 'РЕГИСТРАЦИЯ';
            submitAuthBtn.textContent = 'ЗАРЕГИСТРИРОВАТЬСЯ';
            switchFormBtn.textContent = 'Уже есть аккаунт? Войти';
        } else {
            authMode = 'login';
            modalTitle.textContent = 'ВХОД В АККАУНТ';
            submitAuthBtn.textContent = 'ВОЙТИ';
            switchFormBtn.textContent = 'Нет аккаунта? Зарегистрироваться';
        }
    });
}

if (authForm) {
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value;

        if (authMode === 'register') {
            if (usersDB[user]) {
                showToast('Этот логин уже занят!');
            } else {
                usersDB[user] = pass;
                localStorage.setItem('staticUsersDB', JSON.stringify(usersDB));
                localStorage.setItem('loggedUser', user);
                showToast('Регистрация успешна!');
                setTimeout(() => location.reload(), 1000);
            }
        } else {
            if (usersDB[user] && usersDB[user] === pass) {
                localStorage.setItem('loggedUser', user);
                showToast('Успешный вход в аккаунт!');
                setTimeout(() => location.reload(), 1000);
            } else {
                showToast('Неверный логин или пароль!');
            }
        }
    });
}

// Юридический подвал
const legalModal = document.getElementById('legalModal');
const closeLegalBtn = document.getElementById('closeLegalBtn');
const legalTitle = document.getElementById('legalTitle');
const legalText = document.getElementById('legalText');

const documents = {
    privacy: { title: "Политика конфиденциальности", text: "Настоящая политика конфиденциальности регулирует сбор, хранение и использование персональных данных на проекте MODS PRODUCTION. Мы собираем только те данные, которые вы добровольно указываете при регистрации аккаунта (логин и пароль), а также при написании отзывов (имя). Эти данные хранятся локально в кэш-памяти вашего браузера и никогда не передаются третьим лицам. Мы не используем сторонние трекеры и файлы cookies для отслеживания вашей активности." },
    terms: { title: "Пользовательское соглашение", text: "Регистрируясь на сайте MODS PRODUCTION, вы полностью соглашаетесь со следующими условиями: 1. Все модификации и скрипты создаются в развлекательных целях под индивидуальные технические задания заказчиков. 2. Оплата услуг производится фиксированно в размере 50 рублей после демонстрации видео-пруфа готовой работы. 3. Автор не несет ответственности за блокировки на игровых серверах, вызванные неправильным использованием приватных модификаций." },
    data: { title: "Согласие на обработку персональных данных", text: "Нажимая кнопку 'Зарегистрироваться' или отправляя отзыв, вы даете полное согласие администрации MODS PRODUCTION на автоматизированную обработку введенных вами данных (логин, пароль, имя в отзыве). Обработка включает в себя запись, систематизацию и хранение данных в локальном хранилище (localStorage) вашего браузера. Вы можете в любой момент отозвать свое согласие, просто очистив кэш и куки вашего интернет-браузера." }
};

function openLegal(docKey) {
    if (!legalModal || !documents[docKey]) return;
    legalTitle.textContent = documents[docKey].title;
    legalText.innerHTML = documents[docKey].text;
    legalModal.style.display = 'flex';
}

document.getElementById('link-privacy')?.addEventListener('click', (e) => { e.preventDefault(); openLegal('privacy'); });
document.getElementById('link-terms')?.addEventListener('click', (e) => { e.preventDefault(); openLegal('terms'); });
document.getElementById('link-data')?.addEventListener('click', (e) => { e.preventDefault(); openLegal('data'); });
if (closeLegalBtn) closeLegalBtn.addEventListener('click', () => legalModal.style.display = 'none');
