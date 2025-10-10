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
            
            // 显式设置窗口属性
            window.set_minimizable(true).expect("Failed to set minimizable");
            window.set_maximizable(true).expect("Failed to set maximizable");
            window.set_closable(true).expect("Failed to set closable");
            
            // 设置窗口属性（Windows专用优化）
            #[cfg(target_os = "windows")]
            {
                println!("✅ Window initialized for Windows");
                println!("✅ Window properties set: minimizable, maximizable, closable");
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

