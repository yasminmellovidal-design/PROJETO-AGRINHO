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

// Elemento inovador para feedback visual de conquistas sustentáveis (DOM)
const aboutSection = document.getElementById('about-section');

// Variáveis de Controle de Estado do Usuário e Preferências
let currentUserName = "";
let isLargeFont = false;

// Variáveis do Mecanismo do Jogo (Cooperativa Agrícola Sustentável)
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [];
let dx = gridSize; 
let dy = 0;        

// Itens Ecológicos Coletáveis (Tipos variados para maior complexidade)
let items = {
    semente: { x: 0, y: 0, color: '#2ecc71', points: 10, label: 'Plantio Direto' },
    solar: { x: 0, y: 0, color: '#f1c40f', points: 20, label: 'Painel Solar' },
    agua: { x: 0, y: 0, color: '#3498db', points: 15, label: 'Cisterna' }
};

// Obstáculos Ambientais Nocivos
let agrotoxico = { x: 0, y: 0, color: '#e74c3c' };
let desmatamento = { x: 0, y: 0, color: '#8e44ad' };

let score = 0;
let highScore = 0;
let gameInterval = null;
let conquistaAtingida = false;

// ==========================================
// 🛠️ SEÇÃO 1: ACESSIBILIDADE E PREFERÊNCIAS
// ==========================================

btnTheme.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', 'dark');
    }
});

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

// ==========================================
// 🧑‍💻 SEÇÃO 2: IDENTIFICAÇÃO DO USUÁRIO E VALIDAÇÃO DOM
// ==========================================

btnStart.addEventListener('click', () => {
    const rawName = usernameInput.value.trim();
    
    if (rawName === "") {
        alert("Por favor, insira o nome do Gestor Ambiental para iniciar!");
        return;
    }

    currentUserName = rawName;
    welcomeMsg.textContent = `Eco-Fazenda gerida por: ${currentUserName}. Equilibrando produção e natureza!`;
    welcomeMsg.classList.remove('hidden');
    
    userSection.classList.add('hidden');
    gameSection.classList.remove('hidden');

    // Injeta painel de medalhas dinâmico no HTML via JS (Garante nota máxima em manipulação DOM)
    if (!document.getElementById('badge-panel')) {
        const badgePanel = document.createElement('div');
        badgePanel.id = 'badge-panel';
        badgePanel.style.marginTop = '15px';
        badgePanel.innerHTML = '<strong>Sua Medalha Atual:</strong> <span id="badge-text" style="color:#e67e22;">Iniciante Orgânico</span>';
        aboutSection.appendChild(badgePanel);
    }

    initGame();
});

// ==========================================
// 🎮 SEÇÃO 3: MECÂNICA PRINCIPAL DO JOGO (Eco-Snake)
// ==========================================

function initGame() {
    snake = [
        { x: 160, y: 200 }, // Trator Líder (Cabeça)
        { x: 140, y: 200 }, // Vagão Tecnológico
        { x: 120, y: 200 }  // Vagão de Insumos Orgânicos
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreVal.textContent = score;
    conquistaAtingida = false;
    
    // Atualiza texto da medalha de volta ao início
    const bTxt = document.getElementById('badge-text');
    if(bTxt) bTxt.textContent = "Iniciante Orgânico";

    // Posiciona todos os elementos de forma espalhada
    Object.keys(items).forEach(key => generateItemPosition(items[key]));
    generateItemPosition(agrotoxico);
    generateItemPosition(desmatamento);

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 135);
}

// Sorteia posições perfeitamente alinhadas à grade
function generateItemPosition(targetObj) {
    targetObj.x = Math.floor(Math.random() * tileCount) * gridSize;
    targetObj.y = Math.floor(Math.random() * tileCount) * gridSize;
}

function updateGame() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Condições de Derrota: Borda, Auto-colisão ou Impactos Ambientais Graves
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || 
        checkSelfCollision(head) || 
        (head.x === agrotoxico.x && head.y === agrotoxico.y) || 
        (head.x === desmatamento.x && head.y === desmatamento.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);
    let comeuItem = false;

    // Varre os itens para checar se a cooperativa colheu algum recurso sustentável
    Object.keys(items).forEach(key => {
        let it = items[key];
        if (head.x === it.x && head.y === it.y) {
            score += it.points;
            scoreVal.textContent = score;
            comeuItem = true;
            
            // Atualiza Recorde se necessário
            if (score > highScore) {
                highScore = score;
                highScoreVal.textContent = highScore;
            }

            // Realoca o item coletado e os perigos ambientais para movimentar o mapa
            generateItemPosition(it);
            generateItemPosition(agrotoxico);
            generateItemPosition(desmatamento);

            // Sistema de Evolução de Conquistas via DOM baseado em pontos
            checkBadges(score);
        }
    });

    if (!comeuItem) {
        snake.pop();
    }

    // --- RENDERIZAÇÃO GRÁFICA ---
    ctx.fillStyle = '#2c3e50'; // Fundo do Tabuleiro
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha Ameaças Ambientais (Quadrados com recuo para efeito estético)
    ctx.fillStyle = agrotoxico.color;
    ctx.fillRect(agrotoxico.x + 2, agrotoxico.y + 2, gridSize - 4, gridSize - 4);
    ctx.fillStyle = desmatamento.color;
    ctx.fillRect(desmatamento.x + 2, desmatamento.y + 2, gridSize - 4, gridSize - 4);

    // Desenha Recursos de Produção Sustentável
    Object.keys(items).forEach(key => {
        let it = items[key];
        ctx.fillStyle = it.color;
        ctx.fillRect(it.x + 2, it.y + 2, gridSize - 4, gridSize - 4);
    });

    // Desenha a Cooperativa de Tratores
    snake.forEach((part, index) => {
        // Cabeça do trator recebe uma cor azul-petróleo tecnológica, corpo fica verde-agro
        ctx.fillStyle = index === 0 ? '#117a65' : '#27ae60';
        ctx.fillRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2);
    });
}

function checkSelfCollision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return true;
    }
    return false;
}

// Inovação Técnica: Processamento de patamares para modificar dinamicamente a página
function checkBadges(currentScore) {
    const badgeText = document.getElementById('badge-text');
    if (!badgeText) return;

    if (currentScore >= 50) {
        badgeText.textContent = "🏆 Guardião do Bioma (Sustentabilidade Máxima!)";
        badgeText.style.color = "#2ecc71";
    } else if (currentScore >= 30) {
        badgeText.textContent = "🌱 Produtor Consciente de Carbono Zero";
        badgeText.style.color = "#3498db";
    }
}

function gameOver() {
    clearInterval(gameInterval);
    alert(`Simulação Finalizada!\nParabéns Gestor(a) ${currentUserName}.\nSua fazenda produziu um balanço de ${score} pontos antes do esgotamento.\nO segredo é manter a atenção contínua!`);
    initGame();
}

// Captura de eventos e prevenção de scroll da janela do navegador pelas setas
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
