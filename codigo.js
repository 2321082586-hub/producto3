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

// Función auxiliar: arma una fila de tabla con los campos del instrumento
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
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(data => {
      let tabla = ENCABEZADO;
      tabla += fila(data);
      tabla += "</table>";
      resultadoConsulta.innerHTML = tabla;
    })
    .catch(err => console.error(err));
}

// Consulta por NOMBRE → muestra el resultado en el div de la sección de consulta
function getNombre() {
  const nombre = document.getElementById("txtNombre1").value;
  fetch(`${API_URL}/nombre/${encodeURIComponent(nombre)}`)
    .then(res => res.json())
    .then(data => {
      let tabla = ENCABEZADO;
      tabla += fila(data);
      tabla += "</table>";
      resultadoConsulta.innerHTML = tabla;
    })
    .catch(err => console.error(err));
}

function add() {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: document.getElementById("txtNombreAdd").value,
      categoria: document.getElementById("txtCategoriaAdd").value,
      marca: document.getElementById("txtMarcaAdd").value,
      provedor: document.getElementById("txtProvedorAdd").value,
      precio_compra: parseFloat(document.getElementById("txtPrecioCompraAdd").value),
      precio_venta: parseFloat(document.getElementById("txtPrecioVentaAdd").value),
      stock: parseInt(document.getElementById("txtStockAdd").value),
      stock_minimo: parseInt(document.getElementById("txtStockMinimoAdd").value),
      descripcion: document.getElementById("txtDescripcionAdd").value
    })
  })
    .then(() => getAll())
    .catch(err => console.error(err));
}

function update() {
  const id = document.getElementById("txtIdUp").value;
  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: document.getElementById("txtNombreUp").value,
      categoria: document.getElementById("txtCategoriaUp").value,
      marca: document.getElementById("txtMarcaUp").value,
      provedor: document.getElementById("txtProvedorUp").value,
      precio_compra: parseFloat(document.getElementById("txtPrecioCompraUp").value),
      precio_venta: parseFloat(document.getElementById("txtPrecioVentaUp").value),
      stock: parseInt(document.getElementById("txtStockUp").value),
      stock_minimo: parseInt(document.getElementById("txtStockMinimoUp").value),
      descripcion: document.getElementById("txtDescripcionUp").value
    })
  })
    .then(() => getAll())
    .catch(err => console.error(err));
}

function delete1() {
  const id = parseInt(document.getElementById("txtIdDel").value);
  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(() => getAll())
    .catch(err => console.error(err));
}
// ===== MENÚ: muestra una sección y esconde las demás =====
function mostrarSeccion(id) {
  const secciones = document.getElementsByClassName("seccion");
  for (const s of secciones) {
    s.classList.add("oculta");      // esconde todas
  }
  document.getElementById(id).classList.remove("oculta"); // muestra la elegida
}
