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
    const titleEl = document.getElementById('messageModalTitle');
    const textEl = document.getElementById('messageModalText');
    if (titleEl && textEl) {
        titleEl.textContent = title;
        textEl.textContent = message;
        openModal('messageModal');
    }
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

function renderUsersTable(users) {
    const userTableBody = document.getElementById('user-table-body');
    if (!userTableBody) return;
    userTableBody.innerHTML = '';
    users.forEach(user => {
        userTableBody.innerHTML += `
            <tr class="border-b border-slate-900"><td class="p-3">${user.name}</td><td class="p-3">${user.email}</td><td class="p-3">${user.role || 'user'}</td>
            <td class="p-3"><button onclick="deleteUser('${user.email}')" class="text-red-600 hover:underline ${user.role === 'admin' ? 'hidden' : ''}">Hapus</button></td></tr>`;
    });
}

function renderCoursesTable(courses) {
    const courseTableBody = document.getElementById('course-table-body');
    if (!courseTableBody) return;
    courseTableBody.innerHTML = '';
    courses.forEach(course => {
        courseTableBody.innerHTML += `
             <tr class="border-b border-slate-900"><td class="p-3 font-mono">${course.course_id}</td><td class="p-3 font-bold">${course.title}</td>
             <td class="p-3 whitespace-nowrap"><button onclick="openExerciseManager('${course.course_id}')" class="text-green-600 hover:underline mr-4">Kelola Latihan</button><button onclick="openEditCourseModal('${course.course_id}')" class="text-blue-600 hover:underline mr-4">Edit</button><button onclick="deleteCourse('${course.course_id}')" class="text-red-600 hover:underline">Hapus</button></td></tr>`;
    });
}

async function handleAddCourse(event) {
    event.preventDefault();
    const courseData = {
        course_id: document.getElementById('courseId').value,
        title: document.getElementById('courseTitle').value,
        level: document.getElementById('courseLevel').value,
        image: document.getElementById('courseImage').value || `https://placehold.co/600x400/cccccc/0F172A?text=${document.getElementById('courseId').value}`
    };
    if (!courseData.course_id || !courseData.title || !courseData.level) return alert("ID, Judul, dan Level harus diisi.");
    try {
        await fetchAPI('add-course', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(courseData) });
        alert('Kursus berhasil ditambahkan!');
        loadAdminData();
        event.target.reset();
    } catch(error) { alert(`Error: ${error.message}`); }
}

async function deleteCourse(course_id) {
    if (confirm(`Yakin ingin menghapus kursus ID: ${course_id}?`)) {
        try {
            await fetchAPI('delete-course', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ course_id }) });
            alert('Kursus berhasil dihapus.');
            loadAdminData();
        } catch(error) { alert(error.message); }
    }
}

function openEditCourseModal(course_id) {
    const course = coursesData[course_id];
    if (!course) return alert("Data kursus tidak ditemukan!");
    document.getElementById('editCourseId').value = course.id;
    document.getElementById('editCourseTitle').value = course.title;
    document.getElementById('editCourseLevel').value = course.level;
    document.getElementById('editCourseImage').value = course.image;
    openModal('editCourseModal');
    document.getElementById('editCourseForm').onsubmit = handleEditCourse;
}

async function handleEditCourse(event) {
    event.preventDefault();
    const courseData = {
        course_id: document.getElementById('editCourseId').value,
        title: document.getElementById('editCourseTitle').value,
        level: document.getElementById('editCourseLevel').value,
        image: document.getElementById('editCourseImage').value
    };
    try {
        await fetchAPI('edit-course', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(courseData) });
        alert('Kursus berhasil diperbarui!');
        closeModal('editCourseModal');
        loadAdminData();
    } catch(error) { alert(`Error: ${error.message}`); }
}

async function renderCoursesPage() {
    const container = document.getElementById('main-content');
    if (!container) return;
    let courseCardsHTML = '';
    for (const key in coursesData) {
        const course = coursesData[key];
        courseCardsHTML += `
            <div class="neo-card p-6 flex flex-col">
                <img src="${course.image}" alt="Gambar Kursus ${course.title}" class="w-full h-40 object-cover mb-4 border-2 border-slate-900">
                <h3 class="text-2xl font-bold mb-2 flex-grow">${course.title}</h3>
                <p class="text-slate-600 mb-4 font-bold uppercase text-sm">${course.level}</p>
                <a href="kursus.html?id=${course.id}" class="neo-button mt-auto">Lihat Detail</a>
            </div>`;
    }
    container.innerHTML = `<h1 class="text-4xl font-extrabold text-slate-900 mb-8">Semua Kursus</h1><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">${courseCardsHTML}</div>`;
}

async function renderCourseDetail(courseId) {
    const container = document.getElementById('main-content');
    if (!container) return;
    const course = coursesData[courseId];
    if (!course) return container.innerHTML = `<h1 class="text-4xl font-extrabold text-slate-900">404 - Kursus Tidak Ditemukan</h1>`;
    
    const courseExercises = await loadExercisesFromAPI(courseId);
    let exercisesHTML = courseExercises.map(ex => `
        <div class="neo-card p-4 flex justify-between items-center">
            <div><h4 class="font-bold text-lg">${ex.exercise_id}: ${ex.title}</h4><p class="text-sm text-slate-600">${ex.points} Poin</p></div>
            <a href="arena.html?courseId=${course.id}&exerciseId=${ex.exercise_id}&points=${ex.points}" class="neo-button secondary">Mulai</a>
        </div>`).join('');
    if (courseExercises.length === 0) exercisesHTML = '<p>Belum ada latihan untuk kursus ini.</p>';
    
    container.innerHTML = `
        <a href="kursus.html" class="neo-button secondary mb-8 inline-block">&larr; Kembali ke Daftar Kursus</a>
        <div class="neo-card p-8"><img src="${course.image}" alt="Gambar Kursus ${course.title}" class="w-full h-64 object-cover mb-6 border-2 border-slate-900">
            <h1 class="text-4xl font-extrabold text-slate-900 mb-2">${course.title}</h1>
            <p class="text-slate-600 mb-8 font-bold uppercase text-lg">${course.level}</p>
            <h2 class="text-2xl font-bold mb-4">Latihan & Proyek</h2><div class="space-y-4">${exercisesHTML}</div>
        </div>`;
}

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
    }
    // ... (Tambahkan renderer untuk halaman lain seperti profil dan arena di sini)
}

document.addEventListener('DOMContentLoaded', initializeApp);
