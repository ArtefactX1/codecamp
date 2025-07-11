/**
 * CodeCamp - Main JavaScript File
 * FINAL & COMPLETE VERSION
 * - Fully integrated with Netlify Functions & Supabase Backend.
 * - Includes all Admin Panel CRUD functionalities (Users, Courses, Exercises).
 * - All pages (Home, Courses, Detail, Profile, Arena) are functional.
 * - Uses Event Delegation for robust Admin Panel actions.
 */

// Global data variables, loaded from API
let coursesData = {};
let exercisesData = {};

// --- CORE FUNCTIONS (API-driven) ---
function getLoggedInUser() { return JSON.parse(sessionStorage.getItem('currentUser')) || null; }
function setLoggedInUser(user) { sessionStorage.setItem('currentUser', JSON.stringify(user)); }
function logoutUser() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`/api/${endpoint}`, options);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `Error: Status ${response.status}`);
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
    } catch (error) {
        console.error("Gagal memuat data kursus dari API.", error);
        coursesData = {};
    }
}

async function loadExercisesFromAPI(course_id) {
    try {
        const exercises = await fetchAPI(`get-exercises?course_id=${course_id}`);
        exercisesData[course_id] = exercises;
        return exercises;
    } catch (error) {
        console.error(`Gagal memuat latihan untuk ${course_id}:`, error);
        return [];
    }
}

async function getUserProgress(email) {
    try { return await fetchAPI(`get-progress?email=${email}`); }
    catch (error) { return {}; }
}

async function getUserActivity(email) {
    try { return await fetchAPI(`get-activity?email=${email}`); }
    catch (error) { return []; }
}

async function updateUserProgress(email, courseId, points) {
    try {
        await fetchAPI('update-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email, course_id: courseId, points: points })
        });
    } catch(error) { console.error("Gagal memperbarui progres:", error); }
}

async function addUserActivity(email, activityText) {
    try {
        await fetchAPI('add-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_email: email, text: activityText })
        });
    } catch(error) { console.error("Gagal menambah aktivitas:", error); }
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
    const titleEl = document.getElementById('messageModalTitle');
    const textEl = document.getElementById('messageModalText');
    if (titleEl && textEl) {
        titleEl.textContent = title;
        textEl.textContent = message;
        openModal('messageModal');
    }
}


// --- EVENT HANDLERS ---
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

async function submitCode(courseId, exerciseId, points) {
    const user = getLoggedInUser();
    if (!user) return showMessageModal("Gagal", "Anda harus login untuk mengumpulkan jawaban.");
    try {
        await updateUserProgress(user.email, courseId, points);
        await addUserActivity(user.email, `Menyelesaikan ${exerciseId} di kursus ${coursesData[courseId].title}`);
        showMessageModal("Berhasil!", `Jawaban Anda telah dikumpulkan. Anda mendapatkan ${points} poin!`);
        const outputArea = document.getElementById('outputArea');
        outputArea.textContent = `//-- Simulasi Sukses --//\n// Progres Anda telah diperbarui di database.`;
        outputArea.className = outputArea.className.replace(/text-(slate|red)-400/g, 'text-green-400');
        const submitBtn = document.getElementById('submitCodeBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Telah Dikumpulkan';
    } catch (error) { showMessageModal("Error", "Gagal menyimpan progres. Coba lagi nanti."); }
}

// ===================================================
// ADMIN PANEL FUNCTIONS
// ===================================================

async function handleAdminActions(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'delete-user') deleteUser(button.dataset.email);
    else if (action === 'manage-exercises') openExerciseManager(button.dataset.courseId);
    else if (action === 'edit-course') openEditCourseModal(button.dataset.courseId);
    else if (action === 'delete-course') deleteCourse(button.dataset.courseId);
}

async function loadAdminData() {
    try {
        const [users, courses] = await Promise.all([ fetchAPI('get-users'), fetchAPI('get-courses') ]);
        renderUsersTable(users);
        renderCoursesTable(courses);
        document.getElementById('add-course-form')?.addEventListener('submit', handleAddCourse);
        document.getElementById('user-table-body')?.addEventListener('click', handleAdminActions);
        document.getElementById('course-table-body')?.addEventListener('click', handleAdminActions);
    } catch (error) { alert("Gagal memuat data dashboard admin."); }
}

