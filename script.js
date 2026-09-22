// ========================================================
// 🛠️ ТВОЯ БАЗА ДАННЫХ (Сюда вручную вписывай новых юзеров)
// ========================================================

// 1. БАЗА ПОЛЬЗОВАТЕЛЕЙ (логин: пароль)
let usersDB = JSON.parse(localStorage.getItem('staticUsersDB')) || {
    "admin": "12345",
    "client1": "qwerty"
};

// 2. БАЗА ОТЗЫВОВ КЛИЕНТОВ (сохраняется в памяти браузера)
let reviewsDB = JSON.parse(localStorage.getItem('staticReviewsDB')) || [
    { text: "Заказал мод, все работает шикарно. Сделал за пару часов, цена вообще копейки!", author: "Иван К." },
    { text: "Была ошибка в коде, автор исправил за пару минут бесплатно, как и обещал.", author: "Слава 01" }
];

// Функция автоматического вывода отзывов на экран
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
renderReviews();

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

// Форма добавления нового отзыва (с лимитом 50 символов)
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

// ========================================================
// 🔄 УМНЫЙ СКРОЛЛ И АВТО-ПЕРЕКЛЮЧЕНИЕ КНОПОК ПАНЕЛИ
// ========================================================

const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.scroll-section');

// Плавный скролл к нужной секции при клике на кнопку вверху
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 100; // Корректировка отступа под шапку
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Слежка за колесиком мыши: подсвечиваем нужную кнопку в капсуле навигации
window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 140; 
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.getAttribute('id');
        }
    });

    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-target') === currentSectionId) {
            btn.classList.add('active');
        }
    });
});

// ========================================================
// 🌓 ПЕРЕКЛЮЧЕНИЕ МЯГКОЙ ТЁМНОЙ / СВЕТЛОЙ ТЕМЫ
// ========================================================
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        // Если атрибута нет — мы на светлой теме, включаем тёмную
        if (!document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.setAttribute('data-theme', 'light'); // В стилях под этим селектором лежит тёмная палитра
            themeToggle.textContent = 'СВЕТЛАЯ';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.textContent = 'ТЕМНАЯ';
        }
    });
}

// ========================================================
// 🔐 АВТОРИЗАЦИЯ И ЛОКАЛЬНАЯ ПАНЕЛЬ КЛИЕНТА
// ========================================================
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

// Проверка: вошел ли пользователь ранее?
function checkUser() {
    const loggedUser = sessionStorage.getItem('loggedUser');
    if (loggedUser) {
        if (authSection) authSection.innerHTML = `<button class="capsule-btn" id="logoutBtn">ВЫЙТИ</button>`;
        if (clientGreeting) clientGreeting.textContent = `Привет, ${loggedUser}! Рады видеть тебя снова.`;
        if (clientZone) clientZone.style.display = 'block';
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('loggedUser');
                location.reload();
            });
        }
    }
}
checkUser();

if (openAuthBtn) openAuthBtn.addEventListener('click', () => authModal.style.display = 'flex');
if (closeModalBtn) closeModalBtn.addEventListener('click', () => authModal.style.display = 'none');

// Переключение режимов формы (Вход / Регистрация)
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

// Обработка отправки данных формы в локальную БД
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
}
