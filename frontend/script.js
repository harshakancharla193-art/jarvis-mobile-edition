// ===== 3.5. AGENT MODE ENGINE =====

const AGENT_TOOLS = Object.freeze({

    time: async () => handleTools("current time"),

    weather: async () => handleTools("weather"),

    news: async () => handleTools("news"),

    crypto: async () => handleTools("bitcoin")

});


const AGENT_TOOL_NAMES = Object.freeze({

    time: "time",

    weather: "weather",

    news: "news",

    crypto: "crypto"

});


// ===== CHECK AGENT MODE REQUEST =====

function isAgentModeRequest(text = "") {

    const value = String(text || "");

    if (
        /\b(?:agent(?:\s+mode)?|run\s+(?:the\s+)?agent|use\s+(?:the\s+)?agent)\b/i.test(value)
    ) {
        return true;
    }

    if (
        /\b(?:briefing|research|analy[sz]e|analysis)\b/i.test(value)
    ) {
        return true;
    }

    return (
        /\bplan\b/i.test(value) &&
        /\b(?:time|weather|news|crypto|bitcoin|btc)\b/i.test(value)
    );
}


// ===== PARSE AGENT TOOL PLAN =====

function parseAgentToolPlan(responseText) {

    const text = String(responseText || "")
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");

    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start < 0 || end < start) {
        throw new Error("Agent plan format incorrect.");
    }

    const parsed = JSON.parse(
        text.slice(start, end + 1)
    );

    const allowed = new Set(
        Object.keys(AGENT_TOOLS)
    );

    return [
        ...new Set(
            parsed
                .filter(item => typeof item === "string")
                .map(item => item.trim().toLowerCase())
                .filter(item => allowed.has(item))
        )
    ];
}


// ===== FALLBACK AGENT PLAN =====

function fallbackAgentToolPlan(goal) {

    const text = String(goal || "").toLowerCase();

    const tools = [];

    if (/\btime\b/i.test(text)) {
        tools.push("time");
    }

    if (/\bweather\b/i.test(text)) {
        tools.push("weather");
    }

    if (/\b(?:news|latest)\b/i.test(text)) {
        tools.push("news");
    }

    if (/\b(?:crypto|bitcoin|btc)\b/i.test(text)) {
        tools.push("crypto");
    }

    return tools;
}


// ===== RUN AGENT =====

async function runAgent(goal) {

    add(
        "J.A.R.V.I.S: Agent mode active.",
        "ai"
    );

    add(
        "J.A.R.V.I.S: Goal analyze chesthunna...",
        "ai"
    );


    const planPrompt =
        'Select tools from ["time","weather","news","crypto"]. ' +
        "Return ONLY a JSON array. Goal: " +
        JSON.stringify(String(goal));


    let toolsToRun;


    try {

        toolsToRun = parseAgentToolPlan(
            await callGeminiRaw(planPrompt)
        );

    } catch (error) {

        console.error(
            "Agent planning error:",
            error
        );

        toolsToRun = fallbackAgentToolPlan(goal);

    }


    const results = {};


    for (let i = 0; i < toolsToRun.length; i++) {

        const tool = toolsToRun[i];

        add(
            "J.A.R.V.I.S: [" +
            (i + 1) +
            "/" +
            toolsToRun.length +
            "] " +
            AGENT_TOOL_NAMES[tool] +
            " tool run chesthunna...",
            "ai"
        );


        try {

            results[tool] =
                await AGENT_TOOLS[tool]();

        } catch (e) {

            console.error(
                tool + " tool error:",
                e
            );

            results[tool] = "Tool error";

        }

    }


    add(
        "J.A.R.V.I.S: Results combine chesthunna...",
        "ai"
    );


    const summaryPrompt =
        "Goal: " +
        JSON.stringify(String(goal)) +
        ". Tool results: " +
        JSON.stringify(results) +
        ". Give a concise Telugu/English summary.";


    return await callGemini(summaryPrompt);
}


// ===== 4. GEMINI BRAIN =====

async function callGemini(prompt) {

    if (!API_KEY) {
        throw new Error(
            "Gemini API key is missing."
        );
    }


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


    for (const model of MODELS) {

        try {

            const url =
                "https://generativelanguage.googleapis.com/v1beta/models/" +
                model +
                ":generateContent?key=" +
                encodeURIComponent(API_KEY);


            const response = await fetch(
                url,
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


            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    model +
                    " API error:",
                    errorText
                );

                continue;
            }


            const data =
                await response.json();


            const answer =
                data?.candidates?.[0]?.content?.parts
                    ?.map(part => part.text || "")
                    .join("")
                    .trim();


            if (answer) {
                return answer;
            }

        } catch (error) {

            console.error(
                model +
                " request failed:",
                error
            );

        }

    }


    throw new Error(
        "All Gemini models failed."
    );
}


// ===== RAW GEMINI RESPONSE =====

async function callGeminiRaw(prompt) {

    return await callGemini(prompt);

}
