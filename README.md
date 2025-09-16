# arapytuYa

## Rutas disponibles de la API

### Autenticación

- `POST /login`: Iniciar sesión.

### Usuarios

- `GET /users`: Obtener todos los usuarios (requiere token).
- `GET /users/:id`: Obtener usuario por ID (requiere token).
- `POST /users`: Registrar nuevo usuario.
- `PUT /users/:id`: Actualizar usuario (requiere token).
- `DELETE /users/:id`: Eliminar usuario (requiere token).
- `GET /users/filter/:nombre`: Filtrar usuarios por nombre (requiere token).
- `GET /users/order`: Ordenar usuarios (requiere token).
- `GET /users/page`: Paginación de usuarios (requiere token).

### Ciudades Favoritas

- `GET /favorite-cities`: Obtener todas las ciudades favoritas (requiere token).
- `GET /favorite-cities/user/:userId`: Obtener ciudades favoritas de un usuario (requiere token).
- `POST /favorite-city`: Agregar ciudad favorita (requiere token).
- `PUT /favorite-city/:id`: Actualizar ciudad favorita (requiere token).
- `DELETE /favorite-city/:id`: Eliminar ciudad favorita (requiere token).
- `GET /favorite-cities/filter/:nombre`: Filtrar ciudades favoritas por nombre (requiere token).
- `GET /favorite-cities/order`: Ordenar ciudades favoritas (requiere token).
- `GET /favorite-cities/page`: Paginación de ciudades favoritas (requiere token).

### Clima

- `POST /clima`: Obtener información del clima (requiere token).

## Prueba de integración front–back

1. **Levanta el backend**: Ejecuta el servidor Node.js (`npm run dev`).
2. **Abre el frontend**: Accede a los archivos HTML en la carpeta `frontend/` (puedes usar Live Server o abrirlos directamente en el navegador).
