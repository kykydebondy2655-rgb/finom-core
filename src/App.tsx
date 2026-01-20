import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/finom/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import MobileBottomNav from './components/navigation/MobileBottomNav';
import CookieBanner from './components/common/CookieBanner';
import PWAInstallBanner from './components/pwa/PWAInstallBanner';

// Public Pages - Eager load for fast initial page
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy loaded pages for better performance
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Simulator = lazy(() => import('./pages/Simulator'));
const Rates = lazy(() => import('./pages/Rates'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Contact = lazy(() => import('./pages/Contact'));
const Faq = lazy(() => import('./pages/Faq'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Legal Pages (Anti-Phishing Compliance)
const LegalNotice = lazy(() => import('./pages/legal/LegalNotice'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const SecurityTrust = lazy(() => import('./pages/legal/SecurityTrust'));
const About = lazy(() => import('./pages/About'));
const Install = lazy(() => import('./pages/Install'));

// Client Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Banking = lazy(() => import('./pages/Banking'));
const LoansList = lazy(() => import('./pages/loans/LoansList'));
const LoanDetail = lazy(() => import('./pages/loans/LoanDetail'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Support = lazy(() => import('./pages/Support'));

// Agent Pages
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'));
const AgentClients = lazy(() => import('./pages/agent/AgentClients'));
const AgentCallbacks = lazy(() => import('./pages/agent/AgentCallbacks'));
const AgentClientDetail = lazy(() => import('./pages/agent/AgentClientDetail'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminClients = lazy(() => import('./pages/admin/AdminClients'));
const AdminLoans = lazy(() => import('./pages/admin/AdminLoans'));
const AdminAgents = lazy(() => import('./pages/admin/AdminAgents'));
const AdminAssignments = lazy(() => import('./pages/admin/AdminAssignments'));
const AdminLoginHistory = lazy(() => import('./pages/admin/AdminLoginHistory'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminImports = lazy(() => import('./pages/admin/AdminImports'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminEmailTemplates = lazy(() => import('./pages/admin/AdminEmailTemplates'));
const AdminRoles = lazy(() => import('./pages/admin/AdminRoles'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

import './styles/finom.css';
import './styles/components.css';
import './styles/admin-settings.css';
import './styles/mobile-nav.css';

// Suspense fallback component
const PageLoader = () => (
  <div className="page-loader-fallback">
    <LoadingSpinner message="Chargement..." />
  </div>
);

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ToastProvider>
                    <Router>
                        <div className="app-container">
                        <PWAInstallBanner />
                        <main>
                            <Suspense fallback={<PageLoader />}>
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
                                    <Route 
                                        path="/support" 
                                        element={
                                            <ProtectedRoute allowedRoles={['client']}>
                                                <Support />
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
                                    <Route 
                                        path="/admin/roles" 
                                        element={
                                            <ProtectedRoute allowedRoles={['admin']}>
                                                <AdminRoles />
                                            </ProtectedRoute>
                                        } 
                                    />
                                    <Route 
                                        path="/admin/analytics" 
                                        element={
                                            <ProtectedRoute allowedRoles={['admin']}>
                                                <AdminAnalytics />
                                            </ProtectedRoute>
                                        } 
                                    />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </Suspense>
                        </main>
                        <MobileBottomNav />
                        <CookieBanner />
                    </div>
                    </Router>
                </ToastProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
