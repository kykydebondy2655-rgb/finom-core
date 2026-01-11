import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/finom/Toast';
import Home from './pages/Home';
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
