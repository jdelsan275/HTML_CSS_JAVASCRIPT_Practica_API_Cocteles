// elementos del DOM
const entradaBusqueda = document.getElementById("entradaBusqueda");
const botonBuscar = document.getElementById("botonBuscar");
const botonAleatorio = document.getElementById("botonAleatorio");
const botonRecargarAleatorios = document.getElementById("botonRecargarAleatorios");
const contenedorResultados = document.getElementById("contenedorResultados");
const contenedorAleatorios = document.getElementById("contenedorAleatorios");
const contenedorAlertas = document.getElementById("contenedorAlertas");
const contenedorDestacado = document.getElementById("contenedorDestacado");
const botonMenu = document.getElementById("botonMenu");
const menuNavegacion = document.getElementById("menuNavegacion");
const modalFondo = document.getElementById("modalFondo");
const botonCerrarModal = document.getElementById("botonCerrarModal");
const contenidoModal = document.getElementById("contenidoModal");

const api = "https://www.thecocktaildb.com/api/json/v1/1/"; // url de la api

// alertas
function mostrarAlerta(mensaje, tipo = "warning") {
  contenedorAlertas.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
}

// buscador
async function buscarCocteles(nombre) {
  try {
    const respuesta = await fetch(`${api}search.php?s=${encodeURIComponent(nombre)}`);
    if (!respuesta.ok) {
      throw new Error("Error de conexión");
    }
    const datos = await respuesta.json();
    return datos.drinks || [];
  } catch (error) {
    mostrarAlerta("Ha ocurrido un problema de conexión. Inténtalo de nuevo más tarde.", "danger");
    console.error(error);
    return [];
  }
}

botonBuscar.addEventListener("click", async () => {
  const termino = entradaBusqueda.value.trim();
  if (!termino) {
    mostrarAlerta("Por favor, escribe un nombre de cóctel para buscar.", "warning");
    return;
  }
  const cocteles = await buscarCocteles(termino);
  mostrarResultados(cocteles);
});

entradaBusqueda.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    botonBuscar.click();
  }
});

function mostrarResultados(listaCocteles) {
  if (!listaCocteles.length) {
    mostrarAlerta("No se han encontrado cócteles con ese término.", "info");
    return;
  } else {
    contenedorResultados.innerHTML = `<h2 class="titulo-seccion">Resultados de búsqueda</h2>`;
  }
  listaCocteles.forEach((coctel) => {
    const card = cardCoctel(coctel);
    contenedorResultados.appendChild(card);
  });
}

// cóctel aleatorio sugerido
async function coctelAleatorio() {
  try {
    const respuesta = await fetch(`${api}random.php`);
    if (!respuesta.ok) {
      throw new Error("Error de conexión");
    }
    const datos = await respuesta.json();
    return datos.drinks ? datos.drinks[0] : null;
  } catch (error) {
    mostrarAlerta("Ha ocurrido un problema de conexión. Inténtalo de nuevo más tarde.", "danger");
    console.error(error);
    return null;
  }
}

botonAleatorio.addEventListener("click", async () => {
  const coctel = await coctelAleatorio();
  if (coctel) {
    mostrarDestacado(coctel);
  }
});

function mostrarDestacado(coctel) {
  contenedorDestacado.innerHTML = `<h2 class="titulo-seccion text-center">Cóctel sugerido</h2>`;
  if (!coctel) return;
  const cardDestacada = cardCoctelDestacado(coctel);
  contenedorDestacado.appendChild(cardDestacada);
}

