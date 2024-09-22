package com.agent.module.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Telephony
import android.telephony.SmsMessage
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule

class SmsReceiver(val reactContext: ReactApplicationContext) : BroadcastReceiver() {

    companion object {
        val TAG = "SmsReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                receiveMultipartMessage(Telephony.Sms.Intents.getMessagesFromIntent(intent))
            } else {
                throw UnsupportedOperationException(
                        "Only SDK above KITKAT is supported. Get a new phone bro!"
                )
            }
        } catch (e: Throwable) {
            Log.e(TAG, "Hey Hey Hey! Look there's an error: ${e.message}")
        }
    }

    private fun receiveMultipartMessage(messages: Array<SmsMessage>) {
        val sms = messages[0]
        val body: String

        if (messages.count() == 0 || sms.isReplace) {
            body = sms.displayMessageBody
        } else {
            val sb = StringBuilder()
            for (message in messages) {
                sb.append(message.messageBody)
            }
            body = sb.toString()
        }

        receiveMessage(sms, body)
    }

    private fun receiveMessage(sms: SmsMessage, body: String) {
        if (!reactContext.hasActiveReactInstance()) {
            return
        }

        Log.d(TAG, "received sms from ${sms.originatingAddress}")

        val response = Arguments.createMap()

        response.putString("address", sms.originatingAddress)
        response.putString("body", if (body.length > 0) body else sms.messageBody)
        response.putString("timestamp", sms.timestampMillis.toString())
        response.putInt("status_on_icc", sms.statusOnIcc)
        response.putInt("index_on_icc", sms.indexOnIcc)

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(SmsModule.SMS_RECEIVE_EVENT, response)
    }
}
