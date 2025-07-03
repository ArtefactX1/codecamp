const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    try {
        const { course_id, title, level, image } = JSON.parse(event.body);
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { error } = await supabase.from('courses').update({ title, level, image }).eq('course_id', course_id);
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify({ message: 'Kursus berhasil diperbarui!' }) };
    } catch (error) {
        console.error('Error updating course:', error);
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};
