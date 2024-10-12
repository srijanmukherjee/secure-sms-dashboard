// https://github.com/facebook/react-native/issues/36816#issuecomment-1968259456

import android.annotation.SuppressLint
import android.app.Notification
import android.content.Context
import android.os.PowerManager
import androidx.work.CoroutineWorker
import androidx.work.ForegroundInfo
import androidx.work.WorkerParameters
import com.facebook.infer.annotation.Assertions
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.facebook.react.jstasks.HeadlessJsTaskEventListener
import java.util.concurrent.CopyOnWriteArraySet
import kotlin.coroutines.Continuation
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

/**
 * Base class for running JS without a UI. Generally, you only need to override {@link
 * #getTaskConfig}, which is called for every {@link #doWork}. The result, if not {@code
 * null}, is used to run a JS task.
 *
 * <p>If you need more fine-grained control over how tasks are run, you can override {@link
 * #doWork} and call {@link #startTask} depending on your custom logic.
 *
 * <p>If you're starting a {@code HeadlessJsTaskWorker} from a {@code BroadcastReceiver} (e.g.
 * handling push notifications), make sure to call {@link #acquireWakeLockNow} before returning from
 * {@link BroadcastReceiver#onReceive}, to make sure the device doesn't go to sleep before the
 * service is started.
 */
abstract class HeadlessJsTaskWorker(private val notificationId: Int, appContext: Context, workerParams: WorkerParameters) : CoroutineWorker(appContext, workerParams), HeadlessJsTaskEventListener {
    private val mActiveTasks = CopyOnWriteArraySet<Int>()
    private var workFinishedCont: Continuation<Result>? = null

    companion object {
        private var sWakeLock: PowerManager.WakeLock? = null

        /**
         * Acquire a wake lock to ensure the device doesn't go to sleep while processing background tasks.
         */
        @SuppressLint("WakelockTimeout")
        fun acquireWakeLockNow(context: Context) {
            if (sWakeLock?.isHeld != true) {
                val powerManager = Assertions.assertNotNull(context.getSystemService(Context.POWER_SERVICE) as PowerManager);
                sWakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, HeadlessJsTaskWorker::class.java.canonicalName).apply {
                    setReferenceCounted(false)
                    acquire()
                }
            }
        }
    }

    final override suspend fun getForegroundInfo(): ForegroundInfo {
        return ForegroundInfo(notificationId, createNotification())
    }

    /*
     * Called from {@link #getForegroundInfo} to create a {@link Notification}.
     *
     * @return a {@link Notification} to be displayed when your background JS task
     * is being executed.
     */
    protected abstract fun createNotification(): Notification

    override suspend fun doWork(): Result = suspendCoroutine { cont ->
        workFinishedCont = cont

        when (val cfg = getTaskConfig(inputData.keyValueMap)) {
            null -> finishWork()

            else -> UiThreadUtil.runOnUiThread {
                startTask(cfg)
            }
        }
    }

    /**
     * Called from {@link #doWork} to create a {@link HeadlessJsTaskConfig} for this writableMap.
     *
     * @param writableMap the {@link WritableMap} received in {@link #doWork}.
     * @return a {@link HeadlessJsTaskConfig} to be used with {@link #startTask}, or {@code null} to
     *     ignore this command.
     */
    protected open fun getTaskConfig(extras: Map<String, Any>): HeadlessJsTaskConfig? {
        return null
    }

    /**
     * Start a task. This method handles starting a new React instance if required.
     *
     * <p>Has to be called on the UI thread.
     *
     * @param taskConfig describes what task to start and the parameters to pass to it
     */
    protected open fun startTask(taskConfig: HeadlessJsTaskConfig) {
        UiThreadUtil.assertOnUiThread()
        acquireWakeLockNow(applicationContext);
        val reactInstanceManager = getReactNativeHost().reactInstanceManager;
        val reactContext = reactInstanceManager.currentReactContext;

        when (reactContext) {
            null -> {
                reactInstanceManager.addReactInstanceEventListener(
                    object : ReactInstanceEventListener {
                        override fun onReactContextInitialized(context: ReactContext) {
                            invokeStartTask(context, taskConfig)
                            reactInstanceManager.removeReactInstanceEventListener(this)
                        }
                    });
                reactInstanceManager.createReactContextInBackground()
            }

            else -> {
                invokeStartTask(reactContext, taskConfig)
            }
        }
    }

    private fun invokeStartTask(reactContext: ReactContext?, taskConfig: HeadlessJsTaskConfig) {
        val headlessJsTaskContext = HeadlessJsTaskContext.getInstance(reactContext)
        headlessJsTaskContext.addTaskEventListener(this)

        UiThreadUtil.runOnUiThread {
            val taskId = headlessJsTaskContext.startTask(taskConfig)
            mActiveTasks.add(taskId)
        }
    }

    private fun finishWork() {
        if (getReactNativeHost().hasInstance()) {
            val reactInstanceManager = getReactNativeHost().reactInstanceManager;
            reactInstanceManager.currentReactContext?.let {
                val headlessJsTaskContext = HeadlessJsTaskContext.getInstance(it);
                headlessJsTaskContext.removeTaskEventListener(this);
            }
        }
        sWakeLock?.release();

        workFinishedCont?.resume(Result.success())
    }

    override fun onHeadlessJsTaskStart(taskId: Int) {}

    override fun onHeadlessJsTaskFinish(taskId: Int) {
        mActiveTasks.remove(taskId)
        if (mActiveTasks.size == 0) {
            finishWork()
        }
    }

    /**
     * Get the {@link ReactNativeHost} used by this app. By default, assumes {@link #getApplication()}
     * is an instance of {@link ReactApplication} and calls {@link
     * ReactApplication#getReactNativeHost()}. Override this method if your application class does not
     * implement {@code ReactApplication} or you simply have a different mechanism for storing a
     * {@code ReactNativeHost}, e.g. as a static field somewhere.
     */
    protected open fun getReactNativeHost(): ReactNativeHost {
        return (applicationContext as ReactApplication).reactNativeHost
    }
}