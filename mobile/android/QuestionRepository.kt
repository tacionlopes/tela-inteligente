package com.desbloqueiointeligente

data class EducationQuestion(
    val year: String,
    val age: Int,
    val subject: String,
    val text: String,
    val alternatives: List<String>,
    val correctAnswer: String,
    val level: String,
    val timeSeconds: Int
)

object QuestionRepository {
    val defaultQuestions = listOf(
        EducationQuestion("1º", 6, "Matemática", "Quanto é 2 + 1?", listOf("2", "3", "4"), "B", "Fácil", 10),
        EducationQuestion("2º", 7, "Português", "Qual palavra começa com B?", listOf("Bola", "Casa", "Dedo"), "A", "Fácil", 10),
        EducationQuestion("3º", 8, "Lógica", "Qual número vem depois do 9?", listOf("8", "10", "7"), "B", "Fácil", 10),
        EducationQuestion("4º", 9, "Ciências básicas", "As plantas precisam de luz?", listOf("Sim", "Não", "Nunca"), "A", "Fácil", 10),
        EducationQuestion("5º", 10, "Matemática", "Quanto é 20 dividido por 4?", listOf("4", "5", "6"), "B", "Médio", 15)
    )
}
