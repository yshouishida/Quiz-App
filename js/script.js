let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
let currentQuestions = [];

// Function to import quizzes from a JSON file
function importQuizzes() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a JSON file to import.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const importedQuizzes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuizzes)) {
                quizzes = [...quizzes, ...importedQuizzes];
                localStorage.setItem('quizzes', JSON.stringify(quizzes));
                alert('Quizzes imported successfully!');
                showQuizzes(); // Refresh the quiz list
            } else {
                alert('Invalid JSON format. Please ensure it is an array of quizzes.');
            }
        } catch (error) {
            alert('Error parsing JSON: ' + error.message);
        }
    };

    reader.readAsText(file);
}

function showCreateQuiz() {
    document.getElementById('createQuiz').classList.add('active');
    document.getElementById('quizList').style.display = 'none';
    currentQuestions = [];
    document.getElementById('questions').innerHTML = '';
    document.getElementById('quizTitle').value = '';
    addQuestion();
}

function showQuizzes() {
    document.getElementById('createQuiz').classList.remove('active');
    document.getElementById('quizList').style.display = 'block';
    displayQuizzes();
}

function addQuestion() {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('form-group');
    questionDiv.innerHTML = `
        <label>Question:</label>
        <input type="text" class="question-input" required placeholder="Enter your question">
        <label>Correct Answer:</label>
        <input type="text" class="correct-answer" required placeholder="Enter the correct answer">
        <button onclick="removeQuestion(this)" style="background-color: #ff4444;">Remove Question</button>
        <hr>
    `;
    document.getElementById('questions').appendChild(questionDiv);
}

function removeQuestion(button) {
    button.parentElement.remove();
}

function saveQuiz() {
    const title = document.getElementById('quizTitle').value;
    if (!title) {
        alert('Please enter a quiz title');
        return;
    }

    const questions = [];
    const questionElements = document.getElementsByClassName('question-input');
    
    for (let i = 0; i < questionElements.length; i++) {
        const questionText = questionElements[i].value;
        const correctAnswer = questionElements[i].parentElement.querySelector('.correct-answer').value;

        if (questionText && correctAnswer) {
            questions.push({
                question: questionText,
                correctAnswer: correctAnswer
            });
        }
    }

    if (questions.length === 0) {
        alert('Please add at least one complete question');
        return;
    }

    const quiz = {
        id: Date.now(),
        title: title,
        questions: questions
    };

    quizzes.push(quiz);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    
    alert('Quiz saved successfully!');
    showQuizzes();
}

function displayQuizzes() {
    const quizList = document.getElementById('quizList');
    quizList.innerHTML = '<h2>Available Quizzes</h2>';

    quizzes.forEach(quiz => {
        const quizDiv = document.createElement('div');
        quizDiv.classList.add('quiz-item');
        quizDiv.innerHTML = `
            <h3>${quiz.title}</h3>
            <p>Questions: ${quiz.questions.length}</p>
            <button onclick="startQuiz(${quiz.id})">Start Quiz</button>
            <button onclick="deleteQuiz(${quiz.id})" class="delete-btn">Delete</button>
        `;
        quizList.appendChild(quizDiv);
    });
}

function deleteQuiz(id) {
    if (confirm('Are you sure you want to delete this quiz?')) {
        quizzes = quizzes.filter(quiz => quiz.id !== id);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        displayQuizzes();
    }
}

function startQuiz(id) {
    const quiz = quizzes.find(q => q.id === id);
    let currentQuestion = 0;
    let score = 0;
    let userAnswers = [];

    // Fisher-Yates shuffle function
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    // Shuffle the questions
    const shuffledQuestions = [...quiz.questions];
    shuffle(shuffledQuestions);

    const quizContainer = document.getElementById('quizList');
    
    function displayQuestion() {
        const question = shuffledQuestions[currentQuestion];
        quizContainer.innerHTML = `
            <h2>${quiz.title}</h2>
            <div class="quiz-item">
                <h3>Question ${currentQuestion + 1} of ${shuffledQuestions.length}</h3>
                <p>${question.question}</p>
                <label>Type your answer:</label>
                <input type="text" id="userAnswer" required placeholder="Enter your answer">
                <button onclick="checkAnswer()">Submit Answer</button>
            </div>
        `;

        // Get the text input and add the event listener
        const textInput = document.getElementById("userAnswer");
        textInput.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                checkAnswer(); // Call the checkAnswer function on Enter
            }
        });

        // Autofocus the input field
        textInput.focus();
    }

    window.checkAnswer = function() {
        const userAnswer = document.getElementById('userAnswer').value.trim();
        userAnswers.push(userAnswer); // Store the user's answer

        if (userAnswer.toLowerCase() === shuffledQuestions[currentQuestion].correctAnswer.toLowerCase()) {
            score++;
        }
        
        currentQuestion++;
        
        if (currentQuestion < shuffledQuestions.length) {
            displayQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        let resultsHTML = `
            <div class="results">
                <h2>Quiz Results</h2>
                <h3>${quiz.title}</h3>
                <p>Your score: ${score} out of ${shuffledQuestions.length}</p>
                <p>Percentage: ${(score / shuffledQuestions.length * 100).toFixed(2)}%</p>
                <h4>Details:</h4>
                <ul>
        `;
    
        shuffledQuestions.forEach((question, index) => {
            const userAnswer = userAnswers[index] || 'No Answer';
            const isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
            const color = isCorrect ? '#88C273' : '#F95454';
    
            resultsHTML += `
                <li style="color: ${color};">
                    <strong>Q${index + 1}: ${question.question}</strong><br>
                    Correct Answer: <span style="color: #88C273;">${question.correctAnswer}</span><br>
                    Your Answer: <span style="color: ${color};">${userAnswer}</span>    
                </li>
            `;
        });
    
        resultsHTML += `
                </ul>
                <button onclick="showQuizzes()">Back to Quizzes</button>
            </div>
        `;
    
        quizContainer.innerHTML = resultsHTML;
    }

    displayQuestion();
}

// Initialize the display
showQuizzes();
