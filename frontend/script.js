// =====================================================
// J.A.R.V.I.S - FULL SCRIPT
// =====================================================

// -------------------------------
// API KEY
// -------------------------------

let API_KEY = localStorage.getItem("jarvis_key");

if (!API_KEY) {
    API_KEY = prompt("Enter your Gemini API Key:");

    if (API_KEY) {
        localStorage.setItem("jarvis_key", API_KEY);
    }
}


// -------------------------------
// ELEMENTS
// -------------------------------

const chat = document.getElementById("chat");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("send");

const refreshBtn = document.getElementById("refresh-btn");
const camBtn = document.getElementById("cam-btn");
const imgInput = document.getElementById("img-input");


// -------------------------------
// MEMORY
// -------------------------------

let MEMORY = JSON.parse(
    localStorage.getItem("jarvis_memory") || "[]"
);


function saveMemory() {
    localStorage.setItem(
        "jarvis_memory",
        JSON.stringify(MEMORY)
    );
}


// -------------------------------
// ADD MESSAGE
// -------------------------------

function add(text, type) {

    const message = document.createElement("div");

    message.className = "msg " + type;

    message.innerText = text;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;

    return message;
}


// -------------------------------
// LOAD OLD CHAT
// -------------------------------

MEMORY.forEach(function (item) {

    if (item.role === "user") {

        add(
            "YOU: " + item.text,
            "user"
        );

    } else {

        add(
            "J.A.R.V.I.S: " + item.text,
            "ai"
        );

    }

});


// -------------------------------
// GEMINI REQUEST
// -------------------------------

async function askGemini(question) {

    const thinkingMessage = add(
        "J.A.R.V.I.S: Thinking...",
        "ai"
    );

    if (!API_KEY) {

        thinkingMessage.innerText =
            "J.A.R.V.I.S: API key is missing.";

        return;
    }

    try {

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" +
            API_KEY,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    contents: [

                        {
                            role: "user",

                            parts: [
                                {
                                    text:
                                        "You are J.A.R.V.I.S, a helpful personal AI assistant. Answer clearly and naturally.\n\nUser: " +
                                        question
                                }
                            ]
                        }

                    ]

                })
            }
        );


        const data = await response.json();


        if (data.error) {

            throw new Error(
                data.error.message
            );

        }


        const answer =
            data.candidates[0]
                .content.parts[0].text;


        thinkingMessage.innerText =
            "J.A.R.V.I.S: " + answer;


        // Save memory

        MEMORY.push({
            role: "user",
            text: question
        });

        MEMORY.push({
            role: "model",
            text: answer
        });


        // Keep only last 20 messages

        if (MEMORY.length > 20) {
            MEMORY =
                MEMORY.slice(-20);
        }


        saveMemory();


        speak(answer);


    } catch (error) {

        thinkingMessage.innerText =
            "J.A.R.V.I.S: ERROR - " +
            error.message;

    }

}


// -------------------------------
// SEND MESSAGE
// -------------------------------

function sendMessage() {

    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    add(
        "YOU: " + text,
        "user"
    );


    input.value = "";


    askGemini(text);

}


if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


// -------------------------------
// ENTER KEY
// -------------------------------

if (input) {

    input.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


// =====================================================
// MEMORY REFRESH BUTTON
// =====================================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        function () {

            // Delete memory

            MEMORY = [];

            localStorage.removeItem(
                "jarvis_memory"
            );


            // Clear chat

            chat.innerHTML = "";


            // New system message

            add(
                "J.A.R.V.I.S: Memory refreshed. New session started.",
                "ai"
            );

        }
    );

}


// =====================================================
// CAMERA BUTTON
// =====================================================

if (camBtn && imgInput) {

    camBtn.addEventListener(
        "click",
        function () {

            imgInput.click();

        }
    );

}


// =====================================================
// IMAGE SELECTED
// =====================================================

if (imgInput) {

    imgInput.addEventListener(
        "change",
        function () {

            const file =
                imgInput.files[0];


            if (!file) {
                return;
            }


            if (!file.type.startsWith("image/")) {

                add(
                    "J.A.R.V.I.S: Please select an image.",
                    "ai"
                );

                return;

            }


            add(
                "YOU: [IMAGE]",
                "user"
            );


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    const base64 =
                        reader.result
                            .split(",")[1];


                    askVision(
                        base64,
                        file.type
                    );

                };


            reader.readAsDataURL(file);


            // Allow same image to be selected again

            imgInput.value = "";

        }
    );

}


// =====================================================
// IMAGE ANALYSIS
// =====================================================

async function askVision(
    base64,
    mimeType
) {

    const message =
        add(
            "J.A.R.V.I.S: Analyzing image...",
            "ai"
        );


    if (!API_KEY) {

        message.innerText =
            "J.A.R.V.I.S: API key is missing.";

        return;

    }


    try {

        const response =
            await fetch(

                "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" +
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
                                            "Look at this image and describe what you see clearly."
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

            throw new Error(
                data.error.message
            );

        }


        const answer =
            data.candidates[0]
                .content.parts[0].text;


        message.innerText =
            "J.A.R.V.I.S: " +
            answer;


        speak(answer);


    } catch (error) {

        message.innerText =
            "J.A.R.V.I.S: IMAGE ERROR - " +
            error.message;

    }

}


// =====================================================
// VOICE INPUT
// =====================================================

const micBtn =
    document.getElementById("mic-btn");


const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (micBtn && SpeechRecognition) {

    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    micBtn.addEventListener(
        "click",
        function () {

            recognition.start();

            micBtn.innerText =
                "LISTENING...";

        }
    );


    recognition.onresult =
        function (event) {

            const text =
                event.results[0][0]
                    .transcript;


            input.value = text;

            sendMessage();

        };


    recognition.onend =
        function () {

            micBtn.innerText =
                "🎤";

        };

}


// =====================================================
// VOICE OUTPUT
// =====================================================

function speak(text) {

    if (!window.speechSynthesis) {
        return;
    }


    speechSynthesis.cancel();


    const voice =
        new SpeechSynthesisUtterance(
            text
        );


    voice.rate = 1.0;

    voice.pitch = 0.85;


    speechSynthesis.speak(
        voice
    );

}


// =====================================================
// STARTUP
// =====================================================

if (MEMORY.length === 0) {

    add(
        "J.A.R.V.I.S: Systems online. How may I assist you, Boss?",
        "ai"
    );

}
