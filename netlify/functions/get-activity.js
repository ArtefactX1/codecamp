const { createClient } = require('@supabase/supabase-js');
exports.handler = async function(event) {
    const { email } = event.queryStringParameters;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    try {
        let { data, error } = await supabase.from('user_activities').select('text, created_at').eq('user_email', email).order('created_at', { ascending: false }).limit(5);
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ message: error.message }) }; }
}