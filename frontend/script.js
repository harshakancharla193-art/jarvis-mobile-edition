// ======================================================
// J.A.R.V.I.S — MAIN JAVASCRIPT
// ======================================================


// ===== 1. API KEY & SMART MODELS =====

let API_KEY = localStorage.getItem("jarvis_key");

if (!API_KEY) {
    API_KEY = prompt("Enter your Gemini API Key:");

    if (API_KEY) {
        localStorage.setItem("jarvis_key", API_KEY);
    }
}

const MODELS = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
];


// ===== 2. MEMORY SYSTEM =====

let MEMORY = JSON.parse(
    localStorage.getItem("jarvis_memory") || "[]"
);

function saveMemory() {
    localStorage.setItem(
        "jarvis_memory",
        JSON.stringify(MEMORY)
    );
}


// ===== 3. HTML ELEMENTS =====

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const micBtn = document.getElementById("mic-btn");
const clearBtn = document.getElementById("clear-btn");
const camBtn = document.getElementById("cam-btn");
const imgInput = document.getElementById("img-input");
const sendBtn = document.getElementById("send");


// ===== 4. LOAD OLD MEMORY =====

if (chat) {

    MEMORY.forEach(m => {

        add(
            (m.role === "user" ? "YOU: " : "J.A.R.V.I.S: ") +
            m.text,
            m.role === "user" ? "user" : "ai"
        );

    });

}


// ======================================================
// 5. TOOLS — THE HANDS
// ======================================================

async function handleTools(text) {

    const t = text.toLowerCase().trim();


    // 1. TIME
    if (
        /\btime\b/.test(t) ||
        t.includes("టైమ్") ||
        t.includes("సమయం")
    ) {

        return (
            "The time is " +
            new Date().toLocaleTimeString() +
            ", Boss."
        );
    }


    // 2. DATE
    if (
        /\bdate\b/.test(t) ||
        t.includes("today") ||
        t.includes("తేదీ")
    ) {

        return (
            "Today's date is " +
            new Date().toLocaleDateString() +
            ", Boss."
        );
    }


    // 3. WEATHER
    if (
        t.includes("weather") ||
        t.includes("వాతావరణం")
    ) {

        return await new Promise(resolve => {

            if (!navigator.geolocation) {

                resolve(
                    "Geolocation is not supported, Boss."
                );

                return;
            }

            navigator.geolocation.getCurrentPosition(

                async position => {

                    try {

                        const lat =
                            position.coords.latitude;

                        const lon =
                            position.coords.longitude;

                        const url =
                            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

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

            speak(
                `Timer completed! ${amount} ${unit} are over, Boss.`
            );

        }, duration);

        return (
            `Timer set for ${amount} ${unit}, Boss.`
        );
    }


    // 5. TRANSLATE
    if (t.startsWith("translate")) {

        const q =
            text
                .replace(/^translate\s*(this\s*)?/i, "")
                .trim();

        if (!q) {

            return (
                "Tell me what you want me to translate, Boss."
            );
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

            return (
                "What should I search on YouTube, Boss?"
            );
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
    if (t.startsWith("search google ")) {

        const q =
            text
                .replace(/^search google\s+/i, "")
                .trim();

        if (!q) {

            return (
                "What should I search on Google, Boss."
            );
        }

        window.open(
            "https://www.google.com/search?q=" +
            encodeURIComponent(q),
            "_blank"
        );

        return (
            "Searching Google for " +
            q +
            ", Boss."
        );
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

                return (
                    "I can only calculate basic mathematical expressions, Boss."
                );
            }

            const result =
                Function(
                    `"use strict"; return (${expression})`
                )();

            return (
                "The answer is " +
                result +
                ", Boss."
            );

        } catch (error) {

            return (
                "I couldn't calculate that, Boss."
            );
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


// ======================================================
// 6. GEMINI BRAIN
// ======================================================

async function callGemini(prompt) {

    if (!API_KEY) {

        throw new Error(
            "Gemini API key is missing."
        );
    }

    const contents =
        MEMORY
            .slice(-12)
            .map(m => ({

                role:
                    m.role === "model"
                        ? "model"
                        : "user",

                parts: [
                    {
                        text: m.text
                    }
                ]

            }));


    contents.push({

        role: "user",

        parts: [
            {
                text: prompt
            }
        ]

    });


    let lastError = null;


    for (const model of MODELS) {

        try {

            const response =
                await fetch(
                    "https://generativelanguage.googleapis.com/v1beta/models/" +
                    model +
                    ":generateContent?key=" +
                    encodeURIComponent(API_KEY),

                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            contents: contents
                        })
                    }
                );


            const data =
                await response.json();


            if (data.error) {

                lastError =
                    new Error(
                        data.error.message ||
                        "Gemini API error"
                    );

                if (
                    /high demand|temporar|quota|rate|unavailable|deprecated|not found/i
                        .test(data.error.message || "")
                ) {

                    continue;
                }

                throw lastError;
            }


            const reply =
                data?.candidates?.[0]?.content?.parts?.[0]?.text;


            if (!reply) {

                throw new Error(
                    "Gemini returned an empty response."
                );
            }


            return reply;


        } catch (error) {

            console.error(
                "Model failed:",
                model,
                error
            );

            lastError = error;
        }
    }


    throw (
        lastError ||
        new Error("All Gemini models failed.")
    );
}


// ======================================================
// 7. ASK GEMINI
// ======================================================

async function askGemini(prompt) {

    add(
        "J.A.R.V.I.S: Thinking...",
        "ai"
    );


    try {

        const reply =
            await callGemini(prompt);


        MEMORY.push({
            role: "user",
            text: prompt
        });


        MEMORY.push({
            role: "model",
            text: reply
        });


        saveMemory();


        if (chat.lastChild) {

            chat.lastChild.innerText =
                "J.A.R.V.I.S: " + reply;
        }


        speak(reply);


    } catch (error) {

        console.error(error);


        if (chat.lastChild) {

            chat.lastChild.innerText =
                "J.A.R.V.I.S: ERROR - " +
                error.message;
        }
    }
}


// ======================================================
// 8. SEND MESSAGE
// ======================================================

async function sendMessage() {

    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    // Show user message
    add(
        "YOU: " + text,
        "user"
    );


    // Clear input
    input.value = "";


    // FIRST → CHECK TOOLS
    try {

        const toolResult =
            await handleTools(text);


        if (toolResult) {

            add(
                "J.A.R.V.I.S: " +
                toolResult,
                "ai"
            );

            speak(toolResult);

            return;
        }


    } catch (error) {

        console.error(
            "Tool error:",
            error
        );
    }


    // NO TOOL → GEMINI
    await askGemini(text);
}


// ======================================================
// 9. SEND BUTTON
// ======================================================

if (sendBtn) {

    sendBtn.onclick = sendMessage;
}


// ======================================================
// 10. ENTER KEY
// ======================================================

if (input) {

    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }

        }
    );
}


