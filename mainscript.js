// =========================================================
// ROSHAMBO: website version (Style B: "Toy Robot")
// Now with a SMART Bolt that learns your habits!
//
// Your original command-line game is still in console-version.js.
// =========================================================


// ----- SETTINGS -----
const WINNING_SCORE = 5;    // first to 5 wins the game

// The icon drawing (SVG code) for each choice.
// An "object" works like a Python dictionary: key -> value.
const ICONS = {
    rock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15l2-7 6-3 6 3 2 7-4 4H8z"/><path d="M10 9l2 3-1 3"/></svg>',
    paper: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
    scissors: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9"/><path d="M14.5 14.5 20 20"/><path d="M8.1 8.1 12 12"/></svg>',
};

const MOVES = ["rock", "paper", "scissors"];

// WHAT BEATS WHAT: the move that beats each move.
// BEATS.rock is "paper" because paper beats rock.
// This is the key to Bolt's strategy: once he GUESSES your
// move, he plays BEATS[yourGuessedMove].
const BEATS = {
    rock: "paper",
    paper: "scissors",
    scissors: "rock",
};

// Things Bolt can say. One gets picked at random each round.
const BOLT_LINES = {
    win:  ["Beep boop… you got me!", "Error 404: win not found.", "Lucky guess, human.", "My circuits hurt."],
    lose: ["Ha! Robots rule!", "Calculated. Beep!", "Better luck next time!", "Too easy. Boop."],
    tie:  ["Great minds think alike!", "Jinx! Beep boop.", "We're in sync, human.", "Tie?! Rematch!"],
};

// What each difficulty level does (shown under the picker)
const LEVEL_INFO = {
    easy: "Bolt picks completely at random. Pure luck.",
    medium: "Bolt counts which move you throw the most and counters it.",
    hard: "Bolt learns what you throw AFTER each move, and uses common human habits. Try to stay unpredictable!",
};


// ----- GAME STATE (the variables that change while you play) -----
let humanScore = 0;
let computerScore = 0;
let roundNumber = 0;
let difficulty = "hard";      // "easy", "medium" or "hard"

// ----- BOLT'S MEMORY (what he's learned about you) -----
let humanHistory = [];        // every move you've made, in order, e.g. ["rock", "rock", "paper"]
let lastResult = null;        // "win", "lose" or "tie" from YOUR side, last round
let lastBoltMove = null;      // what Bolt threw last round

// Counts what you threw AFTER each move.
// e.g. afterMove.rock.paper = 3 means:
// "3 times, right after throwing rock, you threw paper next"
let afterMove = makeEmptyTable();

// How often Bolt's prediction was right (just for fun to show)
let guessesTried = 0;
let guessesRight = 0;
let currentPrediction = null; // Bolt's guess for this round (null = he didn't guess)


// ----- GRAB THE PARTS OF THE PAGE WE NEED TO CHANGE -----
const humanScoreText  = document.querySelector("#human-score");
const robotScoreText  = document.querySelector("#robot-score");
const humanHand       = document.querySelector("#human-hand");
const robotHand       = document.querySelector("#robot-hand");
const humanLabel      = document.querySelector("#human-label");
const robotLabel      = document.querySelector("#robot-label");
const robot           = document.querySelector("#robot");
const speech          = document.querySelector("#speech");
const message         = document.querySelector("#message");
const historyList     = document.querySelector("#history");
const playAgainButton = document.querySelector("#play-again");
const levelInfo       = document.querySelector("#level-info");
const choiceButtons   = document.querySelectorAll(".choice");
const levelButtons    = document.querySelectorAll(".level");


// =========================================================
// HELPER FUNCTIONS
// =========================================================

// makes a fresh, all-zero table for Bolt's memory:
// { rock: {rock:0, paper:0, scissors:0}, paper: {...}, scissors: {...} }
function makeEmptyTable() {
    return {
        rock:     { rock: 0, paper: 0, scissors: 0 },
        paper:    { rock: 0, paper: 0, scissors: 0 },
        scissors: { rock: 0, paper: 0, scissors: 0 },
    };
}

// "rock" -> "Rock"
function capitalize(word) {
    return word[0].toUpperCase() + word.slice(1);
}

// picks a random item from a list (like Python's random.choice)
function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// given counts like {rock: 2, paper: 5, scissors: 1},
// returns the move with the biggest number ("paper")
function mostCommon(counts) {
    let best = null;
    let bestCount = -1;
    for (const move of MOVES) {          // for...of = Python's "for move in MOVES"
        if (counts[move] > bestCount) {
            best = move;
            bestCount = counts[move];
        }
    }
    return best;
}

// turns all 3 choice buttons on (true) or off (false)
function setButtonsEnabled(enabled) {
    choiceButtons.forEach(function (button) {
        button.disabled = !enabled;
    });
}


