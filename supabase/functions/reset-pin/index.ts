import { supabaseAdmin } from '../_shared/admin.ts';
import { makeResetPin } from '../_shared/handlers.ts';

Deno.serve(makeResetPin(supabaseAdmin()));
