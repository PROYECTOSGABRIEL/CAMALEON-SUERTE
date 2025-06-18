// ========== CONFIGURACIÓN INICIAL ==========
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

// ========== FUNCIONES PRINCIPALES ==========
function guardarEstado() {
    localStorage.setItem('premios', JSON.stringify(premios));
    actualizarUI();
}

function actualizarUI() {
    const disponibles = premios.filter(p => p.disponible).length;
    document.getElementById('premios-restantes').textContent = 
        `Premios disponibles: ${disponibles}/${premios.length}`;
    
    document.getElementById('sortear-btn').disabled = disponibles === 0;
    actualizarListaPremios();
}

function actualizarListaPremios() {
    const listaPremios = document.getElementById('lista-premios');
    listaPremios.innerHTML = premios
        .map(premio => `
            <li class="${premio.disponible ? '' : 'premio-asignado'}">
                ${premio.nombre}
                <span class="premio-estado">
                    ${premio.disponible ? '✅ Disponible' : '❌ Asignado'}
                </span>
            </li>
        `)
        .join('');
}

function sortearPremio() {
    const premiosDisponibles = premios.filter(p => p.disponible);
    
    if (premiosDisponibles.length === 0) {
        mostrarResultado({ nombre: "Todos los premios han sido asignados", tipo: "info" });
        return;
    }

    const totalPeso = premiosDisponibles.reduce((sum, p) => sum + p.peso, 0);
    let random = Math.random() * totalPeso;
    let pesoAcumulado = 0;

    for (const premio of premiosDisponibles) {
        pesoAcumulado += premio.peso;
        if (random <= pesoAcumulado) {
            premio.disponible = false;
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
    
    let html = `<h2>¡Felicidades!</h2><p>Has ganado: <strong>${premio.nombre}</strong></p>`;
    
    if (premio.tipo === "premio-mayor") {
        html += `<p class="nota-premio-mayor">¡Premio especial! El reloj ya no estará disponible</p>`;
        lanzarConfeti();
    }
    
    resultadoDiv.innerHTML = html;
}

function reiniciarSorteo() {
    if (confirm("¿Estás seguro de reiniciar el sorteo? Esto borrará todos los premios asignados.")) {
        premios.forEach(p => p.disponible = true);
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

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sortear-btn').addEventListener('click', sortearPremio);
    document.getElementById('reset-btn').addEventListener('click', reiniciarSorteo);
    
    actualizarUI();
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado:', registration.scope);
            })
            .catch(error => {
                console.log('Error al registrar ServiceWorker:', error);
            });
    });
}