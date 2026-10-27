import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import { Campo, Titulo, Vacio, Confirmar } from "../components/UI";
import { DatosUsuario, usuarioVacio } from "./Acceso";
import {
  dinero,
  guardarProducto,
  eliminarProducto,
  guardarUsuario,
  eliminarUsuario,
  guardarCategoria,
  eliminarCategoria,
} from "../data/store";
import { validarProducto, validarUsuario } from "../data/validaciones";
export function AdminLayout({ usuario }) {
  if (!usuario) return <Navigate to="/login" replace />;
  if (!["administrador", "vendedor"].includes(usuario.rol))
    return (
      <div className="container section-space">
        <Vacio titulo="Esta sección requiere permisos de administración">
          <Link to="/">Volver a la tienda</Link>
        </Vacio>
      </div>
    );
  const enlaces =
    usuario.rol === "administrador"
      ? [
          ["/admin", "Resumen"],
          ["/admin/productos", "Productos"],
          ["/admin/categorias", "Categorías"],
          ["/admin/usuarios", "Usuarios"],
          ["/admin/reportes", "Reportes"],
          ["/admin/mensajes", "Mensajes"],
          ["/admin/perfil", "Mi perfil"],
        ]
      : [
          ["/admin", "Resumen"],
          ["/admin/productos", "Productos"],
        ];
  return (
    <div className="container section-space">
      <p className="eyebrow">NEW YORK STORE / ADMINISTRACIÓN</p>
      <div className="row g-4">
        <aside className="col-lg-2">
          <nav className="admin-nav" aria-label="Administración">
            {enlaces.map(([url, t]) => (
              <NavLink key={url} to={url} end={url === "/admin"}>
                {t}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="col-lg-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export function SoloAdmin({ usuario, children }) {
  return usuario?.rol === "administrador" ? (
    children
  ) : (
    <Vacio titulo="Acceso reservado al administrador" />
  );
}
export function AdminHome({ datos }) {
  const total = datos.ordenes.reduce((s, o) => s + o.total, 0);
  return (
    <>
      <Titulo titulo="Vista general" descripcion="Tu tienda, de un vistazo." />
      <div className="row g-3">
        {[
          ["Productos", datos.productos.length],
          ["Ventas simuladas", dinero(total)],
          ["Stock crítico", datos.productos.filter((p) => p.stock <= 5).length],
        ].map(([t, v]) => (
          <div className="col-sm-6 col-xl-4" key={t}>
            <div className="stat-card">
              <p>{t}</p>
              <strong>{v}</strong>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
export function AdminProductos({ datos, actualizar, usuario }) {
  const [buscar, setBuscar] = useState("");
  const [critico, setCritico] = useState(false);
  const [borrar, setBorrar] = useState(null);
  const lista = datos.productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(buscar.toLowerCase()) &&
      (!critico || p.stock <= 5),
  );
  const admin = usuario.rol === "administrador";
  return (
    <>
      <div className="section-heading">
        <Titulo titulo="Productos" />
        <div>
          {admin && (
            <Link className="btn btn-dark" to="/admin/productos/nuevo">
              Nuevo producto ＋
            </Link>
          )}
        </div>
      </div>
      <div className="d-flex gap-3 mb-4 align-items-center flex-wrap">
        <input
          aria-label="Buscar productos"
          placeholder="Buscar por nombre"
          className="form-control w-auto"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={critico}
            onChange={(e) => setCritico(e.target.checked)}
          />{" "}
          Solo stock crítico (≤ 5)
        </label>
      </div>
      {borrar && (
        <Confirmar
          texto={`¿Eliminar ${borrar.nombre}? También se quitará del carrito. Las órdenes anteriores se conservan.`}
          cancelar={() => setBorrar(null)}
          confirmar={() => {
            if (
              actualizar(
                (d) => eliminarProducto(d, borrar.id),
                "Producto eliminado.",
              )
            )
              setBorrar(null);
          }}
        />
      )}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio base</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link
                    to={`/admin/productos/${p.id}`}
                    className="admin-product"
                  >
                    <img src={p.imagen} alt="" />
                    <span>
                      {p.nombre}
                      <small className="d-block text-secondary">{p.id}</small>
                    </span>
                  </Link>
                </td>
                <td>{p.categoria}</td>
                <td>{dinero(p.precio)}</td>
                <td>
                  <span
                    className={`badge ${p.stock <= 5 ? "text-bg-warning" : "text-bg-light"}`}
                  >
                    {p.stock}
                  </span>
                </td>
                <td>
                  {admin ? (
                    <>
                      <Link
                        className="btn btn-sm btn-outline-dark me-2"
                        to={`/admin/productos/${p.id}/editar`}
                      >
                        Editar
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setBorrar(p)}
                      >
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <Link to={`/admin/productos/${p.id}`}>Ver detalle</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!lista.length && <p>No hay productos con esos filtros.</p>}
      </div>
    </>
  );
}
export function AdminDetalleProducto({ datos }) {
  const { id } = useParams();
  const p = datos.productos.find((p) => p.id === id);
  return p ? (
    <>
      <Titulo titulo={p.nombre} />
      <div className="row g-4">
        <div className="col-md-5">
          <img className="img-fluid" src={p.imagen} alt={p.nombre} />
        </div>
        <div className="col-md-7">
          <p>Código: {p.id}</p>
          <p>Categoría: {p.categoria}</p>
          <p>Precio base: {dinero(p.precio)}</p>
          <p>Stock: {p.stock}</p>
          <p>{p.descripcion}</p>
          <Link to="/admin/productos">Volver</Link>
        </div>
      </div>
    </>
  ) : (
    <Vacio titulo="Producto no encontrado" />
  );
}
export function ProductoForm({ datos, actualizar }) {
  const { id } = useParams();
  const original = datos.productos.find((p) => p.id === id);
  const navigate = useNavigate();
  const [form, setForm] = useState(
    original
      ? { ...original }
      : {
          id: "",
          nombre: "",
          categoria: "",
          precio: "",
          stock: 0,
          imagen: "/img/mk-001.jpg",
          descripcion: "",
        },
  );
  const [errores, setErrores] = useState({});
  const cambiar = (n, v) => setForm((f) => ({ ...f, [n]: v }));
  if (id && !original) return <Vacio titulo="Producto no encontrado" />;
  function enviar(e) {
    e.preventDefault();
    const er = validarProducto(form);
    setErrores(er);
    if (
      !Object.keys(er).length &&
      actualizar(
        (d) => guardarProducto(d, form, id || null),
        "Producto guardado.",
      )
    )
      navigate("/admin/productos");
  }
  return (
    <>
      <Titulo titulo={original ? "Editar producto" : "Nuevo producto"} />
      <form noValidate onSubmit={enviar} className="panel-card">
        <div className="row">
          <div className="col-md-6">
            <Campo
              nombre="id"
              etiqueta="Código"
              valor={form.id}
              cambiar={cambiar}
              error={errores.id}
              disabled={!!original}
            />
          </div>
          <div className="col-md-6">
            <Campo
              nombre="nombre"
              etiqueta="Nombre"
              valor={form.nombre}
              cambiar={cambiar}
              error={errores.nombre}
            />
          </div>
        </div>
        <Campo
          nombre="categoria"
          etiqueta="Categoría"
          valor={form.categoria}
          cambiar={cambiar}
          error={errores.categoria}
          opciones={datos.categorias.map((c) => ({
            valor: c.nombre,
            texto: c.nombre,
          }))}
        />
        <div className="row">
          {[
            ["precio", "Precio en pesos"],
            ["stock", "Stock"],
          ].map(([n, t]) => (
            <div className="col-md-4" key={n}>
              <Campo
                nombre={n}
                etiqueta={t}
                tipo="number"
                valor={form[n]}
                cambiar={cambiar}
                error={errores[n]}
                min={n === "precio" ? 1 : 0}
              />
            </div>
          ))}
        </div>
        <Campo
          nombre="imagen"
          etiqueta="Imagen del proyecto"
          valor={form.imagen}
          cambiar={cambiar}
          error={errores.imagen}
          opciones={[
            "mk-001.jpg",
            "ea-001.jpg",
            "ax-001.jpg",
            "gs-001.jpg",
            "jordan-001.jpg",
          ].map((n) => ({ valor: `/img/${n}`, texto: n }))}
        />
        <Campo
          nombre="descripcion"
          etiqueta="Descripción"
          tipo="textarea"
          valor={form.descripcion}
          cambiar={cambiar}
          error={errores.descripcion}
          maxLength={1000}
          required={false}
        />
        <button className="btn btn-dark" type="submit">
          Guardar producto
        </button>
        <Link className="btn btn-link" to="/admin/productos">
          Cancelar
        </Link>
      </form>
    </>
  );
}
export function AdminCategorias({ datos, actualizar }) {
  const [form, setForm] = useState({ nombre: "" });
  const [borrar, setBorrar] = useState(null);
  function enviar(e) {
    e.preventDefault();
    if (actualizar((d) => guardarCategoria(d, form), "Categoría guardada."))
      setForm({ nombre: "" });
  }
  return (
    <>
      <Titulo titulo="Categorías" />
      <form className="panel-card mb-4" onSubmit={enviar}>
        <Campo
          nombre="nombre"
          etiqueta={form.id ? "Editar categoría" : "Nueva categoría"}
          valor={form.nombre}
          cambiar={(n, v) => setForm((f) => ({ ...f, [n]: v }))}
          maxLength={40}
        />
        <button className="btn btn-dark" type="submit">
          Guardar categoría
        </button>
        {form.id && (
          <button
            type="button"
            className="btn btn-link"
            onClick={() => setForm({ nombre: "" })}
          >
            Cancelar edición
          </button>
        )}
      </form>
      {borrar && (
        <Confirmar
          texto={`¿Eliminar la categoría ${borrar.nombre}?`}
          cancelar={() => setBorrar(null)}
          confirmar={() => {
            if (
              actualizar(
                (d) => eliminarCategoria(d, borrar.id),
                "Categoría eliminada.",
              )
            )
              setBorrar(null);
          }}
        />
      )}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>
                  {
                    datos.productos.filter((p) => p.categoria === c.nombre)
                      .length
                  }
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-dark me-2"
                    onClick={() => setForm({ ...c })}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setBorrar(c)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function AdminUsuarios({ datos, actualizar }) {
  const [buscar, setBuscar] = useState("");
  const [borrar, setBorrar] = useState(null);
  const lista = datos.usuarios.filter((u) =>
    `${u.nombre} ${u.apellido} ${u.correo}`
      .toLowerCase()
      .includes(buscar.toLowerCase()),
  );
  return (
    <>
      <div className="section-heading">
        <Titulo titulo="Usuarios" />
        <Link className="btn btn-dark" to="/admin/usuarios/nuevo">
          Nuevo usuario ＋
        </Link>
      </div>
      <input
        aria-label="Buscar usuarios"
        className="form-control mb-4"
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        placeholder="Buscar por nombre o correo"
      />
      {borrar && (
        <Confirmar
          texto={`¿Eliminar a ${borrar.nombre}? Su historial de órdenes se conservará.`}
          cancelar={() => setBorrar(null)}
          confirmar={() => {
            if (
              actualizar(
                (d) => eliminarUsuario(d, borrar.id),
                "Usuario eliminado.",
              )
            )
              setBorrar(null);
          }}
        />
      )}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link to={`/admin/usuarios/${u.id}`}>
                    {u.nombre} {u.apellido}
                  </Link>
                </td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>
                  <Link
                    className="btn btn-sm btn-outline-dark me-2"
                    to={`/admin/usuarios/${u.id}/editar`}
                  >
                    Editar
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    disabled={u.id === datos.sesion}
                    onClick={() => setBorrar(u)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function UsuarioForm({ datos, actualizar, perfil = false }) {
  const params = useParams();
  const id = perfil ? datos.sesion : params.id;
  const original = datos.usuarios.find((u) => u.id === id);
  const navigate = useNavigate();
  const [form, setForm] = useState(
    original ? { ...original } : { ...usuarioVacio },
  );
  const [errores, setErrores] = useState({});
  const cambiar = (n, v) => setForm((f) => ({ ...f, [n]: v }));
  if (id && !original) return <Vacio titulo="Usuario no encontrado" />;
  function enviar(e) {
    e.preventDefault();
    const er = validarUsuario(form);
    setErrores(er);
    if (
      !Object.keys(er).length &&
      actualizar((d) => guardarUsuario(d, form), "Usuario guardado.")
    )
      navigate(perfil ? "/cuenta" : "/admin/usuarios");
  }
  return (
    <>
      <Titulo
        titulo={
          perfil ? "Mi perfil" : original ? "Editar usuario" : "Nuevo usuario"
        }
      />
      <form noValidate onSubmit={enviar} className="panel-card">
        <DatosUsuario form={form} cambiar={cambiar} errores={errores} admin />
        <button className="btn btn-dark" type="submit">
          Guardar usuario
        </button>
        <Link className="btn btn-link" to="/admin/usuarios">
          Cancelar
        </Link>
      </form>
    </>
  );
}
export function AdminDetalleUsuario({ datos }) {
  const { id } = useParams();
  const u = datos.usuarios.find((u) => u.id === id);
  return u ? (
    <>
      <Titulo titulo={`${u.nombre} ${u.apellido}`} />
      <div className="panel-card mb-4">
        <p>
          {u.correo} · {u.rol}
        </p>
        <p>RUN: {u.run}</p>
        <p>Dirección: {u.direccion}</p>
        <Link to={`/admin/usuarios/${u.id}/editar`}>Editar datos</Link>
      </div>
      <h2 className="h4">Historial de compras</h2>
      {datos.ordenes.filter((o) => o.usuarioId === id).map((compra) => (<p key={compra.id}>{new Date(compra.fecha).toLocaleDateString("es-CL")} · {dinero(compra.total)}</p>))}
    </>
  ) : (
    <Vacio titulo="Usuario no encontrado" />
  );
}
export function AdminReportes({ datos }) {
  const cantidad = datos.productos.reduce((s, p) => s + p.stock, 0);
  const valor = datos.productos.reduce((s, p) => s + p.stock * p.precio, 0);
  return (
    <>
      <Titulo
        titulo="Reportes"
        descripcion="Inventario y ventas de esta demostración."
      />
      <div className="panel-card mb-4">
        <p>
          Unidades disponibles: <strong>{cantidad}</strong>
        </p>
        <p>
          Valor del inventario a precio base: <strong>{dinero(valor)}</strong>
        </p>
        <p>
          Ventas confirmadas:{" "}
          <strong>
            {dinero(datos.ordenes.reduce((s, o) => s + o.total, 0))}
          </strong>
        </p>
      </div>
      <h2 className="h4">Productos con stock crítico</h2>
      {datos.productos
        .filter((p) => p.stock <= 5)
        .map((p) => (
          <p key={p.id}>
            {p.nombre}: {p.stock} unidades
          </p>
        ))}
      {!datos.productos.some((p) => p.stock <= 5) && (
        <p>No hay productos con stock crítico.</p>
      )}
    </>
  );
}
export function AdminMensajes({ datos }) {
  return (
    <>
      <Titulo titulo="Mensajes de contacto" />
      {datos.mensajes.length ? (
        datos.mensajes
          .slice()
          .reverse()
          .map((m) => (
            <article key={m.id} className="panel-card mb-3">
              <h2 className="h5">{m.nombre}</h2>
              <p>
                {m.correo} · {new Date(m.fecha).toLocaleString("es-CL")}
              </p>
              <p className="message-body">{m.mensaje}</p>
            </article>
          ))
      ) : (
        <p>No hay mensajes todavía.</p>
      )}
    </>
  );
}
