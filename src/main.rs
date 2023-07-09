use std::collections::HashMap;
use std::time::Duration;

use poise::serenity_prelude as serenity;
use roleman::{commands, config, Data};
use tracing::{debug, error, info};
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
                commands::role::remove_role_from_list(),
                commands::role::get_role_list(),
                commands::role::clear_role_list(),
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
            event_handler: move |ctx, event, framework, _data| {
                let handle = match event {
                    poise::Event::Message { new_message } => {
                        if new_message.author.id == framework.bot_id
                            && !(new_message.content.contains("Select a role..."))
                        {
                            debug!("Message Event: {:?}", new_message);
                            tokio::spawn(roleman::cleanup(ctx.http.clone(), new_message.to_owned()))
                        } else {
                            tokio::spawn(async {
                                tokio::time::sleep(Duration::from_secs(0)).await;
                                Ok(())
                            })
                        }
                    }
                    _ => tokio::spawn(async {
                        tokio::time::sleep(Duration::from_secs(0)).await;
                        Ok(())
                    }),
                };
                handle.is_finished();
                Box::pin(async move { Ok(()) })
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
                let rolemap: HashMap<serenity::GuildId, roleman::RoleInfo> = HashMap::new();
                let menumap: HashMap<serenity::GuildId, Option<roleman::MessageInfo>> =
                    HashMap::new();
                Ok(Data {
                    allowed_roles: std::sync::Mutex::new(rolemap),
                    active_menus: std::sync::Mutex::new(menumap),
                })
            })
        });

    framework.run().await.unwrap();
}
