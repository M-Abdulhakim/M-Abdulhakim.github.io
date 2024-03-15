document.getElementById("startButton").addEventListener("click", startGame);

        // aanmaken van de juiste volgorde in array
        const expectedSequence = [1, 4, 3, 2, 6, 5];
        let playerSequence = [];
        let gameInProgress = false;

        // click event listeners toevoegen aan elke button
        for (let i = 1; i <= 6; i++) {
            const button = document.getElementById(`button${i}`);
            button.addEventListener("click", () => {
                if (!gameInProgress) {
                    return; // buttons worden genegeerd
                }

                // de geklikte button toevoegen aan de player array
                playerSequence.push(i);
                checkSequence();
            });
        }

        // functie voor het vergelijken van de player sequence met de expected sequence
        function checkSequence() {
            for (let i = 0; i < playerSequence.length; i++) {
                if (playerSequence[i] !== expectedSequence[i]) {
                    // als de volgorde fout is wordt het spel gestopt
                    playerSequence = [];
                    gameInProgress = false;
                    document.getElementById("status").textContent =
                        "Try again! Click Start Game.";
                    return;
                }
            }

            if (playerSequence.length === expectedSequence.length) {
                // als de player volgorde hetzelfde is als de expected volgorde, winst
                document.getElementById("status").textContent = "Congratulations! You win!";
            }
        }

        // Functie om de game te starten
        function startGame() {
            playerSequence = [];
            gameInProgress = true;
            document.getElementById("status").textContent = "Find the right sequence!";
        }