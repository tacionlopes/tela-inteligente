import Foundation

enum QuestionRepository {
    static let defaultQuestions = [
        EducationQuestion(year: "1º", age: 6, subject: "Matemática", text: "Quanto é 2 + 1?", alternatives: ["2", "3", "4"], correctAnswer: "B", level: "Fácil", timeSeconds: 10),
        EducationQuestion(year: "2º", age: 7, subject: "Português", text: "Qual palavra começa com B?", alternatives: ["Bola", "Casa", "Dedo"], correctAnswer: "A", level: "Fácil", timeSeconds: 10),
        EducationQuestion(year: "3º", age: 8, subject: "Lógica", text: "Qual número vem depois do 9?", alternatives: ["8", "10", "7"], correctAnswer: "B", level: "Fácil", timeSeconds: 10),
        EducationQuestion(year: "4º", age: 9, subject: "Ciências básicas", text: "As plantas precisam de luz?", alternatives: ["Sim", "Não", "Nunca"], correctAnswer: "A", level: "Fácil", timeSeconds: 10),
        EducationQuestion(year: "5º", age: 10, subject: "Matemática", text: "Quanto é 20 dividido por 4?", alternatives: ["4", "5", "6"], correctAnswer: "B", level: "Médio", timeSeconds: 15)
    ]
}
