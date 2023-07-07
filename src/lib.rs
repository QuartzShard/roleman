pub mod commands;
pub mod config;
pub mod error;

use poise::serenity_prelude as serenity;
use poise::Modal;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

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

pub async fn execute_modal_on_component_interaction<'a, M: Modal>(
    ctx: CmdContext<'a>,
    interaction: Arc<serenity::MessageComponentInteraction>,
    defaults: Option<M>,
    timeout: Option<std::time::Duration>,
) -> Result<Option<M>, serenity::Error> {
    execute_modal_generic(
        ctx.serenity_context(),
        |resp| {
            interaction.create_interaction_response(ctx.serenity_context(), |b| {
                *b = resp;
                b
            })
        },
        interaction.id.to_string(),
        defaults,
        timeout,
    )
    .await
}

async fn execute_modal_generic<
    M: Modal,
    F: std::future::Future<Output = Result<(), serenity::Error>>,
>(
    ctx: &serenity::Context,
    create_interaction_response: impl FnOnce(serenity::CreateInteractionResponse<'static>) -> F,
    modal_custom_id: String,
    defaults: Option<M>,
    timeout: Option<std::time::Duration>,
) -> Result<Option<M>, serenity::Error> {
    // Send modal
    create_interaction_response(M::create(defaults, modal_custom_id.clone())).await?;

    // Wait for user to submit
    let response = serenity::CollectModalInteraction::new(&ctx.shard)
        .filter(move |d| d.data.custom_id == modal_custom_id)
        .timeout(timeout.unwrap_or(std::time::Duration::from_secs(3600)))
        .await;
    let response = match response {
        Some(x) => x,
        None => return Ok(None),
    };

    // Send acknowledgement so that the pop-up is closed
    response
        .create_interaction_response(ctx, |b| {
            b.kind(serenity::InteractionResponseType::DeferredUpdateMessage)
        })
        .await?;

    Ok(Some(
        M::parse(response.data.clone()).map_err(serenity::Error::Other)?,
    ))
}

pub async fn execute_modal<U: Send + Sync, E, M: Modal>(
    ctx: poise::ApplicationContext<'_, U, E>,
    defaults: Option<M>,
    timeout: Option<std::time::Duration>,
) -> Result<Option<M>, serenity::Error> {
    let interaction = ctx.interaction.unwrap();
    let response = execute_modal_generic(
        ctx.serenity_context,
        |resp| {
            interaction.create_interaction_response(ctx.serenity_context(), |b| {
                *b = resp;
                b
            })
        },
        interaction.id.to_string(),
        defaults,
        timeout,
    )
    .await?;
    ctx.has_sent_initial_response
        .store(true, std::sync::atomic::Ordering::SeqCst);
    Ok(response)
}
