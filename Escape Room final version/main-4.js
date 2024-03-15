let correctAnswers = 0;
 
  function checkAnswer(puzzleNumber) {
    let answer;
    const resultContainer = document.getElementById("result");
 
    switch (puzzleNumber) {
      case 1:
        answer = document.getElementById("answer1").value.toLowerCase();
        if (answer === "toetsenbord") {
          correctAnswers++;
        }
        break;
 
      case 2:
        answer = document.getElementById("answer2").value.toLowerCase();
        if (answer === "echo") {
          correctAnswers++;
        }
        break;
 
      case 3:
        answer = document.getElementById("answer3").value.toLowerCase();
        if (answer === "voetstappen") {
          correctAnswers++;
        }
        break;
    }
 
    if (correctAnswers === 3) {
      resultContainer.style.color = "lightgreen";
      resultContainer.innerHTML = "Gefeliciteerd! Je hebt alle puzzels opgelost.";
    } else {
      resultContainer.style.color = "red";
      resultContainer.innerHTML = "Blijven gaan! Je hebt " + correctAnswers + " puzzle(s) opgelost .";
    }
  }