// =========================================================
// YOUR ORIGINAL FUNCTION: pure random pick (used on Easy,
// and as Bolt's "backup" when he has no data yet)
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
// BOLT'S BRAIN
// Every strategy works the same way:
//   1. GUESS what you're going to throw
//   2. Play the move that BEATS that guess
// =========================================================

// MEDIUM: guess you'll throw your all-time favorite move
function predictFavorite() {
    // need at least 3 moves before the counts mean anything
    if (humanHistory.length < 3) {
        return null;     // null = "I don't have a guess"
    }

    // count how many times you've thrown each move
    const counts = { rock: 0, paper: 0, scissors: 0 };
    for (const move of humanHistory) {
        counts[move]++;
    }
    return mostCommon(counts);
}

// HARD: guess based on your habits
function predictPattern() {
    // no moves yet = nothing to learn from
    if (humanHistory.length === 0) {
        return null;
    }

    // your most recent move (the last item in the list)
    const yourLastMove = humanHistory[humanHistory.length - 1];

    // what have you thrown after this move before?
    const whatCameNext = afterMove[yourLastMove];
    const timesSeen = whatCameNext.rock + whatCameNext.paper + whatCameNext.scissors;

    // PLAN A ("Markov chain"): if Bolt has seen this situation
    // at least twice, guess whatever you usually did next.
    if (timesSeen >= 2) {
        return mostCommon(whatCameNext);
    }

    // PLAN B: not enough data yet, so use common human habits.
    // Habit 1, "win-stay": after WINNING, people often throw the same move again.
    if (lastResult === "win") {
        return yourLastMove;
    }
    // Habit 2, "lose-shift": after LOSING, people often switch to
    // the move that would have beaten what just beat them.
    if (lastResult === "lose") {
        return BEATS[lastBoltMove];
    }

    // after a tie: no strong habit, so no guess
    return null;
}

// Decides Bolt's move for this round, based on the difficulty
function getBoltMove() {
    currentPrediction = null;

    // EASY: your original random function
    if (difficulty === "easy") {
        return getComputerChoice();
    }

    // Bolt sometimes plays randomly on purpose (Medium 30%, Hard 15%)
    // so you can't figure out his strategy and trick him.
    const randomChance = difficulty === "medium" ? 0.3 : 0.15;
    if (Math.random() < randomChance) {
        return getComputerChoice();
    }

    // make a guess with the right brain
    if (difficulty === "medium") {
        currentPrediction = predictFavorite();
    } else {
        currentPrediction = predictPattern();
    }

    // no guess? fall back to random
    if (currentPrediction === null) {
        return getComputerChoice();
    }

    // play whatever BEATS the move Bolt thinks you'll throw
    return BEATS[currentPrediction];
}

// After each round, Bolt updates his memory
function rememberRound(humanChoice, boltChoice, result) {
    // add to the "what came next" table, using your PREVIOUS move
    if (humanHistory.length > 0) {
        const previousMove = humanHistory[humanHistory.length - 1];
        afterMove[previousMove][humanChoice]++;
    }

    // track how good Bolt's guesses are
    if (currentPrediction !== null) {
        guessesTried++;
        if (currentPrediction === humanChoice) {
            guessesRight++;
        }
    }

    humanHistory.push(humanChoice);   // push = Python's append
    lastResult = result;
    lastBoltMove = boltChoice;
}


// =========================================================
// YOUR playRound: returns "tie", "win" or "lose"
// =========================================================
function playRound(humanChoice, computerChoice) {

    if (humanChoice === computerChoice) {
        return "tie";
    }
    else if (
        (humanChoice === "rock" && computerChoice === "scissors") ||
        (humanChoice === "paper" && computerChoice === "rock") ||
        (humanChoice === "scissors" && computerChoice === "paper")
    ) {
        humanScore++;
        return "win";
    }
    else {
        computerScore++;
        return "lose";
    }
}


// =========================================================
// Runs every time you click Rock, Paper, or Scissors
// =========================================================
function handleClick(humanChoice) {
    setButtonsEnabled(false);

    // IMPORTANT: Bolt decides BEFORE he sees your move,
    // so he can't cheat. He only uses what happened in past rounds.
    const boltChoice = getBoltMove();

    // both sides bounce a "rock" fist first
    humanHand.innerHTML = ICONS.rock;
    robotHand.innerHTML = ICONS.rock;
    robot.classList.remove("happy", "sad");
    message.className = "message";
    message.textContent = "Rock… Paper… Scissors…";
    speech.textContent = currentPrediction ? "I think I know your move…" : "Shoot!";

    humanHand.classList.add("shaking");
    robotHand.classList.add("shaking");

    // wait 900ms for the bounce to finish, then reveal
    setTimeout(function () {
        humanHand.classList.remove("shaking");
        robotHand.classList.remove("shaking");

        const result = playRound(humanChoice, boltChoice);

        humanHand.innerHTML = ICONS[humanChoice];
        robotHand.innerHTML = ICONS[boltChoice];
        humanLabel.textContent = `You threw ${capitalize(humanChoice)}`;
        robotLabel.textContent = `Bolt threw ${capitalize(boltChoice)}`;

        showResult(result, humanChoice, boltChoice);
        rememberRound(humanChoice, boltChoice, result);   // Bolt learns
    }, 900);
}


