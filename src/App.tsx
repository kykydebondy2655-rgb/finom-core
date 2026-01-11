import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/finom/Toast';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Simulator from './pages/Simulator';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import NotFound from './pages/NotFound';

// Client Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Banking from './pages/Banking';
import LoansList from './pages/loans/LoansList';
import NewLoanApplication from './pages/loans/NewLoanApplication';
import LoanDetail from './pages/loans/LoanDetail';

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

import './styles/finom.css';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <div className="app-container">
                        <main>
                            <Routes>
                                {/* Public */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/simulator" element={<Simulator />} />
                                <Route path="/how-it-works" element={<HowItWorks />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/faq" element={<Faq />} />

                                {/* Client */}
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/banking" element={<Banking />} />
                                <Route path="/loans" element={<LoansList />} />
                                <Route path="/loans/new" element={<NewLoanApplication />} />
                                <Route path="/loans/:id" element={<LoanDetail />} />

                                {/* Agent */}
                                <Route path="/agent/dashboard" element={<AgentDashboard />} />
                                <Route path="/agent/clients" element={<AgentClients />} />
                                <Route path="/agent/clients/:id" element={<AgentClientDetail />} />
                                <Route path="/agent/callbacks" element={<AgentCallbacks />} />

                                {/* Admin */}
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="/admin/clients" element={<AdminClients />} />
                                <Route path="/admin/clients/:id" element={<AgentClientDetail />} />
                                <Route path="/admin/loans" element={<AdminLoans />} />
                                <Route path="/admin/agents" element={<AdminAgents />} />
                                <Route path="/admin/assignments" element={<AdminAssignments />} />

                                {/* Fallback */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
