const { createClient } = require('@supabase/supabase-js');
exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const { name, email, password } = JSON.parse(event.body);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    try {
        const { error } = await supabase.from('users').insert([{ name, email, password_plain: password, role: 'user' }]); 
        if (error) throw error;
        return { statusCode: 201, body: JSON.stringify({ message: 'Registrasi berhasil!' }) };
    } catch (error) { return { statusCode: 500, body: JSON.stringify({ message: error.message }) }; }
}; 
