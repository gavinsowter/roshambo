
let humanScore = 0;
let computerScore = 0;

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

function getHumanChoice() {
    
    let answer = prompt("You choose one.. and see who wins (Type Rock, Paper, or Scissors)");
    return answer.toLowerCase();

}

function playRound(humanChoice, computerChoice) {
    
    // 1. Tie: both picked the same thing
    if (humanChoice === computerChoice) {
        console.log("It's a tie!");
    }

    // 2. Human wins: there are 3 ways this can happen
    //    rock beats scissors, paper beats rock, scissors beats paper
    else if (
        (humanChoice === "rock" && computerChoice === "scissors") || (humanChoice === "paper" && computerChoice === "rock") || (humanChoice === "scissors" && computerChoice === "paper")
    ) {
        console.log(`You win! ${humanChoice} beats ${computerChoice}`);
        humanScore++;   // ++ adds 1 (same as humanScore = humanScore + 1)
    }

    // 3. Anything else means the robot won
    else {
         console.log(`You Lose! ${computerChoice} beats ${humanChoice}`);
        computerScore++;
    }
}

function playGame() {

    alert("Let's play a game..");
    alert("A little bit of Rock, Paper, Scissors..");

    // 1. Repeat 5 times (like Python's: for round in range(5):)
    for (let round = 0; round < 5; round++) {

        const humanSelection = getHumanChoice();
        const computerSelection = getComputerChoice();

        playRound(humanSelection, computerSelection);
    }

    if (humanScore === computerScore) {
        console.log("You've tied the game!");
    }

    else if (humanScore > computerScore) {
        // show the final score using the score variables
        console.log(`You won the game! Final score: ${humanScore} to ${computerScore}`);
    }

    else {
        console.log(`The robot won the game! Final score: ${computerScore} to ${humanScore}`);
    }
}

// 4. Last line of the file: actually start the game
playGame();