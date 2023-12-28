document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btn-start');
    const btnZero = document.getElementById('btn-zero');
    const btnRules = document.getElementById('btn-rules');
    const menuMusic = document.getElementById('menu-music');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');

    gameScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    menuMusic.play();

    btnStart.addEventListener('click', () => {
        document.getElementById('menu').style.display = 'none';
        gameScreen.style.display = 'block';
        startGame();
    });

    btnZero.addEventListener('click', () => {
        /*window.location.href = 'zero_menu.html';*/
        window.location.assign('zero_menu.html');
    });

    btnRules.addEventListener('click', () => {
        window.location.assign('rules_menu.html');
    });

});

const character = document.getElementById('character');
const hearts = document.querySelectorAll('.heart');
let lives = hearts.length;
let score = 0;
const scoreElement = document.getElementById('score');
let giftSpeed; // Скорость подарков

function startGame() {
    resetGame();
    setInterval(createGiftElement, 3000);
    setInterval(createBooster, 10000);
}

function resetGame() {
    lives = hearts.length;
    score = 0;
    updateScore(0);
    updateLivesDisplay();
    giftSpeed = 20;
}

function updateScore(points) {
    score += points;
    scoreElement.textContent = score;
}

function updateLivesDisplay() {
    hearts.forEach((heart, index) => {
        heart.style.display = index < lives ? 'block' : 'none';
    });
}

function isCollision(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    return rect1.left < rect2.right && rect1.right > rect2.left &&
           rect1.top < rect2.bottom && rect1.bottom > rect2.top;
}

function loseLife() {
    if (lives > 0) {
        lives--;
        updateLivesDisplay();
        if (lives === 0) {
            endGame();
        }
    }
}

function createGiftElement() {
    const gift = getRandomGift();
    const giftElement = document.createElement('div');
    giftElement.className = 'gift';
    const gameScreenWidth = document.getElementById('game-screen').clientWidth;
    const maxX = gameScreenWidth - 50;
    giftElement.style.left = Math.random() * maxX + 'px';
    giftElement.style.top = 'auto';
    giftElement.style.animationDuration = `${100 / giftSpeed}s`;
    giftElement.dataset.name = gift.name; // Добавляем имя подарка в dataset
    giftElement.dataset.points = gift.points;
    giftElement.style.backgroundImage = `url('${gift.image}')`;
    document.getElementById('game-screen').appendChild(giftElement);

    requestAnimationFrame(() => handleGift(giftElement));
}
function handleGift(giftElement) {
    if (giftElement.parentNode) {
        if (isCollision(giftElement, character)) {
            const points = parseInt(giftElement.dataset.points, 10);
            updateScore(points);
            giftElement.remove();
        } else {
            const gameScreenRect = document.getElementById('game-screen').getBoundingClientRect();
            if (giftElement.getBoundingClientRect().bottom >= gameScreenRect.bottom) {
               // Когда подарок достигает "пола", запускаем анимацию "escape"
                giftElement.style.animation = 'escape 10s forwards';
                giftElement.style.top = '88%';
                loseLife();
                startEscapeAnimation(giftElement);
            } else {
                requestAnimationFrame(() => handleGift(giftElement));
            }
        }
    }
}

function startEscapeAnimation(giftElement) {
    // Получаем имя подарка из dataset
    const giftName = giftElement.dataset.name;
    changeGiftImage(giftElement, `${giftName}_escape_0`);
    giftElement.style.animation = 'escape 2s forwards';

    setTimeout(() => changeGiftImage(giftElement, `${giftName}_escape_1`), 1000);
    setTimeout(() => {
        changeGiftImage(giftElement, `${giftName}_escape_2`);
        giftElement.remove();
    }, 2000);
}

function changeGiftImage(giftElement, imageName) {
    giftElement.style.backgroundImage = `url('img/presents/${imageName}.png')`;
}


// Функция для случайного выбора подарка на основе вероятности
function getRandomGift() {
    const random = Math.random();
    let cumulativeProbability = 0;
    for (const gift of gifts) {
        cumulativeProbability += gift.probability;
        if (random <= cumulativeProbability) {
            return gift;
        }
    }
    return null; // В случае, если подарок не выбран
}

const gifts = [
    { name: 'Gift 1', points: 10, probability: 0.3, image: 'img/presents/Gift 1 fall.png' },
    { name: 'Gift 2', points: 5, probability: 0.45, image: 'img/presents/Gift 2 fall.png' },
    { name: 'Gift 3', points: 20, probability: 0.2, image: 'img/presents/Gift 3 fall.png' },
    { name: 'Gift 4', points: 50, probability: 0.05, image: 'img/presents/Gift 4 fall.png' }

];

