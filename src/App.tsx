import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/finom/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Simulator from './pages/Simulator';
import Rates from './pages/Rates';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import NotFound from './pages/NotFound';

// Legal Pages (Anti-Phishing Compliance)
import LegalNotice from './pages/legal/LegalNotice';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import SecurityTrust from './pages/legal/SecurityTrust';
import About from './pages/About';
import Install from './pages/Install';

// Client Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Banking from './pages/Banking';
import LoansList from './pages/loans/LoansList';
import LoanDetail from './pages/loans/LoanDetail';
import Appointments from './pages/Appointments';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentClients from './pages/agent/AgentClients';
import AgentCallbacks from './pages/agent/AgentCallbacks';
import AgentClientDetail from './pages/agent/AgentClientDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClients from './pages/admin/AdminClients';
import AdminLoans from './pages/admin/AdminLoans';
import AdminAgents from './pages/admin/AdminAgents';
import AdminAssignments from './pages/admin/AdminAssignments';
import AdminLoginHistory from './pages/admin/AdminLoginHistory';
import AdminLeads from './pages/admin/AdminLeads';
import AdminImports from './pages/admin/AdminImports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates';

import CookieBanner from './components/common/CookieBanner';
import PWAInstallBanner from './components/pwa/PWAInstallBanner';

import './styles/finom.css';
import './styles/components.css';
import './styles/admin-settings.css';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <div className="app-container">
                        <PWAInstallBanner />
                        <main>
                            <Routes>
                                {/* ============= PUBLIC ROUTES ============= */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/simulator" element={<Simulator />} />
                                <Route path="/rates" element={<Rates />} />
                                <Route path="/how-it-works" element={<HowItWorks />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/faq" element={<Faq />} />
                                
{/* ============= LEGAL ROUTES (Anti-Phishing) ============= */}
                                <Route path="/legal" element={<LegalNotice />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<TermsOfService />} />
                                <Route path="/security" element={<SecurityTrust />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/install" element={<Install />} />

                                {/* ============= CLIENT ROUTES ============= */}
                                <Route 
                                    path="/dashboard" 
                                    element={
                                        <ProtectedRoute allowedRoles={['client', 'agent', 'admin']}>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/profile" 
                                    element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/banking" 
                                    element={
                                        <ProtectedRoute allowedRoles={['client']}>
                                            <Banking />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/loans" 
                                    element={
                                        <ProtectedRoute allowedRoles={['client']}>
                                            <LoansList />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/loans/new" 
                                    element={
                                        <ProtectedRoute allowedRoles={['client']}>
                                            <Simulator />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/loans/:id" 
                                    element={
                                        <ProtectedRoute allowedRoles={['client', 'agent', 'admin']}>
                                            <LoanDetail />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/appointments" 
                                    element={
                                        <ProtectedRoute allowedRoles={['client']}>
                                            <Appointments />
                                        </ProtectedRoute>
                                    } 
                                />

                                {/* ============= AGENT ROUTES ============= */}
                                <Route 
                                    path="/agent/dashboard" 
                                    element={
                                        <ProtectedRoute allowedRoles={['agent', 'admin']}>
                                            <AgentDashboard />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/agent/clients" 
                                    element={
                                        <ProtectedRoute allowedRoles={['agent', 'admin']}>
                                            <AgentClients />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/agent/clients/:id" 
                                    element={
                                        <ProtectedRoute allowedRoles={['agent', 'admin']}>
                                            <AgentClientDetail />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/agent/callbacks" 
                                    element={
                                        <ProtectedRoute allowedRoles={['agent', 'admin']}>
                                            <AgentCallbacks />
                                        </ProtectedRoute>
                                    } 
                                />

                                {/* ============= ADMIN ROUTES ============= */}
                                <Route 
                                    path="/admin/dashboard" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/clients" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminClients />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/clients/:id" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AgentClientDetail />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/loans" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminLoans />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/agents" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminAgents />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/assignments" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminAssignments />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/login-history" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminLoginHistory />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/leads" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminLeads />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/imports" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminImports />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/settings" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminSettings />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path="/admin/email-templates" 
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminEmailTemplates />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </main>
                        <CookieBanner />
                    </div>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
