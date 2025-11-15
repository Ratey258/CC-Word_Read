// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub version: String,
    pub date: Option<String>,
    pub notes: Option<String>,
    pub current_version: String,
}

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<Option<UpdateInfo>, String> {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        use tauri_plugin_updater::UpdaterExt;
        
        println!("🔍 [更新] 检查更新...");
        
        // 获取当前版本
        let current_version = app.package_info().version.to_string();
        
        match app.updater() {
            Ok(updater) => {
                match updater.check().await {
                    Ok(Some(update)) => {
                        println!("✨ [更新] 发现新版本: {}", update.version);
                        
                        // 调试：打印完整的 update 结构
                        println!("🔍 [调试] update.date = {:?}", update.date);
                        
                        // 转换日期为字符串
                        let date_str = if let Some(date) = update.date {
                            let date_string = date.to_string();
                            println!("📅 [更新] 发布日期 (原始): {}", date_string);
                            // 直接使用 ISO 格式的日期字符串
                            Some(date_string)
                        } else {
                            println!("⚠️  [更新] 未找到发布日期字段");
                            None
                        };
                        
                        if let Some(body) = &update.body {
                            println!("📝 [更新] 更新内容: {}", body);
                        }
                        
                        // 存储更新对象供后续下载使用
                        let update_info = UpdateInfo {
                            version: update.version.clone(),
                            date: date_str,
                            notes: update.body.clone(),
                            current_version,
                        };
                        
                        println!("🔍 [调试] 最终 UpdateInfo: {:?}", update_info);
                        
                        Ok(Some(update_info))
                    }
                    Ok(None) => {
                        println!("✅ [更新] 已是最新版本");
                        Ok(None)
                    }
                    Err(e) => {
                        let error_msg = e.to_string();
                        if error_msg.contains("Could not fetch a valid release JSON") {
                            println!("ℹ️  [更新] 暂无可用更新");
                            Err("暂无可用更新".to_string())
                        } else {
                            eprintln!("❌ [更新] 检查失败: {}", e);
                            Err(format!("检查更新失败: {}", e))
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("❌ [更新] 初始化失败: {}", e);
                Err(format!("更新器初始化失败: {}", e))
            }
        }
    }
    
    #[cfg(any(target_os = "android", target_os = "ios"))]
    {
        println!("ℹ️  [更新] 移动平台不支持自动更新");
        Err("移动平台不支持自动更新".to_string())
    }
}

#[tauri::command]
async fn download_and_install_update(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        use tauri_plugin_updater::UpdaterExt;
        
        println!("⬇️  [更新] 开始下载更新...");
        
        match app.updater() {
            Ok(updater) => {
                match updater.check().await {
                    Ok(Some(update)) => {
                        // 下载并安装更新
                        match update.download_and_install(
                            |chunk_length, content_length| {
                                let percentage = if let Some(total) = content_length {
                                    (chunk_length as f64 / total as f64 * 100.0) as u32
                                } else {
                                    0
                                };
                                println!("⬇️  [更新] 下载进度: {}%", percentage);
                            },
                            || {
                                println!("✅ [更新] 下载完成，准备安装...");
                            }
                        ).await {
                            Ok(_) => {
                                println!("🎉 [更新] 安装成功，应用将重启");
                                Ok(())
                            }
                            Err(e) => {
                                eprintln!("❌ [更新] 安装失败: {}", e);
                                Err(format!("更新安装失败: {}", e))
                            }
                        }
                    }
                    Ok(None) => {
                        Err("没有可用的更新".to_string())
                    }
                    Err(e) => {
                        eprintln!("❌ [更新] 下载失败: {}", e);
                        Err(format!("下载失败: {}", e))
                    }
                }
            }
            Err(e) => {
                eprintln!("❌ [更新] 初始化失败: {}", e);
                Err(format!("更新器初始化失败: {}", e))
            }
        }
    }
    
    #[cfg(any(target_os = "android", target_os = "ios"))]
    {
        println!("ℹ️  [更新] 移动平台不支持自动更新");
        Err("移动平台不支持自动更新".to_string())
    }
}

fn main() {
    let mut builder = tauri::Builder::default()
        // 注册Tauri插件
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init());
    
    // 仅在非移动平台添加更新器插件
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
    }
    
    builder.setup(|app| {
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
        
        // 启动时自动检查更新（仅在生产环境）
        #[cfg(not(debug_assertions))]
        #[cfg(not(any(target_os = "android", target_os = "ios")))]
        {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                // 延迟3秒后检查更新，避免影响启动速度
                tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
                println!("🚀 [更新] 启动自动更新检查...");
                match check_for_updates(app_handle).await {
                    Ok(Some(update)) => {
                        println!("✨ [更新] 发现新版本: {} (当前: {})", update.version, update.current_version);
                    }
                    Ok(None) => {
                        println!("✅ [更新] 已是最新版本");
                    }
                    Err(e) => {
                        // 不显示错误，因为可能只是还没有发布新版本
                        println!("ℹ️  [更新] {}", e);
                    }
                }
            });
        }
        
        Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        check_for_updates,
        download_and_install_update
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
