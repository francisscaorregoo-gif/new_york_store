import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="brand mb-3">
              NEW YORK<span>STORE</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <h2 className="h6">EXPLORA</h2>
            <Link to="/productos">Colección</Link>
            <Link to="/blogs">Historias</Link>
          </div>
          <div className="col-6 col-md-3">
            <h2 className="h6">HABLEMOS</h2>
            <Link to="/contacto">Contacto</Link>
            <Link to="/nosotros">Sobre la tienda</Link>
            <Link to="/cuenta">Mi cuenta</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} New York Store · Compra y pago de
          demostración.
        </div>
      </div>
    </footer>
  );
}
