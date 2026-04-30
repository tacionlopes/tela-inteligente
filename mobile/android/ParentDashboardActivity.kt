package com.desbloqueiointeligente

import android.app.Activity
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView

class ParentDashboardActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        render()
    }

    private fun render() {
        val results = ResultRepository.listResults()
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 64, 40, 40)
        }

        layout.addView(TextView(this).apply {
            text = "Resultados recebidos"
            textSize = 28f
        })

        if (results.isEmpty()) {
            layout.addView(TextView(this).apply {
                text = "Nenhuma rodada respondida ainda."
                textSize = 16f
            })
        } else {
            results.forEach { result ->
                layout.addView(TextView(this).apply {
                    text = "${result.score}/10 • ${result.correctAnswers}/${result.totalQuestions} corretas"
                    textSize = 18f
                })
            }
        }

        setContentView(layout)
    }
}
