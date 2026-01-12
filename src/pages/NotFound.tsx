import { Link } from "react-router-dom";
import Button from '../components/finom/Button';

const NotFound = () => {
    return (
        <div className="container not-found-container">
            <h1>404</h1>
            <p className="not-found-subtitle">Page non trouvée</p>
            <Button to="/" variant="primary">Retour à l'accueil</Button>
        </div>
    );
};

export default NotFound;