import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Titulo, Campo, Aviso, Vacio } from "../components/UI";
import { validarContacto } from "../data/validaciones";
import { nuevoId } from "../data/store";
export function Nosotros() {
  return (
    <div className="container section-space">
      <div className="row g-5 align-items-center">
        <div className="col-md-6">
          <p className="eyebrow">SOBRE NOSOTROS</p>
          <h1>
            Una tienda.
            <br />
            Muchas formas
            <br />
            de ser tú.
          </h1>
          <p className="lead mt-4">
            New York Store reúne ropa y productos de distintas marcas para
            acompañarte en tu día a día.
          </p>
          <p className="text-secondary">
            Este proyecto continúa la tienda creada en HTML, CSS y JavaScript.
            La nueva versión conserva su identidad y catálogo, y transforma sus
            páginas en componentes React.
          </p>
          <Link to="/productos" className="btn btn-dark mt-3">
            Conoce la colección
          </Link>
        </div>
        <div className="col-md-6">
          <div className="about-image">
            <img
              src="/img/mk-001.jpg"
              alt="Short Michael Kors de New York Store"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export function Contacto({ actualizar }) {
  const [form, setForm] = useState({ nombre: "", correo: "", mensaje: "" });
  const [errores, setErrores] = useState({});
  const [exito, setExito] = useState(false);
  const cambiar = (n, v) => {
    setForm((f) => ({ ...f, [n]: v }));
    setExito(false);
  };
  function enviar(e) {
    e.preventDefault();
    setExito(false);
    const er = validarContacto(form);
    setErrores(er);
    if (
      !Object.keys(er).length &&
      actualizar((d) => ({
        ...d,
        mensajes: [
          ...d.mensajes,
          { ...form, id: nuevoId("MSG"), fecha: new Date().toISOString() },
        ],
      }))
    ) {
      setExito(true);
      setForm({ nombre: "", correo: "", mensaje: "" });
    }
  }
  return (
    <div className="container section-space">
      <div className="row g-5">
        <div className="col-md-5">
          <Titulo
            titulo="Conversemos"
            descripcion="¿Una pregunta sobre una prenda o tu pedido? Déjanos un mensaje."
          />
        </div>
        <div className="col-md-7">
          <form noValidate onSubmit={enviar} className="panel-card">
            <Aviso
              tipo="success"
              mensaje={
                exito
                  ? "Tu mensaje quedó guardado. Gracias por escribirnos."
                  : ""
              }
            />
            <Campo
              nombre="nombre"
              etiqueta="Nombre"
              valor={form.nombre}
              cambiar={cambiar}
              error={errores.nombre}
            />
            <Campo
              nombre="correo"
              etiqueta="Correo electrónico"
              tipo="email"
              valor={form.correo}
              cambiar={cambiar}
              error={errores.correo}
            />
            <Campo
              nombre="mensaje"
              etiqueta="Mensaje"
              tipo="textarea"
              valor={form.mensaje}
              cambiar={cambiar}
              error={errores.mensaje}
              maxLength={500}
            />
            <p className="form-text">{form.mensaje.length}/500 caracteres</p>
            <button className="btn btn-dark" type="submit">
              Enviar mensaje ↗
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
const articulos = [
  {
    id: "esenciales",
    titulo: "El poder de los esenciales",
    etiqueta: "GUÍA DE ESTILO",
    imagen: "/img/ea-001.jpg",
    intro:
      "Un clóset versátil comienza con prendas que combinan con tu día a día.",
    texto:
      "Una polera y un short pueden ser el punto de partida de muchos looks. Prueba combinaciones de colores neutros y agrega una prenda que refleje tu personalidad. Lo importante es sentirte cómodo con lo que eliges.",
  },
  {
    id: "cuidado",
    titulo: "Cuida tus prendas favoritas",
    etiqueta: "CUIDADO DIARIO",
    imagen: "/img/jordan-001.jpg",
    intro: "Pequeños hábitos para acompañar tus prendas durante más tiempo.",
    texto:
      "Revisa siempre las instrucciones de lavado en la etiqueta de cada prenda. Separa los colores, evita el exceso de detergente y guarda la ropa seca. El cuidado indicado por el fabricante es la mejor referencia para cada material.",
  },
];
export function Blogs() {
  return (
    <div className="container section-space">
      <Titulo
        titulo="Historias para tu estilo"
        descripcion="Ideas sencillas para vestirte y cuidar lo que te gusta."
      />
      <div className="row g-4">
        {articulos.map((a) => (
          <article key={a.id} className="col-md-6">
            <Link className="blog-image" to={`/blogs/${a.id}`}>
              <img src={a.imagen} alt={a.titulo} />
            </Link>
            <p className="eyebrow mt-4">{a.etiqueta}</p>
            <h2 className="h3">{a.titulo}</h2>
            <p className="text-secondary">{a.intro}</p>
            <Link to={`/blogs/${a.id}`}>Leer historia ↗</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
export function BlogDetalle() {
  const { id } = useParams();
  const a = articulos.find((a) => a.id === id);
  return (
    <div className="container section-space">
      <div className="form-sheet">
        {a ? (
          <>
            <Link to="/blogs">← Todas las historias</Link>
            <Titulo numero={a.etiqueta} titulo={a.titulo} />
            <img
              className="img-fluid mb-4 blog-detail"
              src={a.imagen}
              alt={a.titulo}
            />
            <p className="lead">{a.intro}</p>
            <p>{a.texto}</p>
            <Link className="btn btn-dark" to="/productos">
              Explorar colección
            </Link>
          </>
        ) : (
          <Vacio titulo="Historia no encontrada">
            <Link to="/blogs">Volver al blog</Link>
          </Vacio>
        )}
      </div>
    </div>
  );
}
