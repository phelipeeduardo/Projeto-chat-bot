const API_KEY = "AQ.Ab8RN6L6pwsomEn_xnCNnyg8HkXzjxD7GKtIHLkqMbw98bAZdw";

const MODEL = "gemini-3.8-flash";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const conversation = [];

const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

chatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    sendMessage();
});

userInput.focus();

async function sendMessage() {
    const messageText = userInput.value.trim();

    if (!messageText || sendBtn.disabled) {
        return;
    }

    if (API_KEY === "SUA_CHAVE_AQUI") {
        appendMessage(
            "Configure sua chave da API Gemini no arquivo app.js antes de enviar mensagens.",
            "bot",
            true
        );
        return;
    }

    appendMessage(messageText, "user");

    userInput.value = "";
    sendBtn.disabled = true;
    userInput.disabled = true;

    conversation.push({
        role: "user",
        parts: [
            {
                text: messageText
            }
        ]
    });

    const typingId = appendTypingIndicator();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": API_KEY
            },
            body: JSON.stringify({
                contents: conversation,
                system_instruction: {
                    parts: [
                        {
                            text: "Você é um assistente virtual educado, útil e claro. Responda em português do Brasil. Organize respostas longas usando listas quando isso melhorar a compreensão."
                        }
                    ]
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro retornado pela API:", data);

            const apiError =
                data?.error?.message ||
                `Erro HTTP ${response.status}`;

            throw new Error(apiError);
        }

        const respostaIA =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();

        if (!respostaIA) {
            throw new Error("O Gemini não retornou nenhum texto.");
        }

        conversation.push({
            role: "model",
            parts: [
                {
                    text: respostaIA
                }
            ]
        });

        removeTypingIndicator(typingId);
        appendMessage(respostaIA, "bot");

    } catch (error) {
        console.error("Erro completo:", error);

        removeTypingIndicator(typingId);

        if (conversation.length > 0) {
            conversation.pop();
        }

        appendMessage(
            `Não consegui obter uma resposta do Gemini.\n\n${error.message}`,
            "bot",
            true
        );
    } finally {
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

function appendMessage(text, sender, isError = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("message-content");

    if (isError) {
        contentDiv.classList.add("error-message");
    }

    if (sender === "bot" && !isError) {
        contentDiv.innerHTML = formatMarkdown(text);
    } else {
        contentDiv.textContent = text;
    }

    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);

    scrollToBottom();
}

function formatMarkdown(text) {
    let formatted = escapeHTML(text);

    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    formatted = formatted.replace(
        /`([^`]+)`/g,
        "<strong>$1</strong>"
    );

    formatted = formatted.replace(
        /^[-*] (.+)$/gm,
        "<li>$1</li>"
    );

    formatted = formatted.replace(
        /(<li>.*<\/li>)/gs,
        "<ul>$1</ul>"
    );

    formatted = formatted.replace(
        /\n\n/g,
        "</p><p>"
    );

    formatted = formatted.replace(
        /\n/g,
        "<br>"
    );

    return `<p>${formatted}</p>`;
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function appendTypingIndicator() {
    const typingDiv = document.createElement("div");
    const id = "typing-" + Date.now();

    typingDiv.id = id;
    typingDiv.classList.add("message", "bot", "typing");

    typingDiv.innerHTML = `
        <div class="message-content">
            <span>.</span>
            <span>.</span>
            <span>.</span>
        </div>
    `;

    chatBox.appendChild(typingDiv);

    scrollToBottom();

    return id;
}

function removeTypingIndicator(id) {
    const typingIndicator = document.getElementById(id);

    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}