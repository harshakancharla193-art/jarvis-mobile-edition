// =====================================================
// J.A.R.V.I.S - MOBILE EDITION
// FULL JAVASCRIPT
// =====================================================


// =====================================================
// 1. API KEY
// =====================================================

let API_KEY = localStorage.getItem("jarvis_key");

if (!API_KEY) {

    API_KEY = prompt("Enter your Gemini API Key:");

    if (API_KEY) {
        localStorage.setItem("jarvis_key", API_KEY);
    }
}


// =====================================================
// 2. GEMINI MODELS
// =====================================================

const MODELS = [
    "gemini-3.6-flash",
    "gemini-flash-latest"
];


// =====================================================
// 3. GET HTML ELEMENTS
// =====================================================

const chat = document.getElementById("chat");
const input = document.getElementById("msg");

const sendBtn = document.getElementById("send");

const micBtn = document.getElementById("mic-btn");
const clearBtn = document.getElementById("clear-btn");

const camBtn = document.getElementById("cam-btn");
const imgInput = document.getElementById("img-input");


// =====================================================
// 4. MEMORY
// =====================================================

let MEMORY = JSON.parse(
    localStorage.getItem("jarvis_memory") || "[]"
);


function saveMemory() {

    localStorage.setItem(
        "jarvis_memory",
        JSON.stringify(MEMORY)
    );

}


// =====================================================
// 5. LOAD PREVIOUS MEMORY
// =====================================================

MEMORY.forEach(function (message) {

    add(
        (message.role === "user"
            ? "YOU: "
            : "J.A.R.V.I.S: ") + message.text,

        message.role === "user"
            ? "user"
            : "ai"
    );

});


// =====================================================
// 6. GEMINI AI FUNCTION
// =====================================================

async function callGemini(prompt) {

    if (!API_KEY) {

        throw new Error(
            "Gemini API key is missing."
        );

    }


    // Get recent conversation
    const contents = MEMORY
        .slice(-12)
        .map(function (message) {

            return {

                role:
                    message.role === "model"
                        ? "model"
                        : "user",

                parts: [
                    {
                        text: message.text
                    }
                ]

            };

        });


    // Add current question
    contents.push({

        role: "user",

        parts: [
            {
                text: prompt
            }
        ]

    });


    let lastError = null;


    // Try models one by one
    for (const model of MODELS) {

        try {

            const response = await fetch(

                "https://generativelanguage.googleapis.com/v1beta/models/" +
                model +
                ":generateContent?key=" +
                API_KEY,

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


            // API error
            if (data.error) {

                lastError =
                    new Error(
                        data.error.message
                    );

                continue;

            }


            // Check response
            if (
                !data.candidates ||
                !data.candidates[0]
            ) {

                throw new Error(
                    "No response received from Gemini."
                );

            }


            return data
                .candidates[0]
                .content
                .parts[0]
                .text;


        } catch (error) {

            lastError = error;

        }

    }


    throw lastError ||
        new Error(
            "Gemini request failed."
        );

}


// =====================================================
// 7. ASK JARVIS
// =====================================================

async function askGemini(prompt) {

    // Show thinking
    add(
        "J.A.R.V.I.S: Thinking...",
        "ai"
    );


    try {

        const reply =
            await callGemini(prompt);


        // Save user message
        MEMORY.push({

            role: "user",

            text: prompt

        });


        // Save AI message
        MEMORY.push({

            role: "model",

            text: reply

        });


        // Save to browser memory
        saveMemory();


        // Display response
        chat.lastChild.innerText =
            "J.A.R.V.I.S: " + reply;


        // Speak response
        speak(reply);


    } catch (error) {

        chat.lastChild.innerText =
            "J.A.R.V.I.S: ERROR - " +
            error.message;

    }

}


// =====================================================
// 8. SEND MESSAGE
// =====================================================

function sendMessage() {

    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    // Add user message
    add(
        "YOU: " + text,
        "user"
    );


    // Clear input
    input.value = "";


    // Ask Gemini
    askGemini(text);

}


// Send button
sendBtn.onclick =
    sendMessage;


// =====================================================
// 9. ENTER KEY
// =====================================================

input.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);


// =====================================================
// 10. CLEAR MEMORY
// =====================================================

