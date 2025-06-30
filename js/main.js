/**
 * CodeCamp - Main JavaScript File
 * FINAL VERSION - Integrated with Netlify Functions & Supabase
 */

// Global data variables for static content
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
            body: JSON.stringify({ user_email: email, text: activityText })
        });
    } catch(error) {
        console.error("Gagal menambah aktivitas:", error);
    }
}

function loadStaticData() {
    // Data ini bisa juga diambil dari API jika ingin lebih dinamis
    coursesData = {
        'python101': { id: 'python101', title: 'Dasar Pemrograman Python', level: 'Pemula', image: 'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Python' },
        'js101': { id: 'js101', title: 'JavaScript untuk Web Interaktif', level: 'Pemula - Menengah', image: 'https://placehold.co/600x400/EC4899/FFFFFF?text=JavaScript' },
        'java101': { id: 'java101', title: 'Pengantar Pemrograman Java', level: 'Pemula', image: 'https://placehold.co/600x400/F97316/FFFFFF?text=Java' }
    };
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
        const response = await fetch('/api/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
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
        const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
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
    document.getElementById('submitCodeBtn').disabled = true;
    document.getElementById('submitCodeBtn').textContent = 'Telah Dikumpulkan';
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
            </div>
        `;
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

    const [progress, activities] = await Promise.all([
        getUserProgress(user.email),
        getUserActivity(user.email)
    ]);
    
    const progressContainer = document.getElementById('progress-container');
    progressContainer.innerHTML = '';
    let hasProgress = false;
    for (const courseId in coursesData) {
        const percent = progress[courseId] || 0;
        if (percent > 0) hasProgress = true;
        progressContainer.innerHTML += `
            <div><div class="flex justify-between mb-1"><span class="font-bold text-slate-700">${coursesData[courseId].title}</span><span class="font-bold text-slate-900">${percent}%</span></div>
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
    document.getElementById('arena-exercise-title').textContent = `${exerciseId}`;
    document.getElementById('arena-course-title').textContent = `Kursus: ${course.title}`;
    const backButton = document.getElementById('backToCourseBtn');
    if (backButton) backButton.onclick = () => window.location.href = `kursus.html?id=${courseId}`;
    document.getElementById('submitCodeBtn').addEventListener('click', () => submitCode(courseId, exerciseId, points));
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadStaticData();
    updateUIForLoginState();
    
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registrationForm')?.addEventListener('submit', handleRegistration);
    
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path.endsWith('kursus.html')) {
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
});
