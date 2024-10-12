import android.annotation.TargetApi
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.BackoffPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.ListenableWorker
import androidx.work.OneTimeWorkRequest
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.OutOfQuotaPolicy
import androidx.work.WorkManager
import androidx.work.WorkRequest
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.agent.R
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import java.util.concurrent.TimeUnit

class BackgroundService(appContext: Context, workerParams: WorkerParameters) : HeadlessJsTaskWorker(NOTIFICATION_ID, appContext, workerParams) {

    override fun createNotification(): Notification {
        val builder = NotificationCompat.Builder(applicationContext, "My App")
            .setContentTitle("My App")
            .setContentText("My App")
            .setSmallIcon(R.mipmap.ic_launcher)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel("My App", "My App").also {
                builder.setChannelId(it.id)
            }
        }
        return builder.build()
    }

    @TargetApi(Build.VERSION_CODES.O)
    private fun createNotificationChannel(
        channelId: String,
        name: String
    ): NotificationChannel {
        return NotificationChannel(
            channelId, name, NotificationManager.IMPORTANCE_LOW
        ).also { channel ->
            (applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
        }
    }

    override fun getTaskConfig(extras: Map<String, Any>): HeadlessJsTaskConfig? {
        try {
            return HeadlessJsTaskConfig(
                "RECEIVER",
                Arguments.makeNativeMap(extras),
                50000,
                true)
        } catch (_: Throwable) { }
        return null
    }

    companion object {
        private const val TAG = "BackgroundService"
        private const val NOTIFICATION_ID = 9999

        fun invoke(context: Context) {
            WorkManager.getInstance(context)
                .beginUniqueWork(
                    TAG,
                    ExistingWorkPolicy.APPEND_OR_REPLACE,
                    getExpeditedWork<BackgroundService>(TAG)
                )
                .enqueue()
        }

        private inline fun <reified T: ListenableWorker> getExpeditedWork(tag: String): OneTimeWorkRequest {
            return OneTimeWorkRequestBuilder<T>()
                .setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)
                .setBackoffCriteria(BackoffPolicy.LINEAR, WorkRequest.MIN_BACKOFF_MILLIS, TimeUnit.MILLISECONDS)
                .addTag(tag)
                .build()
        }
    }
}