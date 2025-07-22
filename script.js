// Variables globales
let engine;
let world;
let render;
let canvas;
let currentState = 'initial'; // 'initial' o 'main'
let lastDropTime = 0;
let currentPhrase = '';
let drops = [];

// Configuración inicial cuando se carga la página
function setup() {
    // Crear contenedor para el canvas
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    canvas.mousePressed(handleTouch);
    
    // Configurar el motor de físicas
    engine = Matter.Engine.create();
    world = engine.world;
    engine.gravity.y = 0.5; // Gravedad más suave
    
    // Configurar el renderizado
    render = Matter.Render.create({
        canvas: canvas.elt,
        engine: engine,
        options: {
            width: windowWidth,
            height: windowHeight,
            wireframes: false,
            background: 'transparent'
        }
    });
    
    Matter.Render.run(render);
    Matter.Engine.run(engine);
    
    // Mostrar mensaje inicial
    showInitialMessage();
}

// Función principal de dibujo
function draw() {
    clear();
    
    // Dibujar las gotas líquidas
    drawDrops();
    
    // Actualizar físicas
    Matter.Engine.update(engine);
}

// Manejar toques/clics
function handleTouch() {
    if (currentState === 'initial') {
        transitionToMain();
        return;
    }
    
    // Crear efecto líquido
    createLiquidDrop(mouseX || touchX, mouseY || touchY);
    
    // Mostrar frase aleatoria
    showRandomPhrase();
}

// Transición a la pantalla principal
function transitionToMain() {
    currentState = 'main';
    document.querySelector('.initial-message').remove();
    
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `
        <div class="main-message">Te amo</div>
        <div class="random-phrase"></div>
    `;
}

// Crear gota líquida
function createLiquidDrop(x, y) {
    const now = Date.now();
    if (now - lastDropTime < 200) return; // Limitar frecuencia
    
    lastDropTime = now;
    
    // Crear cuerpo físico
    const drop = Matter.Bodies.circle(x, y, 15 + Math.random() * 10, {
        restitution: 0.7,
        friction: 0.001,
        density: 0.03,
        render: {
            fillStyle: '#ff4081',
            visible: false // Lo dibujaremos nosotros manualmente
        }
    });
    
    // Añadir al mundo
    Matter.World.add(world, drop);
    
    // Añadir a nuestro array de gotas
    drops.push({
        body: drop,
        color: `hsl(${Math.random() * 30 + 330}, 100%, ${Math.random() * 20 + 60}%)`,
        size: 15 + Math.random() * 15
    });
    
    // Eliminar gotas antiguas para mejorar rendimiento
    if (drops.length > 50) {
        Matter.World.remove(world, drops[0].body);
        drops.shift();
    }
}

// Dibujar gotas
function drawDrops() {
    noStroke();
    for (let drop of drops) {
        const pos = drop.body.position;
        const radius = drop.body.circleRadius;
        
        fill(drop.color);
        ellipse(pos.x, pos.y, radius * 2);
        
        // Efecto de brillo
        fill(255, 255, 255, 50);
        ellipse(pos.x - radius * 0.3, pos.y - radius * 0.3, radius * 0.6);
    }
}

// Mostrar mensaje inicial
function showInitialMessage() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `
        <div class="initial-message">Toca aquí si me amas</div>
    `;
}

// Mostrar frase aleatoria
function showRandomPhrase() {
    const phrases = [...romanticPhrases, ...playfulPhrases, ...mixedPhrases];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    const phraseElement = document.querySelector('.random-phrase');
    
    phraseElement.textContent = randomPhrase;
    phraseElement.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        phraseElement.classList.remove('show');
    }, 3000);
}

// Ajustar tamaño al cambiar la ventana
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    render.options.width = windowWidth;
    render.options.height = windowHeight;
}