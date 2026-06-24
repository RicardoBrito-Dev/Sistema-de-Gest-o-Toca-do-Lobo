import { createClient } from '@supabase/supabase-js';

// Chaves públicas do Supabase (seguras para ficarem expostas no código cliente)
const supabaseUrl = 'https://ftdimxgoarncbpqsntgt.supabase.co';
const supabaseAnonKey = 'sb_publishable_mVjuuY4QFrjx7xo2Nw_s0Q_qc-r1bN_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
