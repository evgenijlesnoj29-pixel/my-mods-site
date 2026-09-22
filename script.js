// ========================================================
// 🛠️ ТВОЯ БАЗА ДАННЫХ (Сюда вручную вписывай новых юзеров и отзывы)
// ========================================================

// 1. БАЗА ПОЛЬЗОВАТЕЛЕЙ (логин: пароль)
let usersDB = JSON.parse(localStorage.getItem('staticUsersDB')) || {
    "admin": "12345",
    "client1": "qwerty"
};

// 2. БАЗА ОТЗЫВОВ КЛИЕНТОВ
const reviewsDB = [
    { text: "Заказал мод, все работает шикарно. Сделал за пару часов, цена вообще копейки!", author: "Иван К." },
    { text: "Была ошибка в коде, автор исправил за пару минут бесплатно, как и обещал.", author: "Слава 01" }
];

// ========================================================

// Автоматический рендеринг отзывов на страницу из нашей базы
const reviewsContainer = document.getElementById('reviewsContainer');
if (reviewsContainer) {
    reviewsDB.forEach(rev => {
        reviewsContainer.innerHTML += `
            <div class="review-card">
                <p style="margin:0; line-height:1.6;">«${rev.text}»</p>
                <div style="font-weight:bold; color: var(--text-muted); margin-top:10px;">— ${rev.author}</div>
            </div>`;
    });
}

// Кастомные аккуратные уведомления сверху
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

// Переключение страниц (вкладок)
function showPage(pageId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
    
    document.getElementById('page-' + pageId).classList.add('active');
    btn.classList.add('active');
}

// Переключение темной/светлой темы
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'light') {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = 'ТЕМНАЯ';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = 'СВЕТЛАЯ';
    }
});

// Переменные для формы авторизации
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

let authMode = 'login';

// Проверка: залогинен ли уже пользователь?
function checkUser() {
    const loggedUser = sessionStorage.getItem('loggedUser');
    if (loggedUser) {
        authSection.innerHTML = `<button class="capsule-btn" id="logoutBtn">ВЫЙТИ</button>`;
        if (clientGreeting) clientGreeting.textContent = `Привет, ${loggedUser}! Рады видеть тебя снова.`;
        if (clientZone) clientZone.style.display = 'block';
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            sessionStorage.removeItem('loggedUser');
            location.reload();
        });
    }
}
checkUser();

if (openAuthBtn) openAuthBtn.addEventListener('click', () => authModal.style.display = 'flex');
if (closeModalBtn) closeModalBtn.addEventListener('click', () => authModal.style.display = 'none');

// Переключение режимов формы (Вход / Регистрация)
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

// Обработка отправки данных формы
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
            sessionStorage.setItem('loggedUser', user);
            showToast('Регистрация успешна!');
            setTimeout(() => location.reload(), 1000);
        }
    } else {
        if (usersDB[user] && usersDB[user] === pass) {
            sessionStorage.setItem('loggedUser', user);
            showToast('Успешный вход в аккаунт!');
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast('Неверный логин или пароль!');
        }
    }
});
