// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_m3::init())
        .setup(|app| {
            #[cfg(target_os = "android")]
            {
                use tauri::Manager;
                app.get_webview_window("main")
                    .unwrap()
                    .with_webview(|webview| {
                        #[cfg(target_os = "android")]
                        {
                            use jni::objects::JValue;
                            let env = webview.env();
                            let activity = webview.activity();
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
                        }
                    })
                    .ok();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
