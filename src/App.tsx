import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TopicPracticePage } from './pages/TopicPracticePage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { RevisionPlannerPage } from './pages/RevisionPlannerPage';
import { MockTestsPage } from './pages/MockTestsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/topics" element={<TopicPracticePage />} />
            <Route path="/topics/:topicId" element={<TopicPracticePage />} />
            <Route path="/problems/:slug" element={<ProblemDetailPage />} />
            <Route path="/revision" element={<RevisionPlannerPage />} />
            <Route path="/mock-tests" element={<MockTestsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
}
