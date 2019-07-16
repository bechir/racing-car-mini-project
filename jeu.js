/**
 * Une enumeration pour la gestion du clavier
 */
const Direction = {
    LEFT: '+',
    RIGHT: '-',
    UP: 2,
    DOWN: 3
};

/**
 * Recuperation des elements situés au niveau de la page HTML.
 */
const car = $('#car-container');                    // La voiture
const background = $('.background');                // L'image de fond
const ledBack = $('.car-led-back');                 // La lampe arriere
const ledFront = $('.car-led-front');               // Celle du devant
const ledBackBtn = $('.led-back');                  // Bouton pour allumer la lampe arriere
const ledFrontBtn = $('.led-front');                // Bouton pour allumer la lampe devant
const carPowerButton = $('.btn-move-stop');         // Bouton Arreter / Démarrer
const directionsKeys = $('.directions');            // Les boutons pour les directions
const speedButton = $('#rs-range-line');            // Le slider pour la vitesse
const stopPannel = $('.stop-pannel');               // Panneau de signalisation stop.
const enemy = $('.enemy');                          // Les objectifs

const motorSound = new Audio('sound/laser5.wav');   // Le son du moteur
const shootSound = new Audio('sound/laser5.wav');   // Le son a émettre lors d'un lancement d'une balle
const explosionSound = new Audio('sound/beep.mp3'); // Le son pour l'explosion (collision entre balle et objectif)
const fires = $('.fires-container');

// Personnalisation du slider vitesse dans le tableau de bord en (la partie JS)
const rangeSlider = document.getElementById("rs-range-line"); // Le slider de la vitesse
const rangeBullet = document.getElementById("rs-bullet");     // L'indicateur numerique de la vitesse

let carDirection = Direction.RIGHT;  // Au debut le sens c'est de la gauche vers la droite.
let carPosition = {                  // Les coordonnées 2D de la voiture
    x: 0,
    y: 0
};
let speed = (1 / speedButton.val()) * 300000;
let isRunning = false;

let ledBackIsOn = false;
let ledFrontIsOn = false;

let isEnemyMoving = false;
let enemyGeneratorlHandler = null; // Pour pouvoir arreter de générer des objectifs aléatoirement

// Au clic sur le bouton démarrer/arreter, on change l'état de la voiture.
carPowerButton.on('click', function(){
    toggleCarMovement();
});

// Evenement au clic sur le bouton pour allumer/éteindre la lampe arriere.
ledBackBtn.on('click', function(){
    if(ledBackIsOn) {
        ledBack.addClass('hide');
        ledBackBtn.removeClass('on').addClass('off')
    }
    else {
        ledBack.removeClass('hide');
        ledBackBtn.removeClass('off').addClass('on')
    }
    ledBackIsOn = !ledBackIsOn;
})

// Evenement au clic sur le bouton pour allumer/éteindre la lampe front.
ledFrontBtn.on('click', function(){
    if(ledFrontIsOn) {
        ledFront.addClass('hide');
        ledFrontBtn.removeClass('on').addClass('off')
    }
    else {
        ledFront.removeClass('hide');
        ledFrontBtn.removeClass('off').addClass('on')
    }
    ledFrontIsOn = !ledFrontIsOn;
})

// Quand on change le slider vitesse, on modifie la vitesse de la voiture.
speedButton.on('change', function(){
    if(speedButton.val() == 0)
        stop();
    else {
        speed = (1 / speedButton.val()) * 300000;
        stop();
        move();
    }
})

/**
 * Permet de verifier s'il ya une collision entre un objectif
 * et une balle lancée par la voiture
 * Code executé a chaque milliseconde
 */
setInterval(function(){
    const len = fires.children().length
    if(len > 0) {
        const fire = $(fires.children()[len - 1]);
        const fireOffsetX = Number.parseFloat(fire.css('left'));
        const enemyOffsetX = Number.parseFloat(enemy.css('left'));

        if(fireOffsetX - 100 >= enemyOffsetX) {
            stopEnemy();
            fire.remove();
        }
    }
}, 1)

/**
 * Verifie qu'une balle lanceé n'est plus visible, dans tel cas, on supprime
 * la balise <img> correpondate.
 * Code executé toute les 3 secondes.
 */
setInterval(function(){
    const firesLen = fires.children().length

    if(firesLen > 0) {
        for(let i = 0; i < firesLen; i++) {
            const _fire = $(fires.children()[i]);
            const fireOffsetX = Number.parseFloat(_fire.css('left'));
            console.log(fireOffsetX);

            if(fireOffsetX >= 1200)
                _fire.remove();
        }
    }
}, 6000)

manageDirections();
rangeSlider.addEventListener("input", showSliderValue, false);

//* --------------------- LES FONCTIONS UTILITAIRES ---------------------
/**
 * Met en marche / arret la voiture.
 * Si elle est en déplacement, elle est arretée, sinon on la démarre
 */
function toggleCarMovement() {
    if(!isRunning)
        move();
    else
        stop();
    isRunning = !isRunning;
}

