// ========================================================
// 🛒 БАЗА ГОТОВЫХ ТОВАРОВ МАГАЗИНА
// ========================================================
// Загружаем моды из памяти браузера (чтобы добавленные админом моды не пропадали после обновления страницы)
let shopCatalogDB = JSON.parse(localStorage.getItem('adminShopCatalogDB')) || [
    {
        title: "Тестовый мод (Пример)",
        version: "1.21 Forge",
        desc: "Зайди под аккаунтом admin (пароль 12345), чтобы получить доступ к панели создания модов и наполнить магазин своими работами.",
        price: "0 ₽",
        color: "purple",
        link: "https://t.me"
    }
];

// 🛠️ СТАНДАРТНАЯ БАЗА ПОЛЬЗОВАТЕЛЕЙ И ОТЗЫВОВ
let usersDB = JSON.parse(localStorage.getItem('staticUsersDB')) || {
    "admin": "12345",
    "client1": "qwerty"
};

let reviewsDB = JSON.parse(localStorage.getItem('staticReviewsDB')) || [
    { text: "Заказал мод, все работает шикарно. Сделал за пару часов, цена вообще копейки!", author: "Иван К." },
    { text: "Была ошибка в коде, автор исправил за пару минут бесплатно, как и обещал.", author: "Слава 01" }
];

// Функция рендеринга товаров магазина
function renderShopItems(filterText = '') {
    const shopContainer = document.getElementById('shopItemsContainer');
    if (!shopContainer) return;
    shopContainer.innerHTML = '';

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
// ⚙️ СИСТЕМА ДОБАВЛЕНИЯ МОДОВ ДЛЯ АДМИНИСТРАТОРА
// ========================================================
const addModForm = document.getElementById('addModForm');
if (addModForm) {
    addModForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('modTitle').value.trim();
        const version = document.getElementById('modVersion').value.trim();
        const desc = document.getElementById('modDesc').value.trim();
        const price = document.getElementById('modPrice').value.trim();
        const link = document.getElementById('modLink').value.trim();
        const color = document.getElementById('modColor').value;

        // Создаем и пушим новый товар в массив
        shopCatalogDB.unshift({ title, version, desc, price, color, link });
        
        // Сохраняем обновленную базу модов в localStorage
        localStorage.setItem('adminShopCatalogDB', JSON.stringify(shopCatalogDB));
        
        // Сбрасываем форму и обновляем сетку магазина
        addModForm.reset();
        renderShopItems();
        showToast('Мод успешно выложен на сайт!');
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

// Мгновенный запуск без задержек заставок
window.addEventListener('DOMContentLoaded', () => {
    renderReviews();
    renderShopItems();
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

// Авторизация и скрытая проверка АДМИНА
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

