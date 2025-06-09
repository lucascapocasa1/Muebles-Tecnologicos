// ========== VARIABLES GLOBALES ==========
let subastas = [];
let tipoUsuario = 'comprador'; // 'comprador' o 'empresa'
let temporizadores = {};

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Detectar tipo de usuario (esto vendría de Django/backend)
    tipoUsuario = detectarTipoUsuario();
    
    // Cargar subastas existentes
    cargarSubastas();
    
    // Inicializar eventos
    inicializarEventos();
    
    // Mostrar interfaz apropiada
    mostrarInterfazSegunUsuario();
});

// ========== DETECCIÓN DE USUARIO ==========
function detectarTipoUsuario() {
    // En Django, esto vendría del contexto del template o una llamada AJAX
    // Por ahora simulamos la detección
    const userType = document.body.getAttribute('data-user-type');
    return userType || 'comprador';
}

// ========== MOSTRAR INTERFAZ SEGÚN USUARIO ==========
function mostrarInterfazSegunUsuario() {
    const compradorSections = document.querySelectorAll('.comprador-only');
    const empresaSections = document.querySelectorAll('.empresa-only');
    
    if (tipoUsuario === 'comprador') {
        compradorSections.forEach(section => section.style.display = 'block');
        empresaSections.forEach(section => section.style.display = 'none');
    } else {
        compradorSections.forEach(section => section.style.display = 'none');
        empresaSections.forEach(section => section.style.display = 'block');
    }
}

// ========== INICIALIZAR EVENTOS ==========
function inicializarEventos() {
    // Formulario crear subasta
    const formCrearSubasta = document.getElementById('form-crear-subasta');
    if (formCrearSubasta) {
        formCrearSubasta.addEventListener('submit', crearSubasta);
    }
    
    // Upload de archivos
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
    }
    
    // Input de archivos
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });
    }
}

