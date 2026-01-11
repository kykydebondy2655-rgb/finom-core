import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/finom/Toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Banking from './pages/Banking';

// Loans Pages
import LoansList from './pages/loans/LoansList';
import NewLoanApplication from './pages/loans/NewLoanApplication';
import LoanDetail from './pages/loans/LoanDetail';

import './styles/finom.css';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <div className="app-container">
                        <main>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/simulator" element={<Simulator />} />
                                <Route path="/how-it-works" element={<HowItWorks />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/faq" element={<Faq />} />

                                {/* Client Routes */}
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/banking" element={<Banking />} />
                                
                                {/* Loans Routes */}
                                <Route path="/loans" element={<LoansList />} />
                                <Route path="/loans/new" element={<NewLoanApplication />} />
                                <Route path="/loans/:id" element={<LoanDetail />} />

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