// Обработка движения персонажа с учетом границ игрового поля
document.getElementById('game-screen').addEventListener('mousemove', function(event) {
    const gameScreenRect = this.getBoundingClientRect();
    const characterWidth = character.offsetWidth; // Получаем ширину персонажа 

        // Рассчитываем новую позицию X для персонажа
    let newX = event.clientX - gameScreenRect.left - characterWidth / 2;

        // Ограничиваем новую позицию X в пределах игрового экрана
     newX = Math.max(50, Math.min(newX, gameScreenRect.width - characterWidth + 50));

     character.style.left = newX + 'px'; // Обновляем позицию персонажа
});
// Массив бустеров 
const boosters = [
    { id: 'speed', image: 'img/boosters/toy_elf.png' },
    { id: 'slow', image: 'img/boosters/snowflake.png' },
    { id: 'magnet', image: 'img/boosters/magnet.png' },
    { id: 'shield', image: 'img/boosters/shield.png' },
    { id: 'brokenHeart', image: 'img/boosters/broken_heart.png' }
];

// Функция для создания бустера
function createBooster() {
    const boosterIndex = Math.floor(Math.random() * boosters.length);
    const booster = boosters[boosterIndex];
    const boosterElement = document.createElement('div');
    boosterElement.className = 'booster';
    boosterElement.dataset.boosterId = booster.id;
    boosterElement.style.backgroundImage = `url('${booster.image}')`;

    const gameScreenWidth = document.getElementById('game-screen').clientWidth;
    const maxX = gameScreenWidth - 50;
    boosterElement.style.left = Math.random() * maxX + 'px';
    

    document.getElementById('game-screen').appendChild(boosterElement);

    boosterElement.addEventListener('animationend', () => {
        boosterElement.remove();
    });
    handleBooster(boosterElement); // Обработка столкновения
}


function handleBooster(boosterElement) {
    if (boosterElement.parentNode) {
        if (isCollision(boosterElement, character)) {
            applyBooster(boosterElement.dataset.boosterId);
            boosterElement.remove();
        } else {
            const gameScreenRect = document.getElementById('game-screen').getBoundingClientRect();
            const boosterRect = boosterElement.getBoundingClientRect();

            if (boosterRect.bottom >= gameScreenRect.height * 0.8) { // 80% от высоты игрового поля
                boosterElement.style.opacity = '0';
                boosterElement.style.transition = 'opacity 0.1s ease-out';
                setTimeout(() => boosterElement.remove(), 100);
            } else {
                requestAnimationFrame(() => handleBooster(boosterElement));
            }
        }
    }
}

function applyBooster(boosterId) {
    switch (boosterId) {
        case 'speed':
            changeGiftSpeed(2, 4); // Увеличение скорости подарков
            break;
        case 'slow':
            changeGiftSpeed(0.5, 4); // Замедление скорости подарков
            break;
        case 'magnet':
            attractGifts(); // Притягиваем подарки к персонажу
            break;
        case 'shield':
            activateShield(5); // Активация щита на 5 секунд
            break;

        case 'brokenHeart':
            if (!isShieldActive) {
                loseLifeWithAnimation();
            }
            break;
    }
}

function changeGiftSpeed(factor, duration) {
    giftSpeed *= factor;
    setTimeout(() => {
        giftSpeed /= factor;
    }, duration * 1000);
}

function magnit()
{
    const gifts = document.querySelectorAll('.gift');
    gifts.forEach(gift => {
        // Перемещаем каждый подарок к персонажу
        gift.style.left=character.style.left;
    }); 
}

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}
    async function attractGifts() {
        for (let i=0; i<400; i++) {
            await sleep(10);
            magnit();
        }
}

let isShieldActive = false;

// Активируем щит вокруг персонажа
function activateShield(duration) {
    isShieldActive = true;
    const shieldElement = document.createElement('div');
    shieldElement.id = 'shield';
    shieldElement.style.position = 'absolute';
    shieldElement.style.width = '100%';
    shieldElement.style.height = '100%';
    shieldElement.style.backgroundColor = 'rgba(0, 191, 255, 0.15)'; // Прозрачный голубой цвет
    shieldElement.style.borderRadius = '60%';
    shieldElement.style.top = '0';
    shieldElement.style.left = '0';
    character.appendChild(shieldElement);

    setTimeout(() => {
        isShieldActive = false;
        shieldElement.remove(); // Удаление элемента щита из DOM
    }, duration * 1000);
}

function loseLifeWithAnimation() {
    loseLife();
    showLifeLostAnimation();
}

function showLifeLostAnimation() {
    const lifeLostText = document.createElement('div');
    lifeLostText.textContent = '-1';
    lifeLostText.style.position = 'absolute';
    lifeLostText.style.color = 'red';
    lifeLostText.style.fontSize = '50px';
    lifeLostText.style.fontWeight = 'bold';
    lifeLostText.style.top = character.offsetTop + 'px';
    lifeLostText.style.left = character.offsetLeft + 'px';
    document.getElementById('game-screen').appendChild(lifeLostText);

    // Анимация исчезновения текста
    setTimeout(() => {
        lifeLostText.style.transform = 'translateY(-500px)';
        lifeLostText.style.opacity = '0';
    }, 1000);

    // Удаление элемента после анимации
    setTimeout(() => {
        lifeLostText.remove();
    }, 2000);
}


function endGame() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'flex';
    // Остановка всех игровых процессов
}

document.getElementById('btn-restart').addEventListener('click', restartGame);

function restartGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    resetGame();
}