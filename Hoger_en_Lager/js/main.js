console.log('Main loaded');

const diceArray = ['&#9856;', '&#9857;', '&#9858;', '&#9859;', '&#9860;', '&#9861;'];

const computerDiceOneElement = document.querySelector('.computer-dice-one');
const computerDiceTwoElement = document.querySelector('.computer-dice-two');
const playerDiceOneElement = document.querySelector('.player-dice-one');
const playerDiceTwoElement = document.querySelector('.player-dice-two');
const computerCreditsElement = document.querySelector('.computer-credits');
const playerCreditsElement = document.querySelector('.player-credits');
const messageBox = document.querySelector('.message-box');
const diceButton = document.querySelector('.dice-button');
const higherButton = document.querySelector('.higher-button');
const lowerButton = document.querySelector('.lower-button');
const goButton = document.querySelector('.go-button');

// Initialize game variables
let computerCredits = 3;
let playerCredits = 3;
let computerDiceOne = 0;
let computerDiceTwo = 0;
let playerDiceOne = 0;
let playerDiceTwo = 0;

let computerturn = true;
let gameOver = false;
let higher = false;

// Function to start the game
function startGame() {
  messageBox.textContent = 'Het spel is gestart, de computer moet gooien';
  goButton.disabled = true;
  diceButton.disabled = false;
  computerCreditsElement.textContent = computerCredits;
  playerCreditsElement.textContent = playerCredits;

  if (gameOver) {
    playerCredits = 3;
    computerCredits = 3;
    computerCreditsElement.textContent = computerCredits;
    playerCreditsElement.textContent = playerCredits;
    gameOver = false;
  }
}

// Event listener for the "GO" button
goButton.addEventListener('click', startGame);

// Event listener for the dice button
diceButton.addEventListener('click', function () {
  // In case it is the computer's turn, the computer dices are cast and buttons are set accordingly
  if (computerturn) {
    computerDiceOne = getRandomInt(6);
    computerDiceTwo = getRandomInt(6);

    computerDiceOneElement.innerHTML = diceArray[computerDiceOne];
    computerDiceTwoElement.innerHTML = diceArray[computerDiceTwo];

    messageBox.textContent = 'Computer heeft gegooid. Ga jij hoger of lager gooien?';
    higherButton.disabled = false;
    lowerButton.disabled = false;
    diceButton.disabled = true;
  }

  // In case it is NOT the computer's turn (i.e. player's turn), the player dice are cast and values are checked
  if (!computerturn) {
    playerDiceOne = getRandomInt(6);
    playerDiceTwo = getRandomInt(6);
    playerDiceOneElement.innerHTML = diceArray[playerDiceOne];
    playerDiceTwoElement.innerHTML = diceArray[playerDiceTwo];

    messageBox.textContent = 'Speler heeft gegooid. Ga jij hoger of lager gooien?';
    higherButton.disabled = false;
    lowerButton.disabled = false;
    diceButton.disabled = true;

    // player choose higher and dice values are indeed higher, player wins
    if (higher && computerDiceOne + computerDiceTwo < playerDiceOne + playerDiceTwo) {
      messageBox.textContent = 'Je koos hoger en je hebt hoger gegooid dan de computer. Dus jij wint';
      computerCredits = computerCredits - 1;
      playerCredits = playerCredits + 2;
    }
    // player choose higher and dice values are not higher, player loses
    if (higher && computerDiceOne + computerDiceTwo > playerDiceOne + playerDiceTwo) {
      messageBox.textContent = 'Je koos hoger en je hebt lager gegooid dan de computer. Dus jij verliest';
      computerCredits = computerCredits + 2;
      playerCredits = playerCredits - 1;
    }
    // player choose lower and dice values are indeed lower, player wins
    if (!higher && computerDiceOne + computerDiceTwo > playerDiceOne + playerDiceTwo) {
      messageBox.textContent = 'Je koos lager en je hebt lager gegooid dan de computer. Dus jij wint';
      computerCredits = computerCredits - 1;
      playerCredits = playerCredits + 2;
    };
    // player choose lower and dice values are not lower, player loses
    if (!higher && computerDiceOne + computerDiceTwo < playerDiceOne + playerDiceTwo) {
      messageBox.textContent = 'Je koos lager en je hebt hoger gegooid dan de computer. Dus jij verliest';
      computerCredits = computerCredits + 2;
      playerCredits = playerCredits - 1;
    };
    // in this case, it's a tie
    if (computerDiceOne + computerDiceTwo === playerDiceOne + playerDiceTwo) {
      messageBox.textContent = 'Het is gelijkspel';
    };

    computerCreditsElement.textContent = computerCredits;
    playerCreditsElement.textContent = playerCredits;
    diceButton.disabled = true;
    higherButton.disabled = true;
    lowerButton.disabled = true;
    goButton.disabled = false;
    computerturn = true;

    // Check if game is over
    if (computerCredits <= 0) {
      messageBox.textContent = "De credits van de computer zijn op";
      gameOver = true;
    }
    if (playerCredits <= 0) {
      messageBox.textContent = "Jouw credits zijn op";
      gameOver = true;
    }
  }
});

// Event listener for the "Hoger" button
higherButton.addEventListener('click', function () {
  messageBox.textContent = 'Je hebt "Hoger" gekozen. Druk op "Gooi dobbelsteen" om verder te gaan.';
  higherButton.disabled = true;
  lowerButton.disabled = true;
  diceButton.disabled = false;
  computerturn = false;
  higher = true;
});

// Event listener for the "Lager" button
lowerButton.addEventListener('click', function () {
  messageBox.textContent = 'Je hebt "Lager" gekozen. Druk op "Gooi dobbelsteen" om verder te gaan.';
  higherButton.disabled = true;
  lowerButton.disabled = true;
  diceButton.disabled = false;
  computerturn = false;
  higher = false;
});

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
