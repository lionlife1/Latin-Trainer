import { Link, useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/AppHeader';
import { studentLogin } from './api';
import { CodeNamePinForm } from './CodeNamePinForm';

export function StudentLogin() {
  const navigate = useNavigate();
  return (
    <>
      <AppHeader subtitle="Student sign in" />
      <div className="card auth-card">
        <h1 className="intro-title">Student sign in</h1>
        <CodeNamePinForm
          submitLabel="Sign in →"
          pinHelp="Forgot your PIN? Ask your teacher to reset it."
          onSubmit={async input => {
            const res = await studentLogin(input);
            if (res.ok) navigate('/s');
            return res;
          }}
        />
        <p className="small muted" style={{ marginTop: 16 }}>
          New to the class? <Link className="link" to="/join">Join with a code</Link>
        </p>
      </div>
    </>
  );
}
