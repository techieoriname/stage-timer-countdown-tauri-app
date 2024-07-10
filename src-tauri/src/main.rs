#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use tauri::{Manager, WindowBuilder, AppHandle};

#[tauri::command]
fn start_timer(app_handle: AppHandle, minutes: u32, seconds: u32, activity: String) {
    let total_seconds = minutes * 60 + seconds;
    let payload = serde_json::json!({ "time": total_seconds, "activity": activity });
    app_handle.emit_all("start_timer", payload).unwrap();
}

#[tauri::command]
fn update_timer(app_handle: AppHandle, minutes: u32, seconds: u32, activity: String) {
    let payload = serde_json::json!({ "minutes": minutes, "seconds": seconds, "activity": activity });
    app_handle.emit_all("update_timer", payload).unwrap();
}

#[tauri::command]
fn reset_timer(app_handle: AppHandle) {
    app_handle.emit_all("reset_timer", "").unwrap();
}

#[tauri::command]
fn time_up(app_handle: AppHandle) {
    app_handle.emit_all("time_up", "").unwrap();
}

#[tauri::command]
fn set_flash_state(app_handle: AppHandle, enable: bool) {
    app_handle.emit_all("set_flash_state", enable).unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_timer, update_timer, reset_timer, time_up, set_flash_state])
        .setup(|app| {
            let handle = app.handle();
            let extended_window = Arc::new(Mutex::new(WindowBuilder::new(
                &handle,
                "timer",
                tauri::WindowUrl::App("index.html#/timer".into()),
            )
            .title("Countdown Timer by Oriname")
            .fullscreen(true)
            .build()?));

            {
                let extended_window = Arc::clone(&extended_window);
                app.listen_global("start_timer", move |event| {
                    if let Some(payload) = event.payload() {
                        let extended_window = extended_window.lock().unwrap();
                        extended_window.emit("update_timer", payload).unwrap();
                    }
                });
            }

            {
                let extended_window = Arc::clone(&extended_window);
                app.listen_global("update_timer", move |event| {
                    if let Some(payload) = event.payload() {
                        let extended_window = extended_window.lock().unwrap();
                        extended_window.emit("update_timer", payload).unwrap();
                    }
                });
            }

            {
                let extended_window = Arc::clone(&extended_window);
                app.listen_global("reset_timer", move |_| {
                    let extended_window = extended_window.lock().unwrap();
                    extended_window.emit("reset_timer", "").unwrap();
                });
            }

            {
                let extended_window = Arc::clone(&extended_window);
                app.listen_global("time_up", move |_| {
                    let extended_window = extended_window.lock().unwrap();
                    extended_window.emit("time_up", "").unwrap();
                });
            }

            {
                let extended_window = Arc::clone(&extended_window);
                app.listen_global("set_flash_state", move |event| {
                    if let Some(payload) = event.payload() {
                        let extended_window = extended_window.lock().unwrap();
                        extended_window.emit("set_flash_state", payload).unwrap();
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
