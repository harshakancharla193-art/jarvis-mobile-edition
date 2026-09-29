// ===== 3. TOOLS (THE HANDS) — 15 TOOLS =====
async function handleTools(text) {

    const t = text.toLowerCase().trim();

    // 1. TIME
    if (
        /\btime\b/.test(t) ||
        t.includes("టైమ్") ||
        t.includes("సమయం")
    ) {
        return "The time is " +
            new Date().toLocaleTimeString() +
            ", Boss.";
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
                resolve("Geolocation is not supported, Boss.");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async position => {

                    try {

                        const latitude =
                            position.coords.latitude;

                        const longitude =
                            position.coords.longitude;

                        const url =
                            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

                        const response =
                            await fetch(url);

                        const data =
                            await response.json();

                        if (
                            data.current_weather &&
                            data.current_weather.temperature !== undefined
                        ) {

                            resolve(
                                `It is ${data.current_weather.temperature} degrees Celsius now, Boss.`
                            );

                        } else {

                            resolve(
                                "I couldn't get the weather, Boss."
                            );
                        }

                    } catch (error) {

                        console.error(error);

                        resolve(
                            "Weather service error, Boss."
                        );
                    }

                },

                () => {

                    resolve(
                        "I need location permission for weather, Boss."
                    );

                }
            );
        });
    }


    // 4. TIMER
    const timerMatch = t.match(
        /(\d+)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i
    );

    if (
        (t.includes("timer") || t.includes("టైమర్")) &&
        timerMatch
    ) {

        const amount =
            parseInt(timerMatch[1]);

        const unit =
            timerMatch[2].toLowerCase();

        let factor = 60000;

        if (/^(hours?|hrs?)$/i.test(unit)) {
            factor = 3600000;
        }

        if (/^(seconds?|secs?)$/i.test(unit)) {
            factor = 1000;
        }

        const duration =
            amount * factor;

        setTimeout(() => {

            if (typeof speak === "function") {

                speak(
                    `Timer completed! ${amount} ${unit} are over, Boss.`
                );

            }

        }, duration);

        return `Timer set for ${amount} ${unit}, Boss.`;
    }


    // 5. TRANSLATE
    if (t.startsWith("translate")) {

        const q =
            text
                .replace(/^translate\s*(this\s*)?/i, "")
                .trim();

        if (!q) {
            return "Tell me what you want me to translate, Boss.";
        }

        try {

            const url =
                "https://api.mymemory.translated.net/get?q=" +
                encodeURIComponent(q) +
                "&langpair=en|te";

            const response =
                await fetch(url);

            const data =
                await response.json();

            return (
                "In Telugu: " +
                data.responseData.translatedText
            );

        } catch (error) {

            console.error(error);

            return "Translate error, Boss.";
        }
    }


    // 6. YOUTUBE
    if (
        t.startsWith("play ") ||
        t.startsWith("youtube ")
    ) {

        const q =
            text
                .replace(/^play\s+/i, "")
                .replace(/^youtube\s+/i, "")
                .trim();

        if (!q) {
            return "What should I search on YouTube, Boss?";
        }

        window.open(
            "https://www.youtube.com/results?search_query=" +
            encodeURIComponent(q),
            "_blank"
        );

        return (
            "Searching YouTube for " +
            q +
            ", Boss."
        );
    }


    // 7. GOOGLE SEARCH
    if (
        t.startsWith("search google ")
    ) {

        const q =
            text
                .replace(/^search google\s+/i, "")
                .trim();

        if (!q) {
            return "What should I search on Google, Boss?";
        }

        window.open(
            "https://www.google.com/search?q=" +
            encodeURIComponent(q),
            "_blank"
        );

        return "Searching Google for " + q + ", Boss.";
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
    if (t === "open youtube") {

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


    // 11. OPEN WHATSAPP
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
    if (t.startsWith("calculate ")) {

        const expression =
            text
                .replace(/^calculate\s+/i, "")
                .trim();

        try {

            if (
                !/^[0-9+\-*/().%\s]+$/.test(expression)
            ) {
                return "I can only calculate numbers and basic operators, Boss.";
            }

            const result =
                Function(
                    `"use strict"; return (${expression})`
                )();

            return "The answer is " + result + ", Boss.";

        } catch (error) {

            return "I couldn't calculate that, Boss.";
        }
    }


    // 13. RANDOM NUMBER
    if (t.includes("random number")) {

        const random =
            Math.floor(Math.random() * 100) + 1;

        return (
            "Your random number is " +
            random +
            ", Boss."
        );
    }


    // 14. SCROLL DOWN
    if (t.includes("scroll down")) {

        window.scrollBy({
            top: window.innerHeight * 0.8,
            behavior: "smooth"
        });

        return "Scrolling down, Boss.";
    }


    // 15. SCROLL UP
    if (t.includes("scroll up")) {

        window.scrollBy({
            top: -window.innerHeight * 0.8,
            behavior: "smooth"
        });

        return "Scrolling up, Boss.";
    }


    // NO TOOL MATCH
    return null;
}
