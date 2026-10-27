// Fuente de datos simulada: una sola escritura conserva coherencia entre orden, stock y carrito.
import { productosIniciales } from "./products";
import {
  validarUsuario,
  validarProducto,
  validarEntrega,
} from "./validaciones";
export const STORAGE_KEY = "nys_v2";
export const dinero = (valor) => "$" + Number(valor).toLocaleString("es-CL");
export const nuevoId = (prefijo) =>
  `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
export function datosIniciales() {
  return {
    productos: productosIniciales.map((p, i) => ({
      ...p,
      stock: 10 + i * 3,

      descripcion: `${p.nombre}. Una prenda versátil para combinar con tu estilo de cada día.`,
    })),
    categorias: [
      { id: "CAT-1", nombre: "Poleras" },
      { id: "CAT-2", nombre: "Shorts" },
    ],
    usuarios: [
      {
        id: "USR-ADMIN",
        nombre: "Administración",
        apellido: "New York Store",
        correo: "admin@duoc.cl",
        clave: "Admin123",
        rol: "administrador",
        run: "12.345.678-5",
        fecha: "2000-01-01",
        region: "1000",
        comuna: "1028",
        direccion: "Av. Ejemplo 123",
      },
    ],
    carrito: [],
    ordenes: [],
    mensajes: [],
    sesion: null,
  };
}
export function cargarDatos() {
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (!guardados) return datosIniciales();
  try {
    const datos = JSON.parse(guardados);
    if (
      ![
        "productos",
        "categorias",
        "usuarios",
        "carrito",
        "ordenes",
        "mensajes",
      ].every((k) => Array.isArray(datos[k]))
    )
      throw new Error();
    return datos;
  } catch {
    throw new Error(
      "No se pueden leer los datos guardados. Elimina la clave nys_v2 del almacenamiento del navegador para reiniciar la demostración.",
    );
  }
}
export function guardarDatos(datos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  } catch {
    throw new Error(
      "No fue posible guardar los cambios. Revisa el espacio o los permisos del navegador.",
    );
  }
  return datos;
}
export const usuarioActual = (datos) =>
  datos.usuarios.find((u) => u.id === datos.sesion) || null;
function exigirAdministrador(datos) {
  if (usuarioActual(datos)?.rol !== "administrador")
    throw new Error("Se requiere una sesión de administrador.");
}
export function iniciarSesion(datos, correo, clave) {
  const usuario = datos.usuarios.find(
    (u) =>
      u.correo.toLowerCase() === correo.trim().toLowerCase() &&
      u.clave === clave,
  );
  if (!usuario) throw new Error("Correo o contraseña incorrectos.");
  return { ...datos, sesion: usuario.id };
}
export function registrarUsuario(datos, usuario) {
  const errores = validarUsuario(usuario);
  if (Object.keys(errores).length) throw new Error(Object.values(errores)[0]);
  if (
    datos.usuarios.some(
      (u) =>
        u.correo.toLowerCase() === usuario.correo.trim().toLowerCase() ||
        u.run.replace(/[.\-]/g, "").toUpperCase() === usuario.run.replace(/[.\-]/g, "").toUpperCase(),
    )
  )
    throw new Error("Ya existe un usuario con ese correo o RUN.");
  const nuevo = {
    ...usuario,
    correo: usuario.correo.trim().toLowerCase(),
    id: nuevoId("USR"),
    rol: "cliente",
  };
  return { ...datos, usuarios: [...datos.usuarios, nuevo], sesion: nuevo.id };
}
export function guardarUsuario(datos, usuario) {
  exigirAdministrador(datos);
  const errores = validarUsuario(usuario);
  if (Object.keys(errores).length) throw new Error(Object.values(errores)[0]);
  if (!["administrador", "cliente", "vendedor"].includes(usuario.rol))
    throw new Error("Selecciona un rol válido.");
  if (
    datos.usuarios.some(
      (u) =>
        u.id !== usuario.id &&
        (u.correo.toLowerCase() === usuario.correo.trim().toLowerCase() ||
          u.run.replace(/[.\-]/g, "").toUpperCase() === usuario.run.replace(/[.\-]/g, "").toUpperCase()),
    )
  )
    throw new Error("El correo o RUN ya está registrado.");
  const original = datos.usuarios.find((u) => u.id === usuario.id);
  if (
    original?.rol === "administrador" &&
    usuario.rol !== "administrador" &&
    datos.usuarios.filter((u) => u.rol === "administrador").length === 1
  )
    throw new Error("Debe existir al menos un administrador.");
  const nuevo = {
    ...usuario,
    correo: usuario.correo.trim().toLowerCase(),
    id: usuario.id || nuevoId("USR"),
  };
  return {
    ...datos,
    usuarios: original
      ? datos.usuarios.map((u) => (u.id === nuevo.id ? nuevo : u))
      : [...datos.usuarios, nuevo],
  };
}
export function eliminarUsuario(datos, id) {
  exigirAdministrador(datos);
  if (id === datos.sesion)
    throw new Error("No puedes eliminar tu propia sesión.");
  return { ...datos, usuarios: datos.usuarios.filter((u) => u.id !== id) };
}
export function guardarProducto(datos, producto, idOriginal = null) {
  exigirAdministrador(datos);
  const errores = validarProducto(producto);
  if (Object.keys(errores).length) throw new Error(Object.values(errores)[0]);
  if (!datos.categorias.some((c) => c.nombre === producto.categoria))
    throw new Error("Selecciona una categoría existente.");
  if (datos.productos.some((p) => p.id === producto.id && p.id !== idOriginal))
    throw new Error("El código del producto ya existe.");
  const nuevo = {
    ...producto,
    precio: Number(producto.precio),
    stock: Number(producto.stock),

  };
  return {
    ...datos,
    productos: idOriginal
      ? datos.productos.map((p) => (p.id === idOriginal ? nuevo : p))
      : [...datos.productos, nuevo],
  };
}
export function eliminarProducto(datos, id) {
  exigirAdministrador(datos);
  return {
    ...datos,
    productos: datos.productos.filter((p) => p.id !== id),
    carrito: datos.carrito.filter((i) => i.id !== id),
  };
}
export function guardarCategoria(datos, categoria) {
  exigirAdministrador(datos);
  const nombre = categoria.nombre.trim();
  if (nombre.length < 3 || nombre.length > 40)
    throw new Error("La categoría debe tener entre 3 y 40 caracteres.");
  if (
    datos.categorias.some(
      (c) =>
        c.id !== categoria.id &&
        c.nombre.toLowerCase() === nombre.toLowerCase(),
    )
  )
    throw new Error("La categoría ya existe.");
  const anterior = datos.categorias.find((c) => c.id === categoria.id);
  const nueva = { id: categoria.id || nuevoId("CAT"), nombre };
  return {
    ...datos,
    categorias: anterior
      ? datos.categorias.map((c) => (c.id === categoria.id ? nueva : c))
      : [...datos.categorias, nueva],
    productos: anterior
      ? datos.productos.map((p) =>
          p.categoria === anterior.nombre ? { ...p, categoria: nombre } : p,
        )
      : datos.productos,
  };
}
export function eliminarCategoria(datos, id) {
  exigirAdministrador(datos);
  const categoria = datos.categorias.find((c) => c.id === id);
  if (datos.productos.some((p) => p.categoria === categoria?.nombre))
    throw new Error(
      "Esta categoría tiene productos. Reasígnalos antes de eliminarla.",
    );
  return { ...datos, categorias: datos.categorias.filter((c) => c.id !== id) };
}
export function cambiarCantidad(datos, id, cantidad) {
  const producto = datos.productos.find((p) => p.id === id);
  if (!producto) throw new Error("El producto ya no está disponible.");
  if (!Number.isInteger(cantidad) || cantidad < 0 || cantidad > producto.stock)
    throw new Error(
      "La cantidad debe ser un entero dentro del stock disponible.",
    );
  const otros = datos.carrito.filter((i) => i.id !== id);
  return {
    ...datos,
    carrito: cantidad === 0 ? otros : [...otros, { id, cantidad }],
  };
}
export function agregarAlCarrito(datos, id, cantidad = 1) {
  if (!Number.isInteger(cantidad) || cantidad < 1)
    throw new Error("Selecciona una cantidad mayor que cero.");
  return cambiarCantidad(
    datos,
    id,
    (datos.carrito.find((i) => i.id === id)?.cantidad || 0) + cantidad,
  );
}
export function detalleCarrito(datos) {
  return datos.carrito
    .map((i) => {
      const producto = datos.productos.find((p) => p.id === i.id);
      return producto
        ? {
            ...producto,
            cantidad: i.cantidad,
            unitario: producto.precio,
            subtotal: producto.precio * i.cantidad,
          }
        : null;
    })
    .filter(Boolean);
}
export function resumenCompra(datos, entrega = "retiro") {
  const subtotal = detalleCarrito(datos).reduce(
    (total, i) => total + i.subtotal,
    0,
  );
  const envio =
    entrega === "despacho" && subtotal > 0 ? 3990 : 0;
  return { subtotal, envio, total: subtotal + envio };
}
export function finalizarCompra(datos, formulario) {
  const errores = validarEntrega(formulario);
  if (Object.keys(errores).length) throw new Error(Object.values(errores)[0]);
  if (
    !["retiro", "despacho"].includes(formulario.entrega) ||
    !["aprobado", "rechazado"].includes(formulario.pago)
  )
    throw new Error("Selecciona entrega y resultado de pago.");
  if (!datos.carrito.length)
    throw new Error("Agrega productos antes de comprar.");
  const items = detalleCarrito(datos);
  if (
    items.length !== datos.carrito.length ||
    items.some(
      (i) =>
        !Number.isInteger(i.cantidad) || i.cantidad < 1 || i.cantidad > i.stock,
    )
  )
    throw new Error("El stock cambió. Revisa las cantidades de tu carrito.");
  if (formulario.pago === "rechazado") return { datos, orden: null };
  const orden = {
    id: nuevoId("ORD"),
    fecha: new Date().toISOString(),
    usuarioId: datos.sesion,
    cliente: {
      nombre: formulario.nombre,
      apellido: formulario.apellido,
      correo: formulario.correo,
      region: formulario.region,
      comuna: formulario.comuna,
      direccion: formulario.direccion,
    },
    entrega: formulario.entrega,
    estado: "Confirmada",
    items: items.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      imagen: i.imagen,
      cantidad: i.cantidad,
      unitario: i.unitario,
      subtotal: i.subtotal,
    })),
    ...resumenCompra(datos, formulario.entrega),
  };
  return {
    orden,
    datos: {
      ...datos,
      carrito: [],
      ordenes: [...datos.ordenes, orden],
      productos: datos.productos.map((p) => ({
        ...p,
        stock: p.stock - (items.find((i) => i.id === p.id)?.cantidad || 0),
      })),
    },
  };
}

