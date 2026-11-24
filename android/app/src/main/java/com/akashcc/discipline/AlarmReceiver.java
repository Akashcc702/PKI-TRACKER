package com.akashcc.discipline;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    public static final String CHANNEL_ID = "discipline_alarm_channel";
    public static final String EXTRA_TYPE = "alarm_type";
    public static final String TYPE_MORNING = "morning";
    public static final String TYPE_NIGHT = "night";
    public static final String TYPE_TEST = "test";

    @Override
    public void onReceive(Context context, Intent intent) {
        String type = intent.getStringExtra(EXTRA_TYPE);
        if (type == null) type = TYPE_MORNING;

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = null;
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "discipline:alarm_wakelock");
            wakeLock.acquire(10000); // 10 seconds max
        }

        try {
            showNotificationAndRing(context, type);
        } finally {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        }

        // Reschedule next daily recurring alarm
        if (!TYPE_TEST.equals(type)) {
            AlarmHelper.scheduleDailyAlarms(context);
        }
    }

    private void showNotificationAndRing(Context context, String type) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
        if (alarmSound == null) {
            alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Daily Discipline Alarms",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Ringing alarm & notifications for habit discipline");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 500});

            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build();
            channel.setSound(alarmSound, audioAttributes);
            nm.createNotificationChannel(channel);
        }

        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            (int) System.currentTimeMillis(),
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        String title = "🔥 Daily Discipline Tracker";
        String message;

        if (TYPE_MORNING.equals(type)) {
            title = "🌅 Good Morning! Time for Discipline";
            message = "ಇಂದಿನ ನಿಮ್ಮ ಗುರಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ & ಹ್ಯಾಬಿಟ್ ಟ್ರ್ಯಾಕರ್ ಓಪನ್ ಮಾಡಿ!";
        } else if (TYPE_NIGHT.equals(type)) {
            title = "🌙 Night Check-In: Fill Today's Habits";
            message = "ನಿಮ್ಮ streak ಉಳಿಸಲು ಇಂದಿನ ಎಲ್ಲಾ ಹ್ಯಾಬಿಟ್‌ಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ (Done / Not Done)!";
        } else {
            title = "🔔 Daily Discipline — Test Alarm";
            message = "✅ Ring Alarm and Notifications are working perfectly!";
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setSound(alarmSound)
            .setVibrate(new long[]{0, 500, 200, 500, 200, 500})
            .setContentIntent(pendingIntent);

        nm.notify((int) System.currentTimeMillis(), builder.build());

        // Play native ringtone directly
        try {
            Ringtone r = RingtoneManager.getRingtone(context, alarmSound);
            if (r != null) {
                r.play();
            }
        } catch (Exception ignored) {}
    }
}