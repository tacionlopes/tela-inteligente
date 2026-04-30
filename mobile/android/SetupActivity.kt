package com.desbloqueiointeligente

import android.content.Intent
import android.net.Uri
import android.app.Activity
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class SetupActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 64, 40, 40)
        }

        val title = TextView(this).apply {
            text = "Desbloqueio Inteligente"
            textSize = 28f
        }

        val description = TextView(this).apply {
            text = "Ative a permissão de sobreposição para mostrar as perguntas educativas antes do uso."
            textSize = 16f
        }

        val permissionButton = Button(this).apply {
            text = "Permitir cobertura"
            setOnClickListener { openOverlaySettings() }
        }

        val startButton = Button(this).apply {
            text = "Iniciar rodada"
            setOnClickListener {
                startService(Intent(this@SetupActivity, EducationOverlayService::class.java))
            }
        }

        val dashboardButton = Button(this).apply {
            text = "Painel do responsável"
            setOnClickListener {
                startActivity(Intent(this@SetupActivity, ParentDashboardActivity::class.java))
            }
        }

        layout.addView(title)
        layout.addView(description)
        layout.addView(permissionButton)
        layout.addView(startButton)
        layout.addView(dashboardButton)
        setContentView(layout)
    }

    private fun openOverlaySettings() {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:$packageName")
        )
        startActivity(intent)
    }
}
