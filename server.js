const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET_PIN = process.env.ADMIN_PIN || 'ADMIN2026';
const ADMIN_TOKEN = 'adm_tok_' + Buffer.from(ADMIN_SECRET_PIN).toString('base64');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Clientes SSE conectados para tiempo real
let sseClients = [];

function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach(client => {
        try {
            client.res.write(payload);
        } catch (e) {
            // Error al escribir a cliente desconectado
        }
    });
}

// Middleware de verificación de Admin
function requireAdmin(req, res, next) {
    const token = req.headers['x-admin-token'] || req.query.token;
    if (token === ADMIN_TOKEN) {
        return next();
    }
    return res.status(401).json({ error: 'Acceso no autorizado. Clave de administrador requerida.' });
}

// ==========================================
// CANAL DE TIEMPO REAL (Server-Sent Events)
// ==========================================
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const client = { id: clientId, res, isAdmin: req.query.admin === '1' };
    sseClients.push(client);

    // Enviar bienvenida
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, time: new Date() })}\n\n`);

    req.on('close', () => {
        sseClients = sseClients.filter(c => c.id !== clientId);
    });
});

// ==========================================
// RUTAS DE INICIALIZACIÓN Y LOGIN
// ==========================================

// Inicializar estado para un votante o admin
app.get('/api/init', (req, res) => {
    const deviceId = req.headers['x-device-id'] || req.query.deviceId;
    const adminToken = req.headers['x-admin-token'] || req.query.token;
    const isAdmin = adminToken === ADMIN_TOKEN;

    const config = db.getConfig();
    const participants = db.getParticipants(isAdmin);
    const myVotes = db.getVotesForDevice(deviceId);

    res.json({
        config: {
            titulo: config.titulo,
            subtitulo: config.subtitulo,
            mostrar_resultados: config.mostrar_resultados,
            votaciones_abiertas: config.votaciones_abiertas
        },
        participantes: participants,
        mis_votos: myVotes,
        isAdmin
    });
});

// Login (para votante o admin con clave ADMIN2026)
app.post('/api/login', (req, res) => {
    const { username, pin } = req.body;
    const cleanUser = (username || '').trim();
    const cleanPin = (pin || '').trim();

    const isPinAdmin = cleanPin.toUpperCase() === ADMIN_SECRET_PIN.toUpperCase();
    const isUserAdmin = cleanUser.toUpperCase() === ADMIN_SECRET_PIN.toUpperCase();

    if (isPinAdmin || isUserAdmin) {
        return res.json({
            success: true,
            isAdmin: true,
            username: 'Control Maestro',
            adminToken: ADMIN_TOKEN
        });
    }

    if (!cleanUser) {
        return res.status(400).json({ error: 'Por favor, ingresa tu nombre o apodo.' });
    }

    res.json({
        success: true,
        isAdmin: false,
        username: cleanUser
    });
});

// ==========================================
// RUTAS DE VOTACIÓN (PÚBLICO)
// ==========================================

app.post('/api/votar', (req, res) => {
    const { participante_id, puntos, votante_nombre, dispositivo_id } = req.body;

    if (!dispositivo_id) {
        return res.status(400).json({ error: 'Identificador de dispositivo no encontrado.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        const result = db.recordVote({
            participante_id,
            puntos,
            votante_nombre,
            dispositivo_id,
            ip: clientIp
        });

        // Notificar a todos en tiempo real
        const config = db.getConfig();
        broadcast('nuevo_voto', {
            participante_id,
            mostrar_resultados: config.mostrar_resultados,
            // Solo si los resultados son públicos enviamos el puntaje actualizado
            total_puntos: config.mostrar_resultados ? result.updatedParticipant.total_puntos : null,
            total_votos: config.mostrar_resultados ? result.updatedParticipant.total_votos : null
        });

        // Si hay admins escuchando, enviar actualización de ranking admin
        const adminRanking = db.getAdminRanking();
        broadcast('admin_ranking_update', adminRanking);

        res.json({
            success: true,
            message: '¡Tu voto ha sido registrado con éxito!',
            participante_id,
            puntos
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==========================================
// RUTAS DE ADMINISTRADOR
// ==========================================

// Obtener ranking completo para el admin
app.get('/api/admin/ranking', requireAdmin, (req, res) => {
    const stats = db.getAdminRanking();
    res.json(stats);
});

// Agregar nuevo participante
app.post('/api/admin/participante', requireAdmin, (req, res) => {
    const { nombre, personaje } = req.body;
    if (!nombre || !personaje) {
        return res.status(400).json({ error: 'El nombre y el personaje/artista son obligatorios.' });
    }

    const newParticipant = db.addParticipant(nombre, personaje);

    // Notificar en tiempo real a todas las pantallas
    broadcast('participante_agregado', newParticipant);
    broadcast('admin_ranking_update', db.getAdminRanking());

    res.json({ success: true, participante: newParticipant });
});

// Eliminar participante
app.delete('/api/admin/participante/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const deleted = db.deleteParticipant(id);

    if (deleted) {
        broadcast('participante_eliminado', { id });
        broadcast('admin_ranking_update', db.getAdminRanking());
        return res.json({ success: true, id });
    }

    res.status(404).json({ error: 'Participante no encontrado.' });
});

// Alternar estado de mostrar resultados al público
app.post('/api/admin/mostrar-resultados', requireAdmin, (req, res) => {
    const { mostrar } = req.body;
    const currentState = db.getConfig().mostrar_resultados;
    const newState = typeof mostrar === 'boolean' ? mostrar : !currentState;
    db.setMostrarResultados(newState);

    const fullParticipants = db.getParticipants(true);

    // Emitir evento a todos los celulares conectados
    broadcast('estado_resultados', {
        mostrar_resultados: newState,
        participantes: newState ? fullParticipants : db.getParticipants(false)
    });

    res.json({ success: true, mostrar_resultados: newState });
});

// Alternar si las votaciones están abiertas o pausadas
app.post('/api/admin/estado-votaciones', requireAdmin, (req, res) => {
    const { abiertas } = req.body;
    const currentState = db.getConfig().votaciones_abiertas;
    const newState = typeof abiertas === 'boolean' ? abiertas : !currentState;
    db.setVotacionesAbiertas(newState);

    broadcast('estado_votaciones', { votaciones_abiertas: newState });

    res.json({ success: true, votaciones_abiertas: newState });
});

// Reiniciar todos los votos (para nueva ronda o limpiar pruebas)
app.post('/api/admin/reiniciar', requireAdmin, (req, res) => {
    db.resetVotes();
    broadcast('votacion_reiniciada', {
        participantes: db.getParticipants(false),
        adminRanking: db.getAdminRanking()
    });
    res.json({ success: true, message: 'Votaciones reiniciadas a 0 correctamente.' });
});

// Generar código QR para proyectar o compartir
app.get('/api/qr', async (req, res) => {
    try {
        const localIp = getLocalIpAddress();
        const host = req.get('host') || `${localIp}:${PORT}`;
        const protocol = req.protocol;
        const appUrl = `${protocol}://${host}`;

        const qrDataUrl = await QRCode.toDataURL(appUrl, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        res.json({ qr: qrDataUrl, url: appUrl });
    } catch (err) {
        res.status(500).json({ error: 'Error generando código QR' });
    }
});

// Fallback a index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Obtener IP local de la red WiFi
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && !alias.internal && (alias.address.startsWith('192.168.') || alias.address.startsWith('10.') || alias.address.startsWith('172.'))) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

// Iniciar Servidor
app.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIpAddress();
    console.log('\n' + '='.repeat(60));
    console.log('🎤  YO SOY - SISTEMA DE VOTACIÓN VIP EN VIVO');
    console.log('='.repeat(60));
    console.log(`💻 En esta PC:         http://localhost:${PORT}`);
    console.log(`📱 Celulares en WiFi:  http://${localIp}:${PORT}`);
    console.log(`🔐 Clave Administrador: ${ADMIN_SECRET_PIN}`);
    console.log('='.repeat(60) + '\n');
});
