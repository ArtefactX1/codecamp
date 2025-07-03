const { createClient } = require('@supabase/supabase-js');
exports.handler = async function (event) {
    const { email } = event.queryStringParameters;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    try {
        let { data, error } = await supabase.from('user_progress').select('course_id, points').eq('user_email', email);
        if (error) throw error;
        const progress = data.reduce((acc, item) => { acc[item.course_id] = item.points; return acc; }, {});
        return { statusCode: 200, body: JSON.stringify(progress) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ message: error.message }) }; }
};