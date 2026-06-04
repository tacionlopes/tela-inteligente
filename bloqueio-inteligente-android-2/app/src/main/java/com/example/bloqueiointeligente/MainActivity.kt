package com.example.bloqueiointeligente

import android.app.Activity
import android.app.AlarmManager
import android.app.PendingIntent
import android.app.admin.DevicePolicyManager
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.result.contract.ActivityResultContracts

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private var pageReady = false
    private var pendingForceResume = false
    private var testModeActive = false
    private var unlockedUntilMs = 0L
    private var appInForeground = false
    private var overlayPermissionRequested = false
    private var accessibilityPermissionRequested = false
    private var accessibilityPromptedOnce = false
    private var overlaySuppressedUntilMs = 0L
    private var lockTaskEngaged = false
    private var lastRecoveryAttemptAt = 0L
    private val overlayShowRunnable =
        Runnable {
            updateOverlayState()
        }
    private val immersiveRefreshRunnable =
        Runnable {
            if (appInForeground && isLockEnforced()) {
                applyImmersiveMode()
                scheduleImmersiveRefresh()
            }
        }
    private val fileChooserLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val callback = filePathCallback
            if (callback == null) {
                return@registerForActivityResult
            }

            val uris =
                if (result.resultCode == Activity.RESULT_OK) {
                    val data = result.data
                    when {
                        data?.clipData != null -> {
                            Array(data.clipData!!.itemCount) { index ->
                                data.clipData!!.getItemAt(index).uri
                            }
                        }
                        data?.data != null -> arrayOf(data.data!!)
                        else -> emptyArray()
                    }
                } else {
                    emptyArray()
                }

            callback.onReceiveValue(uris)
            filePathCallback = null
        }

    private val overlayPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
            overlayPermissionRequested = false
            updateOverlayState()
        }
    private val accessibilitySettingsLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
            accessibilityPermissionRequested = false
            updateOverlayState()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (!hasRequiredProtectionSetup()) {
            openPermissionSetup()
            return
        }
        loadPersistedNativeState()
        pendingForceResume = intent?.getBooleanExtra(EXTRA_FORCE_RESUME_TEST, false) == true

        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (isLockEnforced()) {
                        return
                    }

                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                    isEnabled = true
                }
            },
        )

        webView = WebView(this)
        setContentView(webView)
        configureWebView()
        configureWindowLockMode()
        applyImmersiveMode()
        pageReady = false
        webView.clearCache(true)
        webView.clearHistory()
        webView.loadUrl(APP_URL)
    }

    override fun onResume() {
        super.onResume()
        if (!hasRequiredProtectionSetup()) {
            openPermissionSetup()
            return
        }
        appInForeground = true
        applyImmersiveMode()
        scheduleImmersiveRefresh()
        updateLockTaskState()
        updateOverlayState()
        ensureTestResumedIfNeeded()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        loadPersistedNativeState()
        if (intent?.getBooleanExtra(EXTRA_FORCE_RESUME_TEST, false) == true) {
            pendingForceResume = true
        }
        if (pageReady) {
            ensureTestResumedIfNeeded()
        }
    }

    override fun onPause() {
        super.onPause()
        appInForeground = false
        mainHandler.removeCallbacks(immersiveRefreshRunnable)
        if (isLockEnforced()) {
            forceReturnToLockedTest()
        } else {
            updateLockTaskState()
        }
        updateOverlayState()
    }

    override fun onStop() {
        super.onStop()
        if (isLockEnforced()) {
            forceReturnToLockedTest()
        }
    }

    override fun onUserLeaveHint() {
        super.onUserLeaveHint()
        if (isLockEnforced()) {
            appInForeground = false
            forceReturnToLockedTest()
            updateOverlayState()
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            applyImmersiveMode()
            scheduleImmersiveRefresh()
            updateLockTaskState()
        }
    }

    override fun onMultiWindowModeChanged(isInMultiWindowMode: Boolean) {
        super.onMultiWindowModeChanged(isInMultiWindowMode)
        if (isInMultiWindowMode && isLockEnforced()) {
            forceReturnToLockedTest()
        }
    }

    override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode)
        if (isInPictureInPictureMode && isLockEnforced()) {
            forceReturnToLockedTest()
        }
    }

    override fun onDestroy() {
        mainHandler.removeCallbacks(overlayShowRunnable)
        mainHandler.removeCallbacks(immersiveRefreshRunnable)
        mainHandler.removeCallbacks(forceReturnRunnable)
        releaseLockTask()
        hideOverlay()
        if (::webView.isInitialized) {
            webView.destroy()
        }
        super.onDestroy()
    }

    private fun configureWindowLockMode() {
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        @Suppress("DEPRECATION")
        window.statusBarColor = Color.BLACK
        @Suppress("DEPRECATION")
        window.navigationBarColor = Color.BLACK
        @Suppress("DEPRECATION")
        window.decorView.setOnSystemUiVisibilityChangeListener {
            if (isLockEnforced()) {
                mainHandler.postDelayed({ applyImmersiveMode() }, 120L)
            }
        }
    }

    private fun configureWebView() {
        webView.setBackgroundColor(Color.WHITE)
        webView.addJavascriptInterface(SmartUnlockNativeBridge(), "SmartUnlockNative")
        webView.webViewClient =
            object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    pageReady = true
                    view?.evaluateJavascript(
                        """
                        (function () {
                          if (window.__smartUnlockSendNativeConfig) {
                            window.__smartUnlockSendNativeConfig();
                          } else if (window.SmartUnlockNative && typeof window.SmartUnlockNative.syncTestState === "function") {
                            var active = localStorage.getItem("smartUnlockTestActive") === "true";
                            var unlockedUntil = String(Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0"));
                            window.SmartUnlockNative.syncTestState(active, unlockedUntil);
                          }
                        })();
                        """.trimIndent(),
                        null
                    )
                    ensureTestResumedIfNeeded()
                }
            }
        webView.webChromeClient =
            object : WebChromeClient() {
                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = filePathCallback

                    val contentSelectionIntent =
                        Intent(Intent.ACTION_GET_CONTENT).apply {
                            addCategory(Intent.CATEGORY_OPENABLE)
                            type = "*/*"
                            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                            putExtra(
                                Intent.EXTRA_MIME_TYPES,
                                arrayOf("text/csv", "application/csv", "application/vnd.ms-excel", "text/comma-separated-values")
                            )
                        }

                    val chooserIntent =
                        Intent(Intent.ACTION_CHOOSER).apply {
                            putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
                            putExtra(Intent.EXTRA_TITLE, "Selecionar arquivos CSV")
                        }

                    fileChooserLauncher.launch(chooserIntent)
                    return true
                }
            }
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
            loadWithOverviewMode = true
            useWideViewPort = true
            cacheMode = WebSettings.LOAD_NO_CACHE
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            mediaPlaybackRequiresUserGesture = false
        }
    }

    private fun updateOverlayState() {
        mainHandler.removeCallbacks(overlayShowRunnable)

        if (!testModeActive) {
            cancelReturnAlarm()
            hideOverlay()
            return
        }

        requestAccessibilityPermissionIfNeeded()

        val now = System.currentTimeMillis()
        if (overlaySuppressedUntilMs > now) {
            hideOverlay()
            return
        }
        if (unlockedUntilMs > now) {
            scheduleReturnAlarm(unlockedUntilMs)
            hideOverlay()
            if (!appInForeground) {
                mainHandler.postDelayed(overlayShowRunnable, unlockedUntilMs - now)
            }
            return
        }

        cancelReturnAlarm()

        if (!Settings.canDrawOverlays(this)) {
            hideOverlay()
            requestOverlayPermissionIfNeeded()
            return
        }

        if (appInForeground) {
            hideOverlay()
            return
        }

        showOverlay()
    }

    private fun ensureTestResumedIfNeeded() {
        if (!pageReady) {
            return
        }
        val shouldResume = pendingForceResume || (testModeActive && unlockedUntilMs <= System.currentTimeMillis())
        if (!shouldResume) {
            return
        }
        pendingForceResume = false
        webView.evaluateJavascript(
            """
            (function () {
              localStorage.setItem("smartUnlockForceResumeTest", "true");
              localStorage.setItem("smartUnlockTestActive", "true");
              localStorage.setItem("smartUnlockUnlockedUntil", "0");
              if (typeof window.startOverlayRound === "function") {
                window.startOverlayRound();
              }
            })();
            """.trimIndent(),
            null
        )
        updateLockTaskState()
    }

    private fun buildReturnAlarmIntent(): PendingIntent {
        val intent =
            Intent(this, ReturnToTestReceiver::class.java).apply {
                action = ReturnToTestReceiver.ACTION_RETURN_TO_TEST
            }
        return PendingIntent.getBroadcast(
            this,
            2001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun scheduleReturnAlarm(triggerAtMillis: Long) {
        val alarmManager = getSystemService(ALARM_SERVICE) as AlarmManager
        val pendingIntent = buildReturnAlarmIntent()
        try {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                pendingIntent
            )
        } catch (_: SecurityException) {
            alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                pendingIntent
            )
        }
    }

    private fun cancelReturnAlarm() {
        val alarmManager = getSystemService(ALARM_SERVICE) as AlarmManager
        alarmManager.cancel(buildReturnAlarmIntent())
    }

    private fun loadPersistedNativeState() {
        val prefs = getSharedPreferences(NATIVE_STATE_PREFS, MODE_PRIVATE)
        testModeActive = prefs.getBoolean(KEY_TEST_ACTIVE, false)
        unlockedUntilMs = prefs.getLong(KEY_UNLOCKED_UNTIL, 0L)
        accessibilityPromptedOnce = prefs.getBoolean(KEY_ACCESSIBILITY_PROMPTED, false)
        overlaySuppressedUntilMs = prefs.getLong(KEY_OVERLAY_SUPPRESSED_UNTIL, 0L)
    }

    private fun persistNativeState() {
        getSharedPreferences(NATIVE_STATE_PREFS, MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_TEST_ACTIVE, testModeActive)
            .putLong(KEY_UNLOCKED_UNTIL, unlockedUntilMs)
            .putBoolean(KEY_ACCESSIBILITY_PROMPTED, accessibilityPromptedOnce)
            .putLong(KEY_OVERLAY_SUPPRESSED_UNTIL, overlaySuppressedUntilMs)
            .apply()
    }

    private fun suppressOverlayFor(milliseconds: Long) {
        overlaySuppressedUntilMs = System.currentTimeMillis() + milliseconds
        persistNativeState()
    }

    private fun isLockEnforced(): Boolean = testModeActive && unlockedUntilMs <= System.currentTimeMillis()

    private fun updateLockTaskState() {
        if (isLockEnforced() && appInForeground) {
            engageLockTask()
            return
        }
        releaseLockTask()
    }

    private fun engageLockTask() {
        if (lockTaskEngaged) return
        if (!isSilentLockTaskSupported()) return
        try {
            startLockTask()
            lockTaskEngaged = true
        } catch (_: IllegalArgumentException) {
            lockTaskEngaged = false
        } catch (_: SecurityException) {
            lockTaskEngaged = false
        }
    }

    private fun releaseLockTask() {
        if (!lockTaskEngaged) return
        try {
            stopLockTask()
        } catch (_: IllegalArgumentException) {
        } catch (_: SecurityException) {
        } finally {
            lockTaskEngaged = false
        }
    }

    private fun isSilentLockTaskSupported(): Boolean {
        val devicePolicyManager = getSystemService(DevicePolicyManager::class.java) ?: return false
        return try {
            devicePolicyManager.isLockTaskPermitted(packageName)
        } catch (_: SecurityException) {
            false
        }
    }

    private fun hasRequiredProtectionSetup(): Boolean =
        Settings.canDrawOverlays(this) &&
            TestLockAccessibilityService.isEnabled(this) &&
            SmartUnlockDeviceAdminReceiver.isActive(this)

    private fun openPermissionSetup() {
        startActivity(
            Intent(this, PermissionSetupActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            }
        )
        finish()
    }

    private fun forceReturnToLockedTest() {
        if (!isLockEnforced()) return
        val now = System.currentTimeMillis()
        if (now - lastRecoveryAttemptAt < 1200L) return
        lastRecoveryAttemptAt = now
        if (!appInForeground) {
            showOverlay()
        }
        mainHandler.removeCallbacks(forceReturnRunnable)
        mainHandler.postDelayed(forceReturnRunnable, 40L)
    }

    private val forceReturnRunnable =
        Runnable {
            if (!isLockEnforced()) return@Runnable
            val launchIntent =
                Intent(this, MainActivity::class.java).apply {
                    putExtra(EXTRA_FORCE_RESUME_TEST, true)
                    addFlags(
                        Intent.FLAG_ACTIVITY_NEW_TASK or
                            Intent.FLAG_ACTIVITY_SINGLE_TOP or
                            Intent.FLAG_ACTIVITY_CLEAR_TOP or
                            Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                    )
                }
            startActivity(launchIntent)
            applyImmersiveMode()
            updateLockTaskState()
        }

    private fun scheduleImmersiveRefresh() {
        mainHandler.removeCallbacks(immersiveRefreshRunnable)
        if (appInForeground && isLockEnforced()) {
            mainHandler.postDelayed(immersiveRefreshRunnable, 800L)
        }
    }

    private fun applyImmersiveMode() {
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility =
            (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            )
    }

    private fun requestOverlayPermissionIfNeeded() {
        if (!testModeActive || !appInForeground || overlayPermissionRequested || Settings.canDrawOverlays(this)) {
            return
        }

        overlayPermissionRequested = true
        val intent =
            Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName"),
            )
        overlayPermissionLauncher.launch(intent)
    }

    private fun requestAccessibilityPermissionIfNeeded() {
        if (
            !testModeActive ||
            !appInForeground ||
            accessibilityPermissionRequested ||
            accessibilityPromptedOnce ||
            TestLockAccessibilityService.isEnabled(this)
        ) {
            return
        }

        accessibilityPermissionRequested = true
        accessibilityPromptedOnce = true
        persistNativeState()
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        accessibilitySettingsLauncher.launch(intent)
    }

    private fun showOverlay() {
        val intent = Intent(this, OverlayService::class.java).apply { action = OverlayService.ACTION_SHOW }
        startService(intent)
    }

    private fun hideOverlay() {
        val intent = Intent(this, OverlayService::class.java).apply { action = OverlayService.ACTION_HIDE }
        startService(intent)
    }

    private inner class SmartUnlockNativeBridge {
        @JavascriptInterface
        fun syncTestState(active: Boolean, unlockedUntil: String?) {
            runOnUiThread {
                testModeActive = active
                unlockedUntilMs = unlockedUntil?.toLongOrNull() ?: 0L
                persistNativeState()
                applyImmersiveMode()
                scheduleImmersiveRefresh()
                updateLockTaskState()
                updateOverlayState()
            }
        }

        @JavascriptInterface
        fun useUnlockedNow() {
            runOnUiThread {
                webView.evaluateJavascript(
                    """
                    (function () {
                      return String(Number(localStorage.getItem("smartUnlockUnlockedUntil") || "0"));
                    })();
                    """.trimIndent(),
                ) { unlockedUntilValue ->
                    unlockedUntilMs =
                        unlockedUntilValue
                            ?.replace("\"", "")
                            ?.toLongOrNull() ?: unlockedUntilMs
                    suppressOverlayFor(5000)
                    persistNativeState()
                    releaseLockTask()
                    appInForeground = false
                    hideOverlay()
                    updateOverlayState()
                    moveTaskToBack(true)
                }
            }
        }
    }

    companion object {
        private const val APP_URL = "file:///android_asset/index.html"
        private const val EXTRA_FORCE_RESUME_TEST = "force_resume_test"
        private const val NATIVE_STATE_PREFS = "smart_unlock_native_state"
        private const val KEY_TEST_ACTIVE = "test_active"
        private const val KEY_UNLOCKED_UNTIL = "unlocked_until"
        private const val KEY_ACCESSIBILITY_PROMPTED = "accessibility_prompted"
        private const val KEY_OVERLAY_SUPPRESSED_UNTIL = "overlay_suppressed_until"
    }
}
