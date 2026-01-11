import { Link } from "react-router-dom";
import Button from '../components/finom/Button';

const NotFound = () => {
    return (
        <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
            <h1>404</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>Page non trouvée</p>
            <Button to="/" variant="primary">Retour à l'accueil</Button>
        </div>
    );
};

export default NotFound;
