let correctAnswers = 0;

function checkAnswer(puzzleNumber) {
    let answer;
    const resultContainer = document.getElementById("result");

    switch (puzzleNumber) {
        case 1:
            answer = document.getElementById("answer1").value.toLowerCase();
            if (answer === "amsterdam") {
                correctAnswers++;
            }
            break;

        case 2:
            answer = document.getElementById("answer2").value.toLowerCase();
            if (answer === "rome") {
                correctAnswers++;
            }
            break;

        case 3:
            answer = document.getElementById("answer3").value.toLowerCase();
            if (answer === "parijs") {
                correctAnswers++;
            }
            break;
    }

    if (correctAnswers === 3) {
        resultContainer.style.color = "yellow";
        resultContainer.innerHTML = "Gefeliciteerd! Je hebt alle puzzels opgelost.";
    } else {
        resultContainer.style.color = "blue";
        resultContainer.innerHTML = "Blijven gaan! Je hebt " + correctAnswers + " puzzle(s) opgelost .";
    }
}
