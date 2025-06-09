// ===== FUNCIONES DE REDIRECCIÓN =====
function redireccionarALinkedin() {
    window.location.href = "opcion1.html";
}

function redireccionarAFarmacity() {
    window.location.href = "https://www.farmacity.com/";
}

function redireccionarALogin() {
    // Compatible con Django
    window.location.href = "/login2/";
}

// ===== SISTEMA DE CARRITO =====
const listaProductos = document.querySelector(".container-products");
const contentProducts = document.getElementById("carrito-productos");
const VaciarCarrito = document.getElementById("vaciar-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const totalCarrito = document.getElementById("total-carrito");

let productsArray = [];

// Inicialización del carrito
document.addEventListener("DOMContentLoaded", function() {
    eventListeners();
    
    // Cargar productos guardados del localStorage
    const productosGuardados = localStorage.getItem("productos");
    if (productosGuardados) {
        productsArray = JSON.parse(productosGuardados);
        renderCarrito();
        actualizarCarrito();
        actualizarTotal();
    }
});

// Event listeners del carrito
function eventListeners() {
    if (listaProductos) {
        listaProductos.addEventListener("click", getDataElements);
    }
    if (VaciarCarrito) {
        VaciarCarrito.addEventListener("click", () => {
            productsArray = [];
            renderCarrito();
            actualizarCarrito();
            actualizarTotal();
            saveLocalStorage();
        });
    }
}

// Obtener datos del producto y agregarlo al carrito
function getDataElements(e) {
    if (e.target.classList.contains("fa-basket-shopping")) {
        const icono = e.target;
        const producto = e.target.closest(".card-product");

        const infoProducto = {
            imagen: producto.querySelector("img").src,
            nombre: producto.querySelector("h3").textContent,
            precio: parseFloat(icono.dataset.precio),
            id: parseInt(icono.dataset.id, 10),
            cantidad: 1
        };

        const index = productsArray.findIndex(p => p.id === infoProducto.id);
        if (index !== -1) {
            productsArray[index].cantidad += 1;
        } else {
            productsArray.push(infoProducto);
        }

        showAlert("Producto agregado al carrito", "success");
        renderCarrito();
        actualizarCarrito();
        actualizarTotal();
        saveLocalStorage();
    }
}

// Obtener icono según el tipo de producto
function obtenerIcono(nombre) {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes("silla")) return '<i class="fa-solid fa-chair"></i>';
    if (nombreLower.includes("sillón")) return '<i class="fa-solid fa-couch"></i>';
    if (nombreLower.includes("escritorio")) return '<i class="fa-solid fa-desktop"></i>';
    return '<i class="fa-solid fa-box"></i>';
}

// Renderizar productos en el carrito
function renderCarrito() {
    if (!contentProducts) return;
    
    contentProducts.innerHTML = "";

    productsArray.forEach(producto => {
        const { imagen, nombre, precio, id, cantidad } = producto;

        const tr = document.createElement("tr");

        const tdImagen = document.createElement("td");
        const img = document.createElement("img");
        img.src = imagen;
        img.className = "img product";
        tdImagen.appendChild(img);

        const tdNombre = document.createElement("td");
        tdNombre.innerHTML = `<span title="Precio unitario: $${precio.toFixed(2)}">${obtenerIcono(nombre)} ${nombre}</span>`;

        const tdPrecio = document.createElement("td");
        tdPrecio.textContent = `$${precio.toFixed(2)}`;

        const tdCantidad = document.createElement("td");
        tdCantidad.innerHTML = `<span class="badge-cantidad">x${cantidad}</span>`;

        const tdEliminar = document.createElement("td");
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "✖";
        btnEliminar.className = "btn-eliminar";
        btnEliminar.addEventListener("click", () => eliminarProducto(id));
        tdEliminar.appendChild(btnEliminar);

        tr.append(tdImagen, tdNombre, tdPrecio, tdCantidad, tdEliminar);
        contentProducts.appendChild(tr);
    });
}

