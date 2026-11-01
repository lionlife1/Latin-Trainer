import { Link, useNavigate } from 'react-router-dom';
import { StudentShell } from '../../components/StudentShell';
import { joinClass } from './api';
import { CodeNamePinForm } from './CodeNamePinForm';

export function StudentJoin() {
  const navigate = useNavigate();
  return (
    <StudentShell>
      <div className="card auth-card">
        <h1 style={{ marginBottom: 4 }}>Join your class</h1>
        <p className="muted">Use the code your teacher shows. No email needed.</p>
        <CodeNamePinForm
          submitLabel="Join class"
          pinHelp="Pick a PIN you'll remember. Your teacher can reset it."
          onSubmit={async input => {
            const res = await joinClass(input);
            if (res.ok) navigate('/s');
            return res;
          }}
        />
        <p className="small muted" style={{ marginTop: 16 }}>
          Already joined? <Link className="link" to="/student/login">Sign in</Link>
        </p>
      </div>
    </StudentShell>
  );
}
