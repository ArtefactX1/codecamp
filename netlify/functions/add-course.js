const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    try {
        const { course_id, title, level, image } = JSON.parse(event.body);
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { error } = await supabase.from('courses').insert([{ course_id, title, level, image }]);
        if (error) {
            if (error.code === '23505') { 
                return { statusCode: 409, body: JSON.stringify({ message: `Error: Kursus dengan ID '${course_id}' sudah ada.` }) };
            }
            throw error;
        }
        return { statusCode: 201, body: JSON.stringify({ message: 'Kursus berhasil ditambahkan' }) };
    } catch (error) {
        console.error('Crash in add-course function:', error);
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};
