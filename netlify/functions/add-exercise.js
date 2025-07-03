const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
    // Pastikan metode adalah POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Ambil data dari body permintaan
        const { course_id, exercise_id, title, points } = JSON.parse(event.body);
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        
        // Masukkan data baru ke tabel 'exercises'
        const { error } = await supabase
            .from('exercises')
            .insert([{ 
                course_id, 
                exercise_id, 
                title, 
                points: parseInt(points) 
            }]);

        if (error) {
            throw error;
        }

        return { 
            statusCode: 201, // 201 Created
            body: JSON.stringify({ message: 'Latihan berhasil ditambahkan' }) 
        };
    } catch (error) {
        console.error('Error di add-exercise:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: error.message }) 
        };
    }
};