// Actualizar contador del carrito
function actualizarCarrito() {
    const totalUnidades = productsArray.reduce((sum, producto) => sum + producto.cantidad, 0);

    const contadorCarrito = document.getElementById("contador-carrito");
    if (contadorCarrito) contadorCarrito.textContent = `(${totalUnidades})`;

    const contadorProductos = document.getElementById("contador-productos");
    if (contadorProductos) contadorProductos.textContent = totalUnidades;
}

// Actualizar total del carrito
function actualizarTotal() {
    const totalElement = document.getElementById("total-carrito");
    if (!totalElement) return;

    const total = productsArray.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    totalElement.textContent = `$${total.toLocaleString('es-AR')}`;
}

// Actualizar cantidad de un producto
function actualizarCantidad(e) {
    const id = parseInt(e.target.dataset.id, 10);
    const nuevaCantidad = parseInt(e.target.value);

    const producto = productsArray.find(p => p.id === id);
    if (producto && nuevaCantidad > 0) {
        producto.cantidad = nuevaCantidad;
        renderCarrito();
        actualizarTotal();
        saveLocalStorage();
    }
}

// Eliminar producto del carrito
function eliminarProducto(id) {
    const index = productsArray.findIndex(p => p.id === id);

    if (index !== -1) {
        if (productsArray[index].cantidad > 1) {
            productsArray[index].cantidad -= 1;
        } else {
            productsArray.splice(index, 1);
        }

        showAlert("Producto eliminado del carrito", "success");
        renderCarrito();
        actualizarCarrito();
        actualizarTotal();
        saveLocalStorage();
    }
}

// Guardar en localStorage
function saveLocalStorage() {
    localStorage.setItem("productos", JSON.stringify(productsArray));
}

// Mostrar alertas
function showAlert(message, type) {
    const oldAlert = document.querySelector(".alert");
    if (oldAlert) oldAlert.remove();

    const div = document.createElement("div");
    div.classList.add("alert", type);
    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 3000);
}

// ===== COMPATIBILIDAD CON OTRAS PÁGINAS =====
// Compatibilidad con productos.html y otras páginas
document.addEventListener("click", function(e) {
    if (e.target.classList.contains("btn-add-cart")) {
        const producto = e.target.closest(".item");

        const infoProducto = {
            imagen: producto.querySelector("img").src,
            nombre: producto.querySelector("h2").textContent,
            precio: parseFloat(producto.querySelector(".price").textContent.replace("$", "").replace(/\./g, "")),
            id: parseInt(e.target.dataset.id, 10),
            cantidad: 1
        };

        const index = productsArray.findIndex(p => p.id === infoProducto.id);
        if (index !== -1) {
            productsArray[index].cantidad += 1;
        } else {
            productsArray.push(infoProducto);
        }

        showAlert("Producto agregado al carrito", "success");
        renderCarrito();
        actualizarCarrito();
        actualizarTotal();
        saveLocalStorage();
    }
});