// ========== MANEJO DE ARCHIVOS ==========
function handleFiles(files) {
    const uploadArea = document.getElementById('upload-area');
    const fileList = document.getElementById('file-list') || crearListaArchivos();
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <button type="button" onclick="removeFile(this)">×</button>
            `;
            fileList.appendChild(fileItem);
        }
    });
    
    uploadArea.querySelector('p').textContent = `${files.length} archivo(s) seleccionado(s)`;
}

function crearListaArchivos() {
    const fileList = document.createElement('div');
    fileList.id = 'file-list';
    fileList.className = 'file-list';
    document.getElementById('upload-area').appendChild(fileList);
    return fileList;
}

function removeFile(button) {
    button.parentElement.remove();
}

// ========== CREAR SUBASTA ==========
function crearSubasta(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const subasta = {
        id: Date.now(),
        titulo: formData.get('titulo'),
        descripcion: formData.get('descripcion'),
        categoria: formData.get('categoria'),
        precioMin: parseFloat(formData.get('precio-min')),
        precioMax: parseFloat(formData.get('precio-max')),
        tiempoLimite: parseInt(formData.get('tiempo-limite')),
        fechaCreacion: new Date(),
        ofertas: [],
        estado: 'activa'
    };
    
    // Validar datos
    if (!validarSubasta(subasta)) {
        return;
    }
    
    // Simular envío al servidor (en Django sería una llamada AJAX)
    guardarSubasta(subasta);
    
    // Mostrar mensaje de éxito
    mostrarMensaje('Subasta creada exitosamente', 'exito');
    
    // Limpiar formulario
    e.target.reset();
    
    // Recargar lista de subastas
    cargarSubastas();
}

function validarSubasta(subasta) {
    if (!subasta.titulo || !subasta.descripcion) {
        mostrarMensaje('Por favor completa todos los campos obligatorios', 'error');
        return false;
    }
    
    if (subasta.precioMin >= subasta.precioMax) {
        mostrarMensaje('El precio mínimo debe ser menor al precio máximo', 'error');
        return false;
    }
    
    if (subasta.tiempoLimite < 1) {
        mostrarMensaje('El tiempo límite debe ser al menos 1 hora', 'error');
        return false;
    }
    
    return true;
}

// ========== GUARDAR Y CARGAR SUBASTAS ==========
function guardarSubasta(subasta) {
    // En una implementación real, esto sería una llamada AJAX a Django
    let subastas = JSON.parse(localStorage.getItem('subastas')) || [];
    subastas.push(subasta);
    localStorage.setItem('subastas', JSON.stringify(subastas));
}

function cargarSubastas() {
    // En una implementación real, esto sería una llamada AJAX a Django
    const subastas = JSON.parse(localStorage.getItem('subastas')) || [];
    mostrarSubastas(subastas);
}

function mostrarSubastas(subastas) {
    const container = document.getElementById('subastas-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (subastas.length === 0) {
        container.innerHTML = '<p class="no-subastas">No hay subastas activas en este momento.</p>';
        return;
    }
    
    subastas.forEach(subasta => {
        const tarjeta = crearTarjetaSubasta(subasta);
        container.appendChild(tarjeta);
        
        // Inicializar temporizador
        if (subasta.estado === 'activa') {
            iniciarTemporizador(subasta.id, subasta.tiempoLimite);
        }
    });
}

function crearTarjetaSubasta(subasta) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-subasta';
    tarjeta.innerHTML = `
        <img src="/static/img/default-product.jpg" alt="${subasta.titulo}" class="imagen-producto">
        <div class="info-producto">
            <h3>${subasta.titulo}</h3>
            <p><strong>Categoría:</strong> ${subasta.categoria}</p>
            <p>${subasta.descripcion}</p>
            <div class="rango-precio">
                Presupuesto: $${subasta.precioMin.toLocaleString()} - $${subasta.precioMax.toLocaleString()}
            </div>
            <div class="tiempo-restante" id="tiempo-${subasta.id}">
                Calculando tiempo...
            </div>
            <div class="estado-subasta">
                <span class="ofertas-count">${subasta.ofertas.length} ofertas</span>
                ${crearBotonesAccion(subasta)}
            </div>
        </div>
    `;
    
    return tarjeta;
}

function crearBotonesAccion(subasta) {
    if (tipoUsuario === 'comprador') {
        return `
            <button class="btn btn-primary" onclick="verDetalleSubasta(${subasta.id})">
                Ver Ofertas
            </button>
        `;
    } else {
        return `
            <button class="btn btn-primary" onclick="abrirModalOferta(${subasta.id})">
                Hacer Oferta
            </button>
        `;
    }
}

// ========== TEMPORIZADORES ==========
function iniciarTemporizador(subastaId, horasLimite) {
    const elemento = document.getElementById(`tiempo-${subastaId}`);
    if (!elemento) return;
    
    // Calcular tiempo restante (simulado - en real vendría del servidor)
    let tiempoRestante = horasLimite * 3600; // Convertir horas a segundos
    
    temporizadores[subastaId] = setInterval(() => {
        if (tiempoRestante <= 0) {
            clearInterval(temporizadores[subastaId]);
            elemento.textContent = '¡Subasta finalizada!';
            elemento.style.backgroundColor = '#dc3545';
            elemento.style.color = 'white';
            finalizarSubasta(subastaId);
            return;
        }
        
        const horas = Math.floor(tiempoRestante / 3600);
        const minutos = Math.floor((tiempoRestante % 3600) / 60);
        const segundos = tiempoRestante % 60;
        
        elemento.textContent = `Tiempo restante: ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        
        tiempoRestante--;
    }, 1000);
}

function finalizarSubasta(subastaId) {
    // Marcar subasta como finalizada
    let subastas = JSON.parse(localStorage.getItem('subastas')) || [];
    const subasta = subastas.find(s => s.id === subastaId);
    if (subasta) {
        subasta.estado = 'finalizada';
        localStorage.setItem('subastas', JSON.stringify(subastas));
    }
    
    // Deshabilitar botones de oferta
    const botones = document.querySelectorAll(`[onclick*="${subastaId}"]`);
    botones.forEach(btn => {
        btn.disabled = true;
        btn.textContent = 'Finalizada';
    });
}

