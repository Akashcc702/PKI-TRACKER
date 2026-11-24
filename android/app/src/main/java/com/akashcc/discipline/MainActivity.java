package com.akashcc.discipline;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import java.util.Calendar;
import java.util.TimeZone;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private static final int NOTIF_REQ_CODE = 1001;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Apply seamless dark status bar & navigation bar
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        int darkColor = Color.parseColor("#0A0B12");
        window.setStatusBarColor(darkColor);
        window.setNavigationBarColor(darkColor);

        // Request notification permission on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIF_REQ_CODE);
            }
        }

        // Initialize alarms & record app opened
        AlarmHelper.recordAppOpened(this);
        AlarmHelper.scheduleDailyAlarms(this);

        // Initialize WebView
        webView = new WebView(this);
        webView.setBackgroundColor(darkColor);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setLoadsImagesAutomatically(true);

        // Crucial for proper mobile screen viewport adjustment
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // Hardware acceleration hints
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // Add Native JavaScript Bridge
        webView.addJavascriptInterface(new AndroidBridge(this), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient());

        // Load local bundled web application (0ms 100% offline launch)
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Rule: Opening app stops any active ringing alarm immediately!
        AlarmSoundService.stopAlarm(this);
        AlarmHelper.recordAppOpened(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        checkAndScheduleNightExitSnooze();
    }

    private void checkAndScheduleNightExitSnooze() {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kolkata"));
        int hour = cal.get(Calendar.HOUR_OF_DAY);

        // If user exits after 9:00 PM and habits are not complete, schedule 5-minute snooze alarm!
        if (hour >= 21) {
            if (AlarmHelper.shouldTriggerNightAlarm(this)) {
                AlarmHelper.scheduleSnoozeAlarm(this, 5 * 60 * 1000L); // 5 minutes
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null) {
            webView.evaluateJavascript(
                "(function() {" +
                "  const sb = document.getElementById('sidebar');" +
                "  if (sb && sb.classList.contains('open')) { toggleSidebar(); return 'closed_sidebar'; }" +
                "  const modals = ['report-modal', 'share-modal', 'note-modal', 'calendar-modal', 'slot-modal'];" +
                "  for (const m of modals) {" +
                "    const el = document.getElementById(m);" +
                "    if (el && (el.classList.contains('show') || el.classList.contains('active'))) {" +
                "      el.classList.remove('show'); el.classList.remove('active'); return 'closed_modal';" +
                "    }" +
                "  }" +
                "  return 'none';" +
                "})()",
                value -> {
                    if (value == null || "\"none\"".equals(value) || "null".equals(value)) {
                        if (webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            super.onBackPressed();
                        }
                    }
                }
            );
        } else {
            super.onBackPressed();
        }
    }

    public class AndroidBridge {
        private final Context context;

        public AndroidBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }

        @JavascriptInterface
        public void vibrate(int durationMs) {
            Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(Math.min(durationMs, 500), VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(Math.min(durationMs, 500));
                }
            }
        }

        @JavascriptInterface
        public void toast(String message) {
            runOnUiThread(() -> Toast.makeText(context, message, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void recordAppOpened() {
            AlarmHelper.recordAppOpened(context);
        }

        @JavascriptInterface
        public void stopActiveAlarm() {
            AlarmSoundService.stopAlarm(context);
        }

        @JavascriptInterface
        public void updateHabitsCompletionStatus(boolean allCompleted, int unfilledCount) {
            AlarmHelper.updateHabitsCompletionStatus(context, allCompleted, unfilledCount);
        }

        @JavascriptInterface
        public void testRingAlarm(String soundType) {
            AlarmHelper.triggerTestAlarm(context, soundType);
            toast("⏰ Test Alarm triggered! Ringing in 1 second...");
        }

        @JavascriptInterface
        public void configureAlarms(int morningHour, int morningMin, boolean morningEnabled, int nightHour, int nightMin, boolean nightEnabled, String soundType) {
            AlarmHelper.saveAndScheduleAlarms(context, morningHour, morningMin, morningEnabled, nightHour, nightMin, nightEnabled, soundType);
            toast("✅ Alarm schedule & sound type saved!");
        }

        @JavascriptInterface
        public void scheduleTimeTableReminders(String slotsJson) {
            AlarmHelper.scheduleTimeTableReminders(context, slotsJson);
            toast("📅 Time Table reminders scheduled!");
        }
    }
}
