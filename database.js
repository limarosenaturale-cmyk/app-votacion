const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_DATA = {
    config: {
        titulo: 'Yo Soy - Edición Cumpleaños Liz & Criss',
        subtitulo: 'Votación VIP en Vivo',
        mostrar_resultados: false,
        votaciones_abiertas: true,
        admin_pin: 'ADMIN2026'
    },
    participantes: [
        {
            id: '1',
            nombre_participante: 'Liz',
            personaje_imita: 'Rihanna',
            total_puntos: 0,
            total_votos: 0
        },
        {
            id: '2',
            nombre_participante: 'Cristina',
            personaje_imita: 'Shakira',
            total_puntos: 0,
            total_votos: 0
        }
    ],
    votos: []
};

// Asegurar directorio y archivo
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
}

function readData() {
    try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        console.error('Error leyendo base de datos, restaurando inicial:', e);
        return INITIAL_DATA;
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error('Error guardando en base de datos:', e);
        return false;
    }
}

// ==========================================
// MÉTODOS DE BASE DE DATOS
// ==========================================

function getConfig() {
    const data = readData();
    return data.config;
}

function getParticipants(isAdmin = false) {
    const data = readData();
    const showResults = isAdmin || data.config.mostrar_resultados;

    return data.participantes.map(p => {
        if (showResults) {
            return {
                id: p.id,
                nombre_participante: p.nombre_participante,
                personaje_imita: p.personaje_imita,
                total_puntos: p.total_puntos || 0,
                total_votos: p.total_votos || 0
            };
        } else {
            // Ocultar resultados para el público general durante el suspenso
            return {
                id: p.id,
                nombre_participante: p.nombre_participante,
                personaje_imita: p.personaje_imita,
                total_puntos: 0,
                total_votos: 0
            };
        }
    });
}

function addParticipant(nombre, personaje) {
    const data = readData();
    const newId = Date.now().toString();
    const newParticipant = {
        id: newId,
        nombre_participante: nombre.trim(),
        personaje_imita: personaje.trim(),
        total_puntos: 0,
        total_votos: 0
    };
    data.participantes.push(newParticipant);
    saveData(data);
    return newParticipant;
}

function deleteParticipant(id) {
    const data = readData();
    const prevCount = data.participantes.length;
    data.participantes = data.participantes.filter(p => p.id !== id);
    // Eliminar también los votos asociados a este participante
    data.votos = data.votos.filter(v => v.participante_id !== id);
    saveData(data);
    return data.participantes.length < prevCount;
}

function getVotesForDevice(dispositivo_id) {
    if (!dispositivo_id) return {};
    const data = readData();
    const myVotes = {};
    data.votos
        .filter(v => v.dispositivo_id === dispositivo_id)
        .forEach(v => {
            myVotes[v.participante_id] = v.puntos;
        });
    return myVotes;
}

function recordVote({ participante_id, puntos, votante_nombre, dispositivo_id, ip }) {
    const data = readData();

    if (!data.config.votaciones_abiertas) {
        throw new Error('Las votaciones están actualmente cerradas por el administrador.');
    }

    const participant = data.participantes.find(p => p.id === participante_id);
    if (!participant) {
        throw new Error('El participante seleccionado no existe.');
    }

    const numericPoints = parseInt(puntos, 10);
    if (isNaN(numericPoints) || numericPoints < 1 || numericPoints > 5) {
        throw new Error('La calificación debe ser de 1 a 5 estrellas.');
    }

    // Verificar si ya votó por este participante desde este dispositivo
    const existingVote = data.votos.find(v => 
        v.participante_id === participante_id && v.dispositivo_id === dispositivo_id
    );

    if (existingVote) {
        throw new Error('Ya registraste tu voto para este participante.');
    }

    const newVote = {
        id: 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        participante_id,
        nombre_participante: participant.nombre_participante,
        personaje_imita: participant.personaje_imita,
        puntos: numericPoints,
        votante_nombre: (votante_nombre || 'Anónimo').trim(),
        dispositivo_id,
        ip: ip || 'Desconocida',
        fecha: new Date().toISOString()
    };

    data.votos.push(newVote);

    // Sumar puntos y voto al participante
    participant.total_puntos = (participant.total_puntos || 0) + numericPoints;
    participant.total_votos = (participant.total_votos || 0) + 1;

    saveData(data);

    return {
        success: true,
        vote: newVote,
        updatedParticipant: {
            id: participant.id,
            nombre_participante: participant.nombre_participante,
            total_puntos: participant.total_puntos,
            total_votos: participant.total_votos
        }
    };
}

function setMostrarResultados(estado) {
    const data = readData();
    data.config.mostrar_resultados = Boolean(estado);
    saveData(data);
    return data.config.mostrar_resultados;
}

function setVotacionesAbiertas(estado) {
    const data = readData();
    data.config.votaciones_abiertas = Boolean(estado);
    saveData(data);
    return data.config.votaciones_abiertas;
}

function resetVotes() {
    const data = readData();
    data.votos = [];
    data.participantes.forEach(p => {
        p.total_puntos = 0;
        p.total_votos = 0;
    });
    saveData(data);
    return true;
}

function getAdminRanking() {
    const data = readData();
    // Ordenar de mayor a menor puntaje
    const sorted = [...data.participantes].sort((a, b) => {
        if ((b.total_puntos || 0) !== (a.total_puntos || 0)) {
            return (b.total_puntos || 0) - (a.total_puntos || 0);
        }
        return (b.total_votos || 0) - (a.total_votos || 0);
    });

    const totalVotosGlobal = data.votos.length;
    const totalPuntosGlobal = data.participantes.reduce((acc, p) => acc + (p.total_puntos || 0), 0);

    return {
        ranking: sorted,
        votos_recientes: [...data.votos].reverse().slice(0, 50),
        total_votos: totalVotosGlobal,
        total_puntos: totalPuntosGlobal,
        mostrar_resultados: data.config.mostrar_resultados,
        votaciones_abiertas: data.config.votaciones_abiertas
    };
}

module.exports = {
    getConfig,
    getParticipants,
    addParticipant,
    deleteParticipant,
    getVotesForDevice,
    recordVote,
    setMostrarResultados,
    setVotacionesAbiertas,
    resetVotes,
    getAdminRanking
};
