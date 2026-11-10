
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
    alert("Let's play a game..");
    alert("A little bit of Rock, Paper, Scissors..");

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
        console.log("You win! ...");
        humanScore++;   // ++ adds 1 (same as humanScore = humanScore + 1)
    }

    // 3. Anything else means the robot won
    else {
        console.log("You lose! ...");
        computerScore++;
    }
}

// get both choices, then play one round with them
const humanSelection = getHumanChoice();
const computerSelection = getComputerChoice();

playRound(humanSelection, computerSelection);