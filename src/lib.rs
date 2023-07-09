pub mod commands;
pub mod config;
pub mod error;

use poise::serenity_prelude as serenity;
use std::collections::HashMap;
use std::sync::Mutex;

#[derive(Debug)]
pub struct Data {
    pub allowed_roles: Mutex<HashMap<serenity::GuildId, Vec<RoleInfo>>>,
}
#[derive(Debug, Clone, PartialEq, Ord, PartialOrd, Eq)]
pub struct RoleInfo {
    id: u64,
    name: String,
}

type CmdError = Box<dyn std::error::Error + Send + Sync>;
type CmdResult<T> = Result<T, CmdError>;
type Context<'a, U, E> = poise::Context<'a, U, E>;
type CmdContext<'a> = Context<'a, Data, CmdError>;
