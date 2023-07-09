use crate::{error::RoleManError, CmdContext, CmdResult};
use poise::serenity_prelude::{self as serenity, CacheHttp};
use std::time::Duration;
use tracing::{debug, warn};

/// Adds a role to the list of self-assignable roles
#[poise::command(slash_command, guild_only, required_permissions = "MANAGE_ROLES")]
pub async fn add_role_to_list(
    ctx: CmdContext<'_>,
    #[description = "Adds a role to the selfrole list"] role: serenity::Role,
) -> CmdResult<()> {
    let max_role;
    if let Some(author) = ctx.author_member().await {
        max_role = author
            .highest_role_info(ctx)
            .unwrap_or((serenity::RoleId::default(), 0));
    } else {
        return Err(Box::new(RoleManError::APIFetchError(String::from(
            "User profile",
        ))));
    }

    if role.position > max_role.1 {
        return Err(Box::new(RoleManError::PermissionsError(String::from(
            "Can't add a role higher than your own",
        ))));
    }

    let response: String;
    // Mutex Lock scope.
    {
        let mut guild_roles_map = match ctx.data().allowed_roles.lock() {
            Ok(r) => r,
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
        let mut roles = match guild_roles_map.get(&guild_id) {
            Some(r) => r.clone(),
            None => Vec::new(),
        };
        roles.push(crate::RoleInfo {
            id: role.id.into(),
            name: role.name,
        });
        roles.sort();
        roles.dedup();
        guild_roles_map.insert(guild_id, roles);

        response = format!("Added <@&{}> to the list", role.id);
    }
    ctx.say(response).await?;
    Ok(())
}

/// Gets the list of self-assignable roles
#[poise::command(slash_command, guild_only)]
pub async fn get_role_list(ctx: CmdContext<'_>) -> CmdResult<()> {
    let response: String;
    // Mutex Lock scope.
    {
        let guild_roles_map = match ctx.data().allowed_roles.lock() {
            Ok(r) => r,
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
        let rolelist = guild_roles_map
            .get(&guild_id)
            .unwrap_or(&Vec::new())
            .clone();
        let rolestrings = rolelist.iter().map(|s| format!("<@&{}>, ", s.id));
        response = format!(
            "The following roles are available: {}",
            rolestrings.fold(String::new(), |s, e| format!("{}{} ", s, e))
        );
    };
    ctx.say(response).await?;
    Ok(())
}

pub fn id_filter(
    cci: serenity::CollectComponentInteraction,
    ids: Vec<u64>,
) -> serenity::CollectComponentInteraction {
    cci.filter(move |mci| ids.contains(&mci.data.custom_id.parse().unwrap_or(0)))
}
pub async fn role_menu_internal(ctx: CmdContext<'_>) -> CmdResult<()> {
    let rolelist;
    // Mutex lock scope
    {
        let guild_roles_map = match ctx.data().allowed_roles.lock() {
            Ok(r) => r,
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
        rolelist = guild_roles_map
            .get(&guild_id)
            .unwrap_or(&Vec::new())
            .clone();
    };
    let rolelist_copy = rolelist.clone();
    let rolelist = rolelist.iter();

    ctx.send(|msg| {
        msg.content("> Select a role...");
        msg.components(|c| {
            c.create_action_row(|a| {
                rolelist.for_each(|role| {
                    a.create_button(|b| {
                        b.custom_id(role.id)
                            .label(format!("{}", role.name))
                            .style(serenity::ButtonStyle::Primary)
                    });
                });
                a
            })
        })
    })
    .await?;

    let ids: Vec<u64> = rolelist_copy.clone().iter().map(|r| r.id).collect();

    while let Some(mci) = id_filter(
        serenity::CollectComponentInteraction::new(ctx.serenity_context())
            .channel_id(ctx.channel_id()),
        ids.clone(),
    )
    .await
    {
        debug!("Button Pressed!");
        let role_id: serenity::RoleId = mci.data.custom_id.parse()?;
        if !(ids.contains(&role_id.0)) {
            warn!("Role ID issue: \n{:?}\n{:?}", role_id, ids);
            continue;
        }
        let mut member = ctx
            .guild()
            .unwrap()
            .member(ctx.http(), ctx.author().id)
            .await?;

        if member
            .roles(ctx)
            .unwrap_or(vec![])
            .iter()
            .map(|x| x.id)
            .collect::<Vec<serenity::RoleId>>()
            .contains(&role_id)
        {
            debug!("Removing");
            member.remove_role(ctx, role_id).await?;
            let msg = mci.message.clone();
            let _reply = msg
                .reply(
                    ctx,
                    format!("Removed <@&{}> from <@{}>", role_id, member.user.id),
                )
                .await?;
            mci.create_interaction_response(ctx, |i| {
                i.kind(serenity::InteractionResponseType::DeferredUpdateMessage)
            })
            .await?;
        } else {
            debug!("Adding");
            member.add_role(ctx, role_id).await?;
            let msg = mci.message.clone();
            let _reply = msg
                .reply(
                    ctx,
                    format!("Added <@&{}> to <@{}>", role_id, member.user.id),
                )
                .await?;
            mci.create_interaction_response(ctx, |i| {
                i.kind(serenity::InteractionResponseType::DeferredUpdateMessage)
            })
            .await?;
        }
    }

    Ok(())
}
pub async fn cleanup(ctx: impl serenity::CacheHttp, reply: serenity::Message) -> CmdResult<()> {
    tokio::time::sleep(Duration::from_secs(3)).await;
    reply.delete(ctx).await?;
    Ok(())
}
/// Bring up the menu of roles.
#[poise::command(guild_only, slash_command)]
pub async fn role_menu(ctx: CmdContext<'_>) -> CmdResult<()> {
    role_menu_internal(ctx).await
}
#[poise::command(guild_only, context_menu_command = "Get a role!")]
pub async fn role_menu_context_user(ctx: CmdContext<'_>, _msg: serenity::User) -> CmdResult<()> {
    role_menu_internal(ctx).await
}
