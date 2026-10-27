import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard";
import { Titulo, Vacio } from "../components/UI";
import { dinero } from "../data/store";
export default function Productos({ datos, onAgregar }) {
  const [params, setParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState("");
  const [soloStock, setSoloStock] = useState(false);
  const [orden, setOrden] = useState("original");
  const categoria = params.get("categoria") || "";
  let lista = datos.productos.filter(
    (p) =>
      (!categoria || p.categoria === categoria) &&
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (!soloStock || p.stock > 0),
  );
  if (orden === "menor") lista.sort((a, b) => a.precio - b.precio);
  if (orden === "mayor") lista.sort((a, b) => b.precio - a.precio);
  return (
    <div className="container section-space">
      <Titulo
        numero="PRENDAS PARA TODOS TUS PLANES"
        titulo="La colección"
        descripcion="Explora tus marcas favoritas y encuentra algo muy tuyo."
      />
      <div className="catalog-toolbar row g-3 align-items-end">
        <div className="col-md-4">
          <label htmlFor="buscar" className="form-label">
            Buscar producto
          </label>
          <input
            id="buscar"
            className="form-control"
            placeholder="¿Qué estás buscando?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="categoria" className="form-label">
            Categoría
          </label>
          <select
            id="categoria"
            value={categoria}
            className="form-select"
            onChange={(e) =>
              setParams(e.target.value ? { categoria: e.target.value } : {})
            }
          >
            <option value="">Todas</option>
            {datos.categorias.map((c) => (
              <option key={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="orden" className="form-label">
            Ordenar por
          </label>
          <select
            id="orden"
            className="form-select"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="original">Destacados</option>
            <option value="menor">Menor precio</option>
            <option value="mayor">Mayor precio</option>
          </select>
        </div>
        <div className="col-md-2 pb-2">
          <label className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={soloStock}
              onChange={(e) => setSoloStock(e.target.checked)}
            />{" "}
            Solo con stock
          </label>
        </div>
      </div>
      <p className="text-secondary my-4" role="status">
        {lista.length} productos
      </p>
      {lista.length ? (
        <ProductGrid productos={lista} onAgregar={onAgregar} />
      ) : (
        <Vacio titulo="No encontramos productos">
          <p>Prueba con otra búsqueda o categoría.</p>
        </Vacio>
      )}
    </div>
  );
}
export function Categorias({ datos }) {
  return (
    <div className="container section-space">
      <Titulo
        titulo="Elige tu categoría"
        descripcion="Un buen look empieza por lo que te gusta."
      />
      <div className="row g-4">
        {datos.categorias.map((c) => {
          const ps = datos.productos.filter((p) => p.categoria === c.nombre);
          return (
            <div className="col-md-6" key={c.id}>
              <Link
                className="category-card"
                to={`/productos?categoria=${encodeURIComponent(c.nombre)}`}
              >
                {ps[0] && <img src={ps[0].imagen} alt="" />}
                <div>
                  <p className="eyebrow">{ps.length} PRODUCTOS</p>
                  <h2>{c.nombre} ↗</h2>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function DetalleProducto({ datos, onAgregar }) {
  const { id } = useParams();
  const [cantidad, setCantidad] = useState(1);
  const p = datos.productos.find((p) => p.id === id);
  if (!p)
    return (
      <div className="container section-space">
        <Vacio titulo="Producto no disponible">
          <Link to="/productos">Volver a la colección</Link>
        </Vacio>
      </div>
    );
  return (
    <div className="container section-space">
      <Link to="/productos" className="back-link">
        ← Volver a la colección
      </Link>
      <div className="row g-5 mt-1">
        <div className="col-md-6">
          <div className="detail-image">
            <img src={p.imagen} alt={p.nombre} />
          </div>
        </div>
        <div className="col-md-6 py-md-4">
          <p className="eyebrow">
            {p.categoria} / {p.id}
          </p>
          <h1>{p.nombre}</h1>
          <p className="price fs-3 mt-4">
            {dinero(p.precio)}{" "}
          </p>
          <p className="text-secondary my-4">{p.descripcion}</p>
          <p>
            {p.stock > 0
              ? `${p.stock} unidades disponibles`
              : "Producto agotado"}
          </p>
          <label htmlFor="cantidad" className="form-label">
            Cantidad
          </label>
          <div className="d-flex gap-3 mb-4">
            <input
              id="cantidad"
              type="number"
              className="form-control quantity-input"
              min="1"
              max={p.stock}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
            <button
              className="btn btn-dark flex-grow-1"
              disabled={p.stock === 0}
              onClick={() => onAgregar(p.id, cantidad)}
            >
              Agregar al carrito ＋
            </button>
          </div>
          <div className="delivery-note">
            Despacho a domicilio o retiro en tienda
          </div>
        </div>
      </div>
    </div>
  );
}
