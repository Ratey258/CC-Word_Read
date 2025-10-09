// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        // 注册插件
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // 获取主窗口
            let window = app.get_webview_window("main").unwrap();
            
            // 设置窗口属性（Windows专用优化）
            #[cfg(target_os = "windows")]
            {
                use tauri::WebviewWindowBuilder;
                
                // 窗口创建后的额外配置可以在这里添加
                println!("Window initialized for Windows");
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

