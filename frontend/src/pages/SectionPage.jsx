import { useNavigate } from 'react-router-dom';
import ApplicationLayout from '../layouts/ApplicationLayout.jsx';

export function SectionPage({ section }) {
  const navigate = useNavigate();
  return <ApplicationLayout activeSection={section} onNavigate={navigate} />;
}
