package com.facebook.react.viewmanagers

import android.view.View
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ViewManagerDelegate

class RNGestureHandlerRootViewManagerDelegate<T : View, U : RNGestureHandlerRootViewManagerInterface<T>>(
    private val viewManager: U
) : ViewManagerDelegate<T> {

    override fun setProperty(view: T, propName: String, value: Any?) {
        if (propName == "unstable_forceActive") {
            (value as? Boolean)?.let { viewManager.setUnstable_forceActive(view, it) }
        }
    }

    override fun receiveCommand(view: T, commandName: String, args: ReadableArray?) {
        // No custom commands defined.
    }
}
