let API_URL = "http://localhost:5136/api/InstrumentosApi";
let resultado;
let resultadoConsulta;

window.onload = function () {
  resultado = document.getElementById("resp");
  resultadoConsulta = document.getElementById("respConsulta");
  aplicarRol();
  getAll();
};

// ===== PERMISOS SEGÚN EL ROL =====
function aplicarRol() {
  const rol = sessionStorage.getItem("rol");
  const nombre = sessionStorage.getItem("nombre");

  // Si no ha iniciado sesión, lo manda al login
  if (!rol) {
    window.location.href = "login.html";
    return;
  }

  // Saludo con el nombre y el rol
  document.getElementById("saludo").innerText = "👤 " + nombre + " (" + rol + ")";

  // Si NO es administrador, esconde agregar / modificar / eliminar
  if (rol !== "Administrador") {
    const botonesAdmin = document.getElementsByClassName("soloAdmin");
    for (const b of botonesAdmin) {
      b.style.display = "none";
    }
  }
}

// ===== AUXILIARES =====

// Arma una fila de tabla con los campos del instrumento
function fila(i) {
  return `<tr>
    <td>${i.id}</td>
    <td>${i.nombre}</td>
    <td>${i.categoria}</td>
    <td>${i.marca}</td>
    <td>${i.provedor}</td>
    <td>${i.precio_compra}</td>
    <td>${i.precio_venta}</td>
    <td>${i.stock}</td>
    <td>${i.stock_minimo}</td>
    <td>${i.descripcion}</td>
    <td>${i.fechaCreacion}</td>
  </tr>`;
}

const ENCABEZADO = "<table border='1'><tr><th>ID</th><th>NOMBRE</th><th>CATEGORIA</th><th>MARCA</th><th>PROVEEDOR</th><th>PRECIO COMPRA</th><th>PRECIO VENTA</th><th>STOCK</th><th>STOCK MINIMO</th><th>DESCRIPCION</th><th>FECHA</th></tr>";

// Lee un input de texto sin espacios sobrantes
function txt(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

// Lee un input numérico decimal (si está vacío o inválido devuelve 0)
function num(id) {
  const v = parseFloat(txt(id));
  return isNaN(v) ? 0 : v;
}

// Lee un input numérico entero (si está vacío o inválido devuelve 0)
function ent(id) {
  const v = parseInt(txt(id));
  return isNaN(v) ? 0 : v;
}

// Revisa la respuesta del servidor y avisa si hubo error
// (fetch NO lanza error con 400/500, por eso hay que revisarlo a mano)
async function revisar(res, accion) {
  const texto = await res.text();
  if (!res.ok) {
    console.error(accion + " → Error " + res.status, texto);
    alert("Error al " + accion + " (" + res.status + "):\n" + texto);
    return false;
  }
  return true;
}

// Limpia los campos de un formulario según su sufijo (Add o Up)
function limpiar(sufijo) {
  const campos = ["txtNombre", "txtCategoria", "txtMarca", "txtProvedor",
    "txtPrecioCompra", "txtPrecioVenta", "txtStock", "txtStockMinimo", "txtDescripcion"];
  for (const c of campos) {
    const el = document.getElementById(c + sufijo);
    if (el) el.value = "";
  }
  const id = document.getElementById("txtId" + sufijo);
  if (id) id.value = "";
}

// Junta los datos del formulario en un objeto y valida lo mínimo
function leerFormulario(sufijo) {
  const datos = {
    nombre: txt("txtNombre" + sufijo),
    categoria: txt("txtCategoria" + sufijo),
    marca: txt("txtMarca" + sufijo),
    provedor: txt("txtProvedor" + sufijo),
    precio_compra: num("txtPrecioCompra" + sufijo),
    precio_venta: num("txtPrecioVenta" + sufijo),
    stock: ent("txtStock" + sufijo),
    stock_minimo: ent("txtStockMinimo" + sufijo),
    descripcion: txt("txtDescripcion" + sufijo)
  };

  if (!datos.nombre) {
    alert("El nombre es obligatorio");
    return null;
  }
  if (!datos.categoria) {
    alert("La categoría es obligatoria");
    return null;
  }

  return datos;
}

// ===== CONSULTAS =====

function getAll() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      let tabla = ENCABEZADO;
      for (const inst of data)
        tabla += fila(inst);
      tabla += "</table>";
      resultado.innerHTML = tabla;
    })
    .catch(err => console.error(err));
}

