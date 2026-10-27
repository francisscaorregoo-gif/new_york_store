import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Campo, Direccion, Titulo, Vacio } from "../components/UI";
import {
  dinero,
  detalleCarrito,
  resumenCompra,
  cambiarCantidad,
  finalizarCompra,
} from "../data/store";
import { validarEntrega } from "../data/validaciones";
import { regiones, comunas } from "../data/zonas";
export function Resumen({ resumen, children }) {
  return (
    <aside className="order-summary">
      <h2 className="h4 mb-4">Tu resumen</h2>
      <div className="summary-line">
        <span>Productos</span>
        <span>{dinero(resumen.subtotal)}</span>
      </div>
      <div className="summary-line">
        <span>Entrega</span>
        <span>{resumen.envio ? dinero(resumen.envio) : "Sin costo"}</span>
      </div>
      <div className="summary-line summary-total">
        <span>Total</span>
        <strong>{dinero(resumen.total)}</strong>
      </div>
      {children}
    </aside>
  );
}
export function Carrito({ datos, actualizar }) {
  const items = detalleCarrito(datos);
  return (
    <div className="container section-space">
      <Titulo
        numero="01 / TU SELECCIÓN"
        titulo="Tu carrito"
        descripcion="Un paso más cerca de tu próximo look."
      />
      {items.length ? (
        <div className="row g-5">
          <div className="col-lg-8">
            {items.map((i) => (
              <article key={i.id} className="cart-item">
                <img src={i.imagen} alt={i.nombre} />
                <div className="flex-grow-1">
                  <Link to={`/productos/${i.id}`} className="product-name">
                    {i.nombre}
                  </Link>
                  <p className="small text-secondary">
                    {dinero(i.unitario)} por unidad · Stock: {i.stock}
                  </p>
                  <div className="d-flex gap-3 align-items-center flex-wrap">
                    <label htmlFor={`cantidad-${i.id}`} className="small">
                      Cantidad
                    </label>
                    <input
                      id={`cantidad-${i.id}`}
                      aria-label={`Cantidad de ${i.nombre}`}
                      type="number"
                      className="form-control quantity-input"
                      min="1"
                      max={i.stock}
                      value={i.cantidad}
                      onChange={(e) =>
                        actualizar((d) =>
                          cambiarCantidad(d, i.id, Number(e.target.value)),
                        )
                      }
                    />
                    <button
                      className="btn btn-link text-danger small"
                      onClick={() =>
                        actualizar(
                          (d) => cambiarCantidad(d, i.id, 0),
                          "Producto eliminado del carrito.",
                        )
                      }
                    >
                      Quitar
                    </button>
                  </div>
                  {i.cantidad > i.stock && (
                    <p className="text-danger">
                      Ajusta la cantidad al stock disponible.
                    </p>
                  )}
                </div>
                <strong>{dinero(i.subtotal)}</strong>
              </article>
            ))}
            <button
              className="btn btn-outline-dark mt-3"
              onClick={() =>
                actualizar((d) => ({ ...d, carrito: [] }), "Carrito vaciado.")
              }
            >
              Vaciar carrito
            </button>
          </div>
          <div className="col-lg-4">
            <Resumen resumen={resumenCompra(datos)}>
              <p className="small text-secondary">
                Selecciona retiro o despacho en el siguiente paso. Envío:
                $3.990.
              </p>
              <Link className="btn btn-dark w-100" to="/checkout">
                Continuar con la compra →
              </Link>
              <Link className="d-block text-center mt-3" to="/productos">
                Seguir explorando
              </Link>
            </Resumen>
          </div>
        </div>
      ) : (
        <Vacio titulo="Tu carrito está esperando">
          <p>Encuentra esas prendas que van contigo.</p>
          <Link className="btn btn-dark" to="/productos">
            Ver colección
          </Link>
        </Vacio>
      )}
    </div>
  );
}
export function Checkout({ datos, usuario, actualizar }) {
  const [form, setForm] = useState({
    nombre: usuario?.nombre || "",
    apellido: usuario?.apellido || "",
    correo: usuario?.correo || "",
    region: usuario?.region || "",
    comuna: usuario?.comuna || "",
    direccion: usuario?.direccion || "",
    entrega: "despacho",
    pago: "aprobado",
  });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const cambiar = (n, v) => setForm((f) => ({ ...f, [n]: v }));
  function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    const er = validarEntrega(form);
    setErrores(er);
    if (Object.keys(er).length) return;
    setEnviando(true);
    let orden;
    const ok = actualizar((d) => {
      const resultado = finalizarCompra(d, form);
      orden = resultado.orden;
      return resultado.datos;
    });
    if (ok)
      navigate(orden ? "/compra-exitosa" : "/compra-error", {
        state: orden
          ? { ordenId: orden.id }
          : { resumen: resumenCompra(datos, form.entrega) },
        replace: true,
      });
    else setEnviando(false);
  }
  if (!datos.carrito.length)
    return (
      <div className="container section-space">
        <Vacio titulo="Primero elige tus productos">
          <Link to="/productos">Ir a la colección</Link>
        </Vacio>
      </div>
    );
  return (
    <div className="container section-space">
      <Titulo
        numero="02 / DATOS Y ENTREGA"
        titulo="Ya casi es tuyo"
        descripcion="Completa tus datos y elige cómo recibir tu pedido."
      />
      <div className="row g-5">
        <div className="col-lg-8">
          <form noValidate onSubmit={enviar} id="checkout-form">
            <div className="panel-card">
              <h2 className="h4 mb-4">Datos de contacto</h2>
              {!usuario && (
                <p className="small">
                  <Link to="/login">Ingresa</Link> para usar tus datos
                  guardados, o continúa como invitado.
                </p>
              )}
              <div className="row">
                <div className="col-md-6">
                  <Campo
                    nombre="nombre"
                    etiqueta="Nombre"
                    valor={form.nombre}
                    cambiar={cambiar}
                    error={errores.nombre}
                  />
                </div>
                <div className="col-md-6">
                  <Campo
                    nombre="apellido"
                    etiqueta="Apellido"
                    valor={form.apellido}
                    cambiar={cambiar}
                    error={errores.apellido}
                  />
                </div>
              </div>
              <Campo
                nombre="correo"
                etiqueta="Correo electrónico"
                tipo="email"
                valor={form.correo}
                cambiar={cambiar}
                error={errores.correo}
              />
              <h2 className="h4 mt-4 mb-3">Entrega</h2>
              <Campo
                nombre="entrega"
                etiqueta="¿Cómo quieres recibirlo?"
                valor={form.entrega}
                cambiar={cambiar}
                opciones={[
                  { valor: "despacho", texto: "Despacho a domicilio" },
                  { valor: "retiro", texto: "Retiro sin costo" },
                ]}
              />
              {form.entrega === "despacho" ? (
                <Direccion datos={form} cambiar={cambiar} errores={errores} />
              ) : (
                <p className="demo-note">
                  Retiro de demostración. La coordinación se muestra en el
                  resumen del pedido.
                </p>
              )}
              <h2 className="h4 mt-4">Pago de demostración</h2>
              <p className="small text-secondary">
                Esta evaluación simula la compra. No ingreses datos de tarjetas.
              </p>
              <Campo
                nombre="pago"
                etiqueta="Resultado del pago simulado"
                valor={form.pago}
                cambiar={cambiar}
                opciones={[
                  { valor: "aprobado", texto: "Simular pago aprobado" },
                  { valor: "rechazado", texto: "Simular pago rechazado" },
                ]}
              />
            </div>
          </form>
        </div>
        <div className="col-lg-4">
          <Resumen resumen={resumenCompra(datos, form.entrega)}>
            {detalleCarrito(datos).map((i) => (
              <p className="small" key={i.id}>
                {i.nombre} × {i.cantidad}
              </p>
            ))}
            <button
              type="submit"
              form="checkout-form"
              className="btn btn-dark w-100 mt-3"
              disabled={enviando}
            >
              Confirmar compra
            </button>
            <Link to="/carrito" className="d-block text-center mt-3">
              Volver al carrito
            </Link>
          </Resumen>
        </div>
      </div>
    </div>
  );
}
export function ResultadoCompra({ datos, error = false }) {
  const location = useLocation();
  const orden = datos.ordenes.find((o) => o.id === location.state?.ordenId);
  if (error)
    return (
      <div className="container section-space">
        <div className="result-card">
          <span className="result-symbol error">×</span>
          <p className="eyebrow mt-4">PODEMOS INTENTARLO OTRA VEZ</p>
          <h1>No pudimos completar el pago</h1>
          <p>
            El pago de demostración fue rechazado. Tus productos siguen en el
            carrito y el stock no cambió.
          </p>
          {location.state?.resumen && (
            <p>
              Total del intento:{" "}
              <strong>{dinero(location.state.resumen.total)}</strong>
            </p>
          )}
          <Link to="/checkout" className="btn btn-dark">
            Volver a intentar
          </Link>{" "}
          <Link to="/carrito" className="btn btn-outline-dark">
            Ver carrito
          </Link>
        </div>
      </div>
    );
  if (!orden)
    return (
      <div className="container section-space">
        <Vacio titulo="No hay una compra para mostrar">
          <Link to="/cuenta">Ver mis compras</Link>
        </Vacio>
      </div>
    );
  return (
    <div className="container section-space">
      <div className="result-card">
        <span className="result-symbol">✓</span>
        <p className="eyebrow mt-4">03 / TODO LISTO</p>
        <h1>Tu pedido está confirmado</h1>
        <p>
          Gracias, {orden.cliente.nombre}. Estos son los detalles de tu compra
          de demostración.
        </p>
        <p className="small text-break">Pedido: {orden.id}</p>
        <p>{new Date(orden.fecha).toLocaleString("es-CL")}</p>
        <div className="text-start mt-4">
          {orden.items.map((i) => (
            <div className="summary-line" key={i.id}>
              <span>
                {i.nombre} × {i.cantidad}
              </span>
              <span>{dinero(i.subtotal)}</span>
            </div>
          ))}
          <div className="summary-line">
            <span>Entrega</span>
            <span>{dinero(orden.envio)}</span>
          </div>
          <div className="summary-line summary-total">
            <strong>Total</strong>
            <strong>{dinero(orden.total)}</strong>
          </div>
          <p>
            {orden.entrega === "retiro"
              ? "Retiro sin costo. Pedido preparado para coordinación en esta demostración."
              : `${orden.cliente.direccion}, ${comunas.find((c) => String(c.id) === orden.cliente.comuna)?.nombre || ""}, ${regiones.find((r) => String(r.id) === orden.cliente.region)?.nombre || ""}`}
          </p>
        </div>
        <Link to="/productos" className="btn btn-dark mt-3">
          Seguir explorando
        </Link>
        <button
          className="btn btn-outline-dark ms-2 mt-3"
          onClick={() => window.print()}
        >
          Imprimir resumen
        </button>
      </div>
    </div>
  );
}
