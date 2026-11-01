import { Link } from 'react-router-dom';
import { Users } from '../../components/icons';

/** Class tab for visitors who aren't signed in. */
export function ClassGate() {
  return (
    <div className="panel gate">
      <span className="subject-icon" style={{ margin: '0 auto 8px' }}><Users /></span>
      <h1 style={{ fontSize: '1.4rem' }}>Join your class</h1>
      <p>Your teacher's assignments and your scores show up here. Practice works without an account.</p>
      <div className="actions">
        <Link className="btn-primary" to="/join">Join with a class code</Link>
        <Link className="btn-secondary" to="/student/login">Student sign in</Link>
        <Link className="link small" to="/teacher/login">I'm a teacher</Link>
      </div>
    </div>
  );
}