// ======================================================
// 11. VISION ENGINE — CAMERA / IMAGE
// ======================================================

if (camBtn && imgInput) {

    camBtn.onclick = () => {

        imgInput.click();

    };


    imgInput.onchange = () => {

        const file =
            imgInput.files[0];


        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload = () => {

            const base64 =
                reader.result.split(",")[1];


            const question =
                input.value.trim() ||
                "What do you see? Describe the image briefly.";


            add(
                "YOU: [IMAGE] " + question,
                "user"
            );


            input.value = "";


            askVision(
                base64,
                file.type,
                question
            );
        };


        reader.readAsDataURL(file);
    };
}


// ======================================================
// 12. VISION FUNCTION
// ======================================================

async function askVision(
    base64,
    mime,
    question
) {

    add(
        "J.A.R.V.I.S: Analyzing image...",
        "ai"
    );


    let lastError = null;


    for (const model of MODELS) {

        try {

            const response =
                await fetch(
                    "https://generativelanguage.googleapis.com/v1beta/models/" +
                    model +
                    ":generateContent?key=" +
                    encodeURIComponent(API_KEY),

                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            contents: [

                                {
                                    parts: [

                                        {
                                            text:
                                                question
                                        },

                                        {
                                            inline_data: {

                                                mime_type:
                                                    mime,

                                                data:
                                                    base64
                                            }
                                        }

                                    ]
                                }

                            ]
                        })
                    }
                );


            const data =
                await response.json();


            if (data.error) {

                lastError =
                    new Error(
                        data.error.message ||
                        "Vision API error"
                    );

                continue;
            }


            const reply =
                data?.candidates?.[0]?.content?.parts?.[0]?.text;


            if (!reply) {

                throw new Error(
                    "No image response received."
                );
            }


            if (chat.lastChild) {

                chat.lastChild.innerText =
                    "J.A.R.V.I.S: " + reply;
            }


            speak(reply);

            return;


        } catch (error) {

            console.error(error);

            lastError = error;
        }
    }


    if (chat.lastChild) {

        chat.lastChild.innerText =
            "J.A.R.V.I.S: ERROR - " +
            (lastError?.message ||
                "Image analysis failed.");
    }
}


// ======================================================
// 13. VOICE RECOGNITION
// ======================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition && micBtn) {

    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.onresult =
        event => {

            const text =
                event.results[0][0].transcript;


            add(
                "YOU: " + text,
                "user"
            );


            sendVoiceMessage(text);
        };


    recognition.onerror =
        event => {

            console.error(
                "Speech error:",
                event.error
            );

            micBtn.innerText = "🎤";
        };


    recognition.onend =
        () => {

            micBtn.innerText =
                "🎤";
        };


    micBtn.onclick =
        () => {

            recognition.start();

            micBtn.innerText =
                "LISTENING...";
        };
}


// ======================================================
// 14. VOICE MESSAGE HANDLER
// ======================================================

async function sendVoiceMessage(text) {

    try {

        const toolResult =
            await handleTools(text);


        if (toolResult) {

            add(
                "J.A.R.V.I.S: " +
                toolResult,
                "ai"
            );

            speak(toolResult);

            return;
        }


        await askGemini(text);


    } catch (error) {

        console.error(error);

        add(
            "J.A.R.V.I.S: " +
            error.message,
            "ai"
        );
    }
}


// ======================================================
// 15. TEXT TO SPEECH
// ======================================================

let voices = [];


function loadVoices() {

    voices =
        speechSynthesis.getVoices();
}


loadVoices();


speechSynthesis.onvoiceschanged =
    loadVoices;


function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(text);


    utterance.rate =
        1.05;


    utterance.pitch =
        0.85;


    const voice =
        voices.find(v =>
            v.lang &&
            v.lang.toLowerCase().startsWith("en")
        );


    if (voice) {

        utterance.voice =
            voice;
    }


    speechSynthesis.speak(
        utterance
    );
}


// ======================================================
// 16. CLEAR MEMORY
// ======================================================

if (clearBtn) {

    clearBtn.onclick =
        () => {

            MEMORY = [];

            saveMemory();

            chat.innerHTML = "";

            add(
                "SYSTEM: Memory cleared.",
                "ai"
            );
        };
}


// ======================================================
// 17. ADD MESSAGE
// ======================================================

function add(text, type) {

    if (!chat) {
        return;
    }


    const div =
        document.createElement("div");


    div.className =
        "msg " + type;


    div.innerText =
        text;


    chat.appendChild(div);


    chat.scrollTop =
        chat.scrollHeight;
}
