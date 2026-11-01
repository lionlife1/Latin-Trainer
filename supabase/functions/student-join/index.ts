import { supabaseAdmin } from '../_shared/admin.ts';
import { makeStudentJoin } from '../_shared/handlers.ts';

Deno.serve(makeStudentJoin(supabaseAdmin()));
