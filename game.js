// Импорт необходимых модулей из Firebase
import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Получаем элементы DOM
const chooseArea = document.getElementById("choose-area"); // Область выбора карт
const playerArea = document.getElementById("player-area"); // Область карт игрока
const botArea = document.getElementById("bot-area"); // Область карт бота
const playerMag = document.getElementById("player-mag"); // Область мага игрока
const botMag = document.getElementById("bot-mag"); // Область мага бота

// Глобальные переменные
let selectedMages = []; // Массив выбранных магов
let abilities = []; // Массив всех способностей
let isPlayerTurn = true; // Флаг хода игрока

// Функция загрузки магов из Firebase
async function loadMages() {
  const mageCollection = collection(db, "mages"); // Получаем коллекцию магов
  const mageSnapshot = await getDocs(mageCollection); // Получаем снимок коллекции

  // Для каждого документа в коллекции
  mageSnapshot.forEach((docSnap) => {
    const mage = docSnap.data(); // Получаем данные мага
    mage.id = docSnap.id; // Сохраняем ID мага

    // Создаем карточку мага
    const card = document.createElement("div");
    card.classList.add("mage-card");
    card.setAttribute("data-id", mage.id);
    card.innerHTML = `
      <img src="${mage.image}" alt="${mage.name}" class="mage-card">
    `;
    // Добавляем обработчик клика
    card.addEventListener("click", () => selectMage(mage, card));
    chooseArea.appendChild(card);
  });

  await loadAbilities(); // Загружаем способности
}

// Функция загрузки способностей из Firebase
async function loadAbilities() {
  const abilitiesCollection = collection(db, "cpells"); // Получаем коллекцию способностей
  const abilitiesSnapshot = await getDocs(abilitiesCollection); // Получаем снимок коллекции

  // Добавляем каждую способность в массив
  abilitiesSnapshot.forEach((docSnap) => {
    const ability = docSnap.data();
    abilities.push(ability.name.toLowerCase());
  });

  console.log("All abilities loaded:", abilities);
}

// Функция выбора мага игроком
function selectMage(mage, cardElement) {
  if (selectedMages.length >= 2) return; // Если уже выбрано 2 мага, выходим

  selectedMages.push(mage); // Добавляем мага в массив выбранных
  cardElement.remove(); // Удаляем карточку из области выбора

  // Если это первый выбранный маг (игрок)
  if (selectedMages.length === 1) {
    displayMage(playerMag, mage); // Отображаем мага игрока
    setTimeout(() => {
      botChooseMage(); // Бот выбирает мага через 500мс
    }, 500);
  }
}

// Функция выбора мага ботом
async function botChooseMage() {
  const mageCollection = collection(db, "mages");
  const mageSnapshot = await getDocs(mageCollection);

  const availableMages = []; // Массив доступных магов
  mageSnapshot.forEach((docSnap) => {
    const mage = docSnap.data();
    mage.id = docSnap.id;

    // Если маг еще не выбран
    if (!selectedMages.some(selected => selected.id === mage.id)) {
      availableMages.push(mage);
    }
  });

  // Бот выбирает случайного мага
  const randomMage = availableMages[Math.floor(Math.random() * availableMages.length)];
  selectedMages.push(randomMage);

  displayMage(botMag, randomMage); // Отображаем мага бота

  showElementCards(); // Показываем карты элементов
}

// Функция отображения мага в указанной области
function displayMage(container, mage) {
  container.innerHTML = ""; // Очищаем контейнер
  const img = document.createElement("img");
  img.src = mage.image;
  img.classList.add("mage-selected");
  img.setAttribute("data-id", mage.id);
  img.width = 100;
  img.height = 100;
  container.appendChild(img);
}

