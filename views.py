from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.models import User, Group
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .forms import CustomUserCreationForm
from .utils import guardar_producto_firebase, guardar_usuario_firebase, obtener_productos_firebase, obtener_usuarios_firebase

def index(request):
    return render(request, 'tienda/index.html')

def login_view(request):
    return render(request, 'tienda/login2.html')

def redirigir_a_login(request):
    return redirect('login2')

def register_user(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            user_type = form.cleaned_data.get('user_type')

            group_name = 'Empresas' if user_type == 'company' else 'Usuarios'
            group, created = Group.objects.get_or_create(name=group_name)
            user.groups.add(group)

            guardar_usuario_firebase(username, email, user_type)

            tipo_texto = "Empresa" if user_type == 'company' else "Usuario"
            messages.success(request, f'¡Cuenta de {tipo_texto} creada exitosamente para {username}!')
            return redirect('login2')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
            return render(request, 'tienda/login2.html', {'form': form, 'show_register': True})
    else:
        form = CustomUserCreationForm()
        return render(request, 'tienda/login2.html', {'form': form, 'show_register': True})

def custom_login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if user.groups.filter(name='Empresas').exists():
                messages.success(request, f'¡Bienvenido, {username}! (Cuenta de Empresa)')
                return redirect('index')
            else:
                messages.success(request, f'¡Bienvenido, {username}! (Cuenta de Usuario)')
                return redirect('index')
        else:
            messages.error(request, 'Nombre de usuario o contraseña incorrectos.')
            return render(request, 'tienda/login2.html', {'show_login': True})
    return render(request, 'tienda/login2.html')

def is_company(user):
    return user.groups.filter(name='Empresas').exists()

def is_regular_user(user):
    return user.groups.filter(name='Usuarios').exists()

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

@csrf_exempt
@login_required
def crear_producto(request):
    if request.method == 'POST' and is_company(request.user):
        nombre = request.POST.get('nombre')
        descripcion = request.POST.get('descripcion')
        precio = request.POST.get('precio')
        stock = request.POST.get('stock')
        imagen_url = request.POST.get('imagen_url')

        guardar_producto_firebase(nombre, descripcion, precio, stock, imagen_url)
        messages.success(request, "¡Producto guardado en Firebase!")
        return redirect('index')
    return render(request, 'tienda/crear_producto.html')

@login_required
def ver_productos(request):
    productos = obtener_productos_firebase()
    return render(request, 'tienda/ver_productos.html', {'productos': productos})

@login_required
def ver_usuarios(request):
    usuarios = obtener_usuarios_firebase()
    return render(request, 'tienda/ver_usuarios.html', {'usuarios': usuarios})
