import { useState } from 'react';

export default function FunCorner() {
    const triviaQuestions = [
        { q: "Which vitamin is synthesized in the skin upon exposure to sunlight?", options: ["Vitamin A", "Vitamin D", "Vitamin C", "Vitamin K"], answer: "Vitamin D" },
        { q: "What is the primary function of red blood cells?", options: ["Fight infection", "Produce antibodies", "Carry oxygen", "Clotting blood"], answer: "Carry oxygen" },
        { q: "What does 'BMI' stand for?", options: ["Body Mass Index", "Basic Metabolic Indicator", "Bone Mineral Integrity", "Bowel Movement Index"], answer: "Body Mass Index" },
        { q: "The recommended daily steps for a healthy adult is approximately how many?", options: ["5,000", "7,500", "10,000", "15,000"], answer: "10,000" },
        { q: "Which nutrient is essential for muscle repair?", options: ["Fat", "Protein", "Carbohydrates", "Water"], answer: "Protein" }
    ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [started, setStarted] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answerStatus, setAnswerStatus] = useState(null); // 'correct' or 'incorrect'

    const startQuiz = () => {
        setStarted(true);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedOption(null);
        setAnswerStatus(null);
    };

    const handleOptionClick = (option) => {
        if (selectedOption) return; // Prevent multiple clicks

        setSelectedOption(option);
        const currentQ = triviaQuestions[currentQuestionIndex];

        if (option === currentQ.answer) {
            setScore(score + 3);
            setAnswerStatus('correct');
        } else {
            setScore(score - 1);
            setAnswerStatus('incorrect');
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex + 1 < triviaQuestions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setAnswerStatus(null);
        } else {
            setShowResult(true);
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Health Trivia Quiz</h2>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-6">
                {!started ? (
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">Welcome to the Health Quiz!</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Test your knowledge on nutrition, first aid, and general health facts. Get 3 points for a correct answer, lose 1 point for a wrong answer.</p>
                        <button
                            onClick={startQuiz}
                            className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 submit-button"
                        >
                            Start Quiz!
                        </button>
                    </div>
                ) : showResult ? (
                    <div className="text-center animate-fade-in">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Quiz Complete!</h3>
                        <p className="text-4xl font-extrabold text-emerald-600 mb-6 md:text-5xl">Final Score: {score}</p>
                        <button
                            onClick={startQuiz}
                            className="w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 submit-button"
                        >
                            Play Again
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Question <span className="font-bold">{currentQuestionIndex + 1}</span> of {triviaQuestions.length}</p>
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">{triviaQuestions[currentQuestionIndex].q}</p>

                        <div className="space-y-3">
                            {triviaQuestions[currentQuestionIndex].options.map((option, index) => {
                                let btnClass = "w-full p-3 rounded-lg text-left transition duration-150 border ";

                                if (selectedOption) {
                                    if (option === triviaQuestions[currentQuestionIndex].answer) {
                                        btnClass += "bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200";
                                    } else if (option === selectedOption) {
                                        btnClass += "bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200";
                                    } else {
                                        btnClass += "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-transparent";
                                    }
                                } else {
                                    btnClass += "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 border-transparent";
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionClick(option)}
                                        disabled={!!selectedOption}
                                        className={btnClass}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>

                        {selectedOption && (
                            <button
                                onClick={nextQuestion}
                                className="mt-6 w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 submit-button animate-bounce-in"
                            >
                                {currentQuestionIndex + 1 === triviaQuestions.length ? 'Finish Quiz' : 'Next Question'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
