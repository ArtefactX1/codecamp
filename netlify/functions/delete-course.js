exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { course_id } = JSON.parse(event.body);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    try {
        const { error } = await supabase.from('courses').delete().eq('course_id', course_id);
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify({ message: 'Kursus berhasil dihapus' }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};
