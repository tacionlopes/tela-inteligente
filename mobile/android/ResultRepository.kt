package com.desbloqueiointeligente

data class RoundResult(
    val score: Int,
    val correctAnswers: Int,
    val totalQuestions: Int,
    val createdAtMillis: Long = System.currentTimeMillis()
)

object ResultRepository {
    private val results = mutableListOf<RoundResult>()

    fun saveRound(score: Int, correctAnswers: Int, totalQuestions: Int) {
        results.add(0, RoundResult(score, correctAnswers, totalQuestions))
    }

    fun listResults(): List<RoundResult> = results.toList()
}
