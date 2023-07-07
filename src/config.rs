use std::fs;

use poise::serenity_prelude::TypeMapKey;
use serde_derive::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Config {
    #[serde(default)]
    pub discord: Discord,
    #[serde(default)]
    pub about: About,
    #[serde(default)]
    pub test: Test,
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Discord {
    #[serde(default)]
    pub token: String,
    #[serde(default)]
    pub intents: Intents,
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Intents {
    pub members: bool,
    pub guilds: bool,
    pub reactions: bool,
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct About {
    pub title: String,
    pub description: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct Test {
    pub test_guild_id: u64,
    pub testing: bool,
}

impl Config {
    pub fn read_from_file(name: String) -> Option<Self> {
        let unparsed = match fs::read_to_string(name) {
            Err(error) => {
                println!("{:?}", error);
                return None;
            }
            Ok(read) => read,
        };
        let config = match toml::from_str::<Config>(&unparsed) {
            Ok(parsed) => parsed,
            Err(error) => {
                println!("{:?}", error);
                return None;
            }
        };
        Some(config)
    }
}

pub struct TestGuildID;
impl TypeMapKey for TestGuildID {
    type Value = u64;
}
