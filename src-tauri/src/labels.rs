use std::collections::HashMap;

//================
//   Constants
//================
const SHORT_NAME: &str = "short-name";
const LONG_NAME: &str = "long-name";
const FILE: &str = "file";
const EDIT: &str = "edit";
const THEME: &str = "theme";
const THEME_DEFAULT: &str = "theme-default";
const THEME_COLORFORTH: &str = "theme-colorforth";
const THEME_ECLIPSE: &str = "theme-eclipse";
const THEME_IDEA: &str = "theme-idea";
const THEME_MONOKAI: &str = "theme-monokai";
const THEME_NIGHT: &str = "theme-night";
const THEME_SOLARIZED_LIGHT: &str = "theme-solarized light";
const THEME_THE_MATRIX: &str = "theme-the-matrix";
const PREFERENCES: &str = "preferences";
const PROJECT :&str = "proj";
const NEW_PROJECT :&str = "new-proj";
const OPEN_PROJECT :&str = "open-proj";
const CLOSE_PROJECT :&str = "close-proj";
const SAVE: &str = "save";
const COMPILE: &str = "compile";
const BUILD: &str = "build";
const RUN: &str = "run";
const TERMINATE: &str = "terminate";
const LANG: &str = "lang";
const LANG_AR: &str = "lang-ar";
const LANG_EN: &str = "lang-en";

//================
//   Text
//================
struct Text<'a> {
    pub ar: &'a str,
    pub en: &'a str
}

//================
//   Labels
//================
pub struct Labels<'a> {
    editor_lang: &'a str,
    dictionary: HashMap<&'a str, Text<'a>>,
}
impl <'a> Labels<'a> {
    //---------------------
    //  new()
    //---------------------      
    pub fn new() -> Self {
        Self {
            editor_lang: "ar",
            dictionary: HashMap::from([
                (SHORT_NAME,                Text{ ar: "س",                  en: "Seen"} ),
                (LONG_NAME,                 Text{ ar: "محرر س",             en: "Seen Editor"} ),
                (FILE,                      Text{ ar: "ملف",                en: "File"} ),
                (EDIT,                      Text{ ar: "تحرير",              en: "Edit"} ),
                (PREFERENCES,               Text{ ar: "تفضيلات",             en: "Preferences"} ),
                (PROJECT,                   Text{ ar: "مشروع",              en: "Project"} ),
                (NEW_PROJECT,               Text{ ar: "مشروع جديد",         en: "New Project"} ),
                (OPEN_PROJECT,              Text{ ar: "فتح مشروع",          en: "Open Project"} ),
                (CLOSE_PROJECT,             Text{ ar: "اغلاق مشروع",         en: "Close Project"} ),
                (SAVE,                      Text{ ar: "حفظ",                en: "Save"} ),
                (COMPILE,                   Text{ ar: "ترجمة",              en: "Compile"} ),
                (BUILD,                     Text{ ar: "بناء",               en: "Build"} ),
                (RUN,                       Text{ ar: "تشغيل",              en: "Run"} ),
                (TERMINATE,                 Text{ ar: "إنهاء",              en: "Terminate"} ),
                (THEME,                     Text{ ar: "سمة",                en: "Theme"} ),
                (THEME_DEFAULT,             Text{ ar: "افتراضي",            en: "Default"} ),
                (THEME_COLORFORTH,          Text{ ar: "كولور فورث",         en: "colorForth"} ),
                (THEME_ECLIPSE,             Text{ ar: "اكليبس",             en: "Eclipse"} ),
                (THEME_IDEA,                Text{ ar: "ايديا",              en: "Idea"} ),
                (THEME_MONOKAI,             Text{ ar: "مونوكاي",            en: "Monokai"} ),
                (THEME_NIGHT,               Text{ ar: "نايت",               en: "Night"} ),
                (THEME_SOLARIZED_LIGHT,     Text{ ar: "سولارايزد (فاتح)",    en: "Solarized (Light)"} ),
                (THEME_THE_MATRIX,          Text{ ar: "ذا ماتريكس",         en: "The Matrix"} ),
                (LANG,                      Text{ ar: "لغة المحرر",         en: "Editor Language"} ),
                (LANG_AR,                   Text{ ar: "العربية",            en: "ِArabic"} ),
                (LANG_EN,                   Text{ ar: "الانجليزية",          en: "English"} ),
            ])
        }
    }

    //---------------------
    //  editor_lang_id()
    //---------------------      
    pub fn editor_lang_id(
        &mut self,
        id: &'a str
    ) {
        self.editor_lang = id;
    }

