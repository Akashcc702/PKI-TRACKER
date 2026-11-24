package com.akashcc.discipline;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    public static final String CHANNEL_ID = "daily_discipline_alarm_channel";
    public static final String TIMETABLE_CHANNEL_ID = "daily_discipline_timetable_channel";

    public static final String EXTRA_TYPE = "alarm_type";
    public static final String EXTRA_CUSTOM_SOUND = "custom_sound";
    public static final String EXTRA_TIMETABLE_TITLE = "timetable_title";
    public static final String EXTRA_TIMETABLE_TAG = "timetable_tag";
    public static final String EXTRA_TIMETABLE_TIME = "timetable_time";

    public static final String TYPE_MORNING = "morning";
    public static final String TYPE_NIGHT = "night";
    public static final String TYPE_SNOOZE_NIGHT = "snooze_night";
    public static final String TYPE_TIMETABLE = "timetable";
    public static final String TYPE_TEST = "test";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        // Dismiss action from notification button
        if ("com.akashcc.discipline.ACTION_DISMISS_ALARM".equals(intent.getAction())) {
            AlarmSoundService.stopAlarm(context);
            return;
        }

        String type = intent.getStringExtra(EXTRA_TYPE);
        if (type == null) type = TYPE_MORNING;

        String customSound = intent.getStringExtra(EXTRA_CUSTOM_SOUND);
        if (customSound == null || customSound.isEmpty()) {
            customSound = AlarmHelper.getAlarmSoundType(context);
        }

        if (TYPE_MORNING.equals(type)) {
            // Rule 1: Check if user already opened app before 9:00 AM today!
            if (!AlarmHelper.shouldTriggerMorningAlarm(context)) {
                // User opened app before 9 AM -> SKIP ALARM!
                AlarmHelper.scheduleDailyAlarms(context);
                return;
            }

            AlarmSoundService.startAlarm(
                context,
                TYPE_MORNING,
                "🌅 Morning Discipline Alarm",
                "ನೀವು ಇಂದಿನ ದಿನದ ಶಿಸ್ತನ್ನು ಪ್ರಾರಂಭಿಸಲು ಆ್ಯಪ್ ಓಪನ್ ಮಾಡಿಲ್ಲ! ಓಪನ್ ಮಾಡಿ ಅಲಾರಂ ಆಫ್ ಮಾಡಿ.",
                customSound
            );
            AlarmHelper.scheduleDailyAlarms(context);

        } else if (TYPE_NIGHT.equals(type)) {
            // Rule 2: Check if all habits for today are completed!
            if (!AlarmHelper.shouldTriggerNightAlarm(context)) {
                // All habits completed -> SKIP ALARM!
                AlarmHelper.scheduleDailyAlarms(context);
                return;
            }

            AlarmSoundService.startAlarm(
                context,
                TYPE_NIGHT,
                "🌙 Night Habit Check-In Alarm",
                "ಇಂದಿನ ನಿಮ್ಮ ಹ್ಯಾಬಿಟ್‌ಗಳು ಇನ್ನೂ ಪೂರ್ತಿ ಆಗಿಲ್ಲ! ನಿಮ್ಮ Streak ಉಳಿಸಲು ಈಗಲೇ ಭರ್ತಿ ಮಾಡಿ.",
                customSound
            );
            AlarmHelper.scheduleDailyAlarms(context);

        } else if (TYPE_SNOOZE_NIGHT.equals(type)) {
            // Rule 3: 5-minute exit snooze if habits are still unfilled!
            if (AlarmHelper.shouldTriggerNightAlarm(context)) {
                AlarmSoundService.startAlarm(
                    context,
                    TYPE_NIGHT,
                    "⏰ Reminder: Fill Today's Habits!",
                    "ನೀವು ಹ್ಯಾಬಿಟ್ ಭರ್ತಿ ಮಾಡದೆ ಆ್ಯಪ್ ಮುಚ್ಚಿದ್ದೀರಿ! ಕೇವಲ 1 ನಿಮಿಷದಲ್ಲಿ ಭರ್ತಿ ಮಾಡಿ.",
                    customSound
                );
            }

        } else if (TYPE_TIMETABLE.equals(type)) {
            // Time Table Slot Reminder Notification
            String title = intent.getStringExtra(EXTRA_TIMETABLE_TITLE);
            String tag = intent.getStringExtra(EXTRA_TIMETABLE_TAG);
            String time = intent.getStringExtra(EXTRA_TIMETABLE_TIME);
            showTimeTableNotification(context, title, tag, time);

        } else if (TYPE_TEST.equals(type)) {
            // Instant Test Alarm
            AlarmSoundService.startAlarm(
                context,
                TYPE_TEST,
                "🔔 Test Alarm & Notification",
                "✅ Sound and Notification are working continuously until you open or tap!",
                customSound
            );
        }
    }

    private void showTimeTableNotification(Context context, String title, String tag, String time) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                TIMETABLE_CHANNEL_ID,
                "Time Table Reminders",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Reminders for scheduled daily routine slots");
            channel.enableVibration(true);
            nm.createNotificationChannel(channel);
        }

        Intent openAppIntent = new Intent(context, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            (int) System.currentTimeMillis(),
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        String displayTag = (tag != null && !tag.isEmpty()) ? " [" + tag + "]" : "";
        String msg = "ಸಮಯ " + time + " ಆಗಿದೆ: " + title + displayTag;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, TIMETABLE_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle("📅 Time Table Alert: " + title)
            .setContentText(msg)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(msg))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);

        nm.notify((int) System.currentTimeMillis(), builder.build());
    }
}
