const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    try {
        const { course_id, exercise_id, title, points, instructions, starter_code } = JSON.parse(event.body);
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { error } = await supabase.from('exercises').insert([{ 
            course_id, 
            exercise_id, 
            title, 
            points: parseInt(points),
            instructions,
            starter_code
        }]);
        if (error) throw error;
        return { statusCode: 201, body: JSON.stringify({ message: 'Latihan berhasil ditambahkan' }) };
    } catch (error) {
        console.error('Error di add-exercise:', error);
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};