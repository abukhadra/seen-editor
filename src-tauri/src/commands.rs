use std::{
    path::PathBuf,
    thread,
    io::{BufReader, BufRead, Read},
    sync::{Arc, Mutex, Condvar},
    process::Child
};

use tauri::{
    State,
    Manager
};
use seen_compiler::{
    self,
    lang::Lang,
    util::{
        cli, 
        fmt::Color
    }
};

use crate::state::*;

//================
//   editor_lang()
//================
#[tauri::command]
pub fn editor_lang(lang_state: State<LangState>) -> String {
    lang_state
        .inner()
        .0
        .lock()
        .unwrap()        
        .clone()
        .to_string()
        .to_lowercase()
}

//================
//   set_editor_lang()
//================
#[tauri::command]
pub fn set_editor_lang(
    id: String,    
    lang_state: State<LangState>,
) {

    *lang_state.0.lock().unwrap() = Lang::from_str(id.as_str());

}

//================
//   theme()
//================
#[tauri::command]
pub fn theme( theme_state: State<ThemeState>) -> String {
    theme_state
        .inner()
        .0
        .lock()
        .unwrap()        
        .clone()
        .to_string()
}


//================
//   set_theme()
//================
#[tauri::command]
pub fn set_theme(
    name: String,
    theme_state: State<ThemeState>
) {
    *theme_state.0.lock().unwrap() = name;
}



//================
//   home_dir()
//================
#[tauri::command]
pub fn home_dir(homedir_state: State<HomeDirState>) -> Option<PathBuf> {
    let HomeDirState(path) = homedir_state.inner();
    path.clone()
}

//================
//   is_proj_dir()
//================
#[tauri::command]
pub fn is_proj_dir(path: &str) -> bool {
    cli::proj_lang(&PathBuf::from(path)).is_ok()
}

//================
//   proj_lang()
//================
#[tauri::command]
pub fn proj_lang(path: &str) -> String {
    cli::proj_lang(&PathBuf::from(path))
        .expect("could not get the project language!")
        .to_string()
        .to_lowercase()
}
//================
//   proj_name()
//================
#[tauri::command]
pub fn proj_name(
    lang_id: &str,
    path: &str
) -> String {
    cli::proj_name(
        &Lang::from_str(lang_id),
        &PathBuf::from(path)
    )
}

//================
//   read_src()
//================
#[tauri::command]
pub fn read_src(
    path: &str
) -> Result<String, String> {
    cli::main_src(&PathBuf::from(path))
}

//================
//   main_path()
//================
#[tauri::command]
pub fn main_path(
    lang_id: &str,
    path: &str
) -> String {
    cli::main_path(
        &Lang::from_str(lang_id),
        &PathBuf::from(path)
    )
}


//================
//   new()
//================
#[tauri::command]
pub fn new(
    lang: &str,
    name: String,
    path: String,
    template: String,

) -> Result<(),String> {

    cli::New::exec(
        lang == "ar",
        name,
        Some(path),
        if template == "command_line" {
            None
        } else {
            Some(template)
        }
    )    
}

//================
//   open()
//================
#[tauri::command]
pub fn open(name: &str) -> String {
    format!("open");
    todo!(); // TODO
}

//================
//   build()
//================
#[tauri::command]
pub fn build(
    path: &str,
    app_handle: tauri::AppHandle,
    proc_state: State<ProcState>    
) {
    if path == "" { return; }

    let path = path.to_string();
    let cmd = cli::Build::exec(
        Some(PathBuf::from(path)),
        true
    );

    cmd_io(
        cmd,
        app_handle,
        proc_state
    );

}

//================
//   run()
//================
#[tauri::command]
pub fn run(
    path: &str,
    app_handle: tauri::AppHandle,
    proc_state: State<ProcState>
) {
    if path == "" { return; }

    let cmd = cli::Run::exec(
        Some(PathBuf::from(path)),
        true
    );

    cmd_io(
        cmd,
        app_handle,
        proc_state
    );

}


//================
//   cmd_io()
//================
fn cmd_io(
    cmd: Option<Child>,
    app_handle: tauri::AppHandle,
    proc_state: State<ProcState>
) {
    match cmd {
        None => eprintln!("{}", Color::red("error could not receive output from cargo")),
        Some(mut cmd) => {
            let main_win_stdout = app_handle.get_window("main").expect("");
            let main_win_stderr = main_win_stdout.clone();

            let stdout = cmd.stdout.take().unwrap();
            thread::spawn(move ||  {
                for line in BufReader::new(stdout).lines() {
                    main_win_stdout.emit(
                        "seen-stdout", 
                        format!("{}", line.unwrap())
                    ).expect("");
                }
                main_win_stdout.emit(
                    "proc-term", ""
                ).expect("");

            }); 
            let stderr = cmd.stderr.take().unwrap();
            thread::spawn(move ||  {
                for line in BufReader::new(stderr).lines() {
                    main_win_stderr.emit(
                        "seen-stderr",
                        format!("{}", line.unwrap())
                    ).expect("");
                }     

            });
            
            *proc_state.0.lock().unwrap() = Some(cmd);

        }
    }
}

//================
//   terminate()
//================
#[tauri::command]
pub fn terminate(
    proc_state: State<ProcState>
) {

    match proc_state
        .inner()
        .0
        .lock()
        .unwrap()        
        .as_mut() {
            Some(proc) => {
                proc              
                .kill()
                .expect("failed to terminate cargo");
                println!("terminated successfully");
            }, 
            None => ()
        }
}