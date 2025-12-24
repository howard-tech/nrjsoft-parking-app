package com.facebook.react.viewmanagers

import android.view.View
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ViewManagerDelegate

class RNGestureHandlerButtonManagerDelegate<T : View, U : RNGestureHandlerButtonManagerInterface<T>>(
    private val viewManager: U
) : ViewManagerDelegate<T> {

    override fun setProperty(view: T, propName: String, value: Any?) {
        when (propName) {
            "foreground" -> (value as? Boolean)?.let { viewManager.setForeground(view, it) }
            "backgroundColor" -> (value as? Number)?.let { viewManager.setBackgroundColor(view, it.toInt()) }
            "borderless" -> (value as? Boolean)?.let { viewManager.setBorderless(view, it) }
            "enabled" -> (value as? Boolean)?.let { viewManager.setEnabled(view, it) }
            "borderRadius" -> (value as? Number)?.let { viewManager.setBorderRadius(view, it.toFloat()) }
            "borderTopLeftRadius" -> (value as? Number)?.let { viewManager.setBorderTopLeftRadius(view, it.toFloat()) }
            "borderTopRightRadius" -> (value as? Number)?.let { viewManager.setBorderTopRightRadius(view, it.toFloat()) }
            "borderBottomLeftRadius" -> (value as? Number)?.let { viewManager.setBorderBottomLeftRadius(view, it.toFloat()) }
            "borderBottomRightRadius" -> (value as? Number)?.let { viewManager.setBorderBottomRightRadius(view, it.toFloat()) }
            "borderWidth" -> (value as? Number)?.let { viewManager.setBorderWidth(view, it.toFloat()) }
            "borderColor" -> when (value) {
                is Number -> viewManager.setBorderColor(view, value.toInt())
                else -> viewManager.setBorderColor(view, null)
            }
            "borderStyle" -> viewManager.setBorderStyle(view, value as? String)
            "rippleColor" -> when (value) {
                is Number -> viewManager.setRippleColor(view, value.toInt())
                else -> viewManager.setRippleColor(view, null)
            }
            "rippleRadius" -> (value as? Number)?.let { viewManager.setRippleRadius(view, it.toInt()) }
            "exclusive" -> (value as? Boolean)?.let { viewManager.setExclusive(view, it) }
            "touchSoundDisabled" -> (value as? Boolean)?.let { viewManager.setTouchSoundDisabled(view, it) }
        }
    }

    override fun receiveCommand(view: T, commandName: String, args: ReadableArray?) {
        // No custom commands to handle.
    }
}
