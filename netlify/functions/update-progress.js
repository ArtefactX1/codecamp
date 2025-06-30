const { createClient } = require('@supabase/supabase-js');
exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { user_email, course_id, points } = JSON.parse(event.body);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    try {
        let { data: current } = await supabase.from('user_progress').select('points').eq('user_email', user_email).eq('course_id', course_id).single();
        const newTotalPoints = Math.min(100, (current ? current.points : 0) + parseInt(points));
        const { error } = await supabase.from('user_progress').upsert({ user_email, course_id, points: newTotalPoints }, { onConflict: 'user_email,course_id' });
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify({ message: 'Progres diperbarui!' }) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ message: error.message }) }; }
};
