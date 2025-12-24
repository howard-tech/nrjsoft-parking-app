package com.facebook.react.viewmanagers

import android.view.View

interface RNGestureHandlerRootViewManagerInterface<T : View> {
    fun setUnstable_forceActive(view: T, active: Boolean)
}
