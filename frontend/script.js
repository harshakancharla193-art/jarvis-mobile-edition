const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const send = document.getElementById("send");

function add(text, who) {
    const d = document.createElement("div");

    d.className = "msg " + who;
    d.innerText = text;

    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
}

function sendMessage() {
    const t = input.value.trim();

    if (!t) return;

    // User message
    add("YOU: " + t, "user");

    input.value = "";

    // JARVIS processing message
    add("J.A.R.V.I.S: Processing...", "ai");

    // Simulated response
    setTimeout(() => {
        chat.lastChild.innerText =
            "J.A.R.V.I.S: Systems online. How may I assist you, Boss?";
    }, 1000);
}

// Send button
send.onclick = sendMessage;

// Press Enter to send
input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
// ===== 3. TOOLS (THE HANDS) — 15 TOOLS =====
async function handleTools(text) {

    const t = text.toLowerCase().trim();

    // 1. TIME
    if (
        /\btime\b/.test(t) ||
        t.includes("టైమ్") ||
        t.includes("సమయం")
    ) {
        return "The time is " + new Date().toLocaleTimeString() + ", Boss.";
    }


    // 2. DATE
    if (
        /\bdate\b/.test(t) ||
        t.includes("today") ||
        t.includes("తేదీ")
    ) {
        return "Today's date is " +
            new Date().toLocaleDateString() +
            ", Boss.";
    }


    // 3. WEATHER
    if (
        t.includes("weather") ||
        t.includes("వాతావరణం")
    ) {
        return await new Promise(resolve => {

            if (!navigator.geolocation) {
                resolve("Geolocation is not supported by this browser, Boss.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async position => {

                    try {

                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;

                        const url =
                            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;

                        const response = await fetch(url);

                        if (!response.ok) {
                            throw new Error("Weather request failed");
                        }

                        const data = await response.json();

                        const temperature =
                            data.current?.temperature_2m;

                        if (temperature === undefined) {
                            resolve("I couldn't get the current weather, Boss.");
                            return;
                        }

                        resolve(
                            `The current temperature is ${temperature} degrees Celsius, Boss.`
                        );

                    } catch (error) {

                        console.error(error);

                        resolve(
                            "Weather service error, Boss."
                        );
                    }
                },

                () => {
                    resolve(
                        "I need location permission to check the weather, Boss."
                    );
                }
            );
        });
    }


    // 4. TIMER
    const timerMatch = t.match(
        /(?:set\s*)?(?:a\s*)?timer\s*(?:for\s*)?(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i
    );

    if (timerMatch || t.includes("టైమర్")) {

        if (!timerMatch) {
            return "Please tell me the timer duration, Boss. Example: set a timer for 10 seconds.";
        }

        const amount = parseInt(timerMatch[1]);
        const unit = timerMatch[2].toLowerCase();

        let factor = 60000;

        if (/^(hours?|hrs?)$/i.test(unit)) {
            factor = 60 * 60 * 1000;
        } else if (/^(seconds?|secs?)$/i.test(unit)) {
            factor = 1000;
        }

        const duration = amount * factor;

        setTimeout(() => {

            speak(
                `టైమర్ పూర్తయింది! ${amount} ${unit} అయ్యాయి.`
            );

        }, duration);

        return `Timer set for ${amount} ${unit}, Boss.`;
    }


    // 5. TRANSLATE
    if (t.startsWith("translate")) {

        const query = text
            .replace(/^translate\s*(this\s*)?/i, "")
            .trim();

        if (!query) {
            return "Tell me what you want me to translate, Boss.";
        }

        try {

            const url =
                "https://api.mymemory.translated.net/get?q=" +
                encodeURIComponent(query) +
                "&langpair=en|te";

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Translation failed");
            }

            const data = await response.json();

            return "In Telugu: " +
                data.responseData.translatedText;

        } catch (error) {

            console.error(error);

            return "Translation service error, Boss.";
        }
    }


    // 6. YOUTUBE SEARCH
    if (
        t.startsWith("play ") ||
        t.startsWith("youtube ") ||
        t.startsWith("search youtube ")
    ) {

        let query = text
            .replace(/^search youtube\s*/i, "")
            .replace(/^youtube\s*/i, "")
            .replace(/^play\s*/i, "")
            .trim();

        if (!query) {
            return "What should I search on YouTube, Boss?";
        }

        window.open(
            "https://www.youtube.com/results?search_query=" +
            encodeURIComponent(query),
            "_blank"
        );

        return `Searching YouTube for ${query}, Boss.`;
    }


    // 7. GOOGLE SEARCH
    if (
        t.startsWith("search google ") ||
        t.startsWith("google search ")
    ) {

        const query = text
            .replace(/^search google\s*/i, "")
            .replace(/^google search\s*/i, "")
            .trim();

        if (!query) {
            return "What should I search for, Boss?";
        }

        window.open(
            "https://www.google.com/search?q=" +
            encodeURIComponent(query),
            "_blank"
        );

        return `Searching Google for ${query}, Boss.`;
    }


    // 8. OPEN GOOGLE
    if (
        t === "open google" ||
        t === "google"
    ) {

        window.open(
            "https://www.google.com",
            "_blank"
        );

        return "Opening Google, Boss.";
    }


    // 9. OPEN YOUTUBE
    if (
        t === "open youtube"
    ) {

        window.open(
            "https://www.youtube.com",
            "_blank"
        );

        return "Opening YouTube, Boss.";
    }


    // 10. OPEN GMAIL
    if (
        t === "open gmail" ||
        t === "gmail"
    ) {

        window.open(
            "https://mail.google.com",
            "_blank"
        );

        return "Opening Gmail, Boss.";
    }


    // 11. OPEN WHATSAPP WEB
    if (
        t === "open whatsapp" ||
        t === "whatsapp"
    ) {

        window.open(
            "https://web.whatsapp.com",
            "_blank"
        );

        return "Opening WhatsApp Web, Boss.";
    }


    // 12. CALCULATOR
    if (
        t.startsWith("calculate ") ||
        t.startsWith("calculator ")
    ) {

        const expression = text
            .replace(/^calculate\s*/i, "")
            .replace(/^calculator\s*/i, "")
            .trim();

        try {

            // Only allow numbers and basic mathematical operators
            if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
                return "I can only calculate basic mathematical expressions, Boss.";
            }

            const result = Function(
                `"use strict"; return (${expression})`
            )();

            return `The answer is ${result}, Boss.`;

        } catch (error) {

            return "I couldn't calculate that, Boss.";
        }
    }


    // 13. RANDOM NUMBER
    if (
        t.includes("random number") ||
        t.includes("random number")
    ) {

        const randomNumber =
            Math.floor(Math.random() * 100) + 1;

        return `Your random number is ${randomNumber}, Boss.`;
    }


    // 14. SCROLL
    if (
        t === "scroll down" ||
        t.includes("scroll down")
    ) {

        window.scrollBy({
            top: window.innerHeight * 0.8,
            behavior: "smooth"
        });

        return "Scrolling down, Boss.";
    }


    // 15. SCROLL UP
    if (
        t === "scroll up" ||
        t.includes("scroll up")
    ) {

        window.scrollBy({
            top: -window.innerHeight * 0.8,
            behavior: "smooth"
        });

        return "Scrolling up, Boss.";
    }


    // No tool matched
    return null;
}
