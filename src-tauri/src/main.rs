// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#![allow(warnings)]

mod editor;
mod labels;
mod menu;
mod commands;
mod state;

use seen_compiler::{
    self,
    util::cli::{
        self,
    },
};


//================
//   main()
//================
fn main() {

    env_logger::init();
	let cli = cli::Cli::new();

	match cli.command {
		Some(cli::Commands::New(cli::New{ar, name, template})) => {  
			if let Err(err) = cli::New::exec(ar, name, None, template){ 
				eprintln!("{}", err);
			} 
		},
		Some(cli::Commands::Init(cli::Init{ar, template})) => { 
			if let Err(err) = cli::Init::exec(ar, None, template) {
				eprintln!("{}", err);
			} 
		},
		Some(cli::Commands::Compile(cli::Compile{})) => cli::Compile::exec(None),
		Some(cli::Commands::Build(cli::Build{})) => { let _ = cli::Build::exec(None, false); },
		Some(cli::Commands::Run(cli::Run{})) => { let _ = cli::Run::exec(None, false); },	
		Some(cli::Commands::Clean(cli::Clean{})) => todo!(),
		Some(cli::Commands::Update(cli::Update{})) => todo!(),
		Some(cli::Commands::Check(cli::Check{})) => todo!(),
		Some(cli::Commands::Editor(cli::Editor{ar, path})) => editor::startup( ar, &path),
		None => cli::Cli::print_help()
	}

}