if (clearBtn) {

    clearBtn.onclick =
        function () {

            // Delete memory
            MEMORY = [];


            // Delete browser storage
            localStorage.removeItem(
                "jarvis_memory"
            );


            // Clear chat
            chat.innerHTML = "";


            // Show confirmation
            add(
                "SYSTEM: Memory cleared.",
                "ai"
            );

        };

}


// =====================================================
// 11. CAMERA BUTTON
// =====================================================

if (camBtn && imgInput) {

    camBtn.onclick =
        function () {

            imgInput.click();

        };

}


// =====================================================
// 12. IMAGE SELECTED
// =====================================================

if (imgInput) {

    imgInput.onchange =
        function () {

            const file =
                imgInput.files[0];


            if (!file) {
                return;
            }


            // Check image
            if (!file.type.startsWith("image/")) {

                add(
                    "SYSTEM: Please select an image.",
                    "ai"
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    const base64 =
                        reader.result
                            .split(",")[1];


                    // Question from input
                    const question =
                        input.value.trim() ||
                        "What do you see in this image? Describe it briefly.";


                    // Show user message
                    add(
                        "YOU: [IMAGE] " +
                        question,
                        "user"
                    );


                    input.value = "";


                    // Analyze image
                    askVision(

                        base64,

                        file.type,

                        question

                    );

                };


            reader.readAsDataURL(file);

        };

}


// =====================================================
// 13. GEMINI VISION
// =====================================================

async function askVision(
    base64,
    mimeType,
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
                    API_KEY,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            contents: [

                                {

                                    role: "user",

                                    parts: [

                                        {

                                            text:
                                                question

                                        },

                                        {

                                            inline_data: {

                                                mime_type:
                                                    mimeType,

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
                        data.error.message
                    );

                continue;

            }


            if (
                !data.candidates ||
                !data.candidates[0]
            ) {

                throw new Error(
                    "Gemini did not return an image response."
                );

            }


            const reply =
                data
                    .candidates[0]
                    .content
                    .parts[0]
                    .text;


            // Display answer
            chat.lastChild.innerText =
                "J.A.R.V.I.S: " +
                reply;


            // Speak answer
            speak(reply);


            return;


        } catch (error) {

            lastError = error;

        }

    }


    chat.lastChild.innerText =
        "J.A.R.V.I.S: ERROR - " +
        (
            lastError
                ? lastError.message
                : "Image analysis failed."
        );

}


// =====================================================
// 14. VOICE RECOGNITION
// =====================================================

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


    // When speech is recognized
    recognition.onresult =
        function (event) {

            const text =
                event
                    .results[0][0]
                    .transcript;


            add(
                "YOU: " + text,
                "user"
            );


            askGemini(text);

        };


    // Start listening
    micBtn.onclick =
        function () {

            try {

                recognition.start();

                micBtn.innerText =
                    "LISTENING...";

            } catch (error) {

                console.log(error);

            }

        };


    // Stop listening
    recognition.onend =
        function () {

            micBtn.innerText =
                "🎤";

        };


} else if (micBtn) {

    micBtn.onclick =
        function () {

            add(

                "SYSTEM: Voice recognition is not supported in this browser.",

                "ai"

            );

        };

}


// =====================================================
// 15. TEXT TO SPEECH
// =====================================================

let voices = [];


function loadVoices() {

    voices =
        speechSynthesis.getVoices();

}


loadVoices();


speechSynthesis.onvoiceschanged =
    loadVoices;


function speak(text) {

    if (!window.speechSynthesis) {
        return;
    }


    // Stop previous speech
    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.rate =
        1.05;


    utterance.pitch =
        0.85;


    // Find English voice
    const voice =
        voices.find(function (voice) {

            return voice.lang
                .toLowerCase()
                .startsWith("en");

        });


    if (voice) {

        utterance.voice =
            voice;

    }


    speechSynthesis.speak(
        utterance
    );

}


// =====================================================
// 16. ADD MESSAGE TO CHAT
// =====================================================

function add(text, who) {

    const message =
        document.createElement("div");


    message.className =
        "msg " + who;


    message.innerText =
        text;


    chat.appendChild(
        message
    );


    chat.scrollTop =
        chat.scrollHeight;

}


// =====================================================
// 17. STARTUP MESSAGE
// =====================================================

if (MEMORY.length === 0) {

    add(
        "J.A.R.V.I.S: Systems online. How may I assist you, Boss?",
        "ai"
    );

}
