const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    try {
        const { id, title, points, instructions, starter_code } = JSON.parse(event.body);
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { error } = await supabase
            .from('exercises')
            .update({ title, points: parseInt(points), instructions, starter_code })
            .eq('id', id);
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify({ message: 'Latihan berhasil diperbarui' }) };
    } catch (error) {
        console.error('Error di edit-exercise:', error);
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};