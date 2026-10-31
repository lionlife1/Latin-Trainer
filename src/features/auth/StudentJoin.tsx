import { Link, useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader';
import { joinClass } from './api';
import { CodeNamePinForm } from './CodeNamePinForm';

export function StudentJoin() {
  const navigate = useNavigate();
  return (
    <>
      <AppHeader subtitle="Join a class" />
      <div className="card auth-card">
        <h1 className="intro-title">Join your class</h1>
        <p className="muted">Use the code your teacher shows. No email needed.</p>
        <CodeNamePinForm
          submitLabel="Join class →"
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
    </>
  );
}
