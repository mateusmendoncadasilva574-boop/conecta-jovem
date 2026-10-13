const formulario = document.getElementById("formCadastro");
const mensagem = document.getElementById("mensagem");
const nascimento = document.getElementById("nascimento");

const LIMITE_ALUNOS = 30;
const CHAVE = "conectaJovemInscricoes";

nascimento.max = new Date().toLocaleDateString("en-CA");

function calcularIdade(dataNascimento) {
    const nascimentoData = new Date(dataNascimento + "T12:00:00");
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimentoData.getFullYear();

    const aindaNaoFezAniversario =
        hoje.getMonth() < nascimentoData.getMonth() ||
        (
            hoje.getMonth() === nascimentoData.getMonth() &&
            hoje.getDate() < nascimentoData.getDate()
        );

    if (aindaNaoFezAniversario) {
        idade--;
    }

    return idade;
}

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo;
}

function obterInscricoes() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");

        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!formulario.reportValidity()) {
        return;
    }

    const dadosFormulario = new FormData(formulario);
    const dados = Object.fromEntries(dadosFormulario.entries());

    const idade = calcularIdade(dados.nascimento);

    if (idade < 14 || idade > 18) {
        mostrarMensagem(
            "O projeto é destinado a jovens de 14 a 18 anos.",
            "erro"
        );
        return;
    }

    if (!document.getElementById("consentimento").checked) {
        mostrarMensagem(
            "É necessário confirmar a leitura do aviso de privacidade.",
            "erro"
        );
        return;
    }

    const inscricoes = obterInscricoes();

    if (inscricoes.length >= LIMITE_ALUNOS) {
        mostrarMensagem(
            "O limite local de 30 inscrições foi atingido. " +
            "Entre em contato com a equipe do projeto.",
            "erro"
        );
        return;
    }

    // Evita duplicar inscrições pelo mesmo e-mail neste navegador.
    const email = dados.email.trim().toLowerCase();

    const jaInscrito = inscricoes.some(
        aluno => aluno.email.toLowerCase() === email
    );

    if (jaInscrito) {
        mostrarMensagem(
            "Já existe uma inscrição com esse e-mail neste dispositivo.",
            "erro"
        );
        return;
    }

    dados.id = Date.now().toString();
    dados.criadoEm = new Date().toISOString();

    inscricoes.push(dados);

    try {
        localStorage.setItem(CHAVE, JSON.stringify(inscricoes));
    } catch {
        mostrarMensagem(
            "Não foi possível salvar o cadastro neste navegador.",
            "erro"
        );
        return;
    }

    mostrarMensagem(
        "Inscrição registrada neste dispositivo! " +
        "A equipe ainda precisa verificar os dados e confirmar a vaga.",
        "sucesso"
    );

    formulario.reset();
    window.scrollTo({ top: mensagem.offsetTop, behavior: "smooth" });
});

// Para consultar os cadastros de teste no console do navegador:
// console.table(obterInscricoes());
