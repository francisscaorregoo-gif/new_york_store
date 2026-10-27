import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Aviso, Vacio } from "./components/UI";
import Home from "./pages/Home";
import Productos, { Categorias, DetalleProducto } from "./pages/Productos";
import { Login, Registro, Cuenta } from "./pages/Acceso";
import { Carrito, Checkout, ResultadoCompra } from "./pages/Compra";
import { Nosotros, Contacto, Blogs, BlogDetalle } from "./pages/Contenido";
import {
  AdminLayout,
  SoloAdmin,
  AdminHome,
  AdminProductos,
  ProductoForm,
  AdminDetalleProducto,
  AdminCategorias,
  AdminUsuarios,
  UsuarioForm,
  AdminDetalleUsuario,
  AdminReportes,
  AdminMensajes,
} from "./pages/Admin";
import {
  cargarDatos,
  guardarDatos,
  usuarioActual,
  agregarAlCarrito,
} from "./data/store";
import "./index.css";
function Scroll() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function Tienda() {
  const [inicio] = useState(() => {
    try {
      return { datos: cargarDatos(), error: "" };
    } catch (e) {
      return { datos: null, error: e.message };
    }
  });
  const [datos, setDatos] = useState(inicio.datos);
  const [aviso, setAviso] = useState(
    inicio.error ? { mensaje: inicio.error, tipo: "danger" } : null,
  );
  function actualizar(transformar, mensaje = "") {
    try {
      const actuales = cargarDatos();
      const siguientes = transformar(actuales);
      guardarDatos(siguientes);
      setDatos(siguientes);
      setAviso(mensaje ? { mensaje, tipo: "success" } : null);
      return true;
    } catch (error) {
      setAviso({ mensaje: error.message, tipo: "danger" });
      return false;
    }
  }
  const agregar = (id, cantidad = 1) =>
    actualizar(
      (d) => agregarAlCarrito(d, id, cantidad),
      "Producto agregado a tu carrito.",
    );
  if (!datos)
    return (
      <div className="container py-5">
        <h1>No se pudo abrir la tienda</h1>
        <Aviso mensaje={inicio.error} />
      </div>
    );
  const usuario = usuarioActual(datos);
  const cantidad = datos.carrito.reduce((s, i) => s + i.cantidad, 0);
  const admin = (children) => (
    <SoloAdmin usuario={usuario}>{children}</SoloAdmin>
  );
  return (
    <div className="app-shell">
      <Scroll />
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <Navbar
        usuario={usuario}
        cantidad={cantidad}
        salir={() =>
          actualizar((d) => ({ ...d, sesion: null }), "Sesión cerrada.")
        }
      />
      {aviso && (
        <div className="container global-notice">
          <Aviso {...aviso} />
          <button
            className="btn-close"
            aria-label="Cerrar aviso"
            onClick={() => setAviso(null)}
          />
        </div>
      )}
      <main id="contenido" className="flex-grow-1">
        <Routes>
          <Route
            path="/"
            element={<Home datos={datos} onAgregar={agregar} />}
          />
          <Route
            path="/productos"
            element={<Productos datos={datos} onAgregar={agregar} />}
          />
          <Route
            path="/productos/:id"
            element={<DetalleProducto datos={datos} onAgregar={agregar} />}
          />
          <Route path="/categorias" element={<Categorias datos={datos} />} />
          <Route
            path="/carrito"
            element={<Carrito datos={datos} actualizar={actualizar} />}
          />
          <Route
            path="/checkout"
            element={
              <Checkout
                key={usuario?.id || "invitado"}
                datos={datos}
                usuario={usuario}
                actualizar={actualizar}
              />
            }
          />
          <Route
            path="/compra-exitosa"
            element={<ResultadoCompra datos={datos} />}
          />
          <Route
            path="/compra-error"
            element={<ResultadoCompra datos={datos} error />}
          />
          <Route path="/login" element={<Login actualizar={actualizar} />} />
          <Route
            path="/registro"
            element={<Registro actualizar={actualizar} />}
          />
          <Route
            path="/cuenta"
            element={<Cuenta usuario={usuario} datos={datos} />}
          />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route
            path="/contacto"
            element={<Contacto actualizar={actualizar} />}
          />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetalle />} />
          <Route path="/admin" element={<AdminLayout usuario={usuario} />}>
            <Route index element={<AdminHome datos={datos} />} />
            <Route
              path="productos"
              element={
                <AdminProductos
                  datos={datos}
                  actualizar={actualizar}
                  usuario={usuario || {}}
                />
              }
            />
            <Route
              path="productos/nuevo"
              element={admin(
                <ProductoForm datos={datos} actualizar={actualizar} />,
              )}
            />
            <Route
              path="productos/:id"
              element={<AdminDetalleProducto datos={datos} />}
            />
            <Route
              path="productos/:id/editar"
              element={admin(
                <ProductoForm
                  key={window.location.pathname}
                  datos={datos}
                  actualizar={actualizar}
                />,
              )}
            />
            <Route
              path="categorias"
              element={admin(
                <AdminCategorias datos={datos} actualizar={actualizar} />,
              )}
            />
            <Route
              path="usuarios"
              element={admin(
                <AdminUsuarios datos={datos} actualizar={actualizar} />,
              )}
            />
            <Route
              path="usuarios/nuevo"
              element={admin(
                <UsuarioForm datos={datos} actualizar={actualizar} />,
              )}
            />
            <Route
              path="usuarios/:id"
              element={admin(<AdminDetalleUsuario datos={datos} />)}
            />
            <Route
              path="usuarios/:id/editar"
              element={admin(
                <UsuarioForm
                  key={window.location.pathname}
                  datos={datos}
                  actualizar={actualizar}
                />,
              )}
            />
            <Route
              path="reportes"
              element={admin(<AdminReportes datos={datos} />)}
            />
            <Route
              path="mensajes"
              element={admin(<AdminMensajes datos={datos} />)}
            />
            <Route
              path="perfil"
              element={admin(
                <UsuarioForm
                  key="perfil"
                  datos={datos}
                  actualizar={actualizar}
                  perfil
                />,
              )}
            />
          </Route>
          <Route
            path="*"
            element={
              <div className="container section-space">
                <Vacio titulo="Esta página no está aquí">
                  <Link to="/" className="btn btn-dark">
                    Volver al inicio
                  </Link>
                </Vacio>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Tienda />
    </BrowserRouter>
  );
}
