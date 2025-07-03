<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - CodeCamp</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <nav class="navbar-sticky">
        <div class="container mx-auto px-6 py-2 flex justify-between items-center">
            <a href="index.html" class="text-2xl font-extrabold text-slate-900 border-2 border-slate-900 px-3 py-1">CodeCamp - ADMIN</a>
            <div id="desktop-nav-links" class="hidden md:flex items-center font-bold"></div>
        </div>
    </nav>
    <main class="container mx-auto px-6 py-12">
        <div class="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <h1 class="text-4xl font-extrabold text-slate-900">Admin Dashboard</h1>
            <a href="index.html" class="neo-button secondary">&larr; Kembali ke Situs Utama</a>
        </div>
        <section id="user-management" class="mb-12">
            <h2 class="text-2xl font-bold mb-4 inline-block bg-yellow-400 border-2 border-slate-900 px-4 py-1">Manajemen Pengguna</h2>
            <div class="neo-card p-1 overflow-x-auto">
                <!-- PERBAIKAN DI SINI: w-f menjadi w-full -->
                <table class="w-full"><thead class="bg-slate-900 text-white uppercase text-sm"><tr><th class="text-left p-3">Nama</th><th class="text-left p-3">Email</th><th class="text-left p-3">Peran</th><th class="text-left p-3">Aksi</th></tr></thead><tbody id="user-table-body"></tbody></table>
            </div>
        </section>
        <section id="course-management">
            <h2 class="text-2xl font-bold mb-4 inline-block bg-yellow-400 border-2 border-slate-900 px-4 py-1">Manajemen Kursus</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="md:col-span-2">
                    <div class="neo-card p-1 overflow-x-auto">
                        <table class="w-full"><thead class="bg-slate-900 text-white uppercase text-sm"><tr><th class="text-left p-3">ID</th><th class="text-left p-3">Judul</th><th class="text-left p-3">Aksi</th></tr></thead><tbody id="course-table-body"></tbody></table>
                    </div>
                </div>
                <div class="md:col-span-1">
                    <form id="add-course-form" class="neo-card p-6">
                        <h3 class="text-xl font-bold mb-4">Tambah Kursus Baru</h3>
                        <div class="mb-4"><label for="courseId" class="block text-sm font-bold uppercase mb-1">ID Kursus</label><input type="text" id="courseId" class="neo-input" required placeholder="cth: python101"></div>
                        <div class="mb-4"><label for="courseTitle" class="block text-sm font-bold uppercase mb-1">Judul Kursus</label><input type="text" id="courseTitle" class="neo-input" required></div>
                        <div class="mb-4"><label for="courseLevel" class="block text-sm font-bold uppercase mb-1">Level</label><input type="text" id="courseLevel" class="neo-input" required placeholder="Pemula"></div>
                        <div class="mb-4"><label for="courseImage" class="block text-sm font-bold uppercase mb-1">URL Gambar (Opsional)</label><input type="text" id="courseImage" class="neo-input"></div>
                        <button type="submit" class="neo-button w-full">Tambah Kursus</button>
                    </form>
                </div>
            </div>
        </section>
    </main>
    <footer class="bg-yellow-400 text-slate-900 py-6 mt-12 border-t-2 border-slate-900"><div class="container mx-auto px-6 text-center font-bold"><p>&copy; 2025 CodeCamp. Admin Area.</p></div></footer>
    <div id="editCourseModal" class="modal"><div class="modal-content"><span class="close-button" onclick="closeModal('editCourseModal')">&times;</span><h2 class="text-2xl font-bold mb-6 text-center">EDIT KURSUS</h2><form id="editCourseForm"><input type="hidden" id="editCourseId"><div class="mb-4"><label for="editCourseTitle" class="block text-sm font-bold uppercase mb-1">Judul Kursus</label><input type="text" id="editCourseTitle" class="neo-input" required></div><div class="mb-4"><label for="editCourseLevel" class="block text-sm font-bold uppercase mb-1">Level</label><input type="text" id="editCourseLevel" class="neo-input" required></div><div class="mb-6"><label for="editCourseImage" class="block text-sm font-bold uppercase mb-1">URL Gambar</label><input type="text" id="editCourseImage" class="neo-input"></div><button type="submit" class="neo-button w-full">Simpan Perubahan</button></form></div></div>
    <div id="exerciseManagerModal" class="modal"><div class="modal-content max-w-3xl"><span class="close-button" onclick="closeModal('exerciseManagerModal')">&times;</span><h2 class="text-2xl font-bold mb-1">Manajemen Latihan</h2><p class="text-slate-600 mb-6" id="exerciseManagerCourseTitle"></p><div class="grid md:grid-cols-2 gap-8"><div><h3 class="text-xl font-bold mb-4">Daftar Latihan</h3><div id="exercise-list-container" class="space-y-3 max-h-96 overflow-y-auto pr-2"><p class="text-slate-500">Memuat latihan...</p></div></div><div class="border-t-2 md:border-t-0 md:border-l-2 border-slate-900 pt-6 md:pt-0 md:pl-8"><form id="add-exercise-form"><input type="hidden" id="addExerciseCourseId"><h3 class="text-xl font-bold mb-4">Tambah Latihan Baru</h3><div class="mb-4"><label for="exerciseId" class="block text-sm font-bold uppercase mb-1">ID Latihan</label><input type="text" id="exerciseId" class="neo-input" required placeholder="cth: Latihan 1"></div><div class="mb-4"><label for="exerciseTitle" class="block text-sm font-bold uppercase mb-1">Judul Latihan</label><input type="text" id="exerciseTitle" class="neo-input" required></div><div class="mb-4"><label for="exercisePoints" class="block text-sm font-bold uppercase mb-1">Poin</label><input type="number" id="exercisePoints" class="neo-input" required placeholder="25"></div><button type="submit" class="neo-button w-full">Tambah Latihan</button></form></div></div></div></div>
    <script src="js/main.js"></script>
</body>
</html>
