// Variables du jeu
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let totalPairs = 0;

// Emojis pour les cartes
const emojis = ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'];

// Fonction pour afficher/cacher les sections
function showSection(sectionId) {
    // Masquer toutes les sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Afficher la section demandée
    const targetSection = document.getElementById(sectionId);
    targetSection.classList.add('active');
    
    // Si on affiche la section jeu, réinitialiser le jeu
    if (sectionId === 'jeu') {
        resetGame();
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Afficher la section Jeu par défaut
    showSection('jeu');
});

// Démarrer le jeu selon le niveau
function startGame(niveau) {
    resetGame();
    
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameBoard.className = 'game-board ' + niveau;
    
    if (niveau === 'facile') {
        totalPairs = 4;
    } else if (niveau === 'moyen') {
        totalPairs = 6;
    } else {
        totalPairs = 8;
    }
    
    // Créer les paires de cartes
    const selectedEmojis = emojis.slice(0, totalPairs);
    const cards = [...selectedEmojis, ...selectedEmojis];
    
    // Mélanger les cartes
    shuffleArray(cards);
    
    // Créer les éléments de carte
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="back"></div>
            <div class="front">${emoji}</div>
        `;
        
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
    
    // Afficher un message de début
    showMessage('Le jeu commence ! Trouvez toutes les paires.', 'info');
    // Démarrer la musique de fond
    const bgMusic = document.getElementById('background-music');
    bgMusic.play().catch(e => console.log("Échec de la lecture de la musique :", e));
}

// Mélanger un tableau (algorithme de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Retourner une carte
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
    
    checkMatch();
}

// Vérifier si les cartes correspondent
function checkMatch() {
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

// Désactiver les cartes appariées
function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    // Mettre à jour les paires trouvées
    matchedPairs++;
    
    // Vérifier si le jeu est terminé
    if (matchedPairs === totalPairs) {
        endGame();
    }
    
    resetBoard();
}

// Retourner les cartes qui ne correspondent pas
function unflipCards() {
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// Réinitialiser le plateau
function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// Terminer le jeu
function endGame() {
    // Afficher un message de félicitations
    showMessage(
        `Félicitations ! Vous avez trouvé toutes les paires.`,
        'success'
    );
}

// Afficher un message
function showMessage(text, type) {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = text;
    messageElement.className = 'game-message ' + type;
    messageElement.classList.add('show');
    
    // Masquer le message après 5 secondes
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 5000);
}

// Réinitialiser le jeu
function resetGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    // Réinitialiser les variables
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
    totalPairs = 0;
    
    // Masquer les messages
    const messageElement = document.getElementById('game-message');
    messageElement.classList.remove('show');
    // Arrêter la musique de fond lors de la réinitialisation
    const bgMusic = document.getElementById('background-music');
    bgMusic.pause();
    bgMusic.currentTime = 0; // Remettre la musique au début
}