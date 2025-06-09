// Variables globales
let selectedAccountType = 'user';

// Función para mostrar solo una vista a la vez
function showView(viewToShow) {
    const accountTypeSelector = document.getElementById("accountTypeSelector");
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    
    // Ocultar todas las vistas
    accountTypeSelector.classList.add("hide");
    registerForm.classList.add("hide");
    loginForm.classList.add("hide");
    
    // Mostrar la vista seleccionada
    viewToShow.classList.remove("hide");
    
    console.log('Vista mostrada:', viewToShow.id);
}

// Función mejorada para actualizar el formulario según el tipo seleccionado
function updateRegisterForm(type) {
    const hiddenUserType = document.getElementById('hiddenUserType');
    const registerTitle = document.getElementById('registerTitle');
    const typeBadgeIcon = document.getElementById('typeBadgeIcon');
    const typeBadgeText = document.getElementById('typeBadgeText');
    const usernameInput = document.getElementById('usernameInput');
    const usernameIcon = document.getElementById('usernameIcon');
    const usernameLabel = document.getElementById('usernameLabel');

    selectedAccountType = type;

    if (hiddenUserType) {
        hiddenUserType.value = type;
    }

    // Actualizar título
    if (registerTitle) {
        registerTitle.textContent = type === 'company' ? 'Crear Cuenta de Empresa' : 'Crear Cuenta de Usuario';
    }

    // Actualizar badge del tipo
    if (typeBadgeIcon) {
        typeBadgeIcon.className = type === 'company' ? 'bx bx-buildings' : 'bx bx-user';
    }

    if (typeBadgeText) {
        typeBadgeText.textContent = type === 'company' ? 'Empresa' : 'Usuario';
    }

    // Actualizar placeholder e ícono del input principal
    if (usernameInput) {
        usernameInput.placeholder = type === 'company' ? 'Nombre de la empresa' : 'Nombre de usuario';
    }

    if (usernameIcon) {
        usernameIcon.className = type === 'company' ? 'bx bx-buildings' : 'bx bx-user';
    }

    console.log('Formulario actualizado para:', type);
}

// Función para cerrar mensajes de alerta
function closeAlert(element) {
    element.style.animation = 'slideOut 0.5s ease-in-out forwards';
    setTimeout(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }, 500);
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando JavaScript...');
    
    // Referencias a elementos
    const accountTypeSelector = document.getElementById("accountTypeSelector");
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const btnSignIn = document.getElementById("sign-in");
    const btnSignUp = document.getElementById("sign-up");
    
    // Verificar que los elementos existen
    if (!accountTypeSelector || !registerForm || !loginForm) {
        console.error('No se encontraron todos los elementos necesarios');
        return;
    }
    
    // Asegurar que solo se muestre el selector de tipo de cuenta al inicio
    showView(accountTypeSelector);
    
    // Inicializar formulario con tipo usuario por defecto
    updateRegisterForm('user');
    
    // === MANEJO DE SELECCIÓN DE TIPO DE CUENTA ===
    const accountOptions = document.querySelectorAll('.account-option');
    console.log('Opciones de cuenta encontradas:', accountOptions.length);
    
    accountOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedType = this.dataset.type;
            console.log('Tipo de cuenta seleccionado:', selectedType);
            
            // Remover selección anterior
            accountOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Agregar selección actual
            this.classList.add('selected');
            
            // Actualizar tipo seleccionado
            selectedAccountType = selectedType;
            updateRegisterForm(selectedAccountType);
            
            // Pequeño delay para mostrar la selección antes de cambiar vista
            setTimeout(() => {
                showView(registerForm);
            }, 200);
        });
    });

    // === NAVEGACIÓN ENTRE VISTAS ===
    
    // Botón "Inicia sesión aquí" desde selector de tipo
    const goToLoginBtn = document.getElementById('goToLogin');
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Navegando a login desde selector');
            showView(loginForm);
        });
    }

    // Botón "Cambiar" tipo de cuenta desde registro
    const changeTypeBtn = document.getElementById('changeTypeBtn');
    if (changeTypeBtn) {
        changeTypeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Cambiando tipo de cuenta');
            // Remover selección actual
            accountOptions.forEach(opt => opt.classList.remove('selected'));
            showView(accountTypeSelector);
        });
    }

    // Botón "Iniciar Sesión" desde registro
    if (btnSignIn) {
        btnSignIn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Navegando a login desde registro');
            showView(loginForm);
        });
    }

    // Botón "Registrarse" desde login
    if (btnSignUp) {
        btnSignUp.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Navegando a selector desde login');
            // Remover selección actual
            accountOptions.forEach(opt => opt.classList.remove('selected'));
            showView(accountTypeSelector);
        });
    }

    // === MANEJO DE MENSAJES DE ALERTA ===
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        // Auto-ocultar después de 5 segundos
        setTimeout(function() {
            if (alert.parentNode) {
                closeAlert(alert);
            }
        }, 5000);
    });
    
    // Botones de cerrar alertas
    const closeButtons = document.querySelectorAll('.close-alert');
    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            closeAlert(this.parentElement);
        });
    });

    console.log('JavaScript inicializado correctamente');
});