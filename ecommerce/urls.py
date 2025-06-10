"""
URL configuration for ecommerce project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from tienda import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),  # Página principal
    path('login2/', views.login_view, name='login2'),  # Formulario de login/registro
    path('redirigir_a_login/', views.redirigir_a_login, name='redirigir_a_login'),
    path('registro/', views.register_user, name='register_user'),  # Registro de usuarios
    path('subasta/', views.subasta, name='subasta'),  # Vista que redirige según grupo
    path('subasta/empresa/', views.subasta_empresa, name='subasta_empresa'),  # Vista empresa
    path('subasta/usuario/', views.subasta_usuario, name='subasta_usuario'),  # Vista usuario
    # Vista personalizada de login que redirige correctamente
    path('login/', views.custom_login_view, name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='/'), name='logout'),
]