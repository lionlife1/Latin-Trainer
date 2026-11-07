-- The gradebook shows each student's best score, so it also returns that attempt (ties: the latest one)
-- for the score to link to. latest_attempt_id stays for older clients.
drop function public.gradebook(uuid);

create function public.gradebook(p_class_id uuid)
returns table (student_id uuid, display_name text, assignment_id uuid, best_score int, total int,
               attempts int, last_submitted_at timestamptz, any_late boolean, latest_attempt_id uuid,
               best_attempt_id uuid)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'not your class' using errcode = '42501';
  end if;
  return query
    select e.student_id, e.display_name, a.id,
           max(t.score)::int, max(t.total)::int, count(t.id)::int, max(t.submitted_at),
           coalesce(bool_or(t.is_late or t.over_time), false),
           (array_agg(t.id order by t.submitted_at desc) filter (where t.id is not null))[1],
           (array_agg(t.id order by t.score desc nulls last, t.submitted_at desc) filter (where t.id is not null))[1]
    from enrollments e
    cross join assignments a
    left join attempts t on t.assignment_id = a.id and t.student_id = e.student_id and t.submitted_at is not null
    where e.class_id = p_class_id and a.class_id = p_class_id
    group by e.student_id, e.display_name, a.id;
end $$;

revoke execute on function public.gradebook(uuid) from public, anon;
grant execute on function public.gradebook(uuid) to authenticated;
