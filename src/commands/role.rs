use crate::{error::RoleManError, CmdContext, CmdResult};
use poise::serenity_prelude as serenity;
use tracing::info;

#[derive(Debug, poise::Modal)]
#[allow(dead_code)]
struct RoleAddModal {
    role: String,
}

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

    info!("{:?}", ctx.data());
    let response: String;
    // Mutex Lock scope.
    {
        let mut guild_roles_map = match ctx.data().allowed_roles.lock() {
            Ok(r) => r,
            Err(_) => return Err(Box::new(RoleManError::DataError)),
        };
        info!("{:?}", guild_roles_map);
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
        info!("{:?}", roles);
        roles.push(crate::RoleInfo {
            id: role.id.into(),
            name: role.name,
        });
        roles.sort();
        roles.dedup();
        info!("{:?}", roles);
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
        msg.content("Pick your roles: ");
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
    loop {
        let id_i = ids.clone();
        match serenity::CollectComponentInteraction::new(ctx.serenity_context())
            .filter(move |mci| {
                id_i.iter()
                    .fold(false, |b, i| b | (i.to_string() == mci.data.custom_id))
            })
            .await
        {
            Some(mci) => {
                assign_role_to_user(
                    ctx,
                    serenity::RoleId::from((mci.data.custom_id).parse::<u64>()?),
                    match ctx.author_member().await {
                        Some(m) => m.into_owned(),
                        None => {
                            break;
                        }
                    },
                )
                .await?;
                mci.create_followup_message(ctx, |m| {
                    m.content(format!("Added <@&{}>", mci.data.custom_id))
                })
                .await?;
            }
            None => {
                break;
            }
        };
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

pub async fn assign_role_to_user(
    ctx: CmdContext<'_>,
    id: serenity::RoleId,
    mut user: serenity::Member,
) -> CmdResult<()> {
    user.add_role(ctx, id).await?;
    ctx.say(format!("Added <@&{}>", id)).await?;
    Ok(())
}
