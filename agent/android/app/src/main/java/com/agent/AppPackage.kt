package com.agent

import android.view.View
import com.agent.module.sms.SmsModule
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class AppPackage : ReactPackage {

    override fun createViewManagers(
            reactContext: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> = mutableListOf()

    override fun createNativeModules(
            reactContext: ReactApplicationContext
    ): MutableList<NativeModule> = listOf(SmsModule(reactContext)).toMutableList()
}
