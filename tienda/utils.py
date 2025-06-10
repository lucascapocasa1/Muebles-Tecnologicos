def is_empresa(user):
    return user.groups.filter(name='empresa').exists()

def is_usuario(user):
    return user.groups.filter(name='usuario').exists()