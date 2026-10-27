import { regiones, comunas } from "./zonas";
export const validarCorreo = (correo) =>
  /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(correo.trim()) &&
  correo.trim().length <= 100;
export const validarNombre = (nombre) =>
  /^[a-záéíóúüñ][a-záéíóúüñ\s'-]{2,49}$/i.test(nombre.trim());
export const validarClave = (clave) => clave.length >= 4 && clave.length <= 10;
export function validarRun(run) {
  const limpio = run.replace(/[.\-]/g, "").toUpperCase();
  if (!/^\d{7,8}[\dK]$/.test(limpio)) return false;
  let suma = 0,
    factor = 2;
  for (const digito of limpio.slice(0, -1).split("").reverse()) {
    suma += Number(digito) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resultado = 11 - (suma % 11);
  return (
    limpio.slice(-1) ===
    (resultado === 11 ? "0" : resultado === 10 ? "K" : String(resultado))
  );
}
export function validarEntrega(datos) {
  const errores = {};
  if (!validarNombre(datos.nombre || ""))
    errores.nombre = "Ingresa un nombre de 3 a 50 caracteres, sin números.";
  if (!validarNombre(datos.apellido || ""))
    errores.apellido = "Ingresa un apellido de 3 a 50 caracteres, sin números.";
  if (!validarCorreo(datos.correo || ""))
    errores.correo =
      "Usa un correo válido @gmail.com, @duoc.cl o @profesor.duoc.cl.";
  if (datos.entrega && !["retiro", "despacho"].includes(datos.entrega))
    errores.entrega = "Selecciona una opción de entrega válida.";
  if (datos.pago && !["aprobado", "rechazado"].includes(datos.pago))
    errores.pago = "Selecciona un resultado de pago válido.";
  if (datos.entrega !== "retiro") {
    if (!regiones.some((r) => String(r.id) === String(datos.region)))
      errores.region = "Selecciona una región.";
    if (
      !comunas.some(
        (c) =>
          String(c.id) === String(datos.comuna) &&
          String(c.id_region) === String(datos.region),
      )
    )
      errores.comuna = "Selecciona una comuna de la región.";
    if (!(datos.direccion || "").trim() || datos.direccion.trim().length > 300)
      errores.direccion = "Ingresa una dirección de hasta 300 caracteres.";
  }
  return errores;
}
export function validarUsuario(datos) {
  const errores = validarEntrega({ ...datos, entrega: "despacho" });
  if (!validarRun(datos.run || ""))
    errores.run = "Ingresa un RUN válido con dígito verificador.";
  if (!validarClave(datos.clave || ""))
    errores.clave = "La contraseña debe tener entre 4 y 10 caracteres.";
  const fecha = new Date(`${datos.fecha}T00:00:00`);
  if (
    !datos.fecha ||
    Number.isNaN(fecha.getTime()) ||
    fecha > new Date() ||
    fecha.getFullYear() < 1900
  )
    errores.fecha = "Ingresa una fecha de nacimiento válida, no futura.";
  return errores;
}
export function validarProducto(datos) {
  const errores = {};
  if (!/^[A-Z0-9-]{3,25}$/.test(datos.id))
    errores.id =
      "Usa un código de 3 a 25 letras mayúsculas, números o guiones.";
  if (!(datos.nombre || "").trim() || datos.nombre.length > 100)
    errores.nombre = "Ingresa un nombre de hasta 100 caracteres.";
  if (!datos.categoria) errores.categoria = "Selecciona una categoría.";
  if (!Number.isInteger(Number(datos.precio)) || Number(datos.precio) <= 0)
    errores.precio = "El precio debe ser un entero mayor que cero.";
  if (
    datos.stock === "" ||
    !Number.isInteger(Number(datos.stock)) ||
    Number(datos.stock) < 0
  )
    errores.stock = "El stock debe ser un entero igual o mayor que cero.";
  if (
    !/^\/img\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(datos.imagen || "")
  )
    errores.imagen = "Usa una imagen de /img/ en formato jpg, png o webp.";
  if ((datos.descripcion || "").length > 1000)
    errores.descripcion = "La descripción admite hasta 1000 caracteres.";
  return errores;
}
export function validarContacto(datos) {
  const errores = {};
  if (!validarNombre(datos.nombre || ""))
    errores.nombre = "Ingresa un nombre válido.";
  if (!validarCorreo(datos.correo || ""))
    errores.correo = "Ingresa un correo de los dominios permitidos.";
  if (!(datos.mensaje || "").trim() || datos.mensaje.length > 500)
    errores.mensaje = "Escribe un mensaje de 1 a 500 caracteres.";
  return errores;
}
