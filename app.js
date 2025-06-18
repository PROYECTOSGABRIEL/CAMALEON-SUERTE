// ========== CONFIGURACIÓN INICIAL ==========
// Cargar datos desde localStorage o inicializar
let premios = JSON.parse(localStorage.getItem('premios')) || [
    { id: 1, nombre: "Reloj SmartWatch", tipo: "premio-mayor", peso: 3, disponible: true },
    { id: 2, nombre: "Premio Sorpresa", tipo: "sorpresa", peso: 5, disponible: true },
    { id: 3, nombre: "Premio Sorpresa", tipo: "sorpresa", peso: 5, disponible: true },
    { id: 4, nombre: "Premio Sorpresa", tipo: "sorpresa", peso: 5, disponible: true },
    { id: 5, nombre: "Premio Sorpresa", tipo: "sorpresa", peso: 5, disponible: true },
    { id: 6, nombre: "Premio Sorpresa", tipo: "sorpresa", peso: 5, disponible: true },
    { id: 7, nombre: "Premio Sorpresa", tipo: "sorpresa", peso: 5, disponible: true },
    { id: 8, nombre: "Premio Consuelo", tipo: "consuelo", peso: 4, disponible: true },
    { id: 9, nombre: "Premio Consuelo", tipo: "consuelo", peso: 4, disponible: true },
    { id: 10, nombre: "Premio Consuelo", tipo: "consuelo", peso: 4, disponible: true },
    { id: 11, nombre: "Premio Consuelo", tipo: "consuelo", peso: 4, disponible: true },
    { id: 12, nombre: "Premio Consuelo", tipo: "consuelo", peso: 4, disponible: true }
];

let ganadores = JSON.parse(localStorage.getItem('ganadores')) || [];

// ========== FUNCIONES PRINCIPALES ==========
function guardarEstado() {
    localStorage.setItem('premios', JSON.stringify(premios));
    localStorage.setItem('ganadores', JSON.stringify(ganadores));
    actualizarUI();
}

function actualizarUI() {
    // Actualizar contador de premios
    const disponibles = premios.filter(p => p.disponible).length;
    document.getElementById('premios-restantes').textContent = 
        `Premios disponibles: ${disponibles}/${premios.length}`;
    
    // Actualizar lista de ganadores
    const listaGanadores = document.getElementById('lista-ganadores');
    listaGanadores.innerHTML = ganadores
        .slice(-5) // Mostrar solo los últimos 5
        .map(g => `<li>${g.premio} - ${g.fecha}</li>`)
        .join('');
    
    // Deshabilitar botón si no hay premios
    document.getElementById('sortear-btn').disabled = disponibles === 0;
}

function sortearPremio() {
    const premiosDisponibles = premios.filter(p => p.disponible);
    
    if (premiosDisponibles.length === 0) {
        mostrarResultado({ 
            nombre: "Todos los premios han sido asignados", 
            tipo: "info" 
        });
        return;
    }

    // Sorteo ponderado
    const totalPeso = premiosDisponibles.reduce((sum, p) => sum + p.peso, 0);
    let random = Math.random() * totalPeso;
    let pesoAcumulado = 0;

    for (const premio of premiosDisponibles) {
        pesoAcumulado += premio.peso;
        if (random <= pesoAcumulado) {
            premio.disponible = false;
            
            // Registrar ganador
            const nuevoGanador = {
                premio: premio.nombre,
                fecha: new Date().toLocaleString(),
                tipo: premio.tipo
            };
            ganadores.push(nuevoGanador);
            
            mostrarResultado(premio);
            guardarEstado();
            
            break;
        }
    }
}

function mostrarResultado(premio) {
    const resultadoDiv = document.getElementById('resultado');
    
    if (premio.tipo === "info") {
        resultadoDiv.innerHTML = `<p>${premio.nombre}</p>`;
        return;
    }
    
    let html = `
        <h2>¡Felicidades!</h2>
        <p>Has ganado: <strong>${premio.nombre}</strong></p>
    `;
    
    if (premio.tipo === "premio-mayor") {
        html += `<p class="nota-premio-mayor">¡Premio especial! El reloj ya no estará disponible</p>`;
        lanzarConfeti();
        reproducirSonido('fanfarria.mp3');
    } else {
        reproducirSonido('aplausos.mp3');
    }
    
    resultadoDiv.innerHTML = html;
    resultadoDiv.classList.add('premio-mostrado');
}

function reiniciarSorteo() {
    if (confirm("¿Estás seguro de reiniciar el sorteo? Esto borrará todos los ganadores.")) {
        premios.forEach(p => p.disponible = true);
        ganadores = [];
        guardarEstado();
        mostrarResultado({ nombre: "Sorteo reiniciado correctamente", tipo: "info" });
    }
}

// ========== FUNCIONES ADICIONALES ==========
function lanzarConfeti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function reproducirSonido(archivo) {
    // Implementación básica - añade tus archivos de sonido
    // const audio = new Audio(`assets/sounds/${archivo}`);
    // audio.play().catch(e => console.log("No se pudo reproducir sonido:", e));
}

function generarQR() {
    const url = window.location.href;
    document.getElementById('qr-code').innerHTML = `
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" 
             alt="QR para compartir">
    `;
}

function verificarConexion() {
    const statusElement = document.getElementById('conexion-status');
    if (navigator.onLine) {
        statusElement.querySelector('.online').style.display = 'inline';
        statusElement.querySelector('.offline').style.display = 'none';
    } else {
        statusElement.querySelector('.online').style.display = 'none';
        statusElement.querySelector('.offline').style.display = 'inline';
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    document.getElementById('sortear-btn').addEventListener('click', sortearPremio);
    document.getElementById('reset-btn').addEventListener('click', reiniciarSorteo);
    
    // Configuración inicial
    verificarConexion();
    generarQR();
    actualizarUI();
    
    // Verificar conexión periódicamente
    window.addEventListener('online', verificarConexion);
    window.addEventListener('offline', verificarConexion);
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado con éxito:', registration.scope);
            })
            .catch(error => {
                console.log('Error al registrar ServiceWorker:', error);
            });
    });
}
// Usa la URL automática (recomendado)
const urlOnline = window.location.href;
document.getElementById('qr-code').innerHTML = `
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(urlOnline)}">
`;