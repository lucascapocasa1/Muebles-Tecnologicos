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

    // Event listeners para calcular precio en tiempo real
    const dimensionesInput = document.getElementById('productDimensions');
    const woodTypeSelect = document.getElementById('woodType');
    
    if (dimensionesInput) {
        dimensionesInput.addEventListener('input', calcularPrecio);
    }
    
    if (woodTypeSelect) {
        woodTypeSelect.addEventListener('change', calcularPrecio);
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

    const hint = modal.querySelector('.price-hint');
    if (hint) hint.textContent = 'Ofertá tu mejor precio, cuanto más bajo, mejor.';

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

//función mostrar/ocultar en empresas
function toggleMyBids() {
  const contenedor = document.getElementById('myBidsContainer');
  const boton = document.querySelector('.toggle-btn');

  if (!contenedor || !boton) return;

  if (contenedor.classList.contains('visible')) {
    contenedor.classList.remove('visible');
    contenedor.style.display = 'none';
    boton.textContent = 'Mostrar';
  } else {
    contenedor.classList.add('visible');
    contenedor.style.display = 'block';
    boton.textContent = 'Ocultar';
  }
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
        if (form) {
            form.reset();
            // Limpiar displays de precio
            const volumeDisplay = document.getElementById('volumeDisplay');
            const priceDisplay = document.getElementById('priceDisplay');
            if (volumeDisplay) volumeDisplay.textContent = 'Volumen: - cm³';
            if (priceDisplay) priceDisplay.textContent = 'Precio estimado: $0';
        }
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
        
        console.log('Iniciando validación...');
        
        if (!validarFormularioCrearSubasta()) {
            console.log('Validación falló');
            return;
        }
        
        console.log('Validación exitosa, creando subasta...');

        const datos = new FormData(form);
        
        // Calcular precio estimado
        const dimensiones = datos.get('productDimensions');
        const woodType = datos.get('woodType');
        const dimensionMatch = dimensiones.match(/^(\d+)x(\d+)x(\d+)$/);
        
        let precioEstimado = 0;
        if (dimensionMatch && woodType) {
            const volumen = parseInt(dimensionMatch[1]) * parseInt(dimensionMatch[2]) * parseInt(dimensionMatch[3]);
            const woodSelect = document.getElementById('woodType');
            const precioPorCm3 = parseInt(woodSelect.selectedOptions[0].dataset.price);
            precioEstimado = volumen * precioPorCm3;
        }

        const subasta = {
            id: Date.now(),
            titulo: datos.get('productTitle'),
            descripcion: datos.get('productDescription'),
            dimensiones: datos.get('productDimensions'),
            tipoMadera: datos.get('woodType'),
            precioEstimado: precioEstimado,
            fechaLimite: datos.get('deadline'),
            categoria: datos.get('category') || 'sin-categoria',
            imagen: datos.get('productImage') || '',
            fechaCreacion: new Date().toISOString(),
            ofertas: 0,
            estado: 'activa'
        };

        console.log('Subasta a crear:', subasta);

        let subastas = JSON.parse(localStorage.getItem('misSubastas')) || [];
        subastas.push(subasta);
        localStorage.setItem('misSubastas', JSON.stringify(subastas));

        console.log('Subasta guardada en localStorage');

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
        grid.innerHTML = `<p style="text-align: center; color: #666; padding: 40px;">No creaste ninguna subasta aún.</p>`;
        return;
    }

    subastas.forEach(subasta => {
        const fechaLimite = new Date(subasta.fechaLimite);
        const fechaFormateada = fechaLimite.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

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
              <span class="spec">🌳 ${subasta.tipoMadera.charAt(0).toUpperCase() + subasta.tipoMadera.slice(1)}</span>
              <span class="spec">💰 $${subasta.precioEstimado.toLocaleString()}</span>
            </div>
            <div class="deadline">
              <span class="deadline-label">⏰ Cierre:</span>
              <span class="deadline-time">${fechaFormateada}</span>
            </div>
            <div class="request-footer">
              <span class="bids-count">${subasta.ofertas} ofertas</span>
              <button class="btn-view-offers" onclick="verOfertas(${subasta.id})">Ver Ofertas</button>
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

function verOfertas(subastaId) {
    mostrarNotificacion(`Viendo ofertas para subasta #${subastaId} (funcionalidad en desarrollo)`, 'info');
}

// Función para calcular precio basado en dimensiones y tipo de madera
function calcularPrecio() {
    const dimensiones = document.getElementById('productDimensions').value;
    const tipoMadera = document.getElementById('woodType');
    const volumeDisplay = document.getElementById('volumeDisplay');
    const priceDisplay = document.getElementById('priceDisplay');
    
    if (!dimensiones || !tipoMadera || !tipoMadera.value) {
        if (volumeDisplay) volumeDisplay.textContent = 'Volumen: - cm³';
        if (priceDisplay) priceDisplay.textContent = 'Precio estimado: $0';
        return;
    }
    
    // Validar formato de dimensiones (ej: 200x180x40)
    const dimensionPattern = /^(\d+)x(\d+)x(\d+)$/;
    const match = dimensiones.match(dimensionPattern);
    
    if (!match) {
        if (volumeDisplay) volumeDisplay.textContent = 'Formato inválido';
        if (priceDisplay) priceDisplay.textContent = 'Ingresá dimensiones como: 200x180x40';
        return;
    }
    
    const largo = parseInt(match[1]);
    const ancho = parseInt(match[2]);
    const alto = parseInt(match[3]);
    
    const volumen = largo * ancho * alto;
    const precioPorCm3 = parseInt(tipoMadera.selectedOptions[0].dataset.price);
    const precioTotal = volumen * precioPorCm3;
    
    if (volumeDisplay) volumeDisplay.textContent = `Volumen: ${volumen.toLocaleString()} cm³`;
    if (priceDisplay) priceDisplay.textContent = `Precio estimado: $${precioTotal.toLocaleString()}`;
}

// ============ UTILIDADES GENERALES ============
function mostrarNotificacion(mensaje, tipo = 'success') {
    const contenedor = document.getElementById('notificationContainer');
    if (!contenedor) return;
    
    const noti = document.createElement('div');
    noti.className = `notification ${tipo}`;
    noti.textContent = mensaje;
    contenedor.appendChild(noti);
    setTimeout(() => {
        if (contenedor.contains(noti)) {
            contenedor.removeChild(noti);
        }
    }, 4000);
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
    const dimensiones = document.getElementById('productDimensions');
    const woodType = document.getElementById('woodType');
    const deadline = document.getElementById('deadline');

    if (!titulo.value.trim()) {
        mostrarErrorCampo(titulo, 'El título es obligatorio');
        valido = false;
    }

    if (!descripcion.value.trim()) {
        mostrarErrorCampo(descripcion, 'La descripción es obligatoria');
        valido = false;
    }

    if (!dimensiones.value.trim()) {
        mostrarErrorCampo(dimensiones, 'Las dimensiones son obligatorias');
        valido = false;
    } else {
        // Validar formato de dimensiones
        const dimensionPattern = /^(\d+)x(\d+)x(\d+)$/;
        if (!dimensionPattern.test(dimensiones.value)) {
            mostrarErrorCampo(dimensiones, 'Formato debe ser: 200x180x40');
            valido = false;
        }
    }

    if (!woodType.value) {
        mostrarErrorCampo(woodType, 'Tipo de madera es obligatorio');
        valido = false;
    }

    if (!deadline.value) {
        mostrarErrorCampo(deadline, 'Fecha límite requerida');
        valido = false;
    } else {
        // Validar que la fecha sea en el futuro
        const fechaSeleccionada = new Date(deadline.value);
        const ahora = new Date();
        if (fechaSeleccionada <= ahora) {
            mostrarErrorCampo(deadline, 'La fecha debe ser futura');
            valido = false;
        }
    }

    return valido;
}

function mostrarErrorCampo(campo, mensaje) {
    limpiarErrorCampo(campo);
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = mensaje;
    error.style.color = '#f44336';
    error.style.fontSize = '0.9em';
    error.style.marginTop = '5px';
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
    document.querySelectorAll('input, textarea, select').forEach(i => i.style.borderColor = '#ccc');
}

function extraerPrecioMaximo(texto) {
    const match = texto.match(/\$[\d,]+ - \$([0-9,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
}

function validarPrecioOferta() {
    // Función para validación en tiempo real del precio de oferta
    const precio = document.getElementById('bidPrice');
    if (precio && precio.value) {
        const valor = parseFloat(precio.value);
        if (valor <= 0) {
            precio.style.borderColor = '#f44336';
        } else {
            precio.style.borderColor = '#4caf50';
        }
    }
}

function inicializarBuscador() {
    // Función para implementar buscador en vivo si es necesario
    console.log('Buscador inicializado');
}

function cargarPedidos() {
    const pedidos = document.querySelectorAll('.requests-grid .request-card');
    const contador = document.querySelector('.requests-count');

    if (contador) {
        contador.textContent = `${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''} disponible${pedidos.length !== 1 ? 's' : ''}`;
    }

    console.log('Pedidos cargados');
}

function actualizarContadoresTiempo() {
    // Función para actualizar contadores de tiempo en las cards
    const deadlines = document.querySelectorAll('.deadline-time');
    deadlines.forEach(deadline => {
        const fechaLimite = new Date(deadline.textContent);
        const ahora = new Date();
        const diferencia = fechaLimite - ahora;
        
        if (diferencia > 0) {
            const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
            const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            if (dias > 0) {
                deadline.style.color = '#4caf50';
            } else if (horas > 12) {
                deadline.style.color = '#ff9800';
            } else {
                deadline.style.color = '#f44336';
            }
        } else {
            deadline.style.color = '#999';
            deadline.textContent += ' (Vencida)';
        }
    });
}
