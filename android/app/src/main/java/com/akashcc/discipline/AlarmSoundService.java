package com.akashcc.discipline;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.media.ToneGenerator;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.tts.TextToSpeech;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import java.util.Locale;

public class AlarmSoundService extends Service implements TextToSpeech.OnInitListener {
    public static final String CHANNEL_ID = "daily_discipline_alarm_channel";
    public static final String ACTION_START_ALARM = "com.akashcc.discipline.ACTION_START_ALARM";
    public static final String ACTION_STOP_ALARM = "com.akashcc.discipline.ACTION_STOP_ALARM";

    public static final String EXTRA_ALARM_TYPE = "alarm_type";
    public static final String EXTRA_ALARM_TITLE = "alarm_title";
    public static final String EXTRA_ALARM_MESSAGE = "alarm_message";
    public static final String EXTRA_SOUND_TYPE = "sound_type";

    private static boolean isRinging = false;
    private Ringtone ringtone;
    private Vibrator vibrator;
    private ToneGenerator toneGenerator;
    private TextToSpeech tts;
    private PowerManager.WakeLock wakeLock;
    private boolean ttsReady = false;
    private String ttsMessage = null;
    private Thread soundLoopThread;
    private volatile boolean shouldRunSoundLoop = false;

    public static boolean isAlarmActive() {
        return isRinging;
    }

    public static void startAlarm(Context context, String alarmType, String title, String message, String soundType) {
        Intent intent = new Intent(context, AlarmSoundService.class);
        intent.setAction(ACTION_START_ALARM);
        intent.putExtra(EXTRA_ALARM_TYPE, alarmType);
        intent.putExtra(EXTRA_ALARM_TITLE, title);
        intent.putExtra(EXTRA_ALARM_MESSAGE, message);
        intent.putExtra(EXTRA_SOUND_TYPE, soundType);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    public static void stopAlarm(Context context) {
        Intent intent = new Intent(context, AlarmSoundService.class);
        intent.setAction(ACTION_STOP_ALARM);
        context.startService(intent);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        tts = new TextToSpeech(this, this);

        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "discipline:alarm_service_wakelock");
            wakeLock.acquire(10 * 60 * 1000L); // 10 minutes max safety limit
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP_ALARM.equals(intent.getAction())) {
            stopSelfAndCleanup();
            return START_NOT_STICKY;
        }

        String type = (intent != null) ? intent.getStringExtra(EXTRA_ALARM_TYPE) : "morning";
        String title = (intent != null && intent.getStringExtra(EXTRA_ALARM_TITLE) != null) 
            ? intent.getStringExtra(EXTRA_ALARM_TITLE) 
            : "🔥 Daily Discipline Alert";
        String message = (intent != null && intent.getStringExtra(EXTRA_ALARM_MESSAGE) != null)
            ? intent.getStringExtra(EXTRA_ALARM_MESSAGE)
            : "Open the app to complete your daily discipline habits!";
        String soundType = (intent != null && intent.getStringExtra(EXTRA_SOUND_TYPE) != null)
            ? intent.getStringExtra(EXTRA_SOUND_TYPE)
            : "system_alarm";

        isRinging = true;
        startForegroundAlarm(type, title, message, soundType);

