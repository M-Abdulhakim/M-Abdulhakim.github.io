let correctAnswers = 0;
 
    function checkAnswer(puzzleNumber) {
      let answer;
      const resultContainer = document.querySelector(".result");
 
      switch (puzzleNumber) {
        case 1:
          answer = document.querySelector(".mathInput1").value.toLowerCase();
          if (answer === "20") {
            correctAnswers++;
          }
          break;
 
        case 2:
          answer = document.querySelector(".mathInput2").value.toLowerCase();
          if (answer === "8") {
            correctAnswers++;
          }
          break;
 
        case 3:
          answer = document.querySelector(".mathInput3").value.toLowerCase();
          if (answer === "40") {
            correctAnswers++;
          }
          break;
      }
 
      if (correctAnswers === 3) {
        resultContainer.style.color = "white";
        resultContainer.innerHTML = "Congratulations! You've solved all the puzzles. The door opens, and you escape!";
      } else {
        resultContainer.style.color = "red";
        resultContainer.innerHTML = "Keep going! You've solved " + correctAnswers + " puzzle(s).";
      }
    }