    //---------------------
    //  get()
    //---------------------      
    pub fn get(
        &self,
        item_id: &'a str,
    ) -> &'a str {
        match self.editor_lang {
            "ar" => self.dictionary.get(item_id).unwrap().ar,
            "en" => self.dictionary.get(item_id).unwrap().en,
            _ => panic!()
        }   
    }

    //---------------------
    //  short_name_key()
    //  short_name()
    //---------------------      
    pub fn short_name_key(&self) -> &'a str { SHORT_NAME }
    pub fn short_name(&self) -> &'a str { self.get(SHORT_NAME) }

    //---------------------
    //  long_name_key()
    //  long_name()
    //---------------------      
    pub fn long_name_key(&self) -> &'a str {LONG_NAME}    
    pub fn long_name(&self) -> &'a str { self.get(LONG_NAME) }    

    //---------------------
    //  file_key()
    //  file()
    //---------------------      
    pub fn file_key(&self) -> &'a str {FILE}    
    pub fn file(&self) -> &'a str { self.get(FILE) }    

    //---------------------
    //  edit_key()
    //  edit()
    //---------------------      
    pub fn edit_key(&self) -> &'a str {EDIT}    
    pub fn edit(&self) -> &'a str { self.get(EDIT) }       

    //---------------------
    //  preferences_key()    
    //  preferences()
    //---------------------      
    pub fn preferences_key(&self) -> &'a str {PREFERENCES}
    pub fn preferences(&self) -> &'a str { self.get(PREFERENCES) }

    //---------------------
    //  project_key()    
    //  project()
    //---------------------      
    pub fn project_key(&self) -> &'a str {PROJECT}
    pub fn project(&self) -> &'a str { self.get(PROJECT) }

    //---------------------
    //  new_project_key()    
    //  new_project()
    //---------------------      
    pub fn new_project_key(&self) -> &'a str {NEW_PROJECT}
    pub fn new_project(&self) -> &'a str { self.get(NEW_PROJECT) }

    //---------------------
    //  open_project_key()    
    //  open_project()
    //---------------------      
    pub fn open_project_key(&self) -> &'a str {OPEN_PROJECT}
    pub fn open_project(&self) -> &'a str { self.get(OPEN_PROJECT) }

    //---------------------
    //  close_project_key()    
    //  close_project()
    //---------------------      
    pub fn close_project_key(&self) -> &'a str {CLOSE_PROJECT}
    pub fn close_project(&self) -> &'a str { self.get(CLOSE_PROJECT) }


    //---------------------
    //  save_key()    
    //  save()
    //---------------------      
    pub fn save_key(&self) -> &'a str {SAVE}
    pub fn save(&self) -> &'a str { self.get(SAVE) }

    //---------------------
    //  compile_key()    
    //  compile()
    //---------------------      
    pub fn compile_key(&self) -> &'a str {COMPILE}
    pub fn compile(&self) -> &'a str { self.get(COMPILE) }

    //---------------------
    //  build_key()    
    //  build()
    //---------------------      
    pub fn build_key(&self) -> &'a str {BUILD}
    pub fn build(&self) -> &'a str { self.get(BUILD) }

    //---------------------
    //  run_key()    
    //  run()
    //---------------------      
    pub fn run_key(&self) -> &'a str {RUN}
    pub fn run(&self) -> &'a str { self.get(RUN) }                        

    //---------------------
    //  terminate_key()    
    //  terminate()
    //---------------------      
    pub fn terminate_key(&self) -> &'a str {TERMINATE}         
    pub fn terminate(&self) -> &'a str { self.get(TERMINATE) }     

    //---------------------
    //  theme_key()    
    //  theme()
    //---------------------      
    pub fn theme_key(&self) -> &'a str {THEME}         
    pub fn theme(&self) -> &'a str { self.get(THEME) }     

    //---------------------
    //  theme_default_key()    
    //  theme_default()
    //---------------------      
    pub fn theme_default_key(&self) -> &'a str {THEME_DEFAULT}         
    pub fn theme_default(&self) -> &'a str { self.get(THEME_DEFAULT) }     

    //---------------------
    //  theme_colorforth_key()    
    //  theme_colorforth()
    //---------------------      
    pub fn theme_colorforth_key(&self) -> &'a str {THEME_COLORFORTH}                 
    pub fn theme_colorforth(&self) -> &'a str { self.get(THEME_COLORFORTH) }      

    //---------------------
    //  theme_eclipse_key()    
    //  theme_eclipse()
    //---------------------      
    pub fn theme_eclipse_key(&self) -> &'a str {THEME_ECLIPSE}                 
    pub fn theme_eclipse(&self) -> &'a str { self.get(THEME_ECLIPSE) }        


    //---------------------
    //  theme_idea_key()    
    //  theme_idea()
    //---------------------      
    pub fn theme_idea_key(&self) -> &'a str {THEME_IDEA}                 
    pub fn theme_idea(&self) -> &'a str { self.get(THEME_IDEA) }        

    //---------------------
    //  theme_monokai_key()    
    //  theme_monokai()
    //---------------------      
    pub fn theme_monokai_key(&self) -> &'a str {THEME_MONOKAI}                 
    pub fn theme_monokai(&self) -> &'a str { self.get(THEME_MONOKAI) }             


    //---------------------
    //  theme_night_key()    
    //  theme_night()
    //---------------------      
    pub fn theme_night_key(&self) -> &'a str {THEME_NIGHT}                 
    pub fn theme_night(&self) -> &'a str { self.get(THEME_NIGHT) }        



    //---------------------
    //  theme_solarized_light_key()    
    //  theme_solarized_light()
    //---------------------      
    pub fn theme_solarized_light_key(&self) -> &'a str {THEME_SOLARIZED_LIGHT}                 
    pub fn theme_solarized_light(&self) -> &'a str { self.get(THEME_SOLARIZED_LIGHT) }        



    //---------------------
    //  theme_the_matrix_key()    
    //  theme_the_matrix()
    //---------------------      
    pub fn theme_the_matrix_key(&self) -> &'a str {THEME_THE_MATRIX}                 
    pub fn theme_the_matrix(&self) -> &'a str { self.get(THEME_THE_MATRIX) }        

    //---------------------
    //  lang_key()    
    //  lang()
    //---------------------      
    pub fn lang_key(&self) -> &'a str {LANG}                 
    pub fn lang(&self) -> &'a str { self.get(LANG) }             

    //---------------------
    //  lang_ar_key()    
    //  lang_ar()
    //---------------------      
    pub fn lang_a_key(&self) -> &'a str {LANG_AR}                     
    pub fn lang_ar(&self) -> &'a str { self.get(LANG_AR) }                 

    //---------------------
    //  lang_en_key()    
    //  lang_en()
    //---------------------      
    pub fn lang_en_key(&self) -> &'a str { LANG_EN }          
    pub fn lang_en(&self) -> &'a str { self.get(LANG_EN) }                     
}