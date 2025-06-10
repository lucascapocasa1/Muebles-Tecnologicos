// Variables globales
let currentRequestId = null;
let myBidsVisible = false;
let misSubastas = JSON.parse(localStorage.getItem('misSubastas')) || [];

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', function () {
    inicializarEventos();
    cargarPedidos();
    actualizarContadoresTiempo();
    setInterval(actualizarContadoresTiempo, 60000);
    inicializarBuscador();

    if (document.getElementById('myAuctionsGrid')) {
        cargarMisSubastas();
        actualizarContadorSubastas();
    }

    
    if (document.getElementById('createAuctionForm')) {
        inicializarFormularioCrearSubasta();
    }
});

// ============ EVENTOS GENERALES ============
function inicializarEventos() {
    const botonFiltro = document.querySelector('.filter-btn');
    if (botonFiltro) botonFiltro.addEventListener('click', aplicarFiltros);

    const formularioOferta = document.getElementById('bidForm');
    if (formularioOferta) formularioOferta.addEventListener('submit', manejarEnvioOferta);

    const inputPrecio = document.getElementById('bidPrice');
    if (inputPrecio) inputPrecio.addEventListener('input', validarPrecioOferta);

    window.addEventListener('click', function (evento) {
        const modalOferta = document.getElementById('bidModal');
        const modalCrear = document.getElementById('createAuctionModal');

        if (evento.target === modalOferta) cerrarModalOferta();
        if (evento.target === modalCrear) cerrarModalCrearSubasta();
    });
}

// ============ EMPRESAS: OFERTAR ============
function abrirModalOferta(requestId) {
    currentRequestId = requestId;
    const modal = document.getElementById('bidModal');
    const card = document.querySelector(`[data-request-id="${requestId}"]`);
    if (!card || !modal) return;

    const rango = card.querySelector('.price').textContent;
    const precioMaximo = extraerPrecioMaximo(rango);
    const hint = modal.querySelector('.price-hint');
    if (hint) hint.textContent = `Debe ser menor a $${precioMaximo}`;

    const inputPrecio = document.getElementById('bidPrice');
    if (inputPrecio) inputPrecio.max = precioMaximo - 1;

    reiniciarFormularioOferta();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModalOferta() {
    const modal = document.getElementById('bidModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentRequestId = null;
        reiniciarFormularioOferta();
    }
}

function reiniciarFormularioOferta() {
    const form = document.getElementById('bidForm');
    if (form) {
        form.reset();
        limpiarErrores();
    }
}

function manejarEnvioOferta(evento) {
    evento.preventDefault();
    if (!validarFormularioOferta()) return;

    const datos = new FormData(evento.target);
    const oferta = {
        requestId: currentRequestId,
        price: parseFloat(datos.get('bidPrice')),
        materials: datos.get('materials'),
        deliveryTime: parseInt(datos.get('deliveryTime')),
        additionalDetails: datos.get('additionalDetails')
    };

    enviarOferta(oferta);
}

function enviarOferta(oferta) {
    const boton = document.querySelector('.submit-btn');
    const textoOriginal = boton.textContent;
    boton.textContent = 'Enviando...';
    boton.disabled = true;

    setTimeout(() => {
        const exito = Math.random() > 0.1;
        if (exito) {
            mostrarNotificacion('¡Oferta enviada exitosamente!', 'success');
            actualizarContadorOfertas(oferta.requestId);
            agregarAMisOfertas(oferta);
            cerrarModalOferta();
        } else {
            mostrarNotificacion('Error al enviar la oferta. Intenta nuevamente.', 'error');
        }

        boton.textContent = textoOriginal;
        boton.disabled = false;
    }, 1500);
}

// ============ USUARIOS: CREAR SUBASTAS ============
function abrirModalCrearSubasta() {
    const modal = document.getElementById('createAuctionModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModalCrearSubasta() {
    const modal = document.getElementById('createAuctionModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        const form = document.getElementById('createAuctionForm');
        if (form) form.reset();
    }
}

function inicializarFormularioCrearSubasta() {
    const form = document.getElementById('createAuctionForm');
    if (!form) return;

    const deadlineInput = document.getElementById('deadline');
    if (deadlineInput) {
        const ahora = new Date();
        ahora.setHours(ahora.getHours() + 1);
        deadlineInput.min = ahora.toISOString().slice(0, 16);
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validarFormularioCrearSubasta()) return;

        const datos = new FormData(form);
        const subasta = {
            id: Date.now(),
            titulo: datos.get('productTitle'),
            descripcion: datos.get('productDescription'),
            dimensiones: datos.get('productDimensions'),
            color: datos.get('productColor'),
            precioMin: parseFloat(datos.get('minPrice')),
            precioMax: parseFloat(datos.get('maxPrice')),
            fechaLimite: datos.get('deadline'),
            categoria: datos.get('category'),
            imagen: '',
            fechaCreacion: new Date().toISOString(),
            ofertas: 0,
            estado: 'activa'
        };

        let subastas = JSON.parse(localStorage.getItem('misSubastas')) || [];
        subastas.push(subasta);
        localStorage.setItem('misSubastas', JSON.stringify(subastas));

        mostrarNotificacion('Subasta creada con éxito', 'success');
        cerrarModalCrearSubasta();
        cargarMisSubastas();
        actualizarContadorSubastas();
    });
}

