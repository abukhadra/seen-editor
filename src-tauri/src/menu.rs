use tauri::{
    CustomMenuItem, 
    Menu, 
    MenuItem, 
    Submenu, 
    AboutMetadata
};

use crate::labels::{
    self,
    Labels
};


//================
//   main_menu()
//================
pub fn main_menu(
    labels: &Labels
) -> Menu {

    let menu = Menu::new()
        .add_submenu(seen(&labels))
        .add_submenu(file(&labels))
        .add_submenu(edit(&labels))
        .add_submenu(project(&labels));  

    menu
}

//================
//   seen()
//================
fn seen(labels: &Labels) -> Submenu {
    let default_theme = CustomMenuItem::new(labels.theme_default_key(), labels.theme_default());
    let colorforth_theme = CustomMenuItem::new(labels.theme_colorforth_key(), labels.theme_colorforth());
    let eclipse_theme = CustomMenuItem::new(labels.theme_eclipse_key(), labels.theme_eclipse());
    let idea_theme = CustomMenuItem::new(labels.theme_idea_key(), labels.theme_idea());
    let monokai_theme = CustomMenuItem::new(labels.theme_monokai_key(), labels.theme_monokai());
    let night_theme = CustomMenuItem::new(labels.theme_night_key(), labels.theme_night());
    let solarized_light_theme = CustomMenuItem::new(labels.theme_solarized_light_key(), labels.theme_solarized_light());
    let the_matrix_theme = CustomMenuItem::new(labels.theme_the_matrix_key(), labels.theme_the_matrix());
    
    let theme_submenu =  Submenu::new(
        labels.theme(), 
        Menu::new()
            .add_item(default_theme)
            .add_item(colorforth_theme)
            .add_item(eclipse_theme)
            .add_item(idea_theme)
            .add_item(monokai_theme)
            .add_item(night_theme)
            .add_item(solarized_light_theme)
            .add_item(the_matrix_theme)
            
    );
    let preferences_submenu =  Submenu::new(
        labels.preferences(), 
        Menu::new()
            .add_submenu(theme_submenu)
            
    );
    
    Submenu::new(
        labels.short_name(),
        Menu::new()
            .add_native_item(
                MenuItem::About(
                    labels.long_name().to_string(), 
                    AboutMetadata::new().version("0.1.0")   // FIXME, hardcoded version, get from toml
                )
            )
            .add_submenu(preferences_submenu)
            .add_native_item(MenuItem::CloseWindow)
    )

}

//================
//   file()
//================
fn file(labels: &Labels) -> Submenu {

    let new_project = CustomMenuItem::new(labels.new_project_key(), labels.new_project());

    let open_project = CustomMenuItem::new(
        labels.open_project_key(), 
        labels.open_project()
    ).accelerator("Cmd+O");

    let save = CustomMenuItem::new(
        labels.save_key(), 
        labels.save()
    ).accelerator("Cmd+S");

    let close_project = CustomMenuItem::new(
        labels.close_project_key(), 
        labels.close_project()
    ).accelerator("Cmd+W");

    Submenu::new(
        labels.file(),
        Menu::new()
            .add_item(new_project)
            .add_native_item(MenuItem::Separator)        
            .add_item(open_project)
            .add_native_item(MenuItem::Separator)        
            .add_item(save)
            .add_native_item(MenuItem::Separator)        
            .add_item(close_project)
    )    
}

//================
//   edit()
//================
fn edit(labels: &Labels) -> Submenu {
    Submenu::new(
        labels.edit(),
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Paste)
    )    
}

//================
//   project()
//================
fn project(labels: &Labels) -> Submenu {
    let build = CustomMenuItem::new(
        labels.build_key(), 
        labels.build()
    ).accelerator("Cmd+B");

    let run = CustomMenuItem::new(
        labels.run_key(), 
        labels.run()
    ).accelerator("Cmd+R");

    Submenu::new(
        labels.project(), 
        Menu::new()
            .add_item(run)        
            .add_item(build)
    )
}