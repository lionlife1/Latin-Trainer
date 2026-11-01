// Deno-only: binds AdminPort to a service-role Supabase client.
import { createClient } from 'npm:@supabase/supabase-js@2';
import type { AdminPort } from './handlers.ts';

export function supabaseAdmin(): AdminPort {
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return {
    async createStudentUser(pin, displayName) {
      const email = `${crypto.randomUUID()}@students.invalid`;
      const { data, error } = await sb.auth.admin.createUser({
        email,
        password: pin,
        email_confirm: true,
        user_metadata: { role: 'student', display_name: displayName },
      });
      if (error || !data.user) throw error ?? new Error('createUser failed');
      return { id: data.user.id, email };
    },
    async deleteUser(id) {
      await sb.auth.admin.deleteUser(id);
    },
    async joinClassAs(userId, joinCode, displayName) {
      const { error } = await sb.rpc('join_class_as', {
        p_student_id: userId,
        p_join_code: joinCode,
        p_display_name: displayName,
      });
      if (!error) return { ok: true };
      if (error.code === '23505') return { ok: false, reason: 'name_taken' };
      if (error.code === 'P0002') return { ok: false, reason: 'unknown_class' };
      throw error;
    },
    async studentEmailFor(joinCode, displayName) {
      const { data, error } = await sb.rpc('student_email_for', { p_join_code: joinCode, p_display_name: displayName });
      if (error) throw error;
      return (data as string | null) ?? null;
    },
    async userIdFromJwt(jwt) {
      const { data } = await sb.auth.getUser(jwt);
      return data.user?.id ?? null;
    },
    async teacherOwnsStudent(teacherId, studentId) {
      const { data, error } = await sb
        .from('enrollments')
        .select('class_id, classes!inner(teacher_id)')
        .eq('student_id', studentId)
        .eq('classes.teacher_id', teacherId)
        .limit(1);
      if (error) throw error;
      return (data ?? []).length > 0;
    },
    async setPassword(userId, password) {
      const { error } = await sb.auth.admin.updateUserById(userId, { password });
      if (error) throw error;
    },
  };
}
