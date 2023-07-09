use crate::{CmdContext, CmdResult};

/// Pong
#[poise::command(slash_command)]
pub async fn ping(ctx: CmdContext<'_>) -> CmdResult<()> {
    let response = format!("Pong!");
    ctx.say(response).await?;
    Ok(())
}

#[poise::command(slash_command)]
pub async fn test(_ctx: CmdContext<'_>) -> CmdResult<()> {
    Ok(())
}
