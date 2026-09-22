#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_m3::init())
        // cookie-store feature (enabled in Cargo.toml) makes the native HTTP
        // client persist cookies to disk inside the app's data directory.
        // The HttpOnly auth_token cookie set by the server after OTP verification
        // is stored there and automatically re-sent on every subsequent request —
        // including the getUserProfile() call in restoreSession() on next cold
        // launch after the app was cleared from recents. Without this, the cookie
        // jar is in-memory only and dies with the process, forcing re-login every
        // time the app is killed.
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            #[cfg(target_os = "android")]
            {
                use tauri::Manager;
                app.get_webview_window("main")
                    .unwrap()
                    .with_webview(|webview| {
                        use jni::objects::JValue;
                        webview.jni_handle().exec(|env, activity, _webview| {
                            env.call_method(
                                activity,
                                "getWindow",
                                "()Landroid/view/Window;",
                                &[],
                            )
                            .and_then(|window| {
                                env.call_method(
                                    window.l().unwrap(),
                                    "setStatusBarColor",
                                    "(I)V",
                                    &[JValue::Int(0x00000000u32 as i32)],
                                )
                            })
                            .ok();
                        });
                    })
                    .ok();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}