// carga de cocteles aleatorios
async function coctelesAleatorios(numero = 12) {
  contenedorAleatorios.innerHTML = "";
  const peticiones = [];
  for (let i = 0; i < numero; i++) {
    peticiones.push(coctelAleatorio());
  }
  const resultados = await Promise.all(peticiones);
  resultados
    .filter((c) => c)
    .forEach((coctel) => {
      const card = cardCoctel(coctel);
      contenedorAleatorios.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  coctelesAleatorios(12);
});

botonRecargarAleatorios.addEventListener("click", () => {
  coctelesAleatorios(12);
});

// mostrar detalle en modal
function listaIngredientes(coctel) {
  const lista = [];
  for (let i = 1; i <= 15; i++) {
    const ingrediente = coctel[`strIngredient${i}`];
    const medida = coctel[`strMeasure${i}`] || "";
    if (ingrediente) {
      lista.push(`${ingrediente}${medida ? " - " + medida : ""}`);
    }
  }
  return lista;
}

function mostrarDetalleCoctel(coctel) {
  const ingredientes = listaIngredientes(coctel);
  const esAlcoholico = coctel.strAlcoholic || "Desconocido";

  contenidoModal.innerHTML = `
    <div class="container-fluid">
      <div class="row g-3">
        <div class="col-12 col-md-5">
          <img src="${coctel.strDrinkThumb}" alt="${coctel.strDrink}" class="img-fluid imagen-modal" />
        </div>
        <div class="col-12 col-md-7">
          <h3 class="titulo-modal mb-1">${coctel.strDrink}</h3>
          <p class="mb-1"><strong>Categoría:</strong> ${coctel.strCategory || "Sin categoría"}</p>
          <p class="mb-1"><strong>Tipo:</strong> ${esAlcoholico}</p>
          <p class="mb-2"><strong>Vaso:</strong> ${coctel.strGlass || "Sin especificar"}</p>

          <h5 class="mt-3">Ingredientes</h5>
          <ul class="lista-ingredientes">
            ${ingredientes.map((ing) => `<li>${ing}</li>`).join("")}
          </ul>

          <h5 class="mt-3">Instrucciones</h5>
          <p>${coctel.strInstructions || "Sin instrucciones disponibles."}</p>
        </div>
      </div>
    </div>
  `;

  modalFondo.classList.remove("oculto");
}

botonCerrarModal.addEventListener("click", () => {
  modalFondo.classList.add("oculto");
});

modalFondo.addEventListener("click", (e) => {
  if (e.target === modalFondo) {
    modalFondo.classList.add("oculto");
  }
});

// creación de card destacado
function cardCoctelDestacado(coctel) {
  const card = document.createElement("div");
  card.className = "card card-coctel card-coctel-destacado text-light";

  card.innerHTML = `
    <span class="cinta-destacado">¡Pruébalo ahora!</span>
    <img src="${coctel.strDrinkThumb}" class="card-img-top" alt="${coctel.strDrink}" />
    <div class="card-body text-center">
      <h4 class="card-title mb-1">${coctel.strDrink}</h4>
      <p class="mb-1 etiqueta-categoria">${coctel.strCategory || ""}</p>
      <p class="mb-2"><small>${coctel.strAlcoholic || ""} · ${coctel.strGlass || ""}</small></p>
      <button class="btn btn-sm btn-outline-light boton-ver-mas" data-id="${coctel.idDrink}">
        Ver detalles
      </button>
    </div>
  `;

  const botonVerMas = card.querySelector(".boton-ver-mas");
  botonVerMas.addEventListener("click", () => {
    mostrarDetalleCoctel(coctel);
  });

  return card;
}

// creación de cards
function cardCoctel(coctel) {
  const col = document.createElement("div");
  col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

  col.innerHTML = `
    <div class="card card-coctel h-100">
      <img src="${coctel.strDrinkThumb}" class="card-img-top" alt="${coctel.strDrink}" />
      <div class="card-body d-flex flex-column">
        <h5 class="card-title text-white">${coctel.strDrink}</h5>
        <p class="card-text etiqueta-categoria">${coctel.strCategory || ""}</p>
        <div class="mt-auto">
          <button class="btn btn-sm btn-outline-warning boton-ver-mas" data-id="${coctel.idDrink}">
            Ver más
          </button>
        </div>
      </div>
    </div>
  `;

  const botonVerMas = col.querySelector(".boton-ver-mas");
  botonVerMas.addEventListener("click", () => {
    mostrarDetalleCoctel(coctel);
  });

  return col;
}

// menú hamburguesa
botonMenu.addEventListener("click", () => {
  botonMenu.classList.toggle("activo");
  menuNavegacion.classList.toggle("activo");
});

menuNavegacion.addEventListener("click", (e) => {
  if (e.target.classList.contains("enlace-menu")) {
    botonMenu.classList.remove("activo");
    menuNavegacion.classList.remove("activo");
  }
});