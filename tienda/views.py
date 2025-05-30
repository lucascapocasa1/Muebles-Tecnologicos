from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.models import User
from .forms import CustomUserCreationForm

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
            
            # Agregar mensaje de éxito
            messages.success(request, f'¡Cuenta creada exitosamente para {username}!')
            
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
            messages.success(request, f'¡Bienvenido, {username}!')
            return redirect('index')  # Redirigir al index
        else:
            messages.error(request, 'Nombre de usuario o contraseña incorrectos.')
            return render(request, 'tienda/login2.html', {'show_login': True})
    
    return render(request, 'tienda/login2.html')