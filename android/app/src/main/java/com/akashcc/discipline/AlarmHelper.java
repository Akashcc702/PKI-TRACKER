package com.akashcc.discipline;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;
import org.json.JSONArray;
import org.json.JSONObject;

public class AlarmHelper {
    public static final String PREFS_NAME = "discipline_alarms_prefs";
    public static final String KEY_MORNING_HOUR = "morning_hour";
    public static final String KEY_MORNING_MIN = "morning_min";
    public static final String KEY_MORNING_ENABLED = "morning_enabled";
    public static final String KEY_NIGHT_HOUR = "night_hour";
    public static final String KEY_NIGHT_MIN = "night_min";
    public static final String KEY_NIGHT_ENABLED = "night_enabled";
    public static final String KEY_ALARM_SOUND_TYPE = "alarm_sound_type";

    public static final String KEY_LAST_OPENED_DATE = "last_opened_date";
    public static final String KEY_OPENED_BEFORE_9AM_DATE = "opened_before_9am_date";
    public static final String KEY_HABITS_COMPLETED_DATE = "habits_completed_date";
    public static final String KEY_TIMETABLE_JSON = "timetable_slots_json";

    public static final int REQ_CODE_MORNING = 101;
    public static final int REQ_CODE_NIGHT = 102;
    public static final int REQ_CODE_SNOOZE = 103;
    public static final int REQ_CODE_TEST = 104;
    public static final int REQ_CODE_TIMETABLE_BASE = 2000;

