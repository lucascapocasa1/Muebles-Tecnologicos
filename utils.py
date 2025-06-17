import firebase_admin
from firebase_admin import credentials, firestore

# Inicializa Firebase solo una vez
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

def guardar_producto_firebase(nombre, descripcion, precio, stock, imagen_url):
    data = {
        'nombre': nombre,
        'descripcion': descripcion,
        'precio': float(precio),
        'stock': int(stock),
        'imagen_url': imagen_url
    }
    db.collection('productos').add(data)

def guardar_usuario_firebase(username, email, user_type):
    data = {
        'username': username,
        'email': email,
        'tipo': user_type
    }
    db.collection('usuarios').add(data)

def obtener_productos_firebase():
    productos_ref = db.collection('productos')
    docs = productos_ref.stream()
    productos = []
    for doc in docs:
        data = doc.to_dict()
        productos.append(data)
    return productos

def obtener_usuarios_firebase():
    usuarios_ref = db.collection('usuarios')
    docs = usuarios_ref.stream()
    usuarios = []
    for doc in docs:
        data = doc.to_dict()
        usuarios.append(data)
    return usuarios