        return START_STICKY;
    }

    private void startForegroundAlarm(String type, String title, String message, String soundType) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        createNotificationChannel(nm);

        // Intent to open app and stop alarm
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setAction(ACTION_STOP_ALARM);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent openPendingIntent = PendingIntent.getActivity(
            this,
            2001,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        // Stop Action button on notification
        Intent dismissIntent = new Intent(this, AlarmReceiver.class);
        dismissIntent.setAction("com.akashcc.discipline.ACTION_DISMISS_ALARM");
        PendingIntent dismissPendingIntent = PendingIntent.getBroadcast(
            this,
            2002,
            dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(message + "\n\n👉 Tap here to Open App & Turn Alarm OFF."))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setOngoing(true)
            .setAutoCancel(true)
            .setContentIntent(openPendingIntent)
            .setFullScreenIntent(openPendingIntent, true)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop Alarm", dismissPendingIntent)
            .addAction(android.R.drawable.ic_menu_view, "Open App", openPendingIntent);

        Notification notification = builder.build();
        startForeground(1001, notification);

        // Start repeating sound and vibration
        startContinuousAudioAndVibration(soundType, message);
    }

    private void createNotificationChannel(NotificationManager nm) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Daily Discipline Alarms & Reminders",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("High priority sound & vibration alarm channel");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 600, 300, 600, 300, 600});
            nm.createNotificationChannel(channel);
        }
    }

    private void startContinuousAudioAndVibration(String soundType, String spokenText) {
        // Continuous Vibration Pattern
        if (vibrator != null) {
            long[] pattern = new long[]{0, 800, 400, 800, 400, 800, 1000};
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0)); // 0 = repeat from index 0
            } else {
                vibrator.vibrate(pattern, 0);
            }
        }

        ttsMessage = spokenText;
        shouldRunSoundLoop = true;

        soundLoopThread = new Thread(() -> {
            try {
                if ("voice_alert".equals(soundType)) {
                    // Voice Alert mode: Speaks motivating reminder periodically
                    while (shouldRunSoundLoop) {
                        speakVoiceReminder();
                        Thread.sleep(4000);
                        playBeepTone();
                        Thread.sleep(2000);
                    }
                } else if ("digital_beep".equals(soundType) || "siren".equals(soundType)) {
                    // Digital beep / Siren tone
                    while (shouldRunSoundLoop) {
                        playTonePattern(soundType);
                        Thread.sleep(1200);
                    }
                } else {
                    // System loud alarm ringtone
                    Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
                    if (alarmUri == null) {
                        alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                    }
                    if (alarmUri != null) {
                        ringtone = RingtoneManager.getRingtone(getApplicationContext(), alarmUri);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                            ringtone.setLooping(true);
                        }
                        ringtone.play();
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        soundLoopThread.start();
    }

    private void playTonePattern(String soundType) {
        try {
            if (toneGenerator == null) {
                toneGenerator = new ToneGenerator(AudioManager.STREAM_ALARM, 100);
            }
            if ("siren".equals(soundType)) {
                toneGenerator.startTone(ToneGenerator.TONE_CDMA_EMERGENCY_RINGBACK, 700);
            } else {
                toneGenerator.startTone(ToneGenerator.TONE_PROP_BEEP2, 500);
            }
        } catch (Exception ignored) {}
    }

    private void playBeepTone() {
        try {
            if (toneGenerator == null) {
                toneGenerator = new ToneGenerator(AudioManager.STREAM_ALARM, 100);
            }
            toneGenerator.startTone(ToneGenerator.TONE_PROP_ACK, 300);
        } catch (Exception ignored) {}
    }

    private void speakVoiceReminder() {
        if (tts != null && ttsReady && ttsMessage != null) {
            String spoken = "Attention! Daily discipline reminder. Open your tracker and complete today's habits!";
            tts.speak(spoken, TextToSpeech.QUEUE_FLUSH, null, "alarm_tts");
        }
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && tts != null) {
            tts.setLanguage(Locale.US);
            tts.setPitch(1.0f);
            tts.setSpeechRate(0.95f);
            ttsReady = true;
        }
    }

    private void stopSelfAndCleanup() {
        isRinging = false;
        shouldRunSoundLoop = false;

        if (ringtone != null && ringtone.isPlaying()) {
            ringtone.stop();
            ringtone = null;
        }

        if (vibrator != null) {
            vibrator.cancel();
        }

        if (toneGenerator != null) {
            toneGenerator.release();
            toneGenerator = null;
        }

        if (tts != null) {
            tts.stop();
            tts.shutdown();
            tts = null;
        }

        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
        }

        stopForeground(true);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        stopSelfAndCleanup();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
