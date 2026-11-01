import { supabaseAdmin } from '../_shared/admin.ts';
import { makeStudentLogin } from '../_shared/handlers.ts';

Deno.serve(makeStudentLogin(supabaseAdmin()));
