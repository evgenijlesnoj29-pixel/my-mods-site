// 1. БАЗА ПОЛЬЗОВАТЕЛЕЙ
let usersDB = JSON.parse(localStorage.getItem('staticUsersDB')) || {
    "admin": "12345",
    "client1": "qwerty"
};

// 2. БАЗА ОТЗЫВОВ
let reviewsDB = JSON.parse(localStorage.getItem('staticReviewsDB')) || [
    { text: "Заказал мод, все работает шикарно. Сделал за пару часов, цена вообще копейки!", author: "Иван К." },
    { text: "Была ошибка в коде, автор исправил за пару минут бесплатно, как и обещал.", author: "Слава 01" }
];

function renderReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (!reviewsContainer) return;
    reviewsContainer.innerHTML = '';
    reviewsDB.forEach(rev => {
        reviewsContainer.innerHTML += `
            <div class="review-card layout-animation">
                <p style="margin:0; line-height:1.5; font-size:0.9rem;">«${rev.text}»</p>
                <div style="font-weight:bold; color: var(--text-muted); margin-top:8px; font-size:0.85rem;">— ${rev.author}</div>
            </div>`;
    });
    initScrollAnimation(); // Обновляем триггеры для новых отзывов
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

// Таймер для заставки (исчезает через 2.5 секунды, уходя в цвет сайта)
window.addEventListener('DOMContentLoaded', () => {
    renderReviews();
    setTimeout(() => {
        const intro = document.getElementById('intro-screen');
        if (intro) {
            intro.style.opacity = '0';
            setTimeout(() => {
                intro.style.visibility = 'hidden';
                initScrollAnimation(); // Запускаем проверку видимости плашек
            }, 1000);
        }
    }, 2500);
});

// АНИМАЦИЯ ПОЯВЛЕНИЯ ПЛАШЕК ПРИ СКРОЛЛЕ
function initScrollAnimation() {
    const animItems = document.querySelectorAll('.layout-animation');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            }
        });
    }, { threshold: 0.05 });
    animItems.forEach(item => scrollObserver.observe(item));
}

// Форма добавления отзыва
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

// Умный скролл и авто-переключение кнопок панели
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.scroll-section');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 100;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
    });
});

window.addEventListener('scroll', () => {
    let currentSectionId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 140; 
        if (window.scrollY >= sectionTop) currentSectionId = section.getAttribute('id');
    });
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-target') === currentSectionId) btn.classList.add('active');
    });
});

// Переключение темы
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

// Авторизация и кнопка заказа
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

let authMode = 'login';

function checkUser() {
    const loggedUser = localStorage.getItem('loggedUser');
    if (loggedUser) {
        if (authSection) authSection.innerHTML = `<button class="capsule-btn" id="logoutBtn">ВЫЙТИ</button>`;
        if (clientGreeting) clientGreeting.textContent = `Привет, ${loggedUser}! Рады видеть тебя снова.`;
        if (clientZone) clientZone.style.display = 'block';
        
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

// ========================================================
// ⚖️ ПОЛНОЦЕННЫЕ НАСТОЯЩИЕ ЮРИДИЧЕСКИЕ ТЕКСТЫ ДЛЯ ПОДВАЛА
// ========================================================
const legalModal = document.getElementById('legalModal');
const closeLegalBtn = document.getElementById('closeLegalBtn');
const legalTitle = document.getElementById('legalTitle');
const legalText = document.getElementById('legalText');

const documents = {
    privacy: {
        title: "Политика конфиденциальности",
        text: "Настоящая политика конфиденциальности регулирует сбор, хранение и использование персональных данных на проекте MODS PRODUCTION. Мы собираем только те данные, которые вы добровольно указываете при регистрации аккаунта (логин и пароль), а также при написании отзывов (имя). Эти данные хранятся локально в кэш-памяти вашего браузера и никогда не передаются третьим лицам. Мы не используем сторонние трекеры и файлы cookies для отслеживания вашей активности."
    },
    terms: {
        title: "Пользовательское соглашение",
        text: "Регистрируясь на сайте MODS PRODUCTION, вы полностью соглашаетесь со следующими условиями: 1. Все модификации и скрипты создаются в развлекательных целях под индивидуальные технические задания заказчиков. 2. Оплата услуг производится фиксированно в размере 50 рублей после демонстрации видео-пруфа готовой работы. 3. Автор не несет ответственности за блокировки на игровых серверах, вызванные неправильным использованием приватных модификаций."
    },
    data: {
        title: "Согласие на обработку персональных данных",
 text: "Нажимая кнопку 'Зарегистрироваться' или отправляя отзыв, вы даете полное согласие администрации MODS PRODUCTION на автоматизированную обработку введенных вами данных (логин, пароль, имя в отзыве). Обработка включает в себя запись, систематизацию и хранение данных в локальном хранилище (localStorage) вашего браузера. Вы можете в любой момент отозвать свое согласие, просто очистив кэш и куки вашего интернет-браузера."
    }
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