function cargarMisSubastas() {
    const grid = document.getElementById('myAuctionsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    let subastas = JSON.parse(localStorage.getItem('misSubastas')) || [];

    if (subastas.length === 0) {
        grid.innerHTML = `<p>No creaste ninguna subasta aún.</p>`;
        return;
    }

    subastas.forEach(subasta => {
        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
          <div class="request-header">
            <div class="request-id">#SUB-${subasta.id}</div>
            <div class="request-status status-open">Activa</div>
          </div>
          <div class="request-content">
            <h4>${subasta.titulo}</h4>
            <p class="description">${subasta.descripcion}</p>
            <div class="specs">
              <span class="spec">📏 ${subasta.dimensiones}</span>
              <span class="spec">🎨 ${subasta.color}</span>
              <span class="spec">💰 $${subasta.precioMin} - $${subasta.precioMax}</span>
            </div>
            <div class="deadline">
              <span class="deadline-label">⏰ Cierre:</span>
              <span class="deadline-time">${subasta.fechaLimite}</span>
            </div>
          </div>
        `;
        grid.appendChild(card);
    });
}

function actualizarContadorSubastas() {
    const contador = document.getElementById('myAuctionsCount');
    if (contador) {
        const subastas = JSON.parse(localStorage.getItem('misSubastas')) || [];
        contador.textContent = `${subastas.length} subastas activas`;
    }
}

// ============ UTILIDADES GENERALES ============
function mostrarNotificacion(mensaje, tipo = 'success') {
    const contenedor = document.getElementById('notificationContainer');
    const noti = document.createElement('div');
    noti.className = `notification ${tipo}`;
    noti.textContent = mensaje;
    contenedor.appendChild(noti);
    setTimeout(() => contenedor.removeChild(noti), 4000);
}

function aplicarFiltros() {
    mostrarNotificacion('Filtros aplicados (demo)', 'info');
}

function actualizarContadorOfertas(requestId) {
    const card = document.querySelector(`[data-request-id="${requestId}"]`);
    if (card) {
        const contador = card.querySelector('.bids-count');
        if (contador) {
            const actual = parseInt(contador.textContent.match(/\d+/)[0]);
            contador.textContent = `${actual + 1} ofertas`;
        }
    }
}

function agregarAMisOfertas(oferta) {
    const contenedor = document.getElementById('myBidsContainer');
    if (contenedor) {
        const div = document.createElement('div');
        div.className = 'bid-item';
        div.innerHTML = `
            <div class="bid-info">
                <span class="bid-request">#REQ-${oferta.requestId}</span>
                <span class="bid-amount">$${oferta.price}</span>
                <span class="bid-status status-pending">Pendiente</span>
            </div>
            <div class="bid-details">
                <span class="bid-date">${new Date().toLocaleDateString('es-ES')}</span>
            </div>
        `;
        contenedor.insertBefore(div, contenedor.firstChild);
    }
}

function validarFormularioOferta() {
    let valido = true;
    limpiarErrores();

    const precio = document.getElementById('bidPrice');
    const materiales = document.getElementById('materials');
    const tiempo = document.getElementById('deliveryTime');

    if (!precio.value || parseFloat(precio.value) <= 0) {
        mostrarErrorCampo(precio, 'El precio debe ser mayor a 0');
        valido = false;
    }

    if (!materiales.value.trim()) {
        mostrarErrorCampo(materiales, 'Debes especificar los materiales');
        valido = false;
    }

    if (!tiempo.value || parseInt(tiempo.value) <= 0) {
        mostrarErrorCampo(tiempo, 'El tiempo de entrega debe ser mayor a 0');
        valido = false;
    }

    return valido;
}

function validarFormularioCrearSubasta() {
    let valido = true;
    limpiarErrores();

    const titulo = document.getElementById('productTitle');
    const descripcion = document.getElementById('productDescription');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const deadline = document.getElementById('deadline');

    if (!titulo.value.trim()) {
        mostrarErrorCampo(titulo, 'El título es obligatorio');
        valido = false;
    }

    if (!descripcion.value.trim()) {
        mostrarErrorCampo(descripcion, 'La descripción es obligatoria');
        valido = false;
    }

    if (!minPrice.value || parseFloat(minPrice.value) <= 0) {
        mostrarErrorCampo(minPrice, 'Precio mínimo inválido');
        valido = false;
    }

    if (!maxPrice.value || parseFloat(maxPrice.value) <= 0) {
        mostrarErrorCampo(maxPrice, 'Precio máximo inválido');
        valido = false;
    }

    if (parseFloat(minPrice.value) >= parseFloat(maxPrice.value)) {
        mostrarErrorCampo(maxPrice, 'El máximo debe ser mayor al mínimo');
        valido = false;
    }

    if (!deadline.value) {
        mostrarErrorCampo(deadline, 'Fecha límite requerida');
        valido = false;
    }

    return valido;
}

function mostrarErrorCampo(campo, mensaje) {
    limpiarErrorCampo(campo);
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = mensaje;
    campo.parentNode.appendChild(error);
    campo.style.borderColor = '#f44336';
}

function limpiarErrorCampo(campo) {
    const error = campo.parentNode.querySelector('.field-error');
    if (error) error.remove();
    campo.style.borderColor = '#ccc';
}

function limpiarErrores() {
    document.querySelectorAll('.field-error').forEach(e => e.remove());
    document.querySelectorAll('input, textarea').forEach(i => i.style.borderColor = '#ccc');
}

function extraerPrecioMaximo(texto) {
    const match = texto.match(/\$[\\d,]+ - \$([0-9,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
}

function validarPrecioOferta() {
    // Función que faltaba - se puede implementar validación en tiempo real
}

function inicializarBuscador() {
    // Por si querés implementar buscador en vivo
}

function cargarPedidos() {
    // Se puede usar si querés cargar dinámicamente pedidos desde backend
}

function actualizarContadoresTiempo() {
    // Actualización de tiempos en cards si implementás temporizador en frontend
}