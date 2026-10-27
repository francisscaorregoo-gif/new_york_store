import { regiones, comunas } from "../data/zonas";
export function Aviso({ mensaje, tipo = "danger" }) {
  return mensaje ? (
    <div
      role={tipo === "danger" ? "alert" : "status"}
      className={`alert alert-${tipo}`}
    >
      {mensaje}
    </div>
  ) : null;
}
export function Campo({
  nombre,
  etiqueta,
  valor = "",
  cambiar,
  error,
  tipo = "text",
  opciones,
  disabled = false,
  required = true,
  ...props
}) {
  const id = `campo-${nombre}`;
  const comunes = {
    id,
    name: nombre,
    value: valor,
    onChange: (e) => cambiar(nombre, e.target.value),
    className: `form-control ${error ? "is-invalid" : ""}`,
    disabled,
    required,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    ...props,
  };
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {etiqueta}
      </label>
      {opciones ? (
        <select
          {...comunes}
          className={`form-select ${error ? "is-invalid" : ""}`}
        >
          <option value="">Selecciona una opción</option>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
      ) : tipo === "textarea" ? (
        <textarea {...comunes} rows={4} />
      ) : (
        <input {...comunes} type={tipo} />
      )}{" "}
      {error && (
        <div id={`${id}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
export function Direccion({ datos, cambiar, errores = {} }) {
  return (
    <>
      <div className="row">
        <div className="col-md-6">
          <Campo
            nombre="region"
            etiqueta="Región"
            valor={datos.region}
            cambiar={(n, v) => {
              cambiar(n, v);
              cambiar("comuna", "");
            }}
            error={errores.region}
            opciones={regiones.map((r) => ({ valor: r.id, texto: r.nombre }))}
          />
        </div>
        <div className="col-md-6">
          <Campo
            nombre="comuna"
            etiqueta="Comuna"
            valor={datos.comuna}
            cambiar={cambiar}
            error={errores.comuna}
            opciones={comunas
              .filter((c) => String(c.id_region) === String(datos.region))
              .map((c) => ({ valor: c.id, texto: c.nombre }))}
          />
        </div>
      </div>
      <Campo
        nombre="direccion"
        etiqueta="Dirección"
        valor={datos.direccion}
        cambiar={cambiar}
        error={errores.direccion}
        maxLength={300}
      />
    </>
  );
}
export function Titulo({ numero, titulo, descripcion }) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{numero || "NEW YORK STORE"}</p>
      <h1>{titulo}</h1>
      {descripcion && <p className="text-secondary">{descripcion}</p>}
    </div>
  );
}
export function Vacio({ titulo, children }) {
  return (
    <div className="empty-state">
      <p className="eyebrow">NEW YORK STORE</p>
      <h2>{titulo}</h2>
      {children}
    </div>
  );
}
export function Confirmar({ texto, confirmar, cancelar }) {
  return (
    <div className="confirm-box border rounded p-3 my-3" role="alert">
      <p>{texto}</p>
      <button className="btn btn-danger me-2" onClick={confirmar}>
        Confirmar eliminación
      </button>
      <button className="btn btn-outline-dark" onClick={cancelar}>
        Cancelar
      </button>
    </div>
  );
}
