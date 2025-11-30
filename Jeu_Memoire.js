// variables du jeu 
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let totalPairs = 0;
let currentLevel = '';

// variables pour le score et le chronomètre
let score = 0;
let moves = 0;
let timer = 0;
let timerInterval = null;

// images pour les cartes
const images = [
    'image/american_shorthair_cat.png',//ok
    'image/black_cat.png',//ok
    'image/calico_cat.png',//ok
    'image/evil_larry.png',//ok
    'image/gentleorange_cat.png',//ok
    'image/girl_cat.png',
    'image/tabby_cat.png',
    'image/white_cat.png'
];

// fonction pour afficher/cacher les sections 
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    targetSection.classList.add('active');
    
    if (sectionId === 'scores') {
        displayLeaderboard();
    }
}

// initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    showSection('jeu');
    updateDisplay();
});

// démarrer le jeu
function startGame(niveau) {
    resetGame();
    currentLevel = niveau;
    
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameBoard.className = 'game-board ' + niveau;
    
    // définir le nombre de paires selon le niveau
    if (niveau === 'facile') {
        totalPairs = 4;
    } else if (niveau === 'moyen') {
        totalPairs = 6;
    } else {
        totalPairs = 8;
    }
    
    // créer les paires de cartes - utiliser seulement les images disponibles
    const availablePairs = Math.min(totalPairs, images.length);
    const normalImages = images.filter(img => 
        img !== 'image/calico_cat.png' && img !== 'image/evil_larry.png'
    );
    const selectedNormalImages = normalImages.slice(0, availablePairs - 2);
    
    // Ajouter les cartes spéciales fixes
    const selectedImages = [
        ...selectedNormalImages,
        'image/calico_cat.png', // Toujours bonus
        'image/evil_larry.png'  // Toujours malus
    ];
    
    // ajouter des cartes spéciales (bonus/malus fixes)
    const numSpecialCards = niveau === 'facile' ? 1 : niveau === 'moyen' ? 2 : 3;
    
    // créer le tableau de cartes avec les types spéciaux fixes
    let cards = [];
    selectedImages.forEach((image, index) => {
        if (image === 'image/calico_cat.png') {
            cards.push({ image: image, special: 'bonus' });
            cards.push({ image: image, special: 'bonus' });
        } else if (image === 'image/evil_larry.png') {
            cards.push({ image: image, special: 'malus' });
            cards.push({ image: image, special: 'malus' });
        } else {
            cards.push(image);
            cards.push(image);
        }
    });
    
    // mélanger les cartes
    shuffleArray(cards);
    
    // créer les éléments de carte
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        if (typeof card === 'object') {
            cardElement.dataset.image = card.image;
            cardElement.dataset.special = card.special;
            cardElement.classList.add('special-' + card.special);
            
            cardElement.innerHTML = `
                <div class="back"></div>
                <div class="front">
                    <img src="${card.image}" alt="Carte spéciale" class="card-image">
                </div>
            `;
        } else {
            cardElement.dataset.image = card;
            cardElement.innerHTML = `
                <div class="back"></div>
                <div class="front">
                    <img src="${card}" alt="Carte mémoire" class="card-image">
                </div>
            `;
        }
        
        cardElement.dataset.index = index;
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });
    
    // démarrer le chronomètre
    startTimer();
    
    // afficher un message de début
    showMessage('Le jeu commence ! Trouvez toutes les paires. Bonne chance ! 🍀', 'info');
    
    // démarrer la musique de fond
    const bgMusic = document.getElementById('background-music');
    bgMusic.play().catch(e => console.log("La musique nécessite une interaction utilisateur"));
}

// mélanger un tableau (algorithme de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// retourner une carte
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (this.classList.contains('matched')) return;
    
    this.classList.add('flipped');
    
    if (!firstCard) {
        firstCard = this;
        return;
    }
    
    secondCard = this;
    lockBoard = true;
    moves++;
    updateDisplay();
    
    checkMatch();
}

// vérifier si les cartes correspondent
function checkMatch() {
    const isMatch = firstCard.dataset.image === secondCard.dataset.image;
    
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

// désactiver les cartes appariées
function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    // calculer les points selon le type de carte
    let points = 50; // points de base
    let messageType = 'success';
    let messageText = 'Paire trouvée ! +50 points 🎉';
    
    // vérifier si c'est une carte spéciale
    if (firstCard.dataset.special === 'bonus') {
        points += 100;
        messageText = 'CARTE BONUS ! +150 points ⭐✨';
        messageType = 'bonus';
    } else if (firstCard.dataset.special === 'malus') {
        points -= 50;
        messageText = 'Carte malus... 0 points 💀';
        messageType = 'malus';
    }
    
    score += points;
    matchedPairs++;
    
    updateDisplay();
    showMessage(messageText, messageType);
    
    // vérifier si le jeu est terminé
    if (matchedPairs === totalPairs) {
        setTimeout(() => {
            endGame();
        }, 500);
    }
    
    resetBoard();
}

