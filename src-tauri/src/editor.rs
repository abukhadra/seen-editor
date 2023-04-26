use std::{
    sync::Mutex
};

use tauri::{
    Manager, 
    RunEvent
};

use seen_compiler::{
    self,
    lang::Lang,
};

use crate::{
    commands::{
        self,
        *
    },
    state::*,
    labels::Labels,
    menu
};

pub fn startup(
    ar: bool,
    path: &Option<String>,
) {

    let mut labels = Labels::new();
    let path = path.clone();

    let home = match path {
        None => None,
        Some(path) => match path.as_str() {
            "." => Some(std::env::current_dir().unwrap()),
            _ => todo!("relative / absolute paths")
        }
    };

    let lang = if ar {Lang::Ar} else {Lang::En};
    let lang_id = if ar {"ar"} else {"en"};
    labels.editor_lang_id(lang_id);
    let app = tauri::Builder::default()
    .menu(menu::main_menu(&labels))
    .on_menu_event(move |event| {
        match event.menu_item_id() {
            "new-proj" => {
                event
                    .window()
                    .emit("menu-new-proj", "")
                    .expect("")
            },
            "open-proj" => {
                event
                    .window()
                    .emit("menu-open-proj", "")
                    .expect("")                        
            },
            "close-proj" => {
                event
                    .window()
                    .emit("menu-close-proj", "")
                    .expect("")                                        
            }
            "save" => {
                event
                    .window()
                    .emit("menu-save", "")
                    .expect("")                        
            },     
            "build" => {
                event
                    .window()
                    .emit("menu-build", "")
                    .expect("")                        
            },                              
            "run" => {
                event
                    .window()
                    .emit("menu-run", "")
                    .expect("")                        
            },                                    
        id => {
            if id.starts_with("theme") {
                let name = &id[id.find("-").unwrap() + 1 ..];
                event.window()
                    .emit("menu-theme", name)
                    .expect("")
            }
        }
        }
    })          
    .manage(TranslationsState(labels))
    .manage(LangState(Mutex::new(lang)))
    .manage(ThemeState(Mutex::new("default".to_string())))
    .manage(HomeDirState(home))
    .manage(ProcState(Default::default()))
    .invoke_handler(tauri::generate_handler![
        editor_lang,
        set_editor_lang,
        theme,
        set_theme,
        home_dir,
        is_proj_dir,
        proj_lang,
        proj_name,
        read_src,
        main_path,
        new, 
        open, 
        // compile, 
        build, 
        run,
        terminate
    ])
    .build(tauri::generate_context!())
    .expect("error while building tauri application");

    app.run(move |app_handle, e| {
        match e {
            RunEvent::ExitRequested { api, .. } => {
                commands::terminate(app_handle.state::<ProcState>());

            }                    
            _ => ()
        }
    });
}
