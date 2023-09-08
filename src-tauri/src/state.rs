use std::{
    path::PathBuf, 
    process::Child,
    // sync::{Arc, Mutex, Condvar},
    sync::Mutex
};


//================
//   TranslationsState
//================
pub struct TranslationsState<'a>(pub crate::labels::Labels<'a>);


//================
//   LangState
//================
pub struct LangState(pub Mutex<seen_compiler::lang::Lang>);

//================
//   ThemeState
//================
pub struct ThemeState(pub Mutex<String>);

//================
//   HomeDirState
//================
pub struct HomeDirState(pub Option<PathBuf>);

//================
//   ProcState
//================
// pub struct ProcState(pub Mutex<Option<Arc<(Mutex<bool>, Condvar)>>>);
pub struct ProcState(pub Mutex<Option<Child>>);