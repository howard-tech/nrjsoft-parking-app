package com.facebook.react.viewmanagers

import android.view.View

interface RNGestureHandlerButtonManagerInterface<T : View> {
    fun setForeground(view: T, useDrawableOnForeground: Boolean)
    fun setBackgroundColor(view: T, backgroundColor: Int)
    fun setBorderless(view: T, useBorderlessDrawable: Boolean)
    fun setEnabled(view: T, enabled: Boolean)
    fun setBorderRadius(view: T, borderRadius: Float)
    fun setBorderTopLeftRadius(view: T, borderTopLeftRadius: Float)
    fun setBorderTopRightRadius(view: T, borderTopRightRadius: Float)
    fun setBorderBottomLeftRadius(view: T, borderBottomLeftRadius: Float)
    fun setBorderBottomRightRadius(view: T, borderBottomRightRadius: Float)
    fun setBorderWidth(view: T, borderWidth: Float)
    fun setBorderColor(view: T, borderColor: Int?)
    fun setBorderStyle(view: T, borderStyle: String?)
    fun setRippleColor(view: T, rippleColor: Int?)
    fun setRippleRadius(view: T, rippleRadius: Int)
    fun setExclusive(view: T, exclusive: Boolean)
    fun setTouchSoundDisabled(view: T, touchSoundDisabled: Boolean)
}