    private static String getTodayIsoDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));
        return sdf.format(new Date());
    }

    public static void recordAppOpened(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String today = getTodayIsoDate();

        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kolkata"));
        int currentHour = cal.get(Calendar.HOUR_OF_DAY);
        int mHour = prefs.getInt(KEY_MORNING_HOUR, 9);
        int mMin = prefs.getInt(KEY_MORNING_MIN, 0);

        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(KEY_LAST_OPENED_DATE, today);

        // If user opens before the morning alarm time (e.g. before 9:00 AM)
        if (currentHour < mHour || (currentHour == mHour && cal.get(Calendar.MINUTE) < mMin)) {
            editor.putString(KEY_OPENED_BEFORE_9AM_DATE, today);
        }
        editor.apply();
    }

    public static boolean shouldTriggerMorningAlarm(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String today = getTodayIsoDate();
        String openedBefore9am = prefs.getString(KEY_OPENED_BEFORE_9AM_DATE, "");

        // If user opened app before 9:00 AM today, do not ring!
        if (today.equals(openedBefore9am)) {
            return false;
        }
        return true;
    }

    public static void updateHabitsCompletionStatus(Context context, boolean allCompleted, int unfilledCount) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String today = getTodayIsoDate();

        SharedPreferences.Editor editor = prefs.edit();
        if (allCompleted) {
            editor.putString(KEY_HABITS_COMPLETED_DATE, today);
            // Cancel any active 5-minute snooze alarm
            cancelSnoozeAlarm(context);
        } else {
            if (today.equals(prefs.getString(KEY_HABITS_COMPLETED_DATE, ""))) {
                editor.remove(KEY_HABITS_COMPLETED_DATE);
            }
        }
        editor.apply();
    }

    public static boolean shouldTriggerNightAlarm(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String today = getTodayIsoDate();
        String completedDate = prefs.getString(KEY_HABITS_COMPLETED_DATE, "");

        // If all habits are completed for today before 9:00 PM, do not ring!
        if (today.equals(completedDate)) {
            return false;
        }
        return true;
    }

    public static void saveAndScheduleAlarms(Context context, int mHour, int mMin, boolean mEnabled, int nHour, int nMin, boolean nEnabled, String soundType) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putInt(KEY_MORNING_HOUR, mHour)
            .putInt(KEY_MORNING_MIN, mMin)
            .putBoolean(KEY_MORNING_ENABLED, mEnabled)
            .putInt(KEY_NIGHT_HOUR, nHour)
            .putInt(KEY_NIGHT_MIN, nMin)
            .putBoolean(KEY_NIGHT_ENABLED, nEnabled)
            .putString(KEY_ALARM_SOUND_TYPE, soundType)
            .apply();

        scheduleDailyAlarms(context);
    }

    public static String getAlarmSoundType(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(KEY_ALARM_SOUND_TYPE, "system_alarm");
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

    public static void scheduleSnoozeAlarm(Context context, long delayMs) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.setAction("com.akashcc.discipline.ACTION_ALARM");
        intent.putExtra(AlarmReceiver.EXTRA_TYPE, AlarmReceiver.TYPE_SNOOZE_NIGHT);

        PendingIntent pi = PendingIntent.getBroadcast(
            context,
            REQ_CODE_SNOOZE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        long triggerAt = System.currentTimeMillis() + delayMs;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        }
    }

    public static void cancelSnoozeAlarm(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        cancelAlarm(context, am, REQ_CODE_SNOOZE);
    }

    public static void scheduleTimeTableReminders(Context context, String slotsJson) {
        if (slotsJson == null || slotsJson.isEmpty()) return;

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_TIMETABLE_JSON, slotsJson).apply();

        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        try {
            JSONArray arr = new JSONArray(slotsJson);
            Calendar nowCal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kolkata"));
            long nowMs = nowCal.getTimeInMillis();

            for (int i = 0; i < arr.length(); i++) {
                JSONObject slot = arr.getJSONObject(i);
                boolean reminderEnabled = slot.optBoolean("reminder", true);
                if (!reminderEnabled) continue;

                String startTime = slot.optString("startTime", "09:00");
                int leadMinutes = slot.optInt("leadMinutes", 5);
                String title = slot.optString("title", "Daily Routine");
                String habitTag = slot.optString("habitTag", "");

                String[] parts = startTime.split(":");
                int sHour = Integer.parseInt(parts[0]);
                int sMin = Integer.parseInt(parts[1]);

                Calendar slotCal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kolkata"));
                slotCal.set(Calendar.HOUR_OF_DAY, sHour);
                slotCal.set(Calendar.MINUTE, sMin);
                slotCal.set(Calendar.SECOND, 0);
                slotCal.set(Calendar.MILLISECOND, 0);

                // Subtract lead time
                slotCal.add(Calendar.MINUTE, -leadMinutes);

                if (slotCal.getTimeInMillis() <= nowMs) {
                    slotCal.add(Calendar.DAY_OF_YEAR, 1);
                }

                Intent intent = new Intent(context, AlarmReceiver.class);
                intent.setAction("com.akashcc.discipline.ACTION_ALARM");
                intent.putExtra(AlarmReceiver.EXTRA_TYPE, AlarmReceiver.TYPE_TIMETABLE);
                intent.putExtra(AlarmReceiver.EXTRA_TIMETABLE_TITLE, title);
                intent.putExtra(AlarmReceiver.EXTRA_TIMETABLE_TAG, habitTag);
                intent.putExtra(AlarmReceiver.EXTRA_TIMETABLE_TIME, startTime);

                int reqCode = REQ_CODE_TIMETABLE_BASE + i;
                PendingIntent pi = PendingIntent.getBroadcast(
                    context,
                    reqCode,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
                );

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, slotCal.getTimeInMillis(), pi);
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, slotCal.getTimeInMillis(), pi);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
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

    public static void triggerTestAlarm(Context context, String soundType) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.setAction("com.akashcc.discipline.ACTION_ALARM");
        intent.putExtra(AlarmReceiver.EXTRA_TYPE, AlarmReceiver.TYPE_TEST);
        intent.putExtra(AlarmReceiver.EXTRA_CUSTOM_SOUND, soundType);

        PendingIntent pi = PendingIntent.getBroadcast(
            context,
            REQ_CODE_TEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        long triggerAt = System.currentTimeMillis() + 1200;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        }
    }
}
