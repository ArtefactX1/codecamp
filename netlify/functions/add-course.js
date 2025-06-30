const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const { course_id, title, level, image } = JSON.parse(event.body);
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        
        const { error } = await supabase.from('courses').insert([{ course_id, title, level, image }]);

        // PENANGANAN ERROR YANG LEBIH BAIK
        if (error) {
            // Cek jika error disebabkan oleh ID yang sudah ada (duplicate key)
            if (error.code === '23505') { 
                return {
                    statusCode: 409, // 409 Conflict adalah status yang lebih tepat
                    body: JSON.stringify({ message: `Kursus dengan ID '${course_id}' sudah ada.` })
                };
            }
            // Untuk error database lainnya
            throw error;
        }

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Kursus berhasil ditambahkan' })
        };

    } catch (error) {
        // Untuk error umum lainnya (misal: JSON tidak valid)
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        };
    }
};
