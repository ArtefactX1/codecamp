exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { user_email, course_id, points } = JSON.parse(event.body);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    try {
        // 1. Ambil progres saat ini
        let { data: currentProgress } = await supabase
            .from('user_progress')
            .select('points')
            .eq('user_email', user_email)
            .eq('course_id', course_id)
            .single();
        
        // 2. Hitung total poin baru, maksimal 100
        const currentPoints = currentProgress ? currentProgress.points : 0;
        const newTotalPoints = Math.min(100, currentPoints + parseInt(points));

        // 3. Lakukan upsert (update jika ada, insert jika tidak ada)
        const { error } = await supabase
            .from('user_progress')
            .upsert({ user_email, course_id, points: newTotalPoints }, { onConflict: 'user_email,course_id' });

        if (error) throw error;
        
        return { statusCode: 200, body: JSON.stringify({ message: 'Progres diperbarui!' }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
    }
};