function renderUsersTable(users) {
    const userTableBody = document.getElementById('user-table-body');
    if (!userTableBody) return;
    userTableBody.innerHTML = '';
    users.forEach(user => {
        userTableBody.innerHTML += `
            <tr class="border-b border-slate-900"><td class="p-3">${user.name}</td><td class="p-3">${user.email}</td><td class="p-3">${user.role || 'user'}</td>
            <td class="p-3"><button data-action="delete-user" data-email="${user.email}" class="text-red-600 hover:underline ${user.role === 'admin' ? 'hidden' : ''}">Hapus</button></td></tr>`;
    });
}

function renderCoursesTable(courses) {
    const courseTableBody = document.getElementById('course-table-body');
    if (!courseTableBody) return;
    courseTableBody.innerHTML = '';
    courses.forEach(course => {
        courseTableBody.innerHTML += `
             <tr class="border-b border-slate-900"><td class="p-3 font-mono">${course.course_id}</td><td class="p-3 font-bold">${course.title}</td>
             <td class="p-3 whitespace-nowrap"><button data-action="manage-exercises" data-course-id="${course.course_id}" class="text-green-600 hover:underline mr-4">Kelola Latihan</button><button data-action="edit-course" data-course-id="${course.course_id}" class="text-blue-600 hover:underline mr-4">Edit</button><button data-action="delete-course" data-course-id="${course.course_id}" class="text-red-600 hover:underline">Hapus</button></td></tr>`;
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

async function openExerciseManager(course_id) {
    const course = coursesData[course_id];
    if (!course) return alert("Kursus tidak ditemukan.");
    document.getElementById('exerciseManagerCourseTitle').textContent = `Untuk Kursus: ${course.title}`;
    openModal('exerciseManagerModal');
    renderExerciseListView(course_id);
}

async function renderExerciseListView(course_id) {
    const modalContent = document.getElementById('exercise-modal-content');
    modalContent.innerHTML = '<p class="text-slate-500">Memuat latihan...</p>';
    try {
        const exercises = await loadExercisesFromAPI(course_id);
        let exerciseListHTML = '';
        if (exercises.length === 0) {
            exerciseListHTML = '<p class="text-slate-500 text-center col-span-full">Belum ada latihan.</p>';
        } else {
            exerciseListHTML = exercises.map(ex => `
                <div class="flex justify-between items-center p-3 border-2 border-slate-900">
                    <div><p class="font-bold">${ex.exercise_id}: ${ex.title}</p><p class="text-xs text-slate-500">${ex.points} Poin</p></div>
                    <div><button data-action="edit-exercise" data-exercise-id="${ex.id}" class="text-blue-600 hover:underline mr-4">Edit</button><button data-action="delete-exercise" data-id="${ex.id}" data-course-id="${course_id}" class="text-red-600 hover:underline">Hapus</button></div>
                </div>`).join('');
        }
        modalContent.innerHTML = `
            <div class="grid md:grid-cols-2 gap-8"><div class="space-y-3"><h3 class="text-xl font-bold">Daftar Latihan</h3>${exerciseListHTML}</div>
            <div class="border-t-2 md:border-t-0 md:border-l-2 border-slate-900 pt-6 md:pt-0 md:pl-8"><form id="add-exercise-form"><input type="hidden" id="addExerciseCourseId" value="${course_id}"><h3 class="text-xl font-bold mb-4">Tambah Latihan Baru</h3><div class="mb-4"><label for="exerciseId" class="block text-sm font-bold uppercase mb-1">ID Latihan</label><input type="text" id="exerciseId" class="neo-input" required placeholder="cth: Latihan 1"></div><div class="mb-4"><label for="exerciseTitle" class="block text-sm font-bold uppercase mb-1">Judul Latihan</label><input type="text" id="exerciseTitle" class="neo-input" required></div><div class="mb-4"><label for="exercisePoints" class="block text-sm font-bold uppercase mb-1">Poin</label><input type="number" id="exercisePoints" class="neo-input" required placeholder="25"></div><div class="mb-4"><label for="exerciseInstructions" class="block text-sm font-bold uppercase mb-1">Instruksi</label><textarea id="exerciseInstructions" class="neo-textarea h-24"></textarea></div><div class="mb-4"><label for="exerciseStarterCode" class="block text-sm font-bold uppercase mb-1">Kode Awal</label><textarea id="exerciseStarterCode" class="neo-textarea h-24 font-mono"></textarea></div><button type="submit" class="neo-button w-full">Tambah Latihan</button></form></div></div>`;
        modalContent.addEventListener('click', handleExerciseActions);
        document.getElementById('add-exercise-form').addEventListener('submit', handleAddExercise);
    } catch (error) { modalContent.innerHTML = '<p class="text-red-500">Gagal memuat latihan.</p>'; }
}

function renderExerciseEditView(exercise_id) {
    const modalContent = document.getElementById('exercise-modal-content');
    let exercise;
    for (const course in exercisesData) {
        const found = exercisesData[course].find(ex => ex.id == exercise_id);
        if (found) { exercise = found; break; }
    }
    if (!exercise) return alert("Gagal menemukan data latihan.");
    modalContent.innerHTML = `
        <form id="edit-exercise-form"><input type="hidden" id="editExerciseId" value="${exercise.id}"><input type="hidden" id="editExerciseCourseId" value="${exercise.course_id}"><h3 class="text-xl font-bold mb-4">Edit Latihan: ${exercise.exercise_id}</h3><div class="mb-4"><label for="editExerciseTitle" class="block text-sm font-bold uppercase mb-1">Judul Latihan</label><input type="text" id="editExerciseTitle" class="neo-input" value="${exercise.title}" required></div><div class="mb-4"><label for="editExercisePoints" class="block text-sm font-bold uppercase mb-1">Poin</label><input type="number" id="editExercisePoints" class="neo-input" value="${exercise.points}" required></div><div class="mb-4"><label for="editExerciseInstructions" class="block text-sm font-bold uppercase mb-1">Instruksi</label><textarea id="editExerciseInstructions" class="neo-textarea h-32">${exercise.instructions || ''}</textarea></div><div class="mb-4"><label for="editExerciseStarterCode" class="block text-sm font-bold uppercase mb-1">Kode Awal</label><textarea id="editExerciseStarterCode" class="neo-textarea h-32 font-mono">${exercise.starter_code || ''}</textarea></div><div class="flex gap-4 mt-6"><button type="submit" class="neo-button w-full">Simpan Perubahan</button><button type="button" data-action="back-to-list" data-course-id="${exercise.course_id}" class="neo-button secondary w-full">Kembali ke Daftar</button></div></form>`;
    document.getElementById('edit-exercise-form').addEventListener('submit', handleEditExercise);
    modalContent.querySelector('[data-action="back-to-list"]').addEventListener('click', (e) => renderExerciseListView(e.target.dataset.courseId));
}

async function handleExerciseActions(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'edit-exercise') renderExerciseEditView(button.dataset.exerciseId);
    else if (action === 'delete-exercise') deleteExercise(button.dataset.id, button.dataset.courseId);
}

async function handleAddExercise(event) {
    event.preventDefault();
    const exerciseData = {
        course_id: document.getElementById('addExerciseCourseId').value,
        exercise_id: document.getElementById('exerciseId').value,
        title: document.getElementById('exerciseTitle').value,
        points: document.getElementById('exercisePoints').value,
        instructions: document.getElementById('exerciseInstructions').value,
        starter_code: document.getElementById('exerciseStarterCode').value
    };
    if (!exerciseData.course_id || !exerciseData.exercise_id || !exerciseData.title || !exerciseData.points) return alert("ID, Judul, dan Poin harus diisi.");
    try {
        await fetchAPI('add-exercise', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(exerciseData) });
        alert('Latihan berhasil ditambahkan!');
        renderExerciseListView(exerciseData.course_id);
    } catch(error) { alert(`Error: ${error.message}`); }
}

async function handleEditExercise(event) {
    event.preventDefault();
    const exerciseData = {
        id: document.getElementById('editExerciseId').value,
        title: document.getElementById('editExerciseTitle').value,
        points: document.getElementById('editExercisePoints').value,
        instructions: document.getElementById('editExerciseInstructions').value,
        starter_code: document.getElementById('editExerciseStarterCode').value
    };
    const course_id = document.getElementById('editExerciseCourseId').value;
    try {
        await fetchAPI('edit-exercise', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(exerciseData) });
        alert('Latihan berhasil diperbarui!');
        renderExerciseListView(course_id);
    } catch(error) { alert(`Error: ${error.message}`); }
}

async function deleteExercise(id, course_id) {
    if (confirm(`Yakin ingin menghapus latihan ini?`)) {
        try {
            await fetchAPI('delete-exercise', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id }) });
            alert('Latihan berhasil dihapus.');
            renderExerciseListView(course_id);
        } catch(error) { alert(`Error: ${error.message}`); }
    }
}

// --- PAGE RENDERERS ---
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
    await loadCoursesFromAPI();
    updateUIForLoginState();
    
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registrationForm')?.addEventListener('submit', handleRegistration);
    
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
