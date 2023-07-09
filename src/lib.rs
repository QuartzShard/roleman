pub mod commands;
pub mod config;
pub mod error;
use crate::error::RoleManError;
use poise::serenity_prelude::{self as serenity, CacheHttp};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Duration;
use tracing::info;

#[derive(Debug)]
pub struct Data {
    pub allowed_roles: Mutex<HashMap<serenity::GuildId, RoleInfo>>,
    pub active_menus: Mutex<HashMap<serenity::GuildId, Option<MessageInfo>>>,
}
pub type RoleInfo = HashMap<serenity::RoleId, String>;

#[derive(Debug, Clone, PartialEq, Ord, PartialOrd, Eq)]
pub struct MessageInfo {
    guild_id: Option<serenity::GuildId>,
    channel_id: serenity::ChannelId,
    message_id: serenity::MessageId,
}

type CmdError = Box<dyn std::error::Error + Send + Sync>;
type CmdResult<T> = Result<T, CmdError>;
type Context<'a, U, E> = poise::Context<'a, U, E>;
type CmdContext<'a> = Context<'a, Data, CmdError>;

pub async fn clear_menu(ctx: CmdContext<'_>) -> CmdResult<()> {
    let menu;
    // Mutex lock scope
    {
        let mut guild_menus_map = match ctx.data().active_menus.lock() {
            Ok(m) => m,
            Err(_) => return Err(Box::new(RoleManError::DataError)),
        };
        let guild_id = match ctx.guild_id() {
            Some(id) => id,
            None => {
                return Err(Box::new(RoleManError::APIFetchError(String::from(
                    "GuildID",
                ))))
            }
        };
        let borrowed_none = &None;
        menu = guild_menus_map
            .get(&guild_id)
            .unwrap_or(borrowed_none)
            .clone();
        guild_menus_map.remove(&guild_id);
    }
    let message = match menu {
        Some(m) => Some(
            ctx.cache()
                .unwrap()
                .guild_channel(m.channel_id)
                .unwrap()
                .message(ctx, m.message_id)
                .await?,
        ),
        None => None,
    };
    info!("{:?}", message);
    match message {
        None => (),
        Some(m) => {
            m.delete(ctx).await?;
        }
    };

    Ok(())
}

pub async fn cleanup(ctx: impl serenity::CacheHttp, reply: serenity::Message) -> CmdResult<()> {
    tokio::time::sleep(Duration::from_secs(3)).await;
    reply.delete(ctx).await?;
    Ok(())
}