// =========================================================
// Updates the message, scores, Bolt's face and history
// =========================================================
function showResult(result, humanChoice, computerChoice) {
    roundNumber++;

    let text;
    let boltSays = randomFrom(BOLT_LINES[result]);

    if (result === "tie") {
        text = `Tie! You both threw ${humanChoice}.`;
    }
    else if (result === "win") {
        text = "You win this round!";
        message.classList.add("win");
        robot.classList.add("sad");
    }
    else {
        text = "Bolt wins this round!";
        message.classList.add("lose");
        robot.classList.add("happy");

        // if Bolt guessed your move right, he brags about it
        if (currentPrediction === humanChoice) {
            boltSays = `I knew you'd throw ${humanChoice}!`;
        }
    }

    message.textContent = text;
    speech.textContent = boltSays;

    humanScoreText.textContent = humanScore;
    robotScoreText.textContent = computerScore;

    // add this round to the TOP of the history list
    // (the ? : is a short if/else: condition ? valueIfTrue : valueIfFalse)
    const outcome = result === "win" ? "Win" : result === "lose" ? "Loss" : "Tie";
    const item = document.createElement("li");
    item.textContent = `Round ${roundNumber}: ${capitalize(humanChoice)} vs ${capitalize(computerChoice)} · ${outcome}`;
    historyList.prepend(item);

    if (humanScore === WINNING_SCORE || computerScore === WINNING_SCORE) {
        endGame();
    }
    else {
        setButtonsEnabled(true);
    }
}


// =========================================================
// Game over
// =========================================================
function endGame() {
    // Bolt's guess accuracy, as a percent (only if he guessed at all)
    let stats = "";
    if (guessesTried > 0) {
        const percent = Math.round((guessesRight / guessesTried) * 100);
        stats = ` I read your move ${percent}% of the time.`;
    }

    if (humanScore > computerScore) {
        message.textContent = `You beat Bolt ${humanScore} to ${computerScore}!`;
        message.className = "message win";
        speech.textContent = "System failure… GG, human." + stats;
        robot.classList.remove("happy");
        robot.classList.add("sad");
    }
    else {
        message.textContent = `Bolt wins ${computerScore} to ${humanScore}!`;
        message.className = "message lose";
        speech.textContent = "Victory! Beep boop." + stats;
        robot.classList.remove("sad");
        robot.classList.add("happy");
    }

    playAgainButton.classList.remove("hidden");
}


// =========================================================
// Reset everything (Bolt forgets what he learned, too)
// =========================================================
function resetGame() {
    humanScore = 0;
    computerScore = 0;
    roundNumber = 0;

    // wipe Bolt's memory
    humanHistory = [];
    lastResult = null;
    lastBoltMove = null;
    afterMove = makeEmptyTable();
    guessesTried = 0;
    guessesRight = 0;
    currentPrediction = null;

    humanScoreText.textContent = 0;
    robotScoreText.textContent = 0;
    humanHand.innerHTML = ICONS.rock;
    robotHand.innerHTML = ICONS.rock;
    humanLabel.textContent = "Pick a move!";
    robotLabel.textContent = "Bolt is waiting…";
    robot.classList.remove("happy", "sad");
    speech.textContent = difficulty === "easy" ? "Beep boop! Ready to play?" : "I'm watching your moves, human…";
    message.className = "message";
    message.textContent = "First to 5 wins. Good luck!";
    historyList.innerHTML = "";

    playAgainButton.classList.add("hidden");
    setButtonsEnabled(true);
}


// =========================================================
// Switch difficulty (starts a new game so it's fair)
// =========================================================
function setDifficulty(level) {
    difficulty = level;

    // mark the clicked button as picked, and the others as not
    levelButtons.forEach(function (button) {
        const isPicked = button.dataset.level === level;
        button.setAttribute("aria-pressed", isPicked ? "true" : "false");
    });

    levelInfo.textContent = LEVEL_INFO[level];
    resetGame();
}


// =========================================================
// CONNECT THE BUTTONS
// =========================================================
choiceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        handleClick(button.dataset.choice);
    });
});

levelButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        setDifficulty(button.dataset.level);
    });
});

playAgainButton.addEventListener("click", resetGame);

// start on Hard
setDifficulty("hard");
