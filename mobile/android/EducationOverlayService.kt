package com.desbloqueiointeligente

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.LayoutInflater
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView

class EducationOverlayService : Service() {
    private lateinit var windowManager: WindowManager
    private var overlayView: android.view.View? = null
    private var currentQuestionIndex = 0
    private var correctAnswers = 0
    private val questions = QuestionRepository.defaultQuestions.take(5)

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        if (Settings.canDrawOverlays(this)) {
            showEducationOverlay()
        }
    }

    private fun showEducationOverlay() {
        overlayView = LayoutInflater.from(this).inflate(R.layout.education_overlay, null)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
        }

        windowManager.addView(overlayView, params)
        renderQuestion()
    }

    private fun renderQuestion() {
        val question = questions[currentQuestionIndex]
        overlayView?.findViewById<TextView>(R.id.questionCounter)?.text =
            "Questão ${currentQuestionIndex + 1} de 5"
        overlayView?.findViewById<TextView>(R.id.questionText)?.text = question.text
        bindAnswer(R.id.answerA, "A", question)
        bindAnswer(R.id.answerB, "B", question)
        bindAnswer(R.id.answerC, "C", question)
    }

    private fun bindAnswer(buttonId: Int, letter: String, question: EducationQuestion) {
        val button = overlayView?.findViewById<Button>(buttonId) ?: return
        val index = letter.first() - 'A'
        button.text = "$letter. ${question.alternatives[index]}"
        button.setOnClickListener {
            if (letter == question.correctAnswer) correctAnswers += 1
            goToNextStep()
        }
    }

    private fun goToNextStep() {
        if (currentQuestionIndex < questions.lastIndex) {
            currentQuestionIndex += 1
            renderQuestion()
            return
        }

        val score = (correctAnswers * 10) / questions.size
        ResultRepository.saveRound(score, correctAnswers, questions.size)

        if (correctAnswers == questions.size) {
            removeOverlay()
        } else {
            currentQuestionIndex = 0
            correctAnswers = 0
            renderQuestion()
        }
    }

    private fun removeOverlay() {
        overlayView?.let { windowManager.removeView(it) }
        overlayView = null
        stopSelf()
    }

    override fun onDestroy() {
        removeOverlay()
        super.onDestroy()
    }
}
