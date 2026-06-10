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
    
    // COMPLEXIDADE TÉCNICA: Recupera o recorde salvo permanentemente no navegador
    highScore = localStorage.getItem('agroHighScore') || 0;
    highScoreVal.textContent = highScore;
    
    const bTxt = document.getElementById('badge-text');
    if(bTxt) {
        bTxt.textContent = "Iniciante Orgânico";
        bTxt.className = ""; // Remove animações antigas
    }

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
    const head = { x: snake.x + dx, y: snake.y + dy };

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
            
            // FUNCIONALIDADE ADICIONAL: Salva o novo recorde no LocalStorage de forma definitiva
            if (score > highScore) {
                highScore = score;
                highScoreVal.textContent = highScore;
                localStorage.setItem('agroHighScore', highScore);
            }

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
    ctx.fillStyle = '#2c3e50'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha Ameaças Ambientais
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

// Inovação Técnica: Modificação e animação via CSS/DOM
function checkBadges(currentScore) {
    const badgeText = document.getElementById('badge-text');
    if (!badgeText) return;

    if (currentScore >= 50) {
        badgeText.textContent = "🏆 Guardião do Bioma (Sustentabilidade Máxima!)";
        badgeText.style.color = "#2ecc71";
        badgeText.className = "pulse-animation"; // Ativa efeito visual suave
    } else if (currentScore >= 30) {
        badgeText.textContent = "🌱 Produtor Consciente de Carbono Zero";
        badgeText.style.color = "#3498db";
        badgeText.className = "pulse-animation"; // Ativa efeito visual suave
    }
}

function gameOver() {
    clearInterval(gameInterval);
    alert(`Simulação Finalizada!\nParabéns Gestor(a) ${currentUserName}.\nSua fazenda produziu um balanço de ${score} pontos antes do esgotamento.\nO segredo é manter a atenção contínua!`);
    initGame();
}
