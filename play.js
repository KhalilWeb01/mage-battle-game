// Допустим, это твой game.js

import { db } from './firebase-config.js';
import { collection as firestoreCollection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const chooseArea = document.getElementById('choose-area');
    const botArea = document.getElementById('bot-area');
    const playerArea = document.getElementById('player-area');
    const playerStatsContainer = document.getElementById('player-stats');
    const botStatsContainer = document.getElementById('bot-stats');

    let playerTurn = true;
    let playerHP = 100;
    let botHP = 100;
    let playerMana = 10;
    let botMana = 10;
    let spells = {}; // Все заклинания по id

    let playerMageId = ''; // сюда поставишь выбранного игрока
    let botMageId = '';    // сюда выбранного бота

    let draggedCard = null;

    // Загрузка заклинаний
    async function loadSpells() {
        const querySnapshot = await getDocs(firestoreCollection(db, "cpells"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.id && data.damage !== undefined && data.mana !== undefined) {
                spells[data.id] = {
                    name: data.name,
                    damage: data.damage,
                    mana: data.mana
                };
            }
        });
        console.log('All abilities loaded:', spells);
    }

    // Обновить HP и ману в Firebase
    async function updateMageData(mageId, hp, mana) {
        if (!mageId) return;
        const mageRef = doc(db, "mages", mageId);
        await updateDoc(mageRef, {
            hp: hp,
            mana: mana
        });
    }

    // Обновить визуально HP и ману
    function updateMageStats(container, hp, mana) {
        let stats = container.querySelector('.stats');
        if (!stats) {
            stats = document.createElement('div');
            stats.classList.add('stats');
            container.appendChild(stats);
        }
        stats.innerHTML = `
            <div class="stat-bar">
                <div class="stat-fill hp-fill" style="width: ${hp}%">HP: ${hp}</div>
            </div>
            <div class="stat-bar">
                <div class="stat-fill mana-fill" style="width: ${mana * 10}%">Mana: ${mana}</div>
            </div>
        `;
    }

    // Навешиваем data-id на карты
    function addSpellAttributes() {
        const allCards = document.querySelectorAll('.element-card');
        allCards.forEach(card => {
            const src = card.getAttribute('src');
            if (!src) return;

            const fileName = src.split('/').pop().split('.')[0].toLowerCase();

            for (const id in spells) {
                if (fileName.includes(id)) {
                    card.setAttribute('data-id', id);
                    break;
                }
            }
        });
    }

    // Перетаскивание
    playerArea.addEventListener('dragstart', dragStart);
    chooseArea.addEventListener('dragover', allowDrop);
    chooseArea.addEventListener('drop', dropCard);

    function allowDrop(event) {
        event.preventDefault();
    }

    function dragStart(event) {
        if (playerTurn) {
            draggedCard = event.target;
            event.dataTransfer.setData('text/plain', '');
        } else {
            event.preventDefault();
        }
    }

    function dropCard(event) {
        event.preventDefault();
        if (!playerTurn || !draggedCard) return;

        chooseArea.appendChild(draggedCard);
        draggedCard = null;

        playerTurn = false;

        setTimeout(botMove, 1000);
    }

    function botMove() {
        const botCards = botArea.querySelectorAll('.element-card');
        if (botCards.length === 0) return;

        const randomIndex = Math.floor(Math.random() * botCards.length);
        const card = botCards[randomIndex];

        const botCard = card.cloneNode(true);
        chooseArea.appendChild(botCard);

        card.remove();

        setTimeout(applyDamage, 1000);
    }

    async function applyDamage() {
        const allCards = chooseArea.querySelectorAll('.element-card');
        if (allCards.length < 2) {
            console.error("Ошибка: не хватает карт для боя.");
            return;
        }

        const playerCard = allCards[0];
        const botCard = allCards[1];

        let playerDamage = 0;
        let playerManaCost = 0;
        let botDamage = 0;
        let botManaCost = 0;

        if (playerCard) {
            const playerId = playerCard.getAttribute('data-id');
            if (playerId && spells[playerId]) {
                playerDamage = spells[playerId].damage;
                playerManaCost = spells[playerId].mana;
            }
        }

        if (botCard) {
            const botId = botCard.getAttribute('data-id');
            if (botId && spells[botId]) {
                botDamage = spells[botId].damage;
                botManaCost = spells[botId].mana;
            }
        }

        console.log(`Игрок использует ${playerCard?.getAttribute('data-id')}: Урон ${playerDamage}, Мана ${playerManaCost}`);
        console.log(`Бот использует ${botCard?.getAttribute('data-id')}: Урон ${botDamage}, Мана ${botManaCost}`);

        if (playerMana >= playerManaCost) {
            botHP -= playerDamage;
            playerMana -= playerManaCost;
        } else {
            console.log("У игрока недостаточно маны для атаки!");
        }

        if (botMana >= botManaCost) {
            playerHP -= botDamage;
            botMana -= botManaCost;
        } else {
            console.log("У бота недостаточно маны для атаки!");
        }

        console.log(`Player HP: ${playerHP} / Mana: ${playerMana}`);
        console.log(`Bot HP: ${botHP} / Mana: ${botMana}`);

        updateMageStats(playerStatsContainer, playerHP, playerMana);
        updateMageStats(botStatsContainer, botHP, botMana);

        await updateMageData(playerMageId, playerHP, playerMana);
        await updateMageData(botMageId, botHP, botMana);

        chooseArea.innerHTML = '';

        playerTurn = true;

        checkWin();
    }

    function checkWin() {
        if (playerHP <= 0 && botHP <= 0) {
            alert('Ничья!');
        } else if (playerHP <= 0) {
            alert('Бот победил!');
        } else if (botHP <= 0) {
            alert('Игрок победил!');
        }
    }

    // Старт игры
    loadSpells().then(() => {
        addSpellAttributes();
    });

    // УСТАНОВИ сюда правильные ID выбранных магов
    playerMageId = 'ПОДСТАВЬ_ID_ИГРОКА';
    botMageId = 'ПОДСТАВЬ_ID_БОТА';
});
