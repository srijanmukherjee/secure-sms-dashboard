package com.agent.module.sms

import android.content.BroadcastReceiver
import android.content.IntentFilter
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.provider.Telephony
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

class SmsModule(val reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    companion object {
        val TAG = "SmsModule"
        val SMS_RECEIVE_EVENT = "com.agent.module.sms:SMS_RECEIVED"
    }

    val receiver: BroadcastReceiver
    var isReceiverRegistered = false

    init {
        receiver = SmsReceiver(reactContext)
        reactContext.addLifecycleEventListener(this)
        registerReceiver(receiver)
    }

    override fun getName(): String = "SmsModule"

    @ReactMethod
    fun list(index: Int, limit: Int, onSuccess: Callback, onError: Callback) {
        try {
            val smsList: WritableArray = Arguments.createArray()
            val uri = Uri.parse("content://sms/inbox")
            val cursor = reactContext.contentResolver.query(uri, null, "", null, "date DESC")

            if (cursor == null) {
                return
            }

            cursor.moveToPosition(index)
            if (cursor.isAfterLast) {
                return
            }

            var count = 0
            while (cursor.moveToNext() && (limit == -1 || count < limit)) {
                val smsObject = Arguments.createMap()

                insertIntoMap(cursor, smsObject, "id", "_id")

                val columns =
                        listOf(
                                "address",
                                "body",
                                "date",
                                "date_sent",
                                "error_code",
                                "locked",
                                "person",
                                "protocol",
                                "read",
                                "reply_path_present",
                                "seen",
                                "service_center",
                                "subject",
                                "subscription_id",
                                "thread_id",
                                "type",
                                "status"
                        )

                for (column in columns) {
                    insertIntoMap(cursor, smsObject, column, column)
                }

                smsList.pushMap(smsObject)
                count++
            }

            onSuccess.invoke(smsList)
        } catch (e: Throwable) {
            Log.e(TAG, "${e.message}")
            onError.invoke(e.message)
        }
    }

    private fun insertIntoMap(
            cursor: Cursor,
            map: WritableMap,
            targetKey: String,
            sourceKey: String
    ) {
        val colIndex = cursor.getColumnIndex(sourceKey)

        if (colIndex == -1) {
            map.putNull(targetKey)
            return
        }

        when (cursor.getType(colIndex)) {
            Cursor.FIELD_TYPE_NULL -> map.putNull(targetKey)
            Cursor.FIELD_TYPE_INTEGER -> map.putInt(targetKey, cursor.getInt(colIndex))
            Cursor.FIELD_TYPE_FLOAT -> map.putDouble(targetKey, cursor.getDouble(colIndex))
            Cursor.FIELD_TYPE_STRING -> map.putString(targetKey, cursor.getString(colIndex))
        }
    }

    private fun registerReceiver(receiver: BroadcastReceiver) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && reactContext.hasCurrentActivity()
        ) {
            reactContext.currentActivity?.registerReceiver(
                    receiver,
                    IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION)
            )
            isReceiverRegistered = true
            return
        }

        if (reactContext.hasCurrentActivity()) {
            reactContext.currentActivity?.registerReceiver(
                    receiver,
                    IntentFilter("android.provider.Telephony.SMS_RECEIVED")
            )
            isReceiverRegistered = true
        }
    }

    private fun unregisterReceiver(receiver: BroadcastReceiver) {
        if (isReceiverRegistered && reactContext.hasCurrentActivity()) {
            reactContext.currentActivity?.unregisterReceiver(receiver)
            isReceiverRegistered = false
        }
    }

    override fun onHostDestroy() {
        unregisterReceiver(receiver)
    }

    override fun onHostPause() {
        unregisterReceiver(receiver)
    }

    override fun onHostResume() {
        registerReceiver(receiver)
    }
}
