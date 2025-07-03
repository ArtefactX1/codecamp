onst { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
    // 1. Pastikan metode adalah POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 2. Ambil data dari body permintaan
        const { email, name } = JSON.parse(event.body);
        if (!email || !name) {
            return { statusCode: 400, body: JSON.stringify({ message: 'Email dan nama baru dibutuhkan.' }) };
        }

        // 3. Buat koneksi ke Supabase
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        
        // 4. Perbarui nama pengguna berdasarkan email
        const { data, error } = await supabase
            .from('users')
            .update({ name: name })
            .eq('email', email)
            .select(); // select() untuk memastikan data yang diperbarui dikembalikan

        if (error) {
            throw error;
        }

        if (data.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ message: 'Pengguna tidak ditemukan.' }) };
        }

        // 5. Jika berhasil
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Profil berhasil diperbarui!', updatedUser: data[0] })
        };

    } catch (error) {
        console.error('Error di edit-profile:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};