// Функция показа карт элементов
function showElementCards() {
  chooseArea.innerHTML = ""; // Очищаем область выбора
  // Создаем 8 карт элементов
  for (let i = 0; i < 12; i++) {
    const elementCard = document.createElement("div");
    elementCard.classList.add("element-card");
    elementCard.innerHTML = `<img src="/assets/card/CardBack.png" alt="element-card">`;

    // Добавляем обработчик клика
    elementCard.addEventListener("click", async () => {
      if (!isPlayerTurn || elementCard.classList.contains("used")) return;

      elementCard.classList.add("used"); // Помечаем как использованную
      elementCard.remove(); // Удаляем карту
      const randomAbility = getRandomAbility(); // Получаем случайную способность
      await addAbilityCard(playerArea, randomAbility, true); // Добавляем карту способности

      isPlayerTurn = false; // Передаем ход боту
      setTimeout(botTurn, 1000); // Бот делает ход через 1с
      checkBattleStart(); // Проверяем начало битвы
    });

    chooseArea.appendChild(elementCard);
  }
}

// Ход бота
async function botTurn() {
  // Получаем доступные карты
  const availableCards = Array.from(chooseArea.children).filter(card => !card.classList.contains("used"));
  if (availableCards.length === 0) return;

  // Бот выбирает случайную карту
  const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
  randomCard.classList.add("used");
  randomCard.remove();

  const randomAbility = getRandomAbility(); // Получаем случайную способность
  await addAbilityCard(botArea, randomAbility, false); // Добавляем карту способности боту

  isPlayerTurn = true; // Возвращаем ход игроку
  checkBattleStart(); // Проверяем начало битвы
}

// Функция получения случайной способности
function getRandomAbility() {
  return abilities[Math.floor(Math.random() * abilities.length)];
}

// Функция добавления карты способности
async function addAbilityCard(area, abilityName, isPlayer = false) {
  const abilityDoc = doc(db, "cpells", abilityName.toLowerCase());
  const abilitySnap = await getDoc(abilityDoc);

  if (abilitySnap.exists()) {
    const abilityData = abilitySnap.data();
    const abilityCard = document.createElement("img");
    abilityCard.src = abilityData.image;
    abilityCard.classList.add("element-card");
    abilityCard.setAttribute("data-id", abilityData.id);

    // Если это карта игрока, добавляем обработчик клика
    if (isPlayer) {
      abilityCard.addEventListener("click", () => {
        showSpellModal(abilityData); // Показываем модальное окно с информацией
      });
    }

    area.appendChild(abilityCard);
  } else {
    console.error("Ability not found:", abilityName);
  }
}

// Функция показа модального окна с информацией о способности
function showSpellModal(ability) {
  document.getElementById("spellImage").src = ability.image;
  document.getElementById("spellName").textContent = ability.name;
  document.getElementById("spellDescription").textContent = ability.description || "Нет описания.";
  document.getElementById("spellDamage").textContent = ability.damage || "0";
  document.getElementById("spellManaCost").textContent = ability.mana || "0";

  document.getElementById("spellModal").style.display = "block";
}

// Функция закрытия модального окна
function closeSpellModal() {
  document.getElementById("spellModal").style.display = "none";
}

// Назначаем обработчик закрытия модального окна
document.querySelector(".close-btn").addEventListener("click", closeSpellModal);

// Функция проверки начала битвы
function checkBattleStart() {
  const remainingCards = Array.from(chooseArea.children).filter(card => !card.classList.contains("used"));
  if (remainingCards.length === 0) {
    showMageBattleScene(); // Если карты закончились, начинаем битву
  }
}

