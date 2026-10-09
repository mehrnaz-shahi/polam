package expo.modules.polamsms

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.provider.Telephony
import androidx.core.content.ContextCompat
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PolamSmsModule : Module() {
  private var receiver: BroadcastReceiver? = null

  override fun definition() = ModuleDefinition {
    Name("PolamSms")
    Events("onSms")

    AsyncFunction("readInbox") { limit: Int ->
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      if (
        ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) !=
          PackageManager.PERMISSION_GRANTED
      ) {
        return@AsyncFunction emptyList<Map<String, Any>>()
      }
      val results = mutableListOf<Map<String, Any>>()
      val cursor = context.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        arrayOf(
          Telephony.Sms._ID,
          Telephony.Sms.ADDRESS,
          Telephony.Sms.BODY,
          Telephony.Sms.DATE,
        ),
        null,
        null,
        "${Telephony.Sms.DATE} DESC",
      )
      cursor?.use {
        val idIndex = it.getColumnIndex(Telephony.Sms._ID)
        val addressIndex = it.getColumnIndex(Telephony.Sms.ADDRESS)
        val bodyIndex = it.getColumnIndex(Telephony.Sms.BODY)
        val dateIndex = it.getColumnIndex(Telephony.Sms.DATE)
        var count = 0
        while (it.moveToNext() && count < limit) {
          results.add(
            mapOf(
              "id" to it.getString(idIndex),
              "address" to (it.getString(addressIndex) ?: ""),
              "body" to (it.getString(bodyIndex) ?: ""),
              "date" to it.getLong(dateIndex),
            ),
          )
          count += 1
        }
      }
      results
    }

    OnStartObserving {
      registerReceiver()
    }

    OnStopObserving {
      unregisterReceiver()
    }
  }

  private fun registerReceiver() {
    if (receiver != null) return
    val context = appContext.reactContext ?: return
    val next = object : BroadcastReceiver() {
      override fun onReceive(ctx: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
        val parts = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        val body = parts.joinToString("") { it.displayMessageBody ?: "" }
        val address = parts.firstOrNull()?.displayOriginatingAddress ?: ""
        val date = parts.firstOrNull()?.timestampMillis ?: System.currentTimeMillis()
        sendEvent(
          "onSms",
          mapOf(
            "id" to "$address-$date",
            "address" to address,
            "body" to body,
            "date" to date,
          ),
        )
      }
    }
    val filter = IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION)
    ContextCompat.registerReceiver(context, next, filter, ContextCompat.RECEIVER_EXPORTED)
    receiver = next
  }

  private fun unregisterReceiver() {
    val context = appContext.reactContext
    val current = receiver
    if (context != null && current != null) {
      try {
        context.unregisterReceiver(current)
      } catch (error: IllegalArgumentException) {
      }
    }
    receiver = null
  }
}
