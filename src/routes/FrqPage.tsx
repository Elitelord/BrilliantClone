import { Navigate, useParams } from 'react-router-dom';
import { getFrq } from '../content/frqBank';
import FrqRunner from '../components/frq/FrqRunner';

// Full-screen FRQ practice session for a specific FRQ id (from /frq/:id).
export default function FrqPage() {
  const { id } = useParams<{ id: string }>();
  const frq = getFrq(id);
  if (!frq) return <Navigate to="/frq" replace />;
  return <FrqRunner key={frq.id} frq={frq} />;
}