// ===== SISTEMA DE BÚSQUEDA =====
document.addEventListener("DOMContentLoaded", () => {
    const inputBuscador = document.getElementById('buscador');
    const listaSugerencias = document.getElementById('sugerencias');
    const overlay = document.getElementById('autocomplete-overlay');
    const clearButton = document.getElementById('clear-search');

    // Función para normalizar texto (quitar acentos)
    function normalizar(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    if (inputBuscador && listaSugerencias && overlay) {

        // Evento para limpiar búsqueda
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                inputBuscador.value = '';
                overlay.textContent = '';
                listaSugerencias.innerHTML = '';
                listaSugerencias.classList.remove('mostrar');
                clearButton.classList.remove('visible');
                inputBuscador.focus();
            });
        }

        // Evento input para buscar en tiempo real
        inputBuscador.addEventListener('input', () => {
            const filtro = normalizar(inputBuscador.value);
            const productos = document.querySelectorAll('.card-product');

            listaSugerencias.innerHTML = '';
            overlay.textContent = '';

            if (clearButton) {
                if (inputBuscador.value.trim() !== '') {
                    clearButton.classList.add('visible');
                } else {
                    clearButton.classList.remove('visible');
                }
            }

            if (filtro === '') {
                listaSugerencias.classList.remove('mostrar');
                return;
            }

            let primerCoincidencia = null;
            let sugerenciasEncontradas = [];

            productos.forEach(producto => {
                const nombre = producto.querySelector('h3').textContent;
                const nombreNormalizado = normalizar(nombre);

                if (nombreNormalizado.includes(filtro)) {
                    if (!primerCoincidencia && nombreNormalizado.startsWith(filtro)) {
                        primerCoincidencia = nombre;
                    }

                    sugerenciasEncontradas.push({
                        nombre: nombre,
                        url: producto.dataset.url || 'productos.html',
                        exacto: nombreNormalizado.startsWith(filtro)
                    });
                }
            });

            // Ordenar sugerencias: primero las que empiezan con el filtro
            sugerenciasEncontradas.sort((a, b) => {
                if (a.exacto && !b.exacto) return -1;
                if (!a.exacto && b.exacto) return 1;
                return 0;
            });

            // Mostrar sugerencias
            sugerenciasEncontradas.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.nombre;
                li.addEventListener('click', () => {
                    window.location.href = item.url;
                });
                listaSugerencias.appendChild(li);
            });

            if (listaSugerencias.children.length > 0) {
                listaSugerencias.classList.add('mostrar');
            } else {
                listaSugerencias.classList.remove('mostrar');
            }

            // Autocompletado en overlay
            if (primerCoincidencia) {
                const escrito = inputBuscador.value;
                const suggestion = primerCoincidencia;

                if (
                    normalizar(suggestion).startsWith(normalizar(escrito)) &&
                    escrito !== suggestion
                ) {
                    overlay.textContent = escrito + suggestion.slice(escrito.length);
                } else {
                    overlay.textContent = '';
                }
            } else {
                overlay.textContent = '';
            }
        });

        // Evento para autocompletar con teclado
        inputBuscador.addEventListener('keydown', (e) => {
            const text = inputBuscador.value;
            const suggestion = overlay.textContent;

            const shouldAutocomplete = (
                suggestion.toLowerCase().startsWith(text.toLowerCase()) &&
                suggestion.length > text.length
            );

            if (shouldAutocomplete && ["Tab", "Enter", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                inputBuscador.value = suggestion;
                overlay.textContent = '';
                listaSugerencias.innerHTML = '';
                listaSugerencias.classList.remove('mostrar');
            }

            // Navegación con flechas en las sugerencias
            const sugerenciasVisibles = listaSugerencias.querySelectorAll('li');
            let selectedIndex = Array.from(sugerenciasVisibles).findIndex(li => li.classList.contains('selected'));

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (selectedIndex < sugerenciasVisibles.length - 1) {
                    if (selectedIndex >= 0) sugerenciasVisibles[selectedIndex].classList.remove('selected');
                    selectedIndex++;
                    sugerenciasVisibles[selectedIndex].classList.add('selected');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (selectedIndex > 0) {
                    sugerenciasVisibles[selectedIndex].classList.remove('selected');
                    selectedIndex--;
                    sugerenciasVisibles[selectedIndex].classList.add('selected');
                }
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                sugerenciasVisibles[selectedIndex].click();
            }
        });
    }

    // Cerrar sugerencias si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-form')) {
            if (listaSugerencias) {
                listaSugerencias.classList.remove('mostrar');
            }
        }
    });

    // Búsqueda al hacer clic en el botón de búsqueda
    const btnSearch = document.querySelector('.btn-search');
    if (btnSearch && inputBuscador) {
        btnSearch.addEventListener('click', (e) => {
            e.preventDefault();
            const query = inputBuscador.value.trim();
            if (query) {
                // Redirigir a página de productos con parámetro de búsqueda
                window.location.href = `productos.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
});

// ===== FUNCIONES ADICIONALES =====
// Función para formatear precios
function formatearPrecio(precio) {
    return `$${precio.toLocaleString('es-AR')}`;
}

// Función para obtener parámetros de URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Inicialización adicional
document.addEventListener('DOMContentLoaded', function() {
    // Si hay un parámetro de búsqueda en la URL, mostrarlo en el buscador
    const searchParam = getUrlParameter('search');
    if (searchParam) {
        const inputBuscador = document.getElementById('buscador');
        if (inputBuscador) {
            inputBuscador.value = searchParam;
        }
    }
});