// retourner les cartes qui ne correspondent pas
function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// réinitialiser le plateau
function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// chronomètre - démarrer
function startTimer() {
    timer = 0;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(() => {
        timer++;
        updateDisplay();
    }, 1000);
}

// chronomètre - arrêter
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// mettre à jour l'affichage
function updateDisplay() {
    // mettre à jour le chronomètre
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // mettre à jour le score
    document.getElementById('score').textContent = score;
    
    // mettre à jour les coups
    document.getElementById('moves').textContent = moves;
}

// terminer le jeu
function endGame() {
    stopTimer();
    
    // calculer le score final avec bonus de temps et d'efficacité
    let timeBonus = Math.max(0, 300 - timer) * 2; // bonus si moins de 5 minutes
    let efficiencyBonus = Math.max(0, (totalPairs * 2 - moves) * 10); // bonus d'efficacité
    let finalScore = score + timeBonus + efficiencyBonus;
    
    // sauvegarder le score
    saveScore(currentLevel, finalScore, timer, moves);
    
    // afficher un message de félicitations
    let message = `🎊 FÉLICITATIONS ! 🎊\n\n`;
    message += `Score final: ${finalScore} points\n`;
    message += `Temps: ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}\n`;
    message += `Coups: ${moves}\n\n`;
    
    if (timeBonus > 0) {
        message += `⚡ Bonus de rapidité: +${timeBonus} points\n`;
    }
    if (efficiencyBonus > 0) {
        message += `🎯 Bonus d'efficacité: +${efficiencyBonus} points\n`;
    }
    
    showMessage(message, 'success');
    
    // arrêter la musique
    const bgMusic = document.getElementById('background-music');
    bgMusic.pause();
}

// afficher un message 
function showMessage(text, type) {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = text;
    messageElement.className = 'game-message ' + type;
    messageElement.classList.add('show');
    
    // masquer le message après 5 secondes (sauf pour les messages de fin)
    setTimeout(() => {
        if (type !== 'success' || matchedPairs !== totalPairs) {
            messageElement.classList.remove('show');
        }
    }, 5000);
}

// réinitialiser le jeu 
function resetGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    // réinitialiser les variables
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
    totalPairs = 0;
    score = 0;
    moves = 0;
    timer = 0;
    
    // arrêter le chronomètre
    stopTimer();
    
    // mettre à jour l'affichage
    updateDisplay();
    
    // masquer les messages
    const messageElement = document.getElementById('game-message');
    messageElement.classList.remove('show');
    
    // arrêter la musique
    const bgMusic = document.getElementById('background-music');
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

// système de sauvegarde des scores (localStorage) 
function saveScore(level, finalScore, time, moves) {
    // récupérer les scores existants
    let scores = JSON.parse(localStorage.getItem('memoryGameScores')) || {
        facile: null,
        moyen: null,
        difficile: null
    };
    
    // créer le nouveau score
    const newScore = {
        score: finalScore,
        time: time,
        moves: moves,
        date: new Date().toLocaleDateString('fr-FR')
    };
    
    // garder seulement si c'est le meilleur score
    if (!scores[level] || finalScore > scores[level].score) {
        scores[level] = newScore;
        // sauvegarder dans le localStorage
        localStorage.setItem('memoryGameScores', JSON.stringify(scores));
    }
}

// afficher le meilleur score 
function displayLeaderboard() {
    const levels = ['facile', 'moyen', 'difficile'];
    
    // récupérer les scores
    let scores = JSON.parse(localStorage.getItem('memoryGameScores')) || {
        facile: null,
        moyen: null,
        difficile: null
    };
    
    levels.forEach(level => {
        const container = document.getElementById(`best-score-${level}`);
        container.innerHTML = '';
        
        if (!scores[level]) {
            container.innerHTML = '<div class="no-score">Aucun score enregistré</div>';
            return;
        }
        
        const entry = scores[level];
        const minutes = Math.floor(entry.time / 60);
        const seconds = entry.time % 60;
        
        container.innerHTML = `
            <div class="best-score-display">
                <div class="score-number">🏆 ${entry.score}</div>
                <div class="score-details">
                    ⏱️ Temps: ${minutes}:${seconds.toString().padStart(2, '0')}<br>
                    🔄 Coups: ${entry.moves}<br>
                    📅 Date: ${entry.date}
                </div>
            </div>
        `;
    });
}