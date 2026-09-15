async function buscarResposta() {
    const perguntaUsuario = document.getElementById('input-pergunta').value;
    const elementoResposta = document.getElementById('container-resposta');

    if (!perguntaUsuario) return;

    try {
        elementoResposta.innerText = "Pensando...";

        const response = await fetch("https://groq.com", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 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",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: perguntaUsuario }]
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const dados = await response.json();
        elementoResposta.innerText = dados.choices.message.content;

    } catch (error) {
        console.error("Erro completo:", error);
        elementoResposta.innerText = "Desculpe, estou com problemas para me conectar ao servidor.";
    }
}

document.getElementById('botao-enviar').addEventListener('click', buscarResposta);
