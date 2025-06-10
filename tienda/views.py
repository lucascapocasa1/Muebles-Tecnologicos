from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.models import User, Group
from .forms import CustomUserCreationForm
from django.contrib.auth.decorators import login_required

def index(request):
    """Vista para la página principal"""
    return render(request, 'tienda/index.html')

def login_view(request):
    """Vista para mostrar el formulario de login/registro"""
    return render(request, 'tienda/login2.html')

def redirigir_a_login(request):
    """Vista para redirigir al login"""
    return redirect('login2')

def register_user(request):
    """Vista para registrar nuevos usuarios"""
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            # Crear el usuario
            user = form.save()
            username = form.cleaned_data.get('username')
            user_type = form.cleaned_data.get('user_type')
            
            # Asignar al grupo correspondiente
            if user_type == 'company':
                group, created = Group.objects.get_or_create(name='Empresas')
                user.groups.add(group)
            else:
                group, created = Group.objects.get_or_create(name='Usuarios')
                user.groups.add(group)
            
            # Agregar mensaje de éxito
            tipo_texto = "Empresa" if user_type == 'company' else "Usuario"
            messages.success(request, f'¡Cuenta de {tipo_texto} creada exitosamente para {username}!')
            
            # Redirigir al login
            return redirect('login2')
        else:
            # Si hay errores en el formulario
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
            return render(request, 'tienda/login2.html', {'form': form, 'show_register': True})
    else:
        # GET request - mostrar formulario vacío
        form = CustomUserCreationForm()
        return render(request, 'tienda/login2.html', {'form': form, 'show_register': True})

def custom_login_view(request):
    """Vista personalizada para el login"""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            
            # NUEVO: Verificar tipo de usuario y redirigir apropiadamente
            if user.groups.filter(name='Empresas').exists():
                messages.success(request, f'¡Bienvenido, {username}! (Cuenta de Empresa)')
                # Aquí puedes redirigir a una página específica para empresas
                return redirect('index')  # Por ahora al index
            else:
                messages.success(request, f'¡Bienvenido, {username}! (Cuenta de Usuario)')
                # Aquí puedes redirigir a una página específica para usuarios
                return redirect('index')  # Por ahora al index
        else:
            messages.error(request, 'Nombre de usuario o contraseña incorrectos.')
            return render(request, 'tienda/login2.html', {'show_login': True})
    
    return render(request, 'tienda/login2.html')

# NUEVO: Función auxiliar para usar en otras vistas
def is_company(user):
    """Verifica si el usuario es una empresa"""
    return user.groups.filter(name='Empresas').exists()

def is_regular_user(user):
    """Verifica si el usuario es un usuario regular"""
    return user.groups.filter(name='Usuarios').exists()

# Vistas para subasta según tipo de usuario
@login_required
def subasta(request):
    if is_company(request.user):
        return redirect('subasta_empresa')
    elif is_regular_user(request.user):
        return redirect('subasta_usuario')
    else:
        messages.error(request, "No tenés permiso para acceder a la subasta.")
        return redirect('index')

@login_required
def subasta_empresa(request):
    return render(request, 'tienda/subasta/subasta-empresa.html')

@login_required
def subasta_usuario(request):
    return render(request, 'tienda/subasta/subasta-usuario.html')