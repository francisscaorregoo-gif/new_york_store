import { Link } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard";
export default function Home({ datos, onAgregar }) {
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-0">
            <div className="col-lg-6 hero-copy">
              <p className="eyebrow">TU PRÓXIMO FAVORITO ESTÁ AQUÍ</p>
              <h1>
                Tu estilo.
                <br />
                Tus reglas.
              </h1>
              <p className="hero-description">
                Prendas que van contigo, desde el primer plan
                <br className="d-none d-md-block" /> hasta el último. Descubre
                New York Store.
              </p>
              <Link to="/productos" className="btn btn-dark btn-lg">
                Explorar colección <span aria-hidden="true">↗</span>
              </Link>
              <p className="hero-note">
                ARMANI EXCHANGE / MICHAEL KORS / JORDAN
              </p>
            </div>
            <div className="col-lg-6 hero-art">
              <div className="hero-label">
                THE EVERYDAY
                <br />
                <strong>EDIT / 01</strong>
              </div>
              <img
                src="/img/ea-001.jpg"
                alt="Polera Emporio Armani de la colección New York Store"
              />
              <div className="hero-caption">
                <span>Esenciales con personalidad</span>
                <Link
                  to="/productos/EA-001"
                  aria-label="Ver polera Emporio Armani"
                >
                  ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SELECCIONADOS PARA TI</p>
            <h2>En nuestra rotación</h2>
          </div>
          <Link to="/productos">Ver toda la colección ↗</Link>
        </div>
        <ProductGrid
          productos={datos.productos.slice(0, 3)}
          onAgregar={onAgregar}
        />
      </section>
    </>
  );
}