// Consulta por ID → muestra el resultado en el div de la sección de consulta
function getId() {
  const id = parseInt(document.getElementById("txtId1").value);

  if (isNaN(id)) {
    alert("Escribe un ID válido");
    return;
  }

  fetch(`${API_URL}/${id}`)
    .then(res => {
      if (!res.ok) throw new Error("No se encontró el instrumento con ID " + id);
      return res.json();
    })
    .then(data => {
      let tabla = ENCABEZADO;
      tabla += fila(data);
      tabla += "</table>";
      resultadoConsulta.innerHTML = tabla;
    })
    .catch(err => {
      console.error(err);
      resultadoConsulta.innerHTML = "<p>" + err.message + "</p>";
    });
}

// Consulta por NOMBRE → muestra el resultado en el div de la sección de consulta
function getNombre() {
  const nombre = document.getElementById("txtNombre1").value.trim();

  if (!nombre) {
    alert("Escribe un nombre para buscar");
    return;
  }

  fetch(`${API_URL}/nombre/${encodeURIComponent(nombre)}`)
    .then(res => {
      if (!res.ok) throw new Error("No se encontró el instrumento: " + nombre);
      return res.json();
    })
    .then(data => {
      let tabla = ENCABEZADO;
      // Por si la API devuelve una lista en lugar de un solo objeto
      if (Array.isArray(data)) {
        for (const inst of data) tabla += fila(inst);
      } else {
        tabla += fila(data);
      }
      tabla += "</table>";
      resultadoConsulta.innerHTML = tabla;
    })
    .catch(err => {
      console.error(err);
      resultadoConsulta.innerHTML = "<p>" + err.message + "</p>";
    });
}

// ===== AGREGAR =====

function add() {
  const datos = leerFormulario("Add");
  if (!datos) return;

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
    .then(async res => {
      if (!await revisar(res, "agregar")) return;
      limpiar("Add");
      getAll();
      alert("Instrumento agregado correctamente");
    })
    .catch(err => {
      console.error(err);
      alert("No se pudo conectar con la API. Revisa que esté corriendo en " + API_URL);
    });
}

// ===== MODIFICAR =====

function update() {
  const id = parseInt(document.getElementById("txtIdUp").value);

  if (isNaN(id)) {
    alert("Escribe el ID del instrumento a modificar");
    return;
  }

  const datos = leerFormulario("Up");
  if (!datos) return;

  // Varias APIs exigen que el id venga también en el cuerpo
  datos.id = id;

  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
    .then(async res => {
      if (!await revisar(res, "modificar")) return;
      limpiar("Up");
      getAll();
      alert("Instrumento modificado correctamente");
    })
    .catch(err => {
      console.error(err);
      alert("No se pudo conectar con la API. Revisa que esté corriendo en " + API_URL);
    });
}

// ===== ELIMINAR =====

function delete1() {
  const id = parseInt(document.getElementById("txtIdDel").value);

  if (isNaN(id)) {
    alert("Escribe el ID del instrumento a eliminar");
    return;
  }

  if (!confirm("¿Seguro que quieres eliminar el instrumento con ID " + id + "?")) return;

  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(async res => {
      if (!await revisar(res, "eliminar")) return;
      document.getElementById("txtIdDel").value = "";
      getAll();
      alert("Instrumento eliminado correctamente");
    })
    .catch(err => {
      console.error(err);
      alert("No se pudo conectar con la API. Revisa que esté corriendo en " + API_URL);
    });
}

// ===== MENÚ: muestra una sección y esconde las demás =====
function mostrarSeccion(id) {
  const secciones = document.getElementsByClassName("seccion");
  for (const s of secciones) {
    s.classList.add("oculta");      // esconde todas
  }
  document.getElementById(id).classList.remove("oculta"); // muestra la elegida
}
