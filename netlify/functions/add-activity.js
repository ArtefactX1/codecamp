exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const { user_email, text } = JSON.parse(event.body);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    try {
        const { error } = await supabase.from('user_activities').insert([{ user_email, text }]);
        if (error) throw error;
        return { statusCode: 201, body: JSON.stringify({ message: "Aktivitas ditambahkan" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
}