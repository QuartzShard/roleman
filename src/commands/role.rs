use crate::{clear_menu, error::RoleManError, CmdContext, CmdResult};
use poise::serenity_prelude::{self as serenity, CacheHttp};
use std::collections::HashMap;
use tracing::{debug, warn};

/// Adds a role to the list of self-assignable roles
#[poise::command(slash_command, guild_only, required_permissions = "MANAGE_ROLES")]
pub async fn add_role_to_list(
    ctx: CmdContext<'_>,
    #[description = "Adds a role to the selfrole list"] role: serenity::Role,
) -> CmdResult<()> {
    clear_menu(ctx).await.ok();
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
            None => HashMap::new(),
        };
        response = format!("Added `@{}` to the list", &role.name);
        roles.insert(role.id, role.name);
        guild_roles_map.insert(guild_id, roles);
    }
    ctx.say(response).await?;
    Ok(())
}

/// Removes a role from the list of self-assignable roles
#[poise::command(slash_command, guild_only, required_permissions = "MANAGE_ROLES")]
pub async fn remove_role_from_list(
    ctx: CmdContext<'_>,
    #[description = "Removes a role from the selfrole list"] role: serenity::Role,
) -> CmdResult<()> {
    clear_menu(ctx).await.ok();
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
            "Can't edit a role higher than your own",
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
            None => HashMap::new(),
        };
        response = format!("Removing `@{}` from the list", &role.name);
        roles.remove(&role.id);
        guild_roles_map.insert(guild_id, roles);
    }
    ctx.say(response).await?;
    Ok(())
}

/// Clears the role list
#[poise::command(slash_command, guild_only, required_permissions = "MANAGE_ROLES")]
pub async fn clear_role_list(ctx: CmdContext<'_>) -> CmdResult<()> {
    clear_menu(ctx).await.ok();
    let response: String;
    // Mutex lock scope
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
        guild_roles_map.remove(&guild_id);
    };
    response = format!("Cleared the role list.");
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
            .unwrap_or(&HashMap::new())
            .clone();
        let roles_string = rolelist
            .iter()
            .map(|s| format!("{}, ", s.1))
            .fold(String::new(), |s, e| format!("{}{} ", s, e));
        if roles_string.len() < 1 {
            response = format!("No roles are currently available")
        } else {
            response = format!("The following roles are available: {}", roles_string);
        }
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
            .unwrap_or(&HashMap::new())
            .clone();
    };
    if rolelist.len() == 0 {
        ctx.say("No roles available.").await?;
        return Ok(());
    }
    let rolelist_copy = rolelist.clone();
    let rolelist = rolelist.iter();

    clear_menu(ctx).await.ok();
    let handle = ctx
        .send(|msg| {
            msg.content("> Select a role...");
            msg.components(|c| {
                c.create_action_row(|a| {
                    rolelist.for_each(|role| {
                        a.create_button(|b| {
                            b.custom_id(role.0)
                                .label(format!("{}", role.1))
                                .style(serenity::ButtonStyle::Primary)
                        });
                    });
                    a
                })
            })
        })
        .await?;
    let menu_msg = handle.message().await?.clone();
    // Mutex scope 2, electric boogaloo!
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
        guild_menus_map.insert(
            guild_id,
            Some(crate::MessageInfo {
                guild_id: menu_msg.guild_id,
                channel_id: menu_msg.channel_id,
                message_id: menu_msg.id,
            }),
        );
    }
    let ids: Vec<u64> = rolelist_copy.clone().iter().map(|r| r.0 .0).collect();

    while let Some(mci) = id_filter(
        serenity::CollectComponentInteraction::new(ctx.serenity_context())
            .channel_id(ctx.channel_id()),
        ids.clone(),
    )
    .await
    {
        debug!("Button Pressed!");
        let role_id: serenity::RoleId = mci.data.custom_id.parse()?;
        let borrowed_string = &String::new();
        let role_name = rolelist_copy.get(&role_id).unwrap_or(borrowed_string);
        if !(ids.contains(&role_id.0)) {
            warn!("Role ID issue: \n{:?}\n{:?}", role_id, ids);
            continue;
        }
        let mut member = match mci.member.clone() {
            Some(m) => m,
            None => {
                return Err(Box::new(RoleManError::APIFetchError(String::from(
                    "Can't get interaction user",
                ))))
            }
        };

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
                    format!("Removed `@{}` from <@{}>", role_name, member.user.id),
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
                    format!("Added `@{}` to <@{}>", role_name, member.user.id),
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
/// Bring up the menu of roles.
#[poise::command(guild_only, slash_command)]
pub async fn role_menu(ctx: CmdContext<'_>) -> CmdResult<()> {
    role_menu_internal(ctx).await
}
#[poise::command(guild_only, context_menu_command = "Get a role!")]
pub async fn role_menu_context_user(ctx: CmdContext<'_>, _msg: serenity::User) -> CmdResult<()> {
    role_menu_internal(ctx).await
}
