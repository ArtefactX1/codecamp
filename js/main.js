/**
 * CodeCamp - Main JavaScript File
 * FINAL & COMPLETE VERSION
 */

let coursesData = {};
let exercisesData = {};

function getLoggedInUser() { return JSON.parse(sessionStorage.getItem('currentUser')) || null; }
function setLoggedInUser(user) { sessionStorage.setItem('currentUser', JSON.stringify(user)); }
function logoutUser() { sessionStorage.removeItem('currentUser'); window.location.href = 'index.html'; }

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`/api/${endpoint}`, options);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `Error ${response.status}`);
        return result;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}

async function loadCoursesFromAPI() {
    try {
        const courses = await fetchAPI('get-courses');
        coursesData = courses.reduce((acc, course) => {
            acc[course.course_id] = { ...course, id: course.course_id };
            return acc;
        }, {});
    } catch (error) { coursesData = {}; }
}

async function loadExercisesFromAPI(course_id) {
    try {
        const exercises = await fetchAPI(`get-exercises?course_id=${course_id}`);
        exercisesData[course_id] = exercises;
        return exercises;
    } catch (error) { return []; }
}

function updateUIForLoginState() {
    const user = getLoggedInUser();
    const navContainer = document.getElementById('desktop-nav-links');
    if (!navContainer) return;
    let navLinks = `<a href="index.html" class="px-4 py-2 hover:bg-yellow-300">Beranda</a><a href="kursus.html" class="px-4 py-2 hover:bg-yellow-300">Kursus</a>`;
    if (user) {
        navLinks += `<a href="profil.html" class="px-4 py-2 hover:bg-yellow-300">Profil</a>`;
        if (user.role === 'admin') navLinks += `<a href="admin.html" class="px-4 py-2 bg-red-500 text-white font-bold hover:bg-red-600">Admin Panel</a>`;
        navLinks += `<button onclick="logoutUser()" class="ml-4 neo-button secondary">Logout</button>`;
    } else {
        navLinks += `<button onclick="openModal('loginModal')" class="ml-4 neo-button">Login</button>`;
    }
    navContainer.innerHTML = navLinks;
    updateActiveNavLink();
}

function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('#desktop-nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) link.classList.add('active-nav-link');
        else link.classList.remove('active-nav-link');
    });
}

function openModal(modalId) { const modal = document.getElementById(modalId); if (modal) modal.style.display = "flex"; }
function closeModal(modalId) { const modal = document.getElementById(modalId); if (modal) modal.style.display = "none"; }
function showMessageModal(title, message) {
    document.getElementById('messageModalTitle').textContent = title;
    document.getElementById('messageModalText').textContent = message;
    openModal('messageModal');
}

async function handleRegistration(event) {
    event.preventDefault();
    const name = document.getElementById('regNama').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    try {
        await fetchAPI('register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name, email, password }) });
        showMessageModal("Registrasi Berhasil", "Silakan login dengan akun Anda.");
        closeModal('registrationModal');
        openModal('loginModal');
    } catch (error) { showMessageModal("Registrasi Gagal", error.message); }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const result = await fetchAPI('login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, password }) });
        setLoggedInUser(result.user);
        closeModal('loginModal');
        updateUIForLoginState();
        showMessageModal("Login Berhasil", `Selamat datang kembali, ${result.user.name}!`);
        setTimeout(() => { window.location.href = result.user.role === 'admin' ? 'admin.html' : 'profil.html'; }, 1000);
    } catch (error) { showMessageModal("Login Gagal", error.message); }
}

async function loadAdminData() {
    try {
        const [users, courses] = await Promise.all([ fetchAPI('get-users'), fetchAPI('get-courses') ]);
        renderUsersTable(users);
        renderCoursesTable(courses);
        const addCourseForm = document.getElementById('add-course-form');
        if (addCourseForm) addCourseForm.addEventListener('submit', handleAddCourse);
    } catch (error) { alert("Gagal memuat data dashboard admin."); }
}

function renderUsersTable(users) { /* ... */ }
function renderCoursesTable(courses) { /* ... */ }
// ... (Sisa fungsi admin dan renderer lainnya)

async function initializeApp() {
    await loadCoursesFromAPI();
    updateUIForLoginState();
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registrationForm')?.addEventListener('submit', handleRegistration);
    if (path.endsWith('admin.html')) {
        if (!getLoggedInUser() || getLoggedInUser().role !== 'admin') return window.location.href = 'index.html';
        loadAdminData();
    } else if (path.endsWith('kursus.html')) {
        params.has('id') ? renderCourseDetail(params.get('id')) : renderCoursesPage();
    } else if (path.endsWith('profil.html')) {
        if (!getLoggedInUser()) return window.location.href = 'index.html';
        renderProfilePage();
    } else if (path.endsWith('arena.html')) {
        if (!getLoggedInUser()) return window.location.href = 'index.html';
        const p = { courseId: params.get('courseId'), exerciseId: params.get('exerciseId'), points: params.get('points') };
        if (p.courseId && p.exerciseId && p.points) renderArenaPage(p);
        else document.getElementById('main-content').innerHTML = `<h1 class="text-4xl font-extrabold">Error: Latihan tidak valid.</h1>`;
    }
}
document.addEventListener('DOMContentLoaded', initializeApp);
