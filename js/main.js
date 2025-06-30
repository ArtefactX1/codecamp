/**
 * CodeCamp - Main JavaScript File
 * FINAL VERSION - Fully integrated with Netlify Functions & Supabase
 * API HEADER FIX: Added 'Content-Type': 'application/json' to all POST requests.
 */

// Global data variables, some static, some loaded from API
let coursesData = {};
let exercisesData = {};

// --- CORE FUNCTIONS (API-driven) ---
function getLoggedInUser() { return JSON.parse(sessionStorage.getItem('currentUser')) || null; }
function setLoggedInUser(user) { sessionStorage.setItem('currentUser', JSON.stringify(user)); }
function logoutUser() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

async function getUserProgress(email) {
    try {
        const response = await fetch(`/api/get-progress?email=${email}`);
        if (!response.ok) return {};
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil progres:", error);
        return {};
    }
}

async function getUserActivity(email) {
    try {
        const response = await fetch(`/api/get-activity?email=${email}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil aktivitas:", error);
        return [];
    }
}

async function updateUserProgress(email, courseId, points) {
    try {
        await fetch('/api/update-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email, course_id: courseId, points: points })
        });
    } catch(error) {
        console.error("Gagal memperbarui progres:", error);
    }
}

async function addUserActivity(email, activityText) {
    try {
        await fetch('/api/add-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email, text: activityText })
        });
    } catch(error) {
        console.error("Gagal menambah aktivitas:", error);
    }
}

async function loadCoursesFromAPI() {
    try {
        const response = await fetch('/api/get-courses');
        const courses = await response.json();
        coursesData = courses.reduce((acc, course) => {
            acc[course.course_id] = { ...course, id: course.course_id };
            return acc;
        }, {});
    } catch (error) {
        console.error("Gagal memuat data kursus:", error);
        // Fallback to static data if API fails
        coursesData = {
            'python101': { id: 'python101', title: 'Dasar Pemrograman Python', level: 'Pemula', image: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Python' },
            'js101': { id: 'js101', title: 'JavaScript untuk Web Interaktif', level: 'Pemula - Menengah', image: 'https://placehold.co/600x400/EC4899/FFFFFF?text=JavaScript' }
        };
    }
}

function loadStaticData() {
    exercisesData = {
        'python101': [ { id: 'Latihan 1', title: 'Variabel & Tipe Data', points: 25 }, { id: 'Latihan 2', title: 'Fungsi', points: 35 }],
        'js101': [ { id: 'Latihan 1', title: 'DOM Manipulation', points: 30 }, { id: 'Latihan 2', title: 'Event Listeners', points: 30 }],
        'java101': [ { id: 'Latihan 1', title: 'Classes and Objects', points: 40 }]
    };
}

// --- UI & NAVIGATION ---
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

// --- MODAL UTILITIES ---
function openModal(modalId) { const modal = document.getElementById(modalId); if (modal) modal.style.display = "flex"; }
function closeModal(modalId) { const modal = document.getElementById(modalId); if (modal) modal.style.display = "none"; }
function showMessageModal(title, message) {
    document.getElementById('messageModalTitle').textContent = title;
    document.getElementById('messageModalText').textContent = message;
    openModal('messageModal');
}


// --- EVENT HANDLERS ---
async function handleRegistration(event) {
    event.preventDefault();
    const name = document.getElementById('regNama').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    try {
        const response = await fetch('/api/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name, email, password }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        showMessageModal("Registrasi Berhasil", "Silakan login dengan akun Anda.");
        closeModal('registrationModal');
        openModal('loginModal');
    } catch (error) {
        showMessageModal("Registrasi Gagal", error.message);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const response = await fetch('/api/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email, password }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setLoggedInUser(result.user);
        closeModal('loginModal');
        updateUIForLoginState();
        showMessageModal("Login Berhasil", `Selamat datang kembali, ${result.user.name}!`);
        setTimeout(() => { window.location.href = result.user.role === 'admin' ? 'admin.html' : 'profil.html'; }, 1000);
    } catch (error) {
        showMessageModal("Login Gagal", error.message);
    }
}

async function submitCode(courseId, exerciseId, points) {
    const user = getLoggedInUser();
    const outputArea = document.getElementById('outputArea');
    if (!user) return showMessageModal("Gagal", "Anda harus login untuk mengumpulkan jawaban.");
    
    await updateUserProgress(user.email, courseId, points);
    await addUserActivity(user.email, `Menyelesaikan ${exerciseId} di kursus ${coursesData[courseId].title}`);
    
    showMessageModal("Berhasil!", `Jawaban Anda telah dikumpulkan. Anda mendapatkan ${points} poin!`);
    outputArea.textContent = `//-- Simulasi Sukses --//\n// Progres Anda telah diperbarui di database.`;
    outputArea.className = outputArea.className.replace(/text-(slate|red)-400/g, 'text-green-400');
    const submitBtn = document.getElementById('submitCodeBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Telah Dikumpulkan';
    submitBtn.className = 'bg-gray-400 cursor-not-allowed text-white p-3 font-bold';
}


// ===================================================
// ADMIN PANEL FUNCTIONS (IMPLEMENTASI LENGKAP)
// ===================================================

async function loadAdminData() {
    try {
        const [usersResponse, coursesResponse] = await Promise.all([
            fetch('/api/get-users'),
            fetch('/api/get-courses')
        ]);
        if (!usersResponse.ok || !coursesResponse.ok) throw new Error('Gagal memuat data admin');
        const users = await usersResponse.json();
        const courses = await coursesResponse.json();
        renderUsersTable(users);
        renderCoursesTable(courses);
        document.getElementById('add-course-form').addEventListener('submit', handleAddCourse);
    } catch (error) {
        console.error("Error memuat data admin:", error);
        alert("Gagal memuat data dashboard admin.");
    }
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
             <tr class="border-b border-slate-900"><td class="p-3">${course.course_id}</td><td class="p-3">${course.title}</td><td class="p-3">${course.level}</td>
             <td class="p-3"><button onclick="deleteCourse('${course.course_id}')" class="text-red-600 hover:underline">Hapus</button></td></tr>`;
    });
}

async function deleteUser(email) {
    if (confirm(`Yakin ingin menghapus pengguna: ${email}?`)) {
        try {
            const response = await fetch('/api/delete-user', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email }) });
            if (!response.ok) throw new Error('Gagal menghapus pengguna.');
            alert('Pengguna berhasil dihapus.');
            loadAdminData();
        } catch (error) { alert(error.message); }
    }
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
        const response = await fetch('/api/add-course', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(courseData) });
        if (!response.ok) throw new Error('Gagal menambah kursus.');
        alert('Kursus berhasil ditambahkan!');
        loadAdminData();
        event.target.reset();
    } catch(error) { alert(error.message); }
}

async function deleteCourse(course_id) {
    if (confirm(`Yakin ingin menghapus kursus ID: ${course_id}?`)) {
        try {
            const response = await fetch('/api/delete-course', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ course_id }) });
            if (!response.ok) throw new Error('Gagal menghapus kursus.');
            alert('Kursus berhasil dihapus.');
            loadAdminData();
        } catch(error) { alert(error.message); }
    }
}


// --- PAGE RENDERERS ---
function renderCoursesPage() {
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

function renderCourseDetail(courseId) {
    const container = document.getElementById('main-content');
    if (!container) return;
    const course = coursesData[courseId];
    if (!course) return container.innerHTML = `<h1 class="text-4xl font-extrabold text-slate-900">404 - Kursus Tidak Ditemukan</h1>`;
    let exercisesHTML = (exercisesData[courseId] || []).map(ex => `
        <div class="neo-card p-4 flex justify-between items-center">
            <div><h4 class="font-bold text-lg">${ex.id}: ${ex.title}</h4><p class="text-sm text-slate-600">${ex.points} Poin</p></div>
            <a href="arena.html?courseId=${course.id}&exerciseId=${ex.id}&points=${ex.points}" class="neo-button secondary">Mulai</a>
        </div>`).join('');
    if (!exercisesHTML) exercisesHTML = '<p>Belum ada latihan untuk kursus ini.</p>';
    container.innerHTML = `
        <a href="kursus.html" class="neo-button secondary mb-8 inline-block">&larr; Kembali ke Daftar Kursus</a>
        <div class="neo-card p-8"><img src="${course.image}" alt="Gambar Kursus ${course.title}" class="w-full h-64 object-cover mb-6 border-2 border-slate-900">
            <h1 class="text-4xl font-extrabold text-slate-900 mb-2">${course.title}</h1>
            <p class="text-slate-600 mb-8 font-bold uppercase text-lg">${course.level}</p>
            <h2 class="text-2xl font-bold mb-4">Latihan & Proyek</h2><div class="space-y-4">${exercisesHTML}</div>
        </div>`;
}

async function renderProfilePage() {
    const user = getLoggedInUser();
    if (!user) return window.location.href = 'index.html';
    
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;

    const [progress, activities] = await Promise.all([ getUserProgress(user.email), getUserActivity(user.email) ]);
    
    const progressContainer = document.getElementById('progress-container');
    progressContainer.innerHTML = '';
    let hasProgress = false;
    for (const courseId in coursesData) {
        const percent = progress[courseId] || 0;
        if (percent > 0) hasProgress = true;
        progressContainer.innerHTML += `
            <div><div class="flex justify-between mb-1"><span class="font-bold text-slate-700">${coursesData[courseId]?.title || courseId}</span><span class="font-bold text-slate-900">${percent}%</span></div>
            <div class="w-full bg-slate-200 border-2 border-slate-900 h-6"><div class="bg-yellow-400 h-full" style="width: ${percent}%"></div></div></div>`;
    }
    if (!hasProgress) progressContainer.innerHTML = '<p class="text-slate-600">Anda belum memulai kursus apapun. <a href="kursus.html" class="font-bold text-slate-900 hover:underline">Mulai sekarang!</a></p>';
    
    const activityContainer = document.getElementById('activity-container');
    activityContainer.innerHTML = '';
    if(activities.length > 0) {
        activities.forEach(act => {
            activityContainer.innerHTML += `<div class="text-sm"><p class="font-bold">${act.text}</p><p class="text-slate-500 text-xs">${new Date(act.created_at).toLocaleString('id-ID')}</p></div>`;
        });
    } else {
        activityContainer.innerHTML = '<p class="text-slate-600 text-sm">Belum ada aktivitas terbaru.</p>';
    }
}

function renderArenaPage(params) {
    const { courseId, exerciseId, points } = params;
    const course = coursesData[courseId];
    if (!course) return document.getElementById('main-content').innerHTML = `<h1 class="text-4xl font-extrabold">Error: Kursus tidak valid.</h1>`;
    document.getElementById('arena-exercise-title').textContent = `${exerciseId}`;
    document.getElementById('arena-course-title').textContent = `Kursus: ${course.title}`;
    const backButton = document.getElementById('backToCourseBtn');
    if (backButton) backButton.onclick = () => window.location.href = `kursus.html?id=${courseId}`;
    document.getElementById('submitCodeBtn').addEventListener('click', () => submitCode(courseId, exerciseId, points));
}


// --- INITIALIZATION ---
async function initializeApp() {
    loadStaticData();
    await loadCoursesFromAPI();
    updateUIForLoginState();
    
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registrationForm')?.addEventListener('submit', handleRegistration);
    
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path.endsWith('admin.html')) {
        const user = getLoggedInUser();
        if (!user || user.role !== 'admin') return window.location.href = 'index.html';
        loadAdminData();
    } else if (path.endsWith('kursus.html')) {
        params.has('id') ? renderCourseDetail(params.get('id')) : renderCoursesPage();
    } else if (path.endsWith('profil.html')) {
        renderProfilePage();
    } else if (path.endsWith('arena.html')) {
        const p = { courseId: params.get('courseId'), exerciseId: params.get('exerciseId'), points: params.get('points') };
        if (p.courseId && p.exerciseId && p.points) {
            renderArenaPage(p);
        } else {
            document.getElementById('main-content').innerHTML = `<h1 class="text-4xl font-extrabold">Error: Latihan tidak valid.</h1>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
