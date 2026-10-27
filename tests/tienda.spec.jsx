import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import { ProductCard, ProductGrid } from "../src/components/ProductCard";
import { Aviso, Campo } from "../src/components/UI";
import Productos from "../src/pages/Productos";
import { Contacto } from "../src/pages/Contenido";
import { Registro } from "../src/pages/Acceso";
import * as S from "../src/data/store";
import * as V from "../src/data/validaciones";
window.IS_REACT_ACT_ENVIRONMENT = true;
let host, root, memoria;
function montar(ui) {
  act(() => root.render(ui));
}
function click(elemento) {
  expect(elemento)
    .withContext("El elemento debe existir antes de interactuar")
    .not.toBeNull();
  act(() =>
    elemento.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    ),
  );
}
function escribir(elemento, valor) {
  const proto =
    elemento instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : elemento instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
  act(() => {
    Object.getOwnPropertyDescriptor(proto, "value").set.call(elemento, valor);
    elemento.dispatchEvent(
      new Event(elemento instanceof HTMLSelectElement ? "change" : "input", {
        bubbles: true,
      }),
    );
  });
}
function enviar(form) {
  act(() =>
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    ),
  );
}
function iniciarApp(ruta = "/", datos = S.datosIniciales()) {
  memoria[S.STORAGE_KEY] = JSON.stringify(datos);
  window.history.replaceState({}, "", ruta);
  montar(<App />);
}
function boton(texto) {
  return (
    [...host.querySelectorAll("button")].find((b) =>
      b.textContent.includes(texto),
    ) || null
  );
}
const comprador = {
  nombre: "Francisca",
  apellido: "Orrego",
  correo: "francisca@gmail.com",
  entrega: "despacho",
  region: "1000",
  comuna: "1028",
  direccion: "Av. Ejemplo 123",
  pago: "aprobado",
};
const usuario = {
  ...comprador,
  run: "11.111.111-1",
  fecha: "2000-01-01",
  clave: "Prueba123",
  rol: "cliente",
};
function admin() {
  return { ...S.datosIniciales(), sesion: "USR-ADMIN" };
}
beforeEach(() => {
  memoria = {};
  spyOn(Storage.prototype, "getItem").and.callFake((k) => memoria[k] ?? null);
  spyOn(Storage.prototype, "setItem").and.callFake((k, v) => {
    memoria[k] = String(v);
  });
  spyOn(window, "scrollTo");
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  window.history.replaceState({}, "", "/");
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
describe("Componentes React: renderizado, props, estado y eventos", () => {
  it("01. ProductGrid renderiza todos los productos recibidos mediante props", () => {
    const datos = S.datosIniciales();
    montar(
      <MemoryRouter>
        <ProductGrid productos={datos.productos} onAgregar={() => {}} />
      </MemoryRouter>,
    );
    expect(host.querySelectorAll("article").length).toBe(5);
    expect(host.textContent).toContain("Short Michael Kors");
  });
  it("02. ProductCard llama al callback con el código al hacer clic", () => {
    const agregar = jasmine.createSpy("agregar");
    montar(
      <MemoryRouter>
        <ProductCard
          producto={S.datosIniciales().productos[0]}
          onAgregar={agregar}
        />
      </MemoryRouter>,
    );
    click(host.querySelector("button"));
    expect(agregar).toHaveBeenCalledOnceWith("MK-001");
  });
  it("03. ProductCard deshabilita la compra sin stock y no muestra precios promocionales", () => {
    montar(
      <MemoryRouter>
        <ProductCard
          producto={{ ...S.datosIniciales().productos[2], stock: 0 }}
          onAgregar={() => {}}
        />
      </MemoryRouter>,
    );
    expect(host.querySelector("button").disabled).toBeTrue();
    expect(host.textContent).toContain("Agotado");
    expect(host.querySelector("del")).toBeNull();
  });
  it("04. Aviso aparece solamente cuando recibe un mensaje de error", () => {
    montar(<Aviso mensaje="" />);
    expect(host.querySelector('[role="alert"]')).toBeNull();
    montar(<Aviso mensaje="Dato inválido" />);
    expect(host.querySelector('[role="alert"]').textContent).toBe(
      "Dato inválido",
    );
  });
  it("05. Campo controlado actualiza el estado y el DOM al escribir", () => {
    function Form() {
      const [nombre, setNombre] = useState("");
      return (
        <>
          <Campo
            nombre="nombre"
            etiqueta="Nombre"
            valor={nombre}
            cambiar={(n, v) => setNombre(v)}
          />
          <output>{nombre}</output>
        </>
      );
    }
    montar(<Form />);
    escribir(host.querySelector("input"), "Francisca");
    expect(host.querySelector("output").textContent).toBe("Francisca");
    expect(host.querySelector("input").value).toBe("Francisca");
  });
  it("06. El buscador filtra y presenta el estado sin resultados", () => {
    montar(
      <MemoryRouter>
        <Productos datos={S.datosIniciales()} onAgregar={() => {}} />
      </MemoryRouter>,
    );
    escribir(host.querySelector("#buscar"), "Armani");
    expect(host.querySelectorAll("article").length).toBe(2);
    escribir(host.querySelector("#buscar"), "inexistente");
    expect(host.textContent).toContain("No encontramos productos");
  });
  it("07. Registro detecta campos obligatorios vacíos sin guardar datos", () => {
    const actualizar = jasmine.createSpy("actualizar");
    montar(
      <MemoryRouter>
        <Registro actualizar={actualizar} />
      </MemoryRouter>,
    );
    enviar(host.querySelector("form"));
    expect(host.querySelectorAll(".invalid-feedback").length).toBe(9);
    expect(actualizar).not.toHaveBeenCalled();
  });
  it("08. Contacto valida, actualiza datos y confirma la recepción", () => {
    let guardados = S.datosIniciales();
    const actualizar = jasmine.createSpy("actualizar").and.callFake((fn) => {
      guardados = fn(guardados);
      return true;
    });
    montar(<Contacto actualizar={actualizar} />);
    enviar(host.querySelector("form"));
    expect(host.querySelectorAll(".invalid-feedback").length).toBe(3);
    escribir(host.querySelector('[name="nombre"]'), "Francisca");
    escribir(host.querySelector('[name="correo"]'), "francisca@gmail.com");
    escribir(host.querySelector("textarea"), "Consulta por una polera");
    enviar(host.querySelector("form"));
    expect(guardados.mensajes.length).toBe(1);
    expect(host.querySelector('[role="status"]').textContent).toContain(
      "guardado",
    );
    expect(host.querySelector("textarea").value).toBe("");
  });
  it("09. La navegación agrega al carrito, cambia de vista y elimina el producto", () => {
    iniciarApp("/productos");
    click(host.querySelector("article button"));
    expect(JSON.parse(memoria[S.STORAGE_KEY]).carrito[0]).toEqual({
      id: "MK-001",
      cantidad: 1,
    });
    click(host.querySelector("a.cart-link"));
    expect(window.location.pathname).toBe("/carrito");
    expect(host.querySelector("h1").textContent).toBe("Tu carrito");
    click(boton("Quitar"));
    expect(host.textContent).toContain("Tu carrito está esperando");
    expect(JSON.parse(memoria[S.STORAGE_KEY]).carrito).toEqual([]);
  });
  it("10. Checkout usa los datos de sesión, crea la orden y muestra el resumen", () => {
    let datos = admin();
    datos = S.agregarAlCarrito(datos, "MK-001");
    iniciarApp("/checkout", datos);
    expect(host.querySelector('[name="correo"]').value).toBe("admin@duoc.cl");
    enviar(host.querySelector("form"));
    const persistidos = JSON.parse(memoria[S.STORAGE_KEY]);
    expect(persistidos.ordenes.length).toBe(1);
    expect(persistidos.productos[0].stock).toBe(9);
    expect(persistidos.carrito.length).toBe(0);
    expect(window.location.pathname).toBe("/compra-exitosa");
    expect(host.textContent).toContain("Tu pedido está confirmado");
  });
});
describe("Reglas del negocio y persistencia simulada", () => {
  it("11. Inicializa cinco productos sin escribir ni modificar el catálogo base", () => {
    expect(S.cargarDatos().productos.length).toBe(5);
    const d = S.datosIniciales();
    d.productos[0].stock = 0;
    expect(S.datosIniciales().productos[0].stock).toBe(10);
  });
  it("12. Guarda y recupera cambios usando un mock de localStorage", () => {
    const d = S.agregarAlCarrito(S.datosIniciales(), "EA-001", 2);
    S.guardarDatos(d);
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    expect(S.cargarDatos().carrito).toEqual([{ id: "EA-001", cantidad: 2 }]);
  });
  it("13. Detecta almacenamiento corrupto sin sobreescribirlo", () => {
    memoria[S.STORAGE_KEY] = "{roto";
    expect(() => S.cargarDatos()).toThrowError(/No se pueden leer/);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  it("14. Informa una falla de almacenamiento mediante un mock", () => {
    localStorage.setItem.and.throwError("quota");
    expect(() => S.guardarDatos(S.datosIniciales())).toThrowError(
      /No fue posible guardar/,
    );
  });
  it("15. El carrito suma unidades y respeta stock, enteros y cantidades positivas", () => {
    let d = S.agregarAlCarrito(S.datosIniciales(), "MK-001", 2);
    d = S.agregarAlCarrito(d, "MK-001");
    expect(d.carrito).toEqual([{ id: "MK-001", cantidad: 3 }]);
    for (const c of [11, -1, 1.5])
      expect(() => S.cambiarCantidad(d, "MK-001", c)).toThrow();
    expect(() => S.agregarAlCarrito(d, "MK-001", 0)).toThrow();
    expect(() => S.agregarAlCarrito(d, "NO-EXISTE")).toThrow();
  });
  it("16. Cambiar a cero elimina un producto y mantiene el resto", () => {
    let d = S.agregarAlCarrito(S.datosIniciales(), "MK-001");
    d = S.agregarAlCarrito(d, "EA-001", 2);
    d = S.cambiarCantidad(d, "MK-001", 0);
    expect(d.carrito).toEqual([{ id: "EA-001", cantidad: 2 }]);
  });
  it("17. Calcula precios y mantiene el despacho fijo sin importar el subtotal", () => {
    let d = S.agregarAlCarrito(S.datosIniciales(), "AX-001", 2);
    expect(d.productos[2].precio).toBe(30000);
    expect(S.resumenCompra(d, "despacho")).toEqual({
      subtotal: 60000,
      envio: 3990,
      total: 63990,
    });
    expect(S.resumenCompra(d, "retiro").envio).toBe(0);
    d = S.agregarAlCarrito(d, "GS-001");
    expect(S.resumenCompra(d, "despacho").envio).toBe(3990);
  });
  it("18. Compra aprobada descuenta stock una vez y conserva una copia de los precios", () => {
    const d = S.agregarAlCarrito(S.datosIniciales(), "AX-001", 2);
    const r = S.finalizarCompra(d, comprador);
    expect(r.orden.total).toBe(63990);
    expect(r.datos.productos[2].stock).toBe(14);
    expect(r.datos.carrito).toEqual([]);
    expect(d.productos[2].stock).toBe(16);
    r.datos.productos[2].precio = 999;
    expect(r.orden.items[0].unitario).toBe(30000);
    expect(() => S.finalizarCompra(r.datos, comprador)).toThrowError(
      /Agrega productos/,
    );
  });
  it("19. Pago rechazado conserva carrito, órdenes y stock", () => {
    const d = S.agregarAlCarrito(S.datosIniciales(), "MK-001");
    const r = S.finalizarCompra(d, { ...comprador, pago: "rechazado" });
    expect(r.orden).toBeNull();
    expect(r.datos).toBe(d);
    expect(r.datos.ordenes.length).toBe(0);
    expect(r.datos.productos[0].stock).toBe(10);
  });
  it("20. La compra rechaza datos inválidos y stock cambiado", () => {
    const d = S.agregarAlCarrito(S.datosIniciales(), "MK-001", 2);
    expect(() =>
      S.finalizarCompra(d, { ...comprador, correo: "a@otro.cl" }),
    ).toThrow();
    d.productos[0].stock = 1;
    expect(() => S.finalizarCompra(d, comprador)).toThrowError(/stock cambió/);
  });
  it("21. Login verifica contraseña y normaliza el correo", () => {
    expect(
      S.iniciarSesion(S.datosIniciales(), " ADMIN@DUOC.CL ", "Admin123").sesion,
    ).toBe("USR-ADMIN");
    expect(() =>
      S.iniciarSesion(S.datosIniciales(), "admin@duoc.cl", "mala"),
    ).toThrowError(/incorrectos/);
  });
  it("22. Registro crea un cliente y rechaza correos o RUN duplicados", () => {
    const d = S.registrarUsuario(S.datosIniciales(), usuario);
    expect(S.usuarioActual(d).rol).toBe("cliente");
    expect(() => S.registrarUsuario(d, usuario)).toThrowError(/Ya existe/);
    expect(() =>
      S.registrarUsuario(d, { ...usuario, correo: "otro@gmail.com" }),
    ).toThrowError(/Ya existe/);
  });
  it("23. Un cliente no puede modificar productos o usuarios", () => {
    const d = S.registrarUsuario(S.datosIniciales(), usuario);
    expect(() => S.guardarProducto(d, d.productos[0])).toThrowError(
      /administrador/,
    );
    expect(() => S.eliminarUsuario(d, "USR-ADMIN")).toThrowError(
      /administrador/,
    );
  });
  it("24. CRUD de productos crea, lee, actualiza y elimina sin borrar órdenes", () => {
    let d = admin();
    const p = { ...d.productos[0], id: "TEST-001", nombre: "Producto prueba" };
    d = S.guardarProducto(d, p);
    expect(d.productos.length).toBe(6);
    d = S.guardarProducto(d, { ...p, precio: 5000 }, p.id);
    expect(d.productos.find((x) => x.id === p.id).precio).toBe(5000);
    d = S.agregarAlCarrito(d, p.id);
    d = S.eliminarProducto(d, p.id);
    expect(d.productos.length).toBe(5);
    expect(d.carrito.length).toBe(0);
    expect(() => S.guardarProducto(d, d.productos[0])).toThrowError(
      /ya existe/,
    );
  });
  it("25. Categorías propaga renombres y evita eliminar categorías en uso", () => {
    let d = admin();
    d = S.guardarCategoria(d, { id: "CAT-1", nombre: "Camisetas" });
    expect(d.productos[1].categoria).toBe("Camisetas");
    expect(() => S.eliminarCategoria(d, "CAT-1")).toThrowError(
      /tiene productos/,
    );
    d = S.guardarCategoria(d, { nombre: "Accesorios" });
    const c = d.categorias.find((c) => c.nombre === "Accesorios");
    d = S.eliminarCategoria(d, c.id);
    expect(d.categorias.length).toBe(2);
    expect(() => S.guardarCategoria(d, { nombre: "shorts" })).toThrowError(
      /ya existe/,
    );
  });
  it("26. Usuarios admite edición, protege el último administrador y la propia sesión", () => {
    let d = S.guardarUsuario(admin(), usuario);
    const id = d.usuarios[1].id;
    d = S.guardarUsuario(d, { ...d.usuarios[1], nombre: "Francisco" });
    expect(d.usuarios[1].nombre).toBe("Francisco");
    expect(() =>
      S.guardarUsuario(d, { ...d.usuarios[0], rol: "cliente" }),
    ).toThrowError(/al menos un administrador/);
    expect(() => S.eliminarUsuario(d, "USR-ADMIN")).toThrowError(
      /propia sesión/,
    );
    d = S.eliminarUsuario(d, id);
    expect(d.usuarios.length).toBe(1);
  });
  it("27. Valida RUN, nombres, dominios y límites de contraseña", () => {
    expect(V.validarRun("12.345.678-5")).toBeTrue();
    expect(V.validarRun("12.345.678-9")).toBeFalse();
    expect(V.validarNombre("Ana María")).toBeTrue();
    expect(V.validarNombre("Ana123")).toBeFalse();
    expect(V.validarCorreo("a@gmail.com")).toBeTrue();
    expect(V.validarCorreo("a@@gmail.com")).toBeFalse();
    expect(V.validarCorreo("a@gmail.com.evil")).toBeFalse();
    expect(V.validarClave("123")).toBeFalse();
    expect(V.validarClave("1234")).toBeTrue();
    expect(V.validarClave("12345678901")).toBeFalse();
  });
  it("28. Rechaza una comuna ajena a la región y una fecha futura", () => {
    expect(
      V.validarEntrega({ ...comprador, comuna: "2001" }).comuna,
    ).toBeDefined();
    expect(
      V.validarUsuario({ ...usuario, fecha: "2999-01-01" }).fecha,
    ).toBeDefined();
    expect(
      V.validarEntrega({
        ...comprador,
        entrega: "retiro",
        region: "",
        comuna: "",
        direccion: "",
      }),
    ).toEqual({});
  });
  it("29. Producto rechaza precio, stock e imagen inválidos", () => {
    const p = S.datosIniciales().productos[0];
    expect(
      V.validarProducto({
        ...p,
        precio: 0,
        stock: -1,
          imagen: "javascript:alert(1)",
      }),
    ).toEqual(
      jasmine.objectContaining({
        precio: jasmine.any(String),
        stock: jasmine.any(String),
        imagen: jasmine.any(String),
      }),
    );
  });
  it("30. Contacto rechaza mensajes vacíos o mayores a 500 caracteres", () => {
    expect(
      V.validarContacto({ ...comprador, mensaje: " " }).mensaje,
    ).toBeDefined();
    expect(
      V.validarContacto({ ...comprador, mensaje: "x".repeat(501) }).mensaje,
    ).toBeDefined();
    expect(V.validarContacto({ ...comprador, mensaje: "Hola" })).toEqual({});
  });
});
describe("Flujos completos y navegación protegida", () => {
  it("31. Pago rechazado muestra el error y permite volver a intentar", () => {
    const d = S.agregarAlCarrito(admin(), "MK-001");
    iniciarApp("/checkout", d);
    escribir(host.querySelector('[name="pago"]'), "rechazado");
    enviar(host.querySelector("form"));
    expect(window.location.pathname).toBe("/compra-error");
    expect(host.textContent).toContain("Tus productos siguen en el carrito");
    const guardados = JSON.parse(memoria[S.STORAGE_KEY]);
    expect(guardados.carrito.length).toBe(1);
    expect(guardados.ordenes.length).toBe(0);
    click(
      [...host.querySelectorAll("a")].find(
        (a) => a.textContent === "Volver a intentar",
      ),
    );
    expect(window.location.pathname).toBe("/checkout");
  });
  it("32. Una visita sin sesión a administración se redirige a login", () => {
    iniciarApp("/admin");
    expect(window.location.pathname).toBe("/login");
    expect(host.querySelector("h1").textContent).toBe("Qué bueno verte");
  });
  it("33. El vendedor consulta productos y órdenes sin editar usuarios", () => {
    const d = admin();
    d.usuarios[0].rol = "vendedor";
    iniciarApp("/admin/usuarios", d);
    expect(host.textContent).toContain("Acceso reservado al administrador");
    expect(host.querySelector('a[href="/admin/usuarios"]')).toBeNull();
  });
  it("34. Administración edita stock y persiste el cambio desde el formulario", () => {
    iniciarApp("/admin/productos/MK-001/editar", admin());
    escribir(host.querySelector('[name="stock"]'), "4");
    enviar(host.querySelector("form"));
    expect(window.location.pathname).toBe("/admin/productos");
    expect(JSON.parse(memoria[S.STORAGE_KEY]).productos[0].stock).toBe(4);
  });
  it("35. La región cambia y limpia la comuna antes de confirmar datos", () => {
    iniciarApp("/checkout", S.agregarAlCarrito(admin(), "MK-001"));
    expect(host.querySelector('[name="comuna"]').value).toBe("1028");
    escribir(host.querySelector('[name="region"]'), "2000");
    expect(host.querySelector('[name="comuna"]').value).toBe("");
    enviar(host.querySelector("form"));
    expect(host.textContent).toContain("Selecciona una comuna de la región.");
  });
  it("36. Página desconocida muestra un enlace de regreso", () => {
    iniciarApp("/ruta-inexistente");
    expect(host.textContent).toContain("Esta página no está aquí");
    expect(host.querySelector('main a[href="/"]')).not.toBeNull();
  });
});
describe("Administración y vistas complementarias", () => {
  it("37. Categorías permite crear, renombrar y eliminar una categoría sin productos", () => {
    iniciarApp("/admin/categorias", admin());
    escribir(host.querySelector('[name="nombre"]'), "Accesorios");
    enviar(host.querySelector("form"));
    let fila = [...host.querySelectorAll("tr")].find((r) =>
      r.textContent.includes("Accesorios"),
    );
    expect(fila).toBeDefined();
    click(
      [...fila.querySelectorAll("button")].find(
        (b) => b.textContent === "Editar",
      ),
    );
    escribir(host.querySelector('[name="nombre"]'), "Complementos");
    enviar(host.querySelector("form"));
    fila = [...host.querySelectorAll("tr")].find((r) =>
      r.textContent.includes("Complementos"),
    );
    click(
      [...fila.querySelectorAll("button")].find(
        (b) => b.textContent === "Eliminar",
      ),
    );
    click(boton("Confirmar eliminación"));
    expect(JSON.parse(memoria[S.STORAGE_KEY]).categorias.length).toBe(2);
  });
  it("38. Usuarios crea una cuenta desde el formulario administrativo", () => {
    iniciarApp("/admin/usuarios/nuevo", admin());
    for (const [nombre, valor] of Object.entries(usuario)) {
      const campo = host.querySelector(`[name="${nombre}"]`);
      if (campo) escribir(campo, valor);
    }
    enviar(host.querySelector("form"));
    expect(window.location.pathname).toBe("/admin/usuarios");
    expect(JSON.parse(memoria[S.STORAGE_KEY]).usuarios.length).toBe(2);
    expect(host.textContent).toContain("francisca@gmail.com");
  });
  it("39. Login inicia sesión y salir elimina la sesión persistida", () => {
    iniciarApp("/login");
    escribir(host.querySelector('[name="correo"]'), "admin@duoc.cl");
    escribir(host.querySelector('[name="clave"]'), "Admin123");
    enviar(host.querySelector("form"));
    expect(window.location.pathname).toBe("/cuenta");
    expect(host.textContent).toContain("Mis compras");
    click(boton("Salir"));
    expect(JSON.parse(memoria[S.STORAGE_KEY]).sesion).toBeNull();
  });
  it("40. El detalle de producto agrega la cantidad elegida al carrito", () => {
    iniciarApp("/productos/AX-001");
    escribir(host.querySelector("#cantidad"), "2");
    click(boton("Agregar al carrito"));
    expect(JSON.parse(memoria[S.STORAGE_KEY]).carrito).toEqual([
      { id: "AX-001", cantidad: 2 },
    ]);
    expect(host.textContent).toContain("$30.000");
  });
  it("41. El panel oculta órdenes y conserva historial y mensajes guardados", () => {
    let d = S.finalizarCompra(
      S.agregarAlCarrito(admin(), "MK-001"),
      comprador,
    ).datos;
    d.mensajes = [
      {
        id: "MSG-1",
        nombre: "Francisca",
        correo: "f@gmail.com",
        mensaje: "Consulta de ejemplo",
        fecha: new Date().toISOString(),
      },
    ];
    iniciarApp("/admin", d);
    expect(host.textContent).not.toContain("Últimas órdenes");
    expect(host.querySelector('a[href="/admin/ordenes"]')).toBeNull();
    click(host.querySelector('a[href="/admin/mensajes"]'));
    expect(host.textContent).toContain("Consulta de ejemplo");
    click(host.querySelector('a[href="/admin/usuarios"]'));
    click(
      [...host.querySelectorAll("td a")].find((a) =>
        a.textContent.includes("Administración"),
      ),
    );
    expect(host.textContent).toContain("Historial de compras");
  });
  it("42. Colección ordena precios y filtra stock sin mostrar agotados", () => {
    const d = S.datosIniciales();
    d.productos[0].stock = 0;
    iniciarApp("/productos", d);
    escribir(host.querySelector("#orden"), "menor");
    expect(host.querySelector("article").textContent).toContain(
      "Polera Armani Exchange",
    );
    click(host.querySelector('input[type="checkbox"]'));
    expect(host.querySelectorAll("article").length).toBe(4);
    escribir(host.querySelector("#categoria"), "Shorts");
    expect(host.querySelectorAll("article").length).toBe(1);
    expect(host.querySelector("article").textContent).toContain("Jordan");
  });
  it("43. Una visita recorre inicio, categorías y la historia del blog", () => {
    iniciarApp();
    expect(host.textContent).toContain("Tu estilo.");
    click(
      [...host.querySelectorAll("a")].find((a) =>
        a.textContent === "Categorías",
      ),
    );
    expect(host.textContent).toContain("Elige tu categoría");
    click(host.querySelector('main a[href^="/productos?categoria="]'));
    expect(host.querySelectorAll("article").length).toBe(3);
    click(host.querySelector('footer a[href="/blogs"]'));
    click(
      [...host.querySelectorAll("main a")].find((a) =>
        a.textContent.includes("Leer historia"),
      ),
    );
    expect(host.querySelector("h1").textContent).toBe(
      "El poder de los esenciales",
    );
  });
  it("44. El reporte calcula inventario y muestra stock crítico", () => {
    const d = admin();
    d.productos[0].stock = 2;
    iniciarApp("/admin/reportes", d);
    expect(host.textContent).toContain("Unidades disponibles:");
    expect(host.textContent).toContain("Short Michael Kors: 2 unidades");
    expect(boton("Descargar inventario CSV")).toBeNull();
  });
});

