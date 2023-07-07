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
    ctx: CmdContext<'_>,
    #[description = "Message to echo (enter a link or ID)"] _msg: serenity::Message,
) -> CmdResult<()> {
    ctx.send(|m| {
        m.content("Button!");
        m.components(|c| {
            c.create_action_row(|a| {
                a.create_button(|b| {
                    b.custom_id("test_button")
                        .label("Button!")
                        .style(serenity::ButtonStyle::Success)
                })
            })
        })
    })
    .await?;
    while let Some(mci) = serenity::CollectComponentInteraction::new(ctx.serenity_context())
        .timeout(std::time::Duration::from_secs(60))
        .filter(move |mci| mci.data.custom_id == "test_button")
        .await
    {
        let data =
            crate::execute_modal_on_component_interaction::<MyModal>(ctx, mci, None, None).await?;
        println!("Got data: {:?}", data);
    }
    Ok(())
}
#[derive(Debug, poise::Modal)]
#[allow(dead_code)] // fields only used for Debug print
struct MyModal {
    first_input: String,
    second_input: Option<String>,
}
