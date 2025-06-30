const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { email, password } = JSON.parse(event.body);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    try {
        let { data: user, error } = await supabase
            .from('users')
            .select('name, email, role')
            .eq('email', email)
            .eq('password_plain', password)
            .single();

        if (error || !user) throw new Error('Email atau password salah.');

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Login berhasil!', user })
        };
    } catch (error) {
        return { statusCode: 401, body: JSON.stringify({ message: error.message }) };
    }
};