# 🌐 Guía Rápida: Cómo subir tu App a Netlify en 3 Minutos

Netlify te permite tener tu aplicación online con enlace **HTTPS gratuito** para que cualquier persona pueda entrar desde su celular.

---

### 📋 Paso 1: Obtener tu Base de Datos Gratuita en Firebase (2 minutos)
*Firebase se encargará de que los votos se sincronicen en vivo en todos los celulares.*

1. Ingresa a [https://console.firebase.google.com](https://console.firebase.google.com) con tu cuenta de Google.
2. Haz clic en **"Agregar proyecto"** (ponle de nombre por ejemplo `votacion-yo-soy`) y continúa hasta crearlo.
3. En el menú de la izquierda, entra a **"Compilación"** (o Build) y haz clic en **"Realtime Database"**.
4. Haz clic en **"Crear base de datos"** -> Siguiente -> Elige modo de prueba o bloqueado -> Habilitar.
5. Ve a la pestaña **"Reglas"** y pega esto para permitir que el público vote:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   *(Haz clic en **Publicar**)*.
6. Ve a la rueda de engranaje ⚙️ (arriba a la izquierda, junto a "Descripción general del proyecto") -> **Configuración del proyecto**.
7. En la pestaña **General**, baja hasta "Tus apps", haz clic en el icono Web **`</>`**, escribe un apodo y haz clic en **Registrar app**.
8. Te mostrará un bloque de código con tu `firebaseConfig`. Copia esos valores.

---

### 📝 Paso 2: Pegar tu configuración
Abre el archivo [`firebase-config.js`](file:///c:/Users/USER/OneDrive/Desktop/app%20votacion/firebase-config.js) en esta carpeta y reemplaza con tus datos:

```javascript
window.FIREBASE_CONFIG = {
    apiKey: "AIzaSy...",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};
```

*(💡 **Tip:** También puedes simplemente abrir tu web en Netlify, entrar con clave `ADMIN2026`, hacer clic en el icono de base de datos 🗄️ y pegar tu configuración directamente desde el celular o computadora).*

---

### 🚀 Paso 3: Subir a Netlify con "Arrastrar y Soltar" (Netlify Drop)

1. Abre tu navegador e ingresa a: **[https://app.netlify.com/drop](https://app.netlify.com/drop)** (inicia sesión gratis si te lo pide).
2. **Arrastra toda esta carpeta** (`app votacion`) y suéltala en el recuadro de Netlify.
3. En 5 segundos, Netlify te dará un enlace público tipo:
   `https://mi-evento-vip.netlify.app`
4. ¡Listo! Puedes compartir ese enlace por WhatsApp o proyectar el código QR de la pantalla de admin.

---

### 🔑 Clave del Administrador
- **Contraseña:** `ADMIN2026`
- Puedes ingresar en la pantalla de inicio con esa clave para acceder al **Control Maestro**, agregar concursantes, pausar la votación y revelar los resultados al público.