// Функция показа сцены битвы магов
function showMageBattleScene() {
  document.querySelectorAll('.battle-side, .vs-text').forEach(el => el.remove());

  const playerMage = selectedMages[0]; // Маг игрока
  const botMage = selectedMages[1]; // Маг бота

  // Создаем сторону игрока
  const playerSide = document.createElement('div');
  playerSide.classList.add('battle-side', 'left-side', 'slide-in-left');
  playerSide.innerHTML = `
    <div class="gradient-left"></div>
    <img src="${playerMage.battleImage || playerMage.image}" class="battle-mage">
  `;

  // Создаем сторону бота
  const botSide = document.createElement('div');
  botSide.classList.add('battle-side', 'right-side', 'slide-in-right');
  botSide.innerHTML = `
    <div class="gradient-right"></div>
    <img src="${botMage.battleImage || botMage.image}" class="battle-mage">
  `;

  // Создаем текст "VS"
  const vsText = document.createElement('div');
  vsText.classList.add('vs-text');
  vsText.innerText = "VS";

  // Добавляем элементы на страницу
  document.body.appendChild(playerSide);
  document.body.appendChild(botSide);
  document.body.appendChild(vsText);

  // Анимация появления текста "VS"
  setTimeout(() => {
    vsText.style.transition = "opacity 1s ease-in-out";
    vsText.style.opacity = 1;
  }, 1500);

  // Через 5 секунд убираем сцену битвы
  setTimeout(() => {
    playerSide.remove();
    botSide.remove();
    vsText.remove();

    // Показываем статистику магов
    showStats(playerMag, playerMage.hp, playerMage.mana);
    showStats(botMag, botMage.hp, botMage.mana);

    startGame(); // Начинаем игру
  }, 5000);
}

// Функция начала игры
function startGame() {
  isPlayerTurn = true; // Первый ход у игрока
}

// Функция отображения статистики (HP и Mana)
function showStats(container, hp, mana) {
  let stats = container.querySelector('.stats');

  if (!stats) {
      // Если статистики нет, создаем её
      stats = document.createElement('div');
      stats.classList.add('stats');
      stats.innerHTML = `
          <div class="stat-bar">
            <div class="stat-fill hp-fill" style="width: ${hp}%">HP: ${hp}</div>
          </div>
          <div class="stat-bar">
            <div class="stat-fill mana-fill" style="width: ${mana * 10}%">Mana: ${mana}</div>
          </div>
      `;
      container.appendChild(stats);
  } else {
      // Если уже есть - обновляем
      const hpFill = stats.querySelector('.hp-fill');
      const manaFill = stats.querySelector('.mana-fill');
      
      hpFill.style.width = `${hp}%`;
      hpFill.textContent = `HP: ${hp}`;

      manaFill.style.width = `${mana * 10}%`;
      manaFill.textContent = `Mana: ${mana}`;
  }
}

// --- Функции для перетаскивания карт и боя ---

let playerTurn = true; // Флаг хода игрока
let draggedCard = null; // Перетаскиваемая карта

// Обработчики событий перетаскивания
playerArea.addEventListener('dragstart', dragStart);
chooseArea.addEventListener('dragover', allowDrop);
chooseArea.addEventListener('drop', dropCard);

// Функция разрешения перетаскивания
function allowDrop(event) {
    event.preventDefault();
}

// Функция начала перетаскивания
function dragStart(event) {
    if (playerTurn) {
        draggedCard = event.target;
        event.dataTransfer.setData('text/plain', '');
    } else {
        event.preventDefault();
    }
}

// Функция сброса карты
function dropCard(event) {
    event.preventDefault();
    if (!playerTurn || !draggedCard) return;

    chooseArea.appendChild(draggedCard); // Добавляем карту в область выбора
    draggedCard = null;

    playerTurn = false; // Передаем ход боту

    setTimeout(botMove, 1000); // Бот делает ход через 1с
}

// Ход бота (перетаскивание карты)
function botMove() {
  const botCards = botArea.querySelectorAll('.element-card');
  if (botCards.length === 0) return;
  
    const randomIndex = Math.floor(Math.random() * botCards.length);
    const card = botCards[randomIndex];

    const botCard = card.cloneNode(true);
    chooseArea.appendChild(botCard);

    card.remove();

    setTimeout(applyDamage, 1000); // Применяем урон через 1с
}

