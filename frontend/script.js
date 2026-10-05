// ===== 1. API KEY =====

let API_KEY = localStorage.getItem("jarvis_key");

if (!API_KEY) {
    API_KEY = prompt("Enter your Gemini API Key:");

    if (API_KEY) {
        localStorage.setItem("jarvis_key", API_KEY);
    }
}

const MODELS = [
    "gemini-3.6-flash",
    "gemini-flash-latest"
];


// ===== 2. MEMORY =====

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
const sendBtn = document.getElementById("send");


// ===== 4. LOAD MEMORY =====

MEMORY.forEach(m => {

    add(
        (m.role === "user"
            ? "YOU: "
            : "J.A.R.V.I.S: ") + m.text,

        m.role === "user"
            ? "user"
            : "ai"
    );

});


// ===== 5. GEMINI BRAIN =====

async function callGemini(prompt) {

    const contents = MEMORY
        .slice(-12)
        .map(m => ({
            role: m.role,
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

    let lastErr;

    for (const model of MODELS) {

        try {

            const res = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/" +
                model +
                ":generateContent?key=" +
                API_KEY,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        contents: contents
                    })
                }
            );

            const data = await res.json();

            if (data.error) {

                lastErr = new Error(
                    data.error.message
                );

                if (
                    /high demand|temporar|quota|rate|unavailable|deprecated/i
                    .test(data.error.message)
                ) {
                    continue;
                }

                throw lastErr;
            }

            return data
                .candidates[0]
                .content
                .parts[0]
                .text;

        } catch (e) {

            lastErr = e;

        }

    }

    throw lastErr;
}


// ===== 6. ASK JARVIS =====

async function askGemini(prompt) {

    add(
        "J.A.R.V.I.S: Thinking...",
        "ai"
    );

    try {

        const reply = await callGemini(prompt);

        MEMORY.push({
            role: "user",
            text: prompt
        });

        MEMORY.push({
            role: "model",
            text: reply
        });

        saveMemory();

        chat.lastChild.innerText =
            "J.A.R.V.I.S: " + reply;

        speak(reply);

    } catch (e) {

        chat.lastChild.innerText =
            "J.A.R.V.I.S: ERROR - " +
            e.message;

    }
}


// ===== 7. SEND BUTTON =====

sendBtn.onclick = () => {

    const text = input.value.trim();

    if (!text) return;

    add(
        "YOU: " + text,
        "user"
    );

    input.value = "";

    askGemini(text);
};


// ===== 8. ENTER KEY =====

input.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            sendBtn.click();
        }

    }
);


// ===== 9. TEXT TO SPEECH =====

let voices = [];

function loadVoices() {

    voices =
        speechSynthesis.getVoices();

}

loadVoices();

speechSynthesis.onvoiceschanged =
    loadVoices;


function speak(text) {

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = 1.05;
    utterance.pitch = 0.85;

    const voice =
        voices.find(v =>
            v.lang.startsWith("en")
        );

    if (voice) {
        utterance.voice = voice;
    }

    speechSynthesis.speak(
        utterance
    );
}


// ===== 10. ADD MESSAGE =====

function add(text, who) {

    const d =
        document.createElement("div");

    d.className =
        "msg " + who;

    d.innerText = text;

    chat.appendChild(d);

    chat.scrollTop =
        chat.scrollHeight;
}
