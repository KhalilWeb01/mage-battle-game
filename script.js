document.getElementById('play-button').addEventListener('click', startGame);
document.getElementById('settings-button').addEventListener('click', showSettings);
document.getElementById('exit-button').addEventListener('click', exitGame);

function startGame() {
    document.getElementById('menu').style.display = 'none'; // Скрыть меню
    document.getElementById('game-area').style.display = 'block'; // Показать игровое поле
    initGame(); // Инициализируем игру
}

function showSettings() {
    alert("Настройки пока недоступны."); // Здесь можно будет добавить функционал
}

function exitGame() {
    window.close(); // Закрыть окно (не будет работать в браузерах, но можно добавить логику для возврата на главную)
}
function startGame() {
    document.getElementById('menu').style.display = 'none'; // Скрыть меню
    document.getElementById('game-area').style.display = 'block'; // Показать игровое поле
    document.getElementById('game-mode-selection').style.display = 'block'; // Показать выбор режима игры
    initGame(); // Инициализируем игру
}

document.getElementById('mode-2v2').addEventListener('click', function() {
    selectGameMode('2v2');
});
document.getElementById('mode-4v4').addEventListener('click', function() {
    selectGameMode('4v4');
});

function selectGameMode(mode) {
    alert("Вы выбрали режим: " + mode); // Здесь можно будет добавить логику для инициализации выбранного режима
    // Дальше можно добавить логику для инициализации игры в зависимости от выбранного режима
}
document.getElementById('back-to-menu').addEventListener('click', function() {
    document.getElementById('game-mode-selection').style.display = 'none'; // Скрыть выбор режима
    document.getElementById('menu').style.display = 'block'; // Показать главное меню
});


document.getElementById('play-button').addEventListener('click', function() {
    window.location.href = 'loading.html'; // Перенаправление на game.html
});

window.addEventListener("DOMContentLoaded", () => {
    const music = document.getElementById("menu-music");
    music.volume = 0.1; // 🔈 Громкость (0.0 - 1.0)
  });
  document.addEventListener("click", () => {
    const music = document.getElementById("menu-music");
    if (music.paused) {
      music.play();
    }
  }, { once: true });