// Функция применения урона
async function applyDamage() {
  const allCards = chooseArea.querySelectorAll('.element-card');
  if (allCards.length < 2) {
      console.error("Ошибка: не хватает карт для боя.");
      return;
  }

  const playerCard = allCards[0];
  const botCard = allCards[1];

  // Получаем текущие значения HP и Mana из интерфейса
  const playerStats = playerMag.querySelector('.stats');
  const botStats = botMag.querySelector('.stats');
  
  let playerHP = parseInt(playerStats.querySelector('.hp-fill').textContent.split(': ')[1]);
  let playerMana = parseInt(playerStats.querySelector('.mana-fill').textContent.split(': ')[1]);
  let botHP = parseInt(botStats.querySelector('.hp-fill').textContent.split(': ')[1]);
  let botMana = parseInt(botStats.querySelector('.mana-fill').textContent.split(': ')[1]);

  let playerDamage = 10; // Базовый урон игрока
  let playerManaCost = 5; // Базовая стоимость маны
  let botDamage = 10;     // Базовый урон бота
  let botManaCost = 5;    // Базовая стоимость маны бота

  // Получаем данные о способностях из карт
  if (playerCard) {
      const abilityId = playerCard.getAttribute('data-id');
      if (abilityId) {
          try {
              const abilityDoc = doc(db, "cpells", abilityId);
              const abilitySnap = await getDoc(abilityDoc);
              if (abilitySnap.exists()) {
                  const abilityData = abilitySnap.data();
                  playerDamage = abilityData.damage || 10;
                  playerManaCost = abilityData.mana || 5;
              }
          } catch (error) {
              console.error("Ошибка загрузки способности игрока:", error);
          }
      }
  }

  if (botCard) {
      const abilityId = botCard.getAttribute('data-id');
      if (abilityId) {
          try {
              const abilityDoc = doc(db, "cpells", abilityId);
              const abilitySnap = await getDoc(abilityDoc);
              if (abilitySnap.exists()) {
                  const abilityData = abilitySnap.data();
                  botDamage = abilityData.damage || 10;
                  botManaCost = abilityData.mana || 5;
              }
          } catch (error) {
              console.error("Ошибка загрузки способности бота:", error);
          }
      }
  }

  console.log(`Игрок использует способность: Урон ${playerDamage}, Мана ${playerManaCost}`);
  console.log(`Бот использует способность: Урон ${botDamage}, Мана ${botManaCost}`);

  // Проверка маны игрока и применение урона
  if (playerMana >= playerManaCost) {
      botHP = Math.max(0, botHP - playerDamage); // Не даем HP уйти ниже 0
      playerMana = Math.max(0, playerMana - playerManaCost);
  } else {
      console.log("У игрока недостаточно маны для атаки!");
  }

  // Проверка маны бота и применение урона
  if (botMana >= botManaCost) {
      playerHP = Math.max(0, playerHP - botDamage); // Не даем HP уйти ниже 0
      botMana = Math.max(0, botMana - botManaCost);
  } else {
      console.log("У бота недостаточно маны для атаки!");
  }

  console.log(`Player HP: ${playerHP} / Mana: ${playerMana}`);
  console.log(`Bot HP: ${botHP} / Mana: ${botMana}`);

  // Обновляем статистику магов
  showStats(playerMag, playerHP, playerMana);
  showStats(botMag, botHP, botMana);

  // Очищаем поле боя
  chooseArea.innerHTML = '';

  playerTurn = true; // Возвращаем ход игроку

  checkWin(); // Проверяем условие победы
}

// Функция проверки победы
function checkWin() {
  const playerHP = parseInt(playerMag.querySelector('.hp-fill')?.textContent.split(': ')[1] || '0');
  const botHP = parseInt(botMag.querySelector('.hp-fill')?.textContent.split(': ')[1] || '0');

  if (playerHP <= 0) {
      alert("Бот победил!");
      resetGame();
  } else if (botHP <= 0) {
      alert("Игрок победил!");
      resetGame();
  }
}

// Функция сброса игры
function resetGame() {
  // Здесь можно добавить логику сброса игры
  location.reload(); // Просто перезагружаем страницу для примера
}
function showAttackEffect(targetElement, damage) {
  const effect = document.createElement('div');
  effect.className = 'attack-effect';
  effect.textContent = `-${damage}`;
  targetElement.appendChild(effect);
  
  setTimeout(() => {
    effect.classList.add('animate');
    setTimeout(() => effect.remove(), 1000);
  }, 50);
}
// Запускаем загрузку магов при старте
loadMages();