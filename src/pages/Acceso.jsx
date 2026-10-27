import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Campo, Direccion, Aviso, Titulo, Vacio } from "../components/UI";
import {
  validarUsuario,
  validarCorreo,
  validarClave,
} from "../data/validaciones";
import { iniciarSesion, registrarUsuario, dinero } from "../data/store";
export const usuarioVacio = {
  nombre: "",
  apellido: "",
  run: "",
  correo: "",
  clave: "",
  fecha: "",
  region: "",
  comuna: "",
  direccion: "",
  rol: "cliente",
};
export function DatosUsuario({ form, cambiar, errores, admin = false }) {
  return (
    <>
      <div className="row">
        <div className="col-md-6">
          <Campo
            nombre="nombre"
            etiqueta="Nombre"
            valor={form.nombre}
            cambiar={cambiar}
            error={errores.nombre}
            maxLength={50}
          />
        </div>
        <div className="col-md-6">
          <Campo
            nombre="apellido"
            etiqueta="Apellido"
            valor={form.apellido}
            cambiar={cambiar}
            error={errores.apellido}
            maxLength={50}
          />
        </div>
      </div>
      <Campo
        nombre="run"
        etiqueta="RUN"
        valor={form.run}
        cambiar={cambiar}
        error={errores.run}
        placeholder="12.345.678-5"
      />
      <Campo
        nombre="correo"
        etiqueta="Correo electrónico"
        tipo="email"
        valor={form.correo}
        cambiar={cambiar}
        error={errores.correo}
        maxLength={100}
      />
      <p className="form-text">
        Dominios permitidos: gmail.com, duoc.cl y profesor.duoc.cl.
      </p>
      <Campo
        nombre="clave"
        etiqueta={admin ? "Contraseña de demostración" : "Contraseña"}
        tipo="password"
        valor={form.clave}
        cambiar={cambiar}
        error={errores.clave}
        autoComplete="new-password"
        maxLength={10}
      />
      <p className="form-text">
        De 4 a 10 caracteres, según las reglas del proyecto anterior.
      </p>
      <Campo
        nombre="fecha"
        etiqueta="Fecha de nacimiento"
        tipo="date"
        valor={form.fecha}
        cambiar={cambiar}
        error={errores.fecha}
      />
      <Direccion datos={form} cambiar={cambiar} errores={errores} />
      {admin && (
        <Campo
          nombre="rol"
          etiqueta="Rol"
          valor={form.rol}
          cambiar={cambiar}
          opciones={["cliente", "vendedor", "administrador"].map((r) => ({
            valor: r,
            texto: r,
          }))}
        />
      )}
    </>
  );
}
export function Login({ actualizar }) {
  const [form, setForm] = useState({ correo: "", clave: "" });
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();
  const cambiar = (n, v) => setForm((f) => ({ ...f, [n]: v }));
  function enviar(e) {
    e.preventDefault();
    const er = {};
    if (!validarCorreo(form.correo))
      er.correo = "Ingresa un correo válido de los dominios permitidos.";
    if (!validarClave(form.clave))
      er.clave = "La contraseña debe tener entre 4 y 10 caracteres.";
    setErrores(er);
    if (Object.keys(er).length) return;
    if (
      actualizar(
        (d) => iniciarSesion(d, form.correo, form.clave),
        "Sesión iniciada.",
      )
    )
      navigate("/cuenta");
  }
  return (
    <div className="container section-space">
      <div className="auth-card">
        <Titulo
          titulo="Qué bueno verte"
          descripcion="Ingresa para completar tus datos y revisar tus compras."
        />
        <form onSubmit={enviar} noValidate>
          <Campo
            nombre="correo"
            etiqueta="Correo electrónico"
            tipo="email"
            valor={form.correo}
            cambiar={cambiar}
            error={errores.correo}
            autoComplete="username"
          />
          <Campo
            nombre="clave"
            etiqueta="Contraseña"
            tipo="password"
            valor={form.clave}
            cambiar={cambiar}
            error={errores.clave}
            autoComplete="current-password"
          />
          <button className="btn btn-dark w-100" type="submit">
            Ingresar
          </button>
        </form>
        <p className="mt-4">
          ¿Primera vez? <Link to="/registro">Crea tu cuenta</Link>
        </p>
        <div className="demo-note mt-4">
          Acceso de demostración al panel:
          <br />
          <strong>admin@duoc.cl</strong> / <strong>Admin123</strong>
        </div>
      </div>
    </div>
  );
}
export function Registro({ actualizar }) {
  const [form, setForm] = useState({ ...usuarioVacio });
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();
  const cambiar = (n, v) => setForm((f) => ({ ...f, [n]: v }));
  function enviar(e) {
    e.preventDefault();
    const er = validarUsuario(form);
    setErrores(er);
    if (
      !Object.keys(er).length &&
      actualizar((d) => registrarUsuario(d, form), "Cuenta creada.")
    )
      navigate("/cuenta");
  }
  return (
    <div className="container section-space">
      <div className="form-sheet">
        <Titulo
          titulo="Tu cuenta, tu estilo"
          descripcion="Completa tus datos para simplificar tu próxima compra."
        />
        <form onSubmit={enviar} noValidate>
          <DatosUsuario form={form} cambiar={cambiar} errores={errores} />
          <button className="btn btn-dark" type="submit">
            Crear cuenta
          </button>{" "}
          <Link to="/login" className="btn btn-link">
            Ya tengo cuenta
          </Link>
        </form>
        <p className="form-text mt-4">
          Demostración académica: usa datos y contraseñas de prueba.
        </p>
      </div>
    </div>
  );
}
export function Cuenta({ usuario, datos }) {
  if (!usuario)
    return (
      <div className="container section-space">
        <Vacio titulo="Ingresa a tu cuenta">
          <p>Revisa tus compras y datos guardados.</p>
          <Link to="/login" className="btn btn-dark">
            Ingresar
          </Link>
        </Vacio>
      </div>
    );
  const compras = datos.ordenes.filter((o) => o.usuarioId === usuario.id);
  return (
    <div className="container section-space">
      <Titulo
        titulo={`Hola, ${usuario.nombre}`}
        descripcion="Aquí están los datos de tu cuenta y tu historial de compras."
      />
      <div className="row g-4">
        <div className="col-md-4">
          <div className="panel-card">
            <h2 className="h4">Mis datos</h2>
            <p>
              {usuario.nombre} {usuario.apellido}
            </p>
            <p>{usuario.correo}</p>
            <p>{usuario.direccion}</p>
            <span className="badge text-bg-light">{usuario.rol}</span>
            {usuario.rol === "administrador" && (
              <p className="mt-3">
                <Link to="/admin/perfil">Editar perfil</Link>
              </p>
            )}
          </div>
        </div>
        <div className="col-md-8">
          <h2 className="h4 mb-4">Mis compras</h2>
          {compras.length ? (
            compras.map((o) => (
              <div className="panel-card mb-3" key={o.id}>
                <p className="small text-secondary">
                  {new Date(o.fecha).toLocaleString("es-CL")}
                </p>
                <h3 className="h6">{o.id}</h3>
                <p>
                  {o.items.map((i) => `${i.nombre} × ${i.cantidad}`).join(", ")}
                </p>
                <p className="fw-bold">
                  {dinero(o.total)} · {o.estado}
                </p>
              </div>
            ))
          ) : (
            <Aviso
              tipo="light"
              mensaje="Todavía no tienes compras. Tu próximo favorito te espera."
            />
          )}
        </div>
      </div>
    </div>
  );
}
