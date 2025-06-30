exports.handler = async function() {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    try {
        let { data, error } = await supabase.from('courses').select('course_id, title, level, image');
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ message: error.message }) }; }
};
