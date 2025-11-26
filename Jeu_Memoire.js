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
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Afficher la section Jeu par défaut
    showSection('jeu');

});