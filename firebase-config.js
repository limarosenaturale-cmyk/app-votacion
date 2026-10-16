// =========================================================================
// 🔥 CONFIGURACIÓN DE FIREBASE PARA NETLIFY
// =========================================================================
// 1. Ve a https://console.firebase.google.com y crea un proyecto gratuito.
// 2. En el menú izquierdo, ve a "Realtime Database" -> "Crear base de datos".
//    (En la pestaña 'Reglas', coloca ".read": true, ".write": true).
// 3. En la rueda de engranaje ⚙️ (Configuración del proyecto) -> "General" -> "Tus apps",
//    haz clic en el icono Web (</>) y copia tu objeto firebaseConfig aquí:
// =========================================================================

window.FIREBASE_CONFIG = {
    apiKey: "PEGA_AQUI_TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};
