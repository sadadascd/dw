const questions = [
    {
        question: "O que é uma mutação silenciosa?",
        options: [
            "Altera a sequência de aminoácidos da proteína",
            "Não altera a sequência de aminoácidos devido à degeneração do código genético",
            "Gera um códon de parada prematuro",
            "Ocorre apenas em células somáticas"
        ],
        correct: 1
    },
    {
        question: "Qual tipo de mutação gera um dos três códons de parada (UAA, UAG, UGA)?",
        options: [
            "Mutação de sentido trocado",
            "Mutação silenciosa",
            "Mutação sem sentido",
            "Mutação de deleção"
        ],
        correct: 2
    },
    {
        question: "Se uma deleção ou inserção não envolve múltiplos de 3 nucleotídeos, o que geralmente acontece?",
        options: [
            "Não há alteração na proteína",
            "Ocorre mudança no quadro de leitura, alterando toda a sequência de aminoácidos subsequente",
            "Apenas um aminoácido é alterado",
            "A mutação é automaticamente reparada"
        ],
        correct: 1
    },
    {
        question: "Mutações que ocorrem em gametas e podem ser transmitidas aos descendentes são chamadas de:",
        options: [
            "Mutações somáticas",
            "Mutações germinativas",
            "Mutações silenciosas",
            "Mutações induzidas"
        ],
        correct: 1
    },
    {
        question: "As mutações são consideradas 'aleatórias' porque:",
        options: [
            "Sempre prejudicam o organismo",
            "Ocorrem com o objetivo de adaptar o organismo ao ambiente",
            "Não surgem para atender a uma necessidade específica e podem ser benéficas, neutras ou prejudiciais",
            "Ocorrem apenas sob indução de radiação"
        ],
        correct: 2
    }
];

let currentQuestion = 0;
let score = 0;

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progress = document.getElementById('progress');
const resultContainer = document.getElementById('result-container');
const scoreText = document.getElementById('score-text');
const questionContainer = document.getElementById('question-container');

function loadQuestion() {
    const q = questions[currentQuestion];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });
    
    progress.textContent = `Pergunta ${currentQuestion + 1} de ${questions.length}`;
}

function checkAnswer(selected, btn) {
    const correctIndex = questions[currentQuestion].correct;
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    
    if (selected === correctIndex) {
        btn.classList.add('correct');
        score++;
    } else {
        btn.classList.add('wrong');
        allBtns[correctIndex].classList.add('correct');
    }
    
    currentQuestion++;
    if (currentQuestion < questions.length) {
        setTimeout(loadQuestion, 1000);
    } else {
        setTimeout(showResult, 1000);
    }
}

function showResult() {
    questionContainer.classList.add('hide');
    progress.classList.add('hide');
    resultContainer.classList.remove('hide');
    scoreText.textContent = `Você acertou ${score} de ${questions.length}!`;
}

loadQuestion();