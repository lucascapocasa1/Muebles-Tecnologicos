from django.shortcuts import render

# Create your views here.
from django.shortcuts import render

def index(request):
    return render(request, 'tienda/index.html')

from django.shortcuts import render

def login_view(request):
    return render(request, 'tienda/login2.html')  # Esta es la plantilla que se renderiza

from django.shortcuts import redirect

def redirigir_a_login(request):
    return redirect('login2')  # Redirige a la ruta 'login2' (que ya definiste en urls.py)


from django.shortcuts import render, redirect
from .models import CustomUser

def register_user(request):
    if request.method == 'POST':
        name = request.POST.get('userName')
        email = request.POST.get('userEmail')
        password = request.POST.get('userPassword')

        if name and email and password:
            # Guarda en la base de datos
            CustomUser.objects.create(name=name, email=email, password=password)
            return render(request, 'tienda/login2.html', {'success': True})
        else:
            return render(request, 'tienda/login2.html', {'error': True})

    return redirect('/')