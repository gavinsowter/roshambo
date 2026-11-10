
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

console.log(getHumanChoice());
console.log(getComputerChoice());