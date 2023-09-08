
// use std::{
// 	fs, 
// 	path::PathBuf,
// 	process::Child,
// };

use clap::{
	Parser,
	Subcommand,
  	CommandFactory
};

// use crate::{
// 	lang::{
// 		Lang,
// 		compiler,
// 		syntax_tree::ast::{
// 			ModElement,
// 			Fn,
// 			StructLiteral,
// 			Expr,
// 			BlockElement
// 		}
// 	}, 
// 	transl, 
// 	project::ProjSettings
// };

// use crate::project::{
// 	proj_dir,
// 	conf,
// 	src,
// 	build
// };

// use crate::transl::transl::Transl;

// use crate::tool::{
// 	cargo::*,
// 	npx::NPX
// };


//================
//   Cli
//================
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
pub struct Cli {
    /// Set language to Arabic
    #[arg(long)]
    pub ar: bool,

	/// Launch the editor and open the project at the specified path
	///	e.g:
	///		`seen editor .` will open the project in the current directory
	pub path: Option<String>,

}

impl Cli {
    //---------------------
    //  new()
    //---------------------  	
    pub fn new() -> Self {
        Self::parse()        
    }
    //---------------------
    //  print_help()
    //---------------------    
    pub fn print_help() {
        let _ = Cli::command().print_help();
    }
}

// //================
// //   Cli
// //================
// #[derive(Parser, Debug)]
// #[command(author, version, about, long_about = None)]
// pub struct Cli {
//     #[command(subcommand)]
//     pub command: Option<Commands>,
// }

// impl Cli {
//     //---------------------
//     //  new()
//     //---------------------  	
//     pub fn new() -> Self {
//         Self::parse()        
//     }
//     //---------------------
//     //  print_help()
//     //---------------------    
//     pub fn print_help() {
//         let _ = Cli::command().print_help();
//     }
// }