/**
 * Arrete toutes les animations (background, voiture, objets).
 */
function stop() {
    carPowerButton.children('i').addClass('play').removeClass('pause');
    stopCar();
    stopBackground();
    clearInterval(enemyGeneratorlHandler);
    isEnemyMoving = false;
    stopEnemy();
}

/**
 * Fonction donnat l'impression qu'une voiture se depalce
 * En faisant animer l'image de fond,
 * et en remplacant la voiture au format png par le format GIF
 */
function move() {
    carPowerButton.children('i').addClass('pause').removeClass('play');
    moveCar();
    moveBackground();
    
    enemyGeneratorlHandler = setInterval(function(){
        if(!isEnemyMoving && Math.floor(Math.random() * 100) >= 65)
            moveEnemy();
    }, 3000);
}

/**
 * Deplace la voiture: Remplace l'image PNG par une image annimee GIF.
 */
function moveCar() {
    car.children()[0].src = 'images/animated-car-image-0049.gif';
}

/**
 * Arrete la voiture: Remplace l'image annimee GIF par une image PNG.
 */
function stopCar() {
    car.children()[0].src = 'images/animated-car-image-0049.png';
}

/**
 * Fais bouger l'image de fond avec la fonction animate
 */
function moveBackground() {
    background.animate({
        'left': `${carDirection}=100%`
    }, speed * 2, 'linear', function(){
        background.css('left', 0);
        moveBackground();
    })
}

/**
 * Arrete l'animation de l'image de fond.
 */
function stopBackground() {
    background.stop(true, false);
}

/**
 * Animation des objectifs de la droite vers la gauche
 */
function moveEnemy()
{
    enemy.css('left', '1200px');
    isEnemyMoving = true;
    enemy.animate({'left': '-=1300px'}, 2 * speed, 'linear', function(){
        moveEnemy();
    });
}

/**
 * Arrete l'animation des objectifs
 */
function stopEnemy()
{
    enemy.css('left', '1600px');
    enemy.stop(true, false);
    isEnemyMoving = false;
}

/**
 * Lance une balle a une cible
 */
function shoot()
{
    const fire = '<img src="images/efecto_fuego_00002.png" class="fire" alt="Fire">';

    fires.append(fire);
    shootSound.play();

    animateFire($('.fire'));
}

/**
 * Animation d'un feu lancé par la voiture
 * @param {*} fire
 */
function animateFire(fire)
{
    fire.animate({
        'left': '+=100%'
    }, 5 * speed  / 3, 'linear', function(){
        animateFire(fire);
    })
}

/**
 * Permet de changer la direction de la voiture: En avant ou en arriere.
 * @param {Direction} direction la nouvelle direction a prendre
 */
function turnCarTo(direction)
{
    switch (direction) {
        case Direction.UP:
            if(carPosition.y > -87)
                carPosition.y -= 3;
            car.css('transform', `translateY(${carPosition.y}px)`);
            break;
        
        case Direction.DOWN:
            if(carPosition.y < 12)
                carPosition.y += 3;
            car.css('transform', `translateY(${carPosition.y}px)`);
            break;
        
        case Direction.LEFT:
                carDirection = Direction.LEFT;
            break;
            
        case Direction.RIGHT:
                carDirection = Direction.RIGHT;
            break;
        default:
                // car.css('transform', 'rotate(15deg)');
            break;
    }
    stop();
    move();
}

/**
 * Permet de gerer les directions.
 * Ainsi que les touches du claviers.
 */
function manageDirections()
{
    // Gestion de controle du tableau de bord
    directionsKeys.on('click', function(e) {
        if($(this).hasClass('up'))
            turnCarTo(Direction.UP);
        else if($(this).hasClass('down'))
            turnCarTo(Direction.DOWN);
        else if($(this).hasClass('left'))
            turnCarTo(Direction.LEFT);
        else if($(this).hasClass('right'))    
            turnCarTo(Direction.RIGHT);
    });
    
    // La gestion du clavier
    $(document).keydown(function(e){
        switch (e.which) {
            // SPACE
            case 32:
                toggleCarMovement();
                break;
            // UP
            case 38:
                turnCarTo(Direction.UP);
                break; 
            // DOWN
            case 40:
                turnCarTo(Direction.DOWN);
                break;
            // LEFT
            case 37:
                turnCarTo(Direction.LEFT);
                break;
            // RIGHT
            case 39:
                turnCarTo(Direction.RIGHT);
                break;
            // Touche G
            case 71:
                shoot();
                break;
            default:
                console.log('touche ' + e.key + ' code ' + e.which);
                break;
        }
    })
}

/**
 * Quand on change la vitesse, on met a jour la position de l'indicateur
 */
function showSliderValue() {
  rangeBullet.innerHTML = rangeSlider.value;
  const bulletPosition = (rangeSlider.value / rangeSlider.max);
  rangeBullet.style.left = (bulletPosition * 485) + "px";
}
