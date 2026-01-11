import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/finom/Toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import './styles/finom.css';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <div className="app-container">
                        <main>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/dashboard" element={<Dashboard />} />
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
