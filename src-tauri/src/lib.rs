use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    Emitter, Manager,
};
use tauri_plugin_sql::{Migration, MigrationKind};

/// Load the tray icon from bytes pre-decoded by build.rs.
/// include_bytes! registers the generated file as a rustc dependency, so
/// editing icons/32x32.png triggers a recompile automatically.
fn tray_icon() -> tauri::image::Image<'static> {
    const DATA: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/tray_icon.bin"));
    let width = u32::from_le_bytes(DATA[0..4].try_into().unwrap());
    let height = u32::from_le_bytes(DATA[4..8].try_into().unwrap());
    tauri::image::Image::new_owned(DATA[8..].to_vec(), width, height)
}

// ─── Tauri commands ───────────────────────────────────────────────────────────

#[tauri::command]
fn print(window: tauri::WebviewWindow) {
    let _ = window.print();
}

/// Called by the frontend whenever the badge state changes, so the tray menu
/// always reflects the current step.
#[tauri::command]
fn update_tray(app: tauri::AppHandle, status: String, next_action: String, is_done: bool) {
    if let Some(tray) = app.tray_by_id("klok") {
        if let Some(menu) = tray_menu(&app, &status, &next_action, is_done) {
            let _ = tray.set_menu(Some(menu));
        }
    }
}

// ─── Tray menu builder ────────────────────────────────────────────────────────

fn tray_menu(
    app: &tauri::AppHandle,
    status: &str,
    next_action: &str,
    is_done: bool,
) -> Option<Menu<tauri::Wry>> {
    let status_item = MenuItem::with_id(app, "status", status, false, None::<&str>).ok()?;
    let sep1 = PredefinedMenuItem::separator(app).ok()?;
    let stamp_item =
        MenuItem::with_id(app, "stamp", next_action, !is_done, None::<&str>).ok()?;
    let sep2 = PredefinedMenuItem::separator(app).ok()?;
    let show_item = MenuItem::with_id(app, "show", "Ouvrir Klok", true, None::<&str>).ok()?;
    let sep3 = PredefinedMenuItem::separator(app).ok()?;
    let quit_item = MenuItem::with_id(app, "quit", "Quitter", true, None::<&str>).ok()?;

    Menu::with_items(
        app,
        &[
            &status_item,
            &sep1,
            &stamp_item,
            &sep2,
            &show_item,
            &sep3,
            &quit_item,
        ],
    )
    .ok()
}

// ─── App entry point ──────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "initial_schema",
            sql: include_str!("../migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "settings_table",
            sql: include_str!("../migrations/002_settings_table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "holidays_table",
            sql: include_str!("../migrations/003_holidays_table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "hours_per_week",
            sql: include_str!("../migrations/004_hours_per_week.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "vacations_table",
            sql: include_str!("../migrations/005_vacations_table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "vacation_type",
            sql: include_str!("../migrations/006_vacation_type.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "sick_days_table",
            sql: include_str!("../migrations/007_sick_days_table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "special_days_table",
            sql: include_str!("../migrations/008_special_days_table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
            description: "activity_periods",
            sql: include_str!("../migrations/009_activity_periods.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:klok.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![print, update_tray])
        .setup(|app| {
            let icon = tray_icon();
            let handle = app.handle().clone();

            let menu =
                tray_menu(&handle, "Prêt", "Arrivée", false).expect("failed to build tray menu");

            tauri::tray::TrayIconBuilder::with_id("klok")
                .icon(icon)
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "stamp" => {
                        // Forward to frontend — badge store processes it and
                        // calls update_tray to keep the menu in sync.
                        let _ = app.emit("tray-stamp", ());
                    }
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(&handle)?;

            // Closing the window hides it rather than quitting — the tray icon
            // remains the persistent entry point.
            let window = handle.get_webview_window("main").unwrap();
            window.on_window_event({
                let w = window.clone();
                move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = w.hide();
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
