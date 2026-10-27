import { Link } from "react-router-dom";
import { dinero } from "../data/store";
export function ProductCard({ producto, onAgregar }) {
  return (
    <article className="product-card h-100">
      <Link className="product-image" to={`/productos/${producto.id}`}>
        <img src={producto.imagen} alt={producto.nombre} loading="lazy" />
        {producto.stock === 0 && <span className="stock-badge">Agotado</span>}
      </Link>
      <div className="product-info">
        <p className="eyebrow">{producto.categoria}</p>
        <Link className="product-name" to={`/productos/${producto.id}`}>
          {producto.nombre}
        </Link>
        <p className="price">
          {dinero(producto.precio)}{" "}
        </p>
        <button
          className="btn btn-outline-dark w-100"
          disabled={producto.stock === 0}
          onClick={() => onAgregar(producto.id)}
        >
          {producto.stock === 0 ? "Sin stock" : "Agregar al carrito"}{" "}
          <span aria-hidden="true">＋</span>
        </button>
      </div>
    </article>
  );
}
export function ProductGrid({ productos, onAgregar }) {
  return (
    <div className="row g-4">
      {productos.map((p) => (
        <div className="col-12 col-sm-6 col-lg-4" key={p.id}>
          <ProductCard producto={p} onAgregar={onAgregar} />
        </div>
      ))}
    </div>
  );
}
