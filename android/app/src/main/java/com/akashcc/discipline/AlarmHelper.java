package com.akashcc.discipline;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import java.util.Calendar;
import java.util.TimeZone;

public class AlarmHelper {
    public static final String PREFS_NAME = "discipline_alarms_prefs";
    public static final String KEY_MORNING_HOUR = "morning_hour";
    public static final String KEY_MORNING_MIN = "morning_min";
    public static final String KEY_MORNING_ENABLED = "morning_enabled";
    public static final String KEY_NIGHT_HOUR = "night_hour";
    public static final String KEY_NIGHT_MIN = "night_min";
    public static final String KEY_NIGHT_ENABLED = "night_enabled";

    public static final int REQ_CODE_MORNING = 101;
    public static final int REQ_CODE_NIGHT = 102;
    public static final int REQ_CODE_TEST = 103;

    public static void saveAndScheduleAlarms(Context context, int mHour, int mMin, boolean mEnabled, int nHour, int nMin, boolean nEnabled) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putInt(KEY_MORNING_HOUR, mHour)
            .putInt(KEY_MORNING_MIN, mMin)
            .putBoolean(KEY_MORNING_ENABLED, mEnabled)
            .putInt(KEY_NIGHT_HOUR, nHour)
            .putInt(KEY_NIGHT_MIN, nMin)
            .putBoolean(KEY_NIGHT_ENABLED, nEnabled)
            .apply();

        scheduleDailyAlarms(context);
    }

    public static void scheduleDailyAlarms(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        int mHour = prefs.getInt(KEY_MORNING_HOUR, 9);
        int mMin = prefs.getInt(KEY_MORNING_MIN, 0);
        boolean mEnabled = prefs.getBoolean(KEY_MORNING_ENABLED, true);

        int nHour = prefs.getInt(KEY_NIGHT_HOUR, 21);
        int nMin = prefs.getInt(KEY_NIGHT_MIN, 0);
        boolean nEnabled = prefs.getBoolean(KEY_NIGHT_ENABLED, true);

        if (mEnabled) {
            scheduleExact(context, am, mHour, mMin, REQ_CODE_MORNING, AlarmReceiver.TYPE_MORNING);
        } else {
            cancelAlarm(context, am, REQ_CODE_MORNING);
        }

        if (nEnabled) {
            scheduleExact(context, am, nHour, nMin, REQ_CODE_NIGHT, AlarmReceiver.TYPE_NIGHT);
        } else {
            cancelAlarm(context, am, REQ_CODE_NIGHT);
        }
    }

    private static void scheduleExact(Context context, AlarmManager am, int hour, int minute, int reqCode, String type) {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kolkata"));
        long now = System.currentTimeMillis();

        cal.set(Calendar.HOUR_OF_DAY, hour);
        cal.set(Calendar.MINUTE, minute);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);

        if (cal.getTimeInMillis() <= now) {
            cal.add(Calendar.DAY_OF_YEAR, 1);
        }

        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.setAction("com.akashcc.discipline.ACTION_ALARM");
        intent.putExtra(AlarmReceiver.EXTRA_TYPE, type);

        PendingIntent pi = PendingIntent.getBroadcast(
            context,
            reqCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
        }
    }

    private static void cancelAlarm(Context context, AlarmManager am, int reqCode) {
        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.setAction("com.akashcc.discipline.ACTION_ALARM");
        PendingIntent pi = PendingIntent.getBroadcast(
            context,
            reqCode,
            intent,
            PendingIntent.FLAG_NO_CREATE | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );
        if (pi != null) {
            am.cancel(pi);
            pi.cancel();
        }
    }

    public static void triggerTestAlarm(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.setAction("com.akashcc.discipline.ACTION_ALARM");
        intent.putExtra(AlarmReceiver.EXTRA_TYPE, AlarmReceiver.TYPE_TEST);

        PendingIntent pi = PendingIntent.getBroadcast(
            context,
            REQ_CODE_TEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        long triggerAt = System.currentTimeMillis() + 1500;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        }
    }
}
