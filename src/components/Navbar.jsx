import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
export default function Navbar({ usuario, cantidad, salir }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <div className="announcement">
        ESTILO QUE TE ACOMPAÑA
      </div>
      <header className="site-header">
        <nav
          className="container navbar navbar-expand-lg py-3"
          aria-label="Navegación principal"
        >
          <Link
            to="/"
            className="navbar-brand brand"
            onClick={() => setAbierto(false)}
          >
            NEW YORK<span>STORE</span>
          </Link>
          <button
            className="navbar-toggler"
            aria-label="Abrir menú"
            aria-expanded={abierto}
            onClick={() => setAbierto(!abierto)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`navbar-collapse ${abierto ? "" : "collapse"}`}>
            <div
              className="navbar-nav mx-auto"
              onClick={() => setAbierto(false)}
            >
              {[
                ["/productos", "Colección"],
                ["/categorias", "Categorías"],
                ["/nosotros", "Nosotros"],
                ["/blogs", "Blog"],
                ["/contacto", "Contacto"],
              ].map(([url, t]) => (
                <NavLink key={url} to={url} className="nav-link">
                  {t}
                </NavLink>
              ))}
            </div>
            <div className="nav-actions" onClick={() => setAbierto(false)}>
              {usuario ? (
                <>
                  <Link to="/cuenta">{usuario.nombre}</Link>
                  {["administrador", "vendedor"].includes(usuario.rol) && (
                    <Link to="/admin">Panel</Link>
                  )}
                  <button className="btn btn-link p-0" onClick={salir}>
                    Salir
                  </button>
                </>
              ) : (
                <Link to="/login">Ingresar</Link>
              )}
              <Link
                to="/carrito"
                className="cart-link"
                aria-label={`Carrito, ${cantidad} productos`}
              >
                Carrito <span>{cantidad}</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
