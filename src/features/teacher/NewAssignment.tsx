import { Link, useNavigate, useParams } from 'react-router-dom';
import { AssignmentBuilder } from './AssignmentBuilder';

export function NewAssignment() {
  const { classId = '' } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <div className="crumbs"><Link className="link" to={`/t/c/${classId}`}>← Class</Link></div>
      <h1>New assignment</h1>
      <AssignmentBuilder classId={classId} onPublished={() => navigate(`/t/c/${classId}`)} />
    </>
  );
}