// ========== OFERTAS ==========
function abrirModalOferta(subastaId) {
    const subastas = JSON.parse(localStorage.getItem('subastas')) || [];
    const subasta = subastas.find(s => s.id === subastaId);
    
    if (!subasta) {
        mostrarMensaje('Subasta no encontrada', 'error');
        return;
    }
    
    // Crear modal de oferta
    const modal = crearModalOferta(subasta);
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function crearModalOferta(subasta) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Hacer Oferta - ${subasta.titulo}</h3>
                <button class="close-modal" onclick="cerrarModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Presupuesto solicitado:</strong> $${subasta.precioMin.toLocaleString()} - $${subasta.precioMax.toLocaleString()}</p>
                <div class="ofertas-existentes">
                    <h4>Ofertas actuales:</h4>
                    ${mostrarOfertasExistentes(subasta.ofertas)}
                </div>
                <form id="form-hacer-oferta" onsubmit="hacerOferta(event, ${subasta.id})">
                    <div class="form-group">
                        <label for="precio-oferta">Tu oferta (debe ser menor al presupuesto):</label>
                        <input type="number" id="precio-oferta" name="precio" 
                               max="${subasta.precioMax}" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="tiempo-entrega">Tiempo de entrega (días):</label>
                        <input type="number" id="tiempo-entrega" name="tiempoEntrega" 
                               min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="comentarios">Comentarios adicionales:</label>
                        <textarea id="comentarios" name="comentarios" rows="3"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModal(this)">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Enviar Oferta</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    return modal;
}

function mostrarOfertasExistentes(ofertas) {
    if (ofertas.length === 0) {
        return '<p>No hay ofertas todavía. ¡Sé el primero!</p>';
    }
    
    const ofertasOrdenadas = [...ofertas].sort((a, b) => a.precio - b.precio);
    return ofertasOrdenadas.map((oferta, index) => `
        <div class="oferta-existente ${index === 0 ? 'mejor-oferta' : ''}">
            <span class="empresa">${oferta.empresa}</span>
            <span class="precio">$${oferta.precio.toLocaleString()}</span>
            <span class="tiempo">${oferta.tiempoEntrega} días</span>
        </div>
    `).join('');
}

function hacerOferta(e, subastaId) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const oferta = {
        id: Date.now(),
        empresa: 'Mi Empresa', // En Django vendría del usuario logueado
        precio: parseFloat(formData.get('precio')),
        tiempoEntrega: parseInt(formData.get('tiempoEntrega')),
        comentarios: formData.get('comentarios'),
        fecha: new Date()
    };
    
    // Validar oferta
    if (!validarOferta(oferta, subastaId)) {
        return;
    }
    
    // Guardar oferta
    guardarOferta(subastaId, oferta);
    
    // Cerrar modal
    cerrarModal(e.target.querySelector('.close-modal'));
    
    // Mostrar mensaje de éxito
    mostrarMensaje('Oferta enviada exitosamente', 'exito');
    
    // Recargar subastas
    cargarSubastas();
}

function validarOferta(oferta, subastaId) {
    const subastas = JSON.parse(localStorage.getItem('subastas')) || [];
    const subasta = subastas.find(s => s.id === subastaId);
    
    if (!subasta) {
        mostrarMensaje('Subasta no encontrada', 'error');
        return false;
    }
    
    if (oferta.precio >= subasta.precioMax) {
        mostrarMensaje('Tu oferta debe ser menor al presupuesto máximo', 'error');
        return false;
    }
    
    if (oferta.tiempoEntrega < 1) {
        mostrarMensaje('El tiempo de entrega debe ser al menos 1 día', 'error');
        return false;
    }
    
    return true;
}

function guardarOferta(subastaId, oferta) {
    let subastas = JSON.parse(localStorage.getItem('subastas')) || [];
    const subasta = subastas.find(s => s.id === subastaId);
    
    if (subasta) {
        subasta.ofertas.push(oferta);
        localStorage.setItem('subastas', JSON.stringify(subastas));
    }
}

// ========== UTILIDADES ==========
function mostrarMensaje(texto, tipo) {
    const mensajeExistente = document.querySelector('.mensaje');
    if (mensajeExistente) {
        mensajeExistente.remove();
    }
    
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje ${tipo}`;
    mensaje.textContent = texto;
    
    const container = document.querySelector('.contenedor-subasta');
    container.insertBefore(mensaje, container.firstChild);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        mensaje.remove();
    }, 5000);
}
