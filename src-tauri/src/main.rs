// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        // 注册Tauri插件
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // 获取主窗口 - 使用正确的Tauri 2.x API
            let main_window = app.get_webview_window("main")
                .expect("Failed to get main window");
            
            // 显式设置窗口属性（确保窗口控制按钮可用）
            #[cfg(target_os = "windows")]
            {
                // 设置窗口为可最小化、可最大化、可关闭
                let _ = main_window.set_minimizable(true);
                let _ = main_window.set_maximizable(true);
                let _ = main_window.set_closable(true);
                let _ = main_window.set_resizable(true);
                
                println!("✅ [Tauri] Window initialized for Windows");
                println!("   - Minimizable: ✓");
                println!("   - Maximizable: ✓");
                println!("   - Closable: ✓");
                println!("   - Resizable: ✓");
            }
            
            #[cfg(not(target_os = "windows"))]
            {
                let _ = main_window.set_minimizable(true);
                let _ = main_window.set_maximizable(true);
                let _ = main_window.set_closable(true);
                let _ = main_window.set_resizable(true);
                
                println!("✅ [Tauri] Window initialized");
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
