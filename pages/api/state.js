import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STATE_ID = 'owner';
const TABLE_NAME = 'app_state';

const SUPABASE_CONFIGURED = Boolean(
    SUPABASE_URL
    && SUPABASE_SERVICE_ROLE_KEY
    && SUPABASE_SERVICE_ROLE_KEY !== 'your-service-role-key'
);

const supabase = SUPABASE_CONFIGURED
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    : null;

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (!supabase) {
        res.status(200).json({ available: false, error: 'Supabase no esta configurado.' });
        return;
    }

    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('data')
            .eq('id', STATE_ID)
            .maybeSingle();

        if (error) {
            res.status(500).json({ error: 'No se pudo leer el estado.' });
            return;
        }

        res.status(200).json({ data: data ? data.data : null });
        return;
    }

    if (req.method === 'POST') {
        let payload = req.body;
        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            } catch (parseError) {
                res.status(400).json({ error: 'JSON inválido.' });
                return;
            }
        }

        if (!payload || typeof payload !== 'object') {
            res.status(400).json({ error: 'Payload inválido.' });
            return;
        }

        const { error } = await supabase
            .from(TABLE_NAME)
            .upsert({ id: STATE_ID, data: payload, updated_at: new Date().toISOString() });

        if (error) {
            res.status(500).json({ error: 'No se pudo guardar el estado.' });
            return;
        }

        res.status(200).json({ ok: true });
        return;
    }

    res.status(405).json({ error: 'Método no permitido.' });
};
