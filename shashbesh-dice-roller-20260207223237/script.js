document.addEventListener('DOMContentLoaded', () => {
    const die1 = document.getElementById('die1');
    const die2 = document.getElementById('die2');
    const rollButton = document.getElementById('rollButton');
    const resultDiv = document.getElementById('result');
    const generationTimestampSpan = document.getElementById('generation-timestamp');

    // Set generation timestamp
    if (generationTimestampSpan) {
        generationTimestampSpan.textContent = new Date().toLocaleString();
    }

    // Function to generate random number between 1 and 6
    function getRandomDiceValue() {
        return Math.floor(Math.random() * 6) + 1;
    }

    // Function to update the dots on a die
    function updateDie(dieElement, value) {
        // Clear existing dots
        dieElement.innerHTML = '';
        // Create new dots based on the value
        const dotPositions = {
            1: [[2, 2]],
            2: [[1, 3], [3, 1]],
            3: [[1, 3], [2, 2], [3, 1]],
            4: [[1, 1], [1, 3], [3, 1], [3, 3]],
            5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
            6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
        };
        dotPositions[value].forEach(pos => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.style.gridArea = `${pos[0]} / ${pos[1]}`;
            dieElement.appendChild(dot);
        });
        dieElement.dataset.value = value; // Store value for potential CSS styling
    }

    // Initial display of dice (e.g., both showing 1)
    updateDie(die1, 1);
    updateDie(die2, 1);

    rollButton.addEventListener('click', () => {
        rollButton.disabled = true; // Disable button during roll
        resultDiv.textContent = 'Rolling...';

        die1.classList.add('rolling');
        die2.classList.add('rolling');

        // Simulate rolling animation
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            updateDie(die1, getRandomDiceValue());
            updateDie(die2, getRandomDiceValue());
            rollCount++;
            if (rollCount > 10) { // Roll for a short duration
                clearInterval(rollInterval);
                die1.classList.remove('rolling');
                die2.classList.remove('rolling');

                const value1 = getRandomDiceValue();
                const value2 = getRandomDiceValue();
                updateDie(die1, value1);
                updateDie(die2, value2);

                resultDiv.textContent = `You rolled: ${value1} and ${value2} (Total: ${value1 + value2})`;
                rollButton.disabled = false; // Re-enable button
            }
        }, 100);
    });
});