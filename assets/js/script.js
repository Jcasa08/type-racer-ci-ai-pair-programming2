// Typing test samples and control wiring
(function () {
    const SAMPLES = {
        easy: [
            "The cat sat on the mat.",
            "A red ball rolled down the hill.",
            "She likes to read books in the park.",
            "Birds fly in the sky.",
            "I drink coffee every morning.",
        ],
        medium: [
            "Small steps every day help you reach big goals.",
            "The musician practiced the new piece until it sounded perfect.",
            "Clouds gathered quickly and a gentle drizzle began to fall.",
            "He opened the old book and read the faded handwriting.",
            "A sudden idea can change the course of your afternoon.",
        ],
        hard: [
            "Under the crimson sky, the travelers debated the merits of distant lands and home alike.",
            "A complex algorithm must balance performance with clarity and maintainability to be truly useful.",
            "Philosophical questions often begin with simple observations but lead to intricate arguments.",
            "The bioluminescent waves shimmered as midnight boats drifted silently across the bay.",
            "She meticulously catalogued the rare manuscripts, noting provenance, condition, and marginalia.",
        ],
    };

    function getRandomSample(level) {
        const list = SAMPLES[level] || SAMPLES.easy;
        return list[Math.floor(Math.random() * list.length)];
    }

    function setSampleText(text) {
        const el = document.getElementById("sample-text");
        if (!el) return;
        el.textContent = text;
    }

    function init() {
        const difficulty = document.getElementById("difficulty");
        const startBtn = document.getElementById("start-btn");
        const stopBtn = document.getElementById("stop-btn");
        const retryBtn = document.getElementById("retry-btn");
        const userInput = document.getElementById("user-input");

        if (!difficulty) return;

        // show initial sample based on current selection
        setSampleText(getRandomSample(difficulty.value));

        difficulty.addEventListener("change", function () {
            setSampleText(getRandomSample(this.value));
        });

        if (startBtn) {
            startBtn.addEventListener("click", function () {
                // pick a fresh sample for current difficulty and prepare the textarea
                setSampleText(getRandomSample(difficulty.value));
                if (userInput) {
                    userInput.value = "";
                    userInput.focus();
                }
            });
        }

        if (stopBtn && userInput) {
            stopBtn.addEventListener("click", function () {
                userInput.blur();
            });
        }

        if (retryBtn) {
            retryBtn.addEventListener("click", function () {
                // regenerate sample, clear input and focus
                setSampleText(getRandomSample(difficulty.value));
                if (userInput) {
                    userInput.value = "";
                    userInput.focus();
                }
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // expose helpers for debugging
    window._typingSamples = {
        getRandomSample,
    };
})();
