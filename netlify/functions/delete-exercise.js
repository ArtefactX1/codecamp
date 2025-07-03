const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
    // Pastikan metode adalah POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Ambil ID unik dari baris yang akan dihapus
        const { id } = JSON.parse(event.body);
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        // Hapus baris dari tabel 'exercises' berdasarkan ID primernya
        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return { 
            statusCode: 200, 
            body: JSON.stringify({ message: 'Latihan berhasil dihapus' }) 
        };
    } catch (error) {
        console.error('Error di delete-exercise:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: error.message }) 
        };
    }
};