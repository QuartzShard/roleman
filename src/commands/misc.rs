use crate::{CmdContext, CmdResult};

use poise::serenity_prelude as serenity;

/// Pong!
#[poise::command(slash_command)]
pub async fn ping(ctx: CmdContext<'_>) -> CmdResult<()> {
    let response = format!("Pong!");
    ctx.say(response).await?;
    Ok(())
}

#[poise::command(context_menu_command = "Test", slash_command)]
pub async fn test(
    _ctx: CmdContext<'_>,
    #[description = "Message to echo (enter a link or ID)"] _msg: serenity::Message,
) -> CmdResult<()> {
    Ok(())
}
