package com.dreamsynccreations.dailynk;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.activity.OnBackPressedDispatcher;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private OnBackPressedCallback backPressedCallback;
    private volatile boolean hasOpenUI = false;
    private boolean jsInterfaceAdded = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        setupBackButtonHandling();
    }

    private void setupBackButtonHandling() {
        if (backPressedCallback != null) {
            return; // Already set up
        }

        OnBackPressedDispatcher dispatcher = getOnBackPressedDispatcher();
        WebView webView = getBridge().getWebView();
        
        // Add JavaScript interface for synchronous UI checking
        if (!jsInterfaceAdded && webView != null) {
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void setHasOpenUI(boolean hasUI) {
                    hasOpenUI = hasUI;
                }
            }, "BackButtonInterface");
            jsInterfaceAdded = true;
        }
        
        backPressedCallback = new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView wv = getBridge().getWebView();
                if (wv == null) {
                    // Fallback: exit if WebView not ready
                    finish();
                    return;
                }
                
                // Check synchronously if there are open UIs
                if (hasOpenUI) {
                    // There are open UIs - ask JavaScript to close them
                    wv.evaluateJavascript(
                        "(function() { " +
                        "  if (window.dispatchBackButton) { " +
                        "    window.dispatchBackButton(); " +
                        "  } " +
                        "})()",
                        null
                    );
                    // Don't proceed with navigation - UI was closed
                    return;
                }
                
                // No open UIs - proceed with navigation
                if (wv.canGoBack()) {
                    // Navigate back in WebView history
                    wv.goBack();
                } else {
                    // Can't go back, exit app
                    finish();
                }
            }
        };
        
        dispatcher.addCallback(this, backPressedCallback);
    }
}
