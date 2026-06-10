// Constantes Globais e Elementos do DOM capturados para Processamento
const btnStart = document.getElementById('btn-start');
const usernameInput = document.getElementById('username');
const welcomeMsg = document.getElementById('welcome-message');
const userSection = document.getElementById('user-section');
const gameSection = document.getElementById('game-section');

const btnTheme = document.getElementById('btn-theme');
const btnFont = document.getElementById('btn-font');

const scoreVal = document.getElementById('score-val');
const highScoreVal = document.getElementById('high-score-val');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variáveis de Controle de Estado do Usuário e Preferências
let currentUserName = "";
let isLargeFont = false;

// Variáveis do Mecanismo do Jogo (Estilo Snake Sustentável)
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [];
let dx = gridSize; // Movimento horizontal inicial
let dy = 0;        // Movimento vertical inicial
let foodPositive = { x: 0, y: 0 };
let obstacleNegative = { x: 0, y: 0 };
let score = 0;
let highScore = 0;
let gameInterval = null;

// SEÇÃO 1: ACESSIBILIDADE E PREFERÊNCIAS (Critério de Usabilidade Nível 4)

// Função executada para Alternar Modo Claro / Escuro
btnTheme.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', 'dark');
    }
});

// Função executada para Aumentar/Diminuir Tamanho da Fonte
btnFont.addEventListener('click', () => {
    if (!isLargeFont) {
        document.documentElement.style.setProperty('--font-size-base', '20px');
        btnFont.textContent = "Reduzir Fonte";
        isLargeFont = true;
    } else {
        document.documentElement.style.setProperty('--font-size-base', '16px');
        btnFont.textContent = "Aumentar Fonte";
        isLargeFont = false;
    }
});

// SEÇÃO 2: IDENTIFICAÇÃO DO USUÁRIO E VALIDAÇÃO DOM

// Captura evento de clique para iniciar jornada e processar nome
btnStart.addEventListener('click', () => {
    const rawName = usernameInput.value.trim();
    
    if (rawName === "") {
        alert("Por favor, digite um nome válido para o Produtor Sustentável!");
        return;
    }

    currentUserName = rawName;
    // Armazena e processa informação antes de exibir (Manipulação DOM)
    welcomeMsg.textContent = `Olá, Produtor(a) ${currentUserName}! Sua missão começou.`;
    welcomeMsg.classList.remove('hidden');
    
    // Transiciona as seções visualmente na tela
    userSection.classList.add('hidden');
    gameSection.classList.remove('hidden');

    // Inicializa o ambiente do simulador de colheita
    initGame();
});

// SEÇÃO 3: MECÂNICA PRINCIPAL DO JOGO (Eco-Snake)

// Inicialização completa dos vetores e posições do jogo
function initGame() {
    snake = [
        { x: 160, y: 200 },
        { x: 140, y: 200 },
        { x: 120, y: 200 }
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreVal.textContent = score;
    
    generateFood();
    generateObstacle();

    if (gameInterval) clearInterval(gameInterval);
    // Loop de renderização fluida a cada 130 milissegundos
    gameInterval = setInterval(updateGame, 130);
}

// Geração aleatória de posições alinhadas ao grid do Canvas
function generateFood() {
    foodPositive.x = Math.floor(Math.random() * tileCount) * gridSize;
    foodPositive.y = Math.floor(Math.random() * tileCount) * gridSize;
}

function generateObstacle() {
    obstacleNegative.x = Math.floor(Math.random() * tileCount) * gridSize;
    obstacleNegative.y = Math.floor(Math.random() * tileCount) * gridSize;

    // Impede que o obstáculo surja em cima da comida positiva
    if (obstacleNegative.x === foodPositive.x && obstacleNegative.y === foodPositive.y) {
        generateObstacle();
    }
}

// Função controladora de lógica de atualização de quadros
function updateGame() {
    // 1. Calcula a nova posição da cabeça da colheitadeira
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // 2. Condição de colisão: Bordas ou Auto-colisão ou Área Degradada (Obstáculo)
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || checkSelfCollision(head) || (head.x === obstacleNegative.x && head.y === obstacleNegative.y)) {
        gameOver();
        return;
    }

    // Adiciona a nova cabeça ao vetor do corpo
    snake.unshift(head);

    // 3. Verificação de coleta de Recursos Positivos (Semente Certificada)
    if (head.x === foodPositive.x && head.y === foodPositive.y) {
        score += 10;
        scoreVal.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreVal.textContent = highScore;
        }
        generateFood();
        // Reposiciona o obstáculo para dinamicidade do jogo
        generateObstacle();
    } else {
        // Se não comeu, remove o último elemento para manter tamanho estável
        snake.pop();
    }

    // 4. Limpeza e renderização gráfica no Canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha Obstáculo Negativo (Área Degradada - Vermelho)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(obstacleNegative.x, obstacleNegative.y, gridSize - 2, gridSize - 2);

    // Desenha Recurso Positivo (Semente Certificada - Verde Claro)
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(foodPositive.x, foodPositive.y, gridSize - 2, gridSize - 2);

    // Desenha a Colheitadeira (Snake - Verde Escuro / Destaque na Cabeça)
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#1b4f72' : '#27ae60';
        ctx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
    });
}

// Varre o vetor para encontrar colisões contra si mesmo
function checkSelfCollision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return true;
    }
    return false;
}

// Finalização do loop e aviso imediato ao usuário
function gameOver() {
    clearInterval(gameInterval);
    alert(`Simulação Encerrada! Pontuação Final do Produtor(a) ${currentUserName}: ${score} pontos.\nTente novamente limpando mais áreas de forma sustentável!`);
    initGame();
}

// Captura de eventos de teclas direcionais evitando comportamento padrão de scroll
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -gridSize; e.preventDefault(); }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = gridSize; e.preventDefault(); }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -gridSize; dy = 0; e.preventDefault(); }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = gridSize; dy = 0; e.preventDefault(); }
            break;
    }
});
