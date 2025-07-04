const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {
    // Ambil course_id dari parameter URL, contoh: /api/get-exercises?course_id=python101
    const { course_id } = event.queryStringParameters;
    
    // Jika course_id tidak ada, kembalikan error
    if (!course_id) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ message: 'Parameter course_id dibutuhkan' }) 
        };
    }
    
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    try {
        // Ambil semua latihan yang cocok dengan course_id dari tabel 'exercises'
        let { data, error } = await supabase
            .from('exercises')
            .select('*')
            .eq('course_id', course_id);

        if (error) {
            throw error; // Lemparkan error jika ada masalah database
        }

        // Kembalikan data latihan sebagai JSON
        return { 
            statusCode: 200, 
            body: JSON.stringify(data) 
        };
    } catch (error) {
        console.error('Error di get-exercises:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: error.message }) 
        };
    }
};