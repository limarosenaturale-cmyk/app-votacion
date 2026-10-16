# 🎤 Yo Soy - Sistema de Votación VIP en Tiempo Real

Sistema de votación en tiempo real diseñado para concursos de imitación, fiestas y eventos privados. Optimizado para celulares, con prevención de doble voto por dispositivo, panel de control administrativo y revelación de resultados en suspenso.

---

## 🚀 Cómo Iniciar la Aplicación

### Opción 1: En tu PC y Celulares en la misma red WiFi (Inmediato)
1. Haz **doble clic en `iniciar.bat`** (o ejecuta `npm start` en la terminal).
2. Se abrirá automáticamente la aplicación en tu navegador:
   - **En tu PC:** [http://localhost:3000](http://localhost:3000)
   - **Desde celulares conectados a tu WiFi:** `http://TU_IP_LOCAL:3000` (el enlace exacto y el código QR se muestran en la consola y en el panel de admin).

---

### Opción 2: Compartir por Internet (Sin configurar servidores ni pagar)
Si los invitados están usando sus propios datos móviles (4G/5G) o están en distintas ubicaciones:
1. Con `iniciar.bat` corriendo, haz **doble clic en `compartir_online.bat`**.
2. Te generará un enlace público seguro `https://xxxx.loca.lt` que puedes enviar por WhatsApp a todos los invitados.

---

### Opción 3: Desplegar en la Nube (Gratis y Permanente)
Puedes subir este proyecto a cualquier servicio de hosting gratuito:

#### En Render.com (Recomendado):
1. Sube esta carpeta a tu cuenta de GitHub.
2. En [Render.com](https://render.com), crea un nuevo **Web Service**.
3. Selecciona tu repositorio y haz clic en **Deploy Web Service** (Render detectará automáticamente Node.js y ejecutará `npm start`).
4. ¡Listo! Tendrás un link oficial HTTPS como `https://yo-soy-vip.onrender.com`.

---

## 👑 Acceso y Funciones del Administrador

- **Clave de Administrador:** `ADMIN2026`
- **Cómo entrar:**
  - En la pantalla de inicio, escribe `ADMIN2026` en el campo de nombre y presiona **Entrar al Show**.
  - O haz clic en el enlace pequeño **Admin** debajo del botón principal.

### Controles del Panel de Control (Control Maestro):
1. **Agregar Participante:** Escribe el nombre del concursante y el personaje/artista que imita, y presiona **Subir al Escenario**. Aparecerá inmediatamente en todos los celulares conectados.
2. **Eliminar Participante:** Botón de papelera junto a cada concursante.
3. **Pausar / Abrir Votaciones:** Permite bloquear temporalmente las votaciones mientras un concursante canta o antes de iniciar el show.
4. **Revelar Resultados al Público:**
   - Mientras está oculto, el público ve la **Bóveda Secreta** y no puede ver los puntajes.
   - Al hacer clic en **Revelar Resultados**, todos los celulares conectados desbloquean la pantalla de podio automáticamente con lluvia de confeti 🎉.
5. **Conteo en Vivo:** El administrador ve en tiempo real cuántos votos y puntos lleva cada participante con barras de progreso animadas.
6. **Código QR:** Botón para proyectar en grande el código QR en una TV o pantalla gigante.
7. **Reiniciar Votaciones:** Botón para poner todos los contadores en 0 para una nueva ronda.

---

## 📱 Experiencia de los Votantes (Público)

1. Ingresan al enlace desde su celular e introducen su nombre o apodo.
2. Ven la lista de participantes en vivo.
3. Califican de 1 a 5 estrellas a cada concursante.
4. **Control antifraude:** El sistema restringe a **1 solo voto por participante por dispositivo** (usando `localStorage` + identificador único persistente + validación en servidor). Una vez emitido el voto, los botones de ese participante se deshabilitan y muestran el sello **VOTADO**.
5. Los resultados se mantienen en secreto hasta que el administrador los revele.

---

## 📂 Estructura del Proyecto

```
app-votacion/
├── server.js              # Servidor Node.js con Express y Server-Sent Events (SSE)
├── database.js            # Base de datos JSON atómica con validación de votos
├── package.json           # Dependencias del proyecto
├── iniciar.bat            # Acceso directo para ejecutar en Windows en 1 clic
├── compartir_online.bat   # Enlace público por internet para celulares
├── render.yaml            # Configuración de despliegue en Render
├── public/
│   └── index.html         # Interfaz web móvil VIP (Tailwind + SSE + Confeti)
├── data/
│   └── database.json      # Almacén persistente de participantes y votos
└── firebase_version/
    └── index.html         # Versión alternativa 100% estática para Firebase Realtime DB
```
