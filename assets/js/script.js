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

    // Render sample text as word spans so we can style per-word feedback
    let sampleWords = [];
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setSampleText(text) {
        const el = document.getElementById("sample-text");
        if (!el) return;
        const tokens = (text || "").trim().split(/\s+/).filter(Boolean);
        sampleWords = tokens;
        el.innerHTML = tokens
            .map(
                (w, i) =>
                    `<span class="word" data-index="${i}">${escapeHtml(
                        w
                    )}</span>`
            )
            .join(" ");
    }

    // Update visual feedback while typing: correct / incorrect / partial
    function updateAccuracyFeedback() {
        const userInput = document.getElementById("user-input");
        const container = document.getElementById("sample-text");
        if (!container || !userInput) return;

        const spans = Array.from(container.querySelectorAll(".word"));
        const raw = userInput.value;
        // split by whitespace but keep empty when trailing space
        const typedTokens = raw.length === 0 ? [] : raw.split(/\s+/);

        // Determine if there's a trailing space
        const trailingSpace = raw.endsWith(" ");

        spans.forEach((span, i) => {
            span.classList.remove("correct", "incorrect", "partial", "current");
            const sample = sampleWords[i] || "";
            const typed = typedTokens[i];

            if (typed === undefined) {
                // not typed yet
                return;
            }

            if (trailingSpace && i === typedTokens.length - 1) {
                // user finished a word by typing a space; compare full
                if (typed === sample) span.classList.add("correct");
                else span.classList.add("incorrect");
                return;
            }

            // For current or partially-typed word, compare prefix
            if (typed === sample) {
                span.classList.add("correct");
            } else if (sample.startsWith(typed)) {
                // partial match (typed is prefix of sample)
                span.classList.add("partial");
            } else {
                span.classList.add("incorrect");
            }
        });

        // Mark the current word (the one being typed or next)
        let currentIndex = typedTokens.length - 1;
        if (trailingSpace) currentIndex = typedTokens.length;
        if (currentIndex >= 0 && currentIndex < spans.length) {
            spans[currentIndex].classList.add("current");
        }
    }

    // Timing state
    let startTime = null;

    // Write seconds to results (two decimals)
    function updateTimeDisplay(seconds) {
        const timeEl = document.getElementById("time");
        if (!timeEl) return;
        timeEl.textContent = Number(seconds).toFixed(2);
    }

    // Write WPM to results (two decimals)
    function updateWPMDisplay(wpm) {
        const wpmEl = document.getElementById("wpm");
        if (!wpmEl) return;
        wpmEl.textContent = Number(wpm).toFixed(2);
    }

    // Enable/disable start & stop buttons. 'running' = test active
    function updateButtonsState(running) {
        const startBtn = document.getElementById("start-btn");
        const stopBtn = document.getElementById("stop-btn");
        if (startBtn) startBtn.disabled = !!running;
        if (stopBtn) stopBtn.disabled = !running;
    }

    // Calculate WPM: words typed / minutes
    function calculateWPM(typedText, elapsedSeconds) {
        if (!typedText) return 0;
        const trimmed = typedText.trim();
        if (!trimmed) return 0;
        const words = trimmed.split(/\s+/).filter(Boolean).length;
        if (!elapsedSeconds || elapsedSeconds <= 0) return 0;
        return (words * 60) / elapsedSeconds;
    }

    // Start the test: pick sample, clear input, set start time
    function startTest() {
        const difficulty = document.getElementById("difficulty");
        const userInput = document.getElementById("user-input");

        if (!difficulty) return;

        setSampleText(getRandomSample(difficulty.value));
        if (userInput) {
            userInput.value = "";
            userInput.focus();
            // clear any previous feedback
            updateAccuracyFeedback();
        }

        startTime = performance.now();

        const levelEl = document.getElementById("level");
        if (levelEl)
            levelEl.textContent =
                difficulty.options[difficulty.selectedIndex].text ||
                difficulty.value;

        updateButtonsState(true);
    }

    // Stop the test: compute elapsed seconds and WPM, display them
    function stopTest() {
        if (startTime === null) return;
        const endTime = performance.now();
        const elapsedSeconds = (endTime - startTime) / 1000;

        updateTimeDisplay(elapsedSeconds);

        const userInput = document.getElementById("user-input");
        const typed = userInput ? userInput.value : "";
        const wpm = calculateWPM(typed, elapsedSeconds);
        updateWPMDisplay(wpm);

        startTime = null;
        updateButtonsState(false);
        // final accuracy update
        updateAccuracyFeedback();
    }

    // Reset / retry: new sample, clear input, zero displays
    function resetTest() {
        const difficulty = document.getElementById("difficulty");
        const userInput = document.getElementById("user-input");
        if (!difficulty) return;

        setSampleText(getRandomSample(difficulty.value));
        if (userInput) {
            userInput.value = "";
            userInput.focus();
        }

        startTime = null;
        updateTimeDisplay(0);
        updateWPMDisplay(0);
        updateButtonsState(false);
        // clear per-word classes
        const container = document.getElementById("sample-text");
        if (container)
            container
                .querySelectorAll(".word")
                .forEach((s) =>
                    s.classList.remove(
                        "correct",
                        "incorrect",
                        "partial",
                        "current"
                    )
                );
    }

    function init() {
        const difficulty = document.getElementById("difficulty");
        const startBtn = document.getElementById("start-btn");
        const stopBtn = document.getElementById("stop-btn");
        const retryBtn = document.getElementById("retry-btn");

        if (!difficulty) return;

        setSampleText(getRandomSample(difficulty.value));
        updateTimeDisplay(0);
        updateWPMDisplay(0);
        updateButtonsState(false);

        difficulty.addEventListener("change", function () {
            setSampleText(getRandomSample(this.value));
        });

        if (startBtn) startBtn.addEventListener("click", startTest);
        if (stopBtn) stopBtn.addEventListener("click", stopTest);
        if (retryBtn) retryBtn.addEventListener("click", resetTest);

        // live feedback while typing
        const userInput = document.getElementById("user-input");
        if (userInput) {
            userInput.addEventListener("input", updateAccuracyFeedback);
        }
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else init();

    // expose helpers for debugging
    window._typingSamples = { getRandomSample, calculateWPM };
})();
