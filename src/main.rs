use std::collections::HashMap;

use poise::serenity_prelude as serenity;
use roleman::{commands, config, Data};
use tracing::{error, info};
use tracing_subscriber;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let config =
        config::Config::read_from_file("config.toml".into()).expect("Can't read your config.");
    let framework = poise::Framework::builder()
        .options(poise::FrameworkOptions {
            commands: vec![
                commands::misc::ping(),
                commands::role::add_role_to_list(),
                commands::role::get_role_list(),
                commands::role::role_menu(),
                commands::role::role_menu_context_user(),
            ],
            on_error: |error| {
                Box::pin(async move {
                    if let Err(e) = poise::builtins::on_error(error).await {
                        error!("Error while handling error: {}", e);
                    }
                })
            },
            ..Default::default()
        })
        .token(config.discord.token)
        .intents(serenity::GatewayIntents::non_privileged())
        .setup(move |ctx, _ready, framework| {
            Box::pin(async move {
                if config.test.testing {
                    let guild_id = serenity::GuildId::from(config.test.test_guild_id);
                    info!("Testing mode!, registering in {}", guild_id);
                    poise::builtins::register_in_guild(
                        ctx,
                        &framework.options().commands,
                        guild_id,
                    )
                    .await?;
                } else {
                    info!("Registering Commands...");
                    poise::builtins::register_globally(ctx, &framework.options().commands).await?;
                }
                info!("Logged in as: {}", _ready.user.name);
                let map: HashMap<serenity::GuildId, Vec<roleman::RoleInfo>> = HashMap::new();
                Ok(Data {
                    allowed_roles: std::sync::Mutex::new(map),
                })
            })
        });

    framework.run().await.unwrap();
}
