import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard';
import ProjectDetail from '@/pages/ProjectDetail';
import Settlement from '@/pages/Settlement';
import WorkerStats from '@/pages/WorkerStats';
import WorkerManagement from '@/pages/WorkerManagement';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/project/:id/settlement" element={<Settlement />} />
          <Route path="/workers" element={<WorkerStats />} />
          <Route path="/workers/manage" element={<WorkerManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}
