/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import About from './pages/About';
import Pedoman from './pages/Pedoman';
import AdminIndexing from './pages/AdminIndexing';
import Login from './pages/Login';
import RegisterSelection from './pages/RegisterSelection';
import RegisterAuthor from './pages/RegisterAuthor';
import RegisterReviewer from './pages/RegisterReviewer';
import RegisterEditor from './pages/RegisterEditor';
import Copyright from './pages/Copyright';
import Ethics from './pages/Ethics';
import PeerReview from './pages/PeerReview';
import JurnalList from './pages/JurnalList';
import JurnalDetail from './pages/JurnalDetail';
import Publikasi from './pages/Publikasi';
import ArticleDetail from './pages/ArticleDetail';
import PanduanPenulis from './pages/PanduanPenulis';
import PanduanReviewer from './pages/PanduanReviewer';
import PanduanEditor from './pages/PanduanEditor';
import AuthorDashboard from './pages/dashboards/AuthorDashboard';
import AuthorArticles from './pages/dashboards/AuthorArticles';
import AuthorSubmit from './pages/dashboards/AuthorSubmit';
import AuthorReviewStatus from './pages/dashboards/AuthorReviewStatus';
import AuthorLoa from './pages/dashboards/AuthorLoa';
import AuthorCertificates from './pages/dashboards/AuthorCertificates';
import AuthorArticleDetail from './pages/dashboards/AuthorArticleDetail';

import ReviewerDashboard from './pages/dashboards/ReviewerDashboard';
import ReviewerAssignments from './pages/dashboards/ReviewerAssignments';
import ReviewerMyReviews from './pages/dashboards/ReviewerMyReviews';
import ReviewerHistory from './pages/dashboards/ReviewerHistory';

import EditorDashboard from './pages/dashboards/EditorDashboard';
import EditorArticles from './pages/dashboards/EditorArticles';
import EditorAssignReviewer from './pages/dashboards/EditorAssignReviewer';
import EditorDecisions from './pages/dashboards/EditorDecisions';
import EditorDecisionsHistory from './pages/dashboards/EditorDecisionsHistory';
import EditorPublications from './pages/dashboards/EditorPublications';

import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminUsers from './pages/dashboards/AdminUsers';
import AdminReviewers from './pages/dashboards/AdminReviewers';
import AdminEditors from './pages/dashboards/AdminEditors';
import AdminLogs from './pages/dashboards/AdminLogs';
import AdminSettings from './pages/dashboards/AdminSettings';
import AdminJournals from './pages/dashboards/AdminJournals';
import AdminIssues from './pages/dashboards/AdminIssues';
import AdminArticles from './pages/dashboards/AdminArticles';
import AdminBoardMembers from './pages/dashboards/AdminBoardMembers';
import Unauthorized from './pages/dashboards/Unauthorized';
import SetupAdmin from './pages/SetupAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-academic-50 font-sans text-academic-800 selection:bg-brand-100 selection:text-brand-900 flex flex-col overflow-x-hidden">
            
            {/* Global OJS Floating Badge - Bottom Right */}


            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tentang" element={<About />} />
              <Route path="/jurnal" element={<JurnalList />} />
              <Route path="/jurnal/:slug" element={<JurnalDetail />} />
              <Route path="/publikasi" element={<Publikasi />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
            <Route path="/panduan-penulis" element={<PanduanPenulis />} />
            <Route path="/panduan-reviewer" element={<PanduanReviewer />} />
            <Route path="/panduan-editor" element={<PanduanEditor />} />
            <Route path="/pedoman" element={<Pedoman />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterSelection />} />
            <Route path="/register/author" element={<RegisterAuthor />} />
            <Route path="/register/reviewer" element={<RegisterReviewer />} />
            <Route path="/register/editor" element={<RegisterEditor />} />
            <Route path="/setup-admin" element={<SetupAdmin />} />
            <Route path="/hak-cipta" element={<Copyright />} />
            <Route path="/etika-publikasi" element={<Ethics />} />
            <Route path="/proses-peer-review" element={<PeerReview />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
               <Route path="/admin/indexing" element={<AdminIndexing />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['author']} />}>
              <Route path="/dashboard/author" element={<AuthorDashboard />} />
              <Route path="/dashboard/author/articles" element={<AuthorArticles />} />
              <Route path="/dashboard/author/articles/:id" element={<AuthorArticleDetail />} />
              <Route path="/dashboard/author/submit" element={<AuthorSubmit />} />
              <Route path="/dashboard/author/review-status" element={<AuthorReviewStatus />} />
              <Route path="/dashboard/author/loa" element={<AuthorLoa />} />
              <Route path="/dashboard/author/certificates" element={<AuthorCertificates />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['reviewer']} />}>
              <Route path="/dashboard/reviewer" element={<ReviewerDashboard />} />
              <Route path="/dashboard/reviewer/assignments" element={<ReviewerAssignments />} />
              <Route path="/dashboard/reviewer/my-reviews" element={<ReviewerMyReviews />} />
              <Route path="/dashboard/reviewer/history" element={<ReviewerHistory />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['editor']} />}>
              <Route path="/dashboard/editor" element={<EditorDashboard />} />
              <Route path="/dashboard/editor/articles" element={<EditorArticles />} />
              <Route path="/dashboard/editor/reviewers" element={<EditorAssignReviewer />} />
              <Route path="/dashboard/editor/decisions" element={<EditorDecisions />} />
              <Route path="/dashboard/editor/decisions-history" element={<EditorDecisionsHistory />} />
              <Route path="/dashboard/editor/publications" element={<EditorPublications />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/users" element={<AdminUsers />} />
              <Route path="/dashboard/admin/reviewers" element={<AdminReviewers />} />
              <Route path="/dashboard/admin/editors" element={<AdminEditors />} />
              <Route path="/dashboard/admin/board-members" element={<AdminBoardMembers />} />
              <Route path="/dashboard/admin/journals" element={<AdminJournals />} />
              <Route path="/dashboard/admin/issues" element={<AdminIssues />} />
              <Route path="/dashboard/admin/articles" element={<AdminArticles />} />
              <Route path="/dashboard/admin/logs" element={<AdminLogs />} />
              <Route path="/dashboard/admin/settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
    </HelmetProvider>
  );
}
