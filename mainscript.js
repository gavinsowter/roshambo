// =========================================================
// ROSHAMBO: website version
// The game logic is the same as your command-line version
// (saved in console-version.js). The difference: instead of
// prompt() and console.log(), we use button clicks and
// change the text on the page.
// =========================================================


// ----- SETTINGS -----
const WINNING_SCORE = 5;    // first to 5 wins the game

// emoji for each choice, so we can show the hands
// (an "object" works like a Python dictionary: key -> value)
const HAND_EMOJI = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️",
};


// ----- SCORES (same as your command-line version) -----
let humanScore = 0;
let computerScore = 0;
let roundNumber = 0;


// ----- GRAB THE PARTS OF THE PAGE WE NEED TO CHANGE -----
// document.querySelector finds an element in the HTML.
// "#" means "find the element with this id".
const humanScoreText = document.querySelector("#human-score");
const robotScoreText = document.querySelector("#robot-score");
const humanHand = document.querySelector("#human-hand");
const robotHand = document.querySelector("#robot-hand");
const robot = document.querySelector("#robot");
const message = document.querySelector("#message");
const historyList = document.querySelector("#history");
const playAgainButton = document.querySelector("#play-again");

// querySelectorAll finds ALL matching elements (our 3 buttons)
const choiceButtons = document.querySelectorAll(".choice");


// =========================================================
// YOUR FUNCTION: the robot picks randomly (unchanged!)
// =========================================================
function getComputerChoice() {
    let randomNumber = Math.floor(Math.random() * 3);

    if (randomNumber === 0) {
        return "rock";
    }
    else if (randomNumber === 1) {
        return "paper";
    }
    else {
        return "scissors";
    }
}


// =========================================================
// YOUR playRound, with one change: instead of printing,
// it RETURNS "tie", "win" or "lose" so the page can react.
// =========================================================
function playRound(humanChoice, computerChoice) {

    // 1. Tie: both picked the same thing
    if (humanChoice === computerChoice) {
        return "tie";
    }

    // 2. Human wins: the same 3 cases you wrote
    else if (
        (humanChoice === "rock" && computerChoice === "scissors") ||
        (humanChoice === "paper" && computerChoice === "rock") ||
        (humanChoice === "scissors" && computerChoice === "paper")
    ) {
        humanScore++;
        return "win";
    }

    // 3. Anything else means the robot won
    else {
        computerScore++;
        return "lose";
    }
}


// =========================================================
// Runs every time you click rock, paper, or scissors
// =========================================================
function handleClick(humanChoice) {

    // turn the buttons off so you can't spam-click during the animation
    setButtonsEnabled(false);

    // reset both hands to fists and clear the robot's mood
    humanHand.textContent = HAND_EMOJI.rock;
    robotHand.textContent = HAND_EMOJI.rock;
    robot.classList.remove("happy", "sad");
    message.className = "message";      // removes the win/lose color
    message.textContent = "Rock... Paper... Scissors...";

    // start the bouncing animation on both hands
    humanHand.classList.add("shaking");
    robotHand.classList.add("shaking");

    // setTimeout waits, then runs the code inside.
    // 900 milliseconds = the length of the 3 bounces in style.css
    setTimeout(function () {

        // stop bouncing
        humanHand.classList.remove("shaking");
        robotHand.classList.remove("shaking");

        // the robot picks, and we play the round
        const computerChoice = getComputerChoice();
        const result = playRound(humanChoice, computerChoice);

        // reveal both hands
        humanHand.textContent = HAND_EMOJI[humanChoice];
        robotHand.textContent = HAND_EMOJI[computerChoice];

        // update the page based on who won
        showResult(result, humanChoice, computerChoice);

    }, 900);
}


// =========================================================
// Updates the message, score, robot face and history
// =========================================================
function showResult(result, humanChoice, computerChoice) {
    roundNumber++;

    let text;   // the message we'll show

    if (result === "tie") {
        text = `It's a tie! You both picked ${humanChoice}.`;
    }
    else if (result === "win") {
        text = `You win! ${humanChoice} beats ${computerChoice}.`;
        message.classList.add("win");       // green text
        robot.classList.add("sad");         // robot frowns
    }
    else {
        text = `You lose! ${computerChoice} beats ${humanChoice}.`;
        message.classList.add("lose");      // red text
        robot.classList.add("happy");       // robot grins
    }

    message.textContent = text;

    // update the scoreboard numbers
    humanScoreText.textContent = humanScore;
    robotScoreText.textContent = computerScore;

    // add this round to the history list
    // createElement makes a brand-new <li> (list item)
    const item = document.createElement("li");
    item.textContent = `Round ${roundNumber}: ${text}`;
    historyList.prepend(item);      // prepend = add to the TOP of the list

    // did someone reach 5? (same idea as the end of your playGame)
    if (humanScore === WINNING_SCORE || computerScore === WINNING_SCORE) {
        endGame();
    }
    else {
        setButtonsEnabled(true);    // turn the buttons back on for the next round
    }
}


// =========================================================
// Game over: announce the winner and show "Play again"
// =========================================================
function endGame() {
    if (humanScore > computerScore) {
        message.textContent = `🏆 You beat the robot ${humanScore} to ${computerScore}!`;
        message.className = "message win";
    }
    else {
        message.textContent = `🤖 The robot wins ${computerScore} to ${humanScore}. Try again!`;
        message.className = "message lose";
    }

    // buttons stay off, and the Play again button appears
    playAgainButton.classList.remove("hidden");
}


// =========================================================
// Reset everything back to the start
// =========================================================
function resetGame() {
    humanScore = 0;
    computerScore = 0;
    roundNumber = 0;

    humanScoreText.textContent = 0;
    robotScoreText.textContent = 0;
    humanHand.textContent = HAND_EMOJI.rock;
    robotHand.textContent = HAND_EMOJI.rock;
    robot.classList.remove("happy", "sad");
    message.className = "message";
    message.textContent = "Pick your move to start!";
    historyList.innerHTML = "";     // empties the history list

    playAgainButton.classList.add("hidden");
    setButtonsEnabled(true);
}


// helper: turns all 3 choice buttons on (true) or off (false)
function setButtonsEnabled(enabled) {
    // forEach = run this for every button (like a Python for loop)
    choiceButtons.forEach(function (button) {
        button.disabled = !enabled;     // ! flips true/false
    });
}


// =========================================================
// CONNECT THE BUTTONS
// addEventListener("click", ...) = "when this is clicked, run this"
// =========================================================
choiceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        // read the data-choice="..." label from the HTML button
        handleClick(button.dataset.choice);
    });
});

playAgainButton.addEventListener("click", resetGame);
