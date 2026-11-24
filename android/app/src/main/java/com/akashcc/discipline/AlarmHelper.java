package com.akashcc.discipline;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import java.util.Calendar;
import java.util.TimeZone;

public class AlarmHelper {
    public static final int REQ_CODE_MORNING = 101;
    public static final int REQ_CODE_NIGHT = 102;
    public static final int REQ_CODE_TEST = 103;

    public static void scheduleDailyAlarms(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        // Schedule Morning Alarm at 09:00 AM IST
        scheduleExact(context, am, 9, 0, REQ_CODE_MORNING, AlarmReceiver.TYPE_MORNING);

        // Schedule Night Alarm at 09:00 PM (21:00) IST
        scheduleExact(context, am, 21, 0, REQ_CODE_NIGHT, AlarmReceiver.TYPE_NIGHT);
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

        long triggerAt = System.currentTimeMillis() + 1500; // Trigger in 1.5 seconds
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        }
    }
}