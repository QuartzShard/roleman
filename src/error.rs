#[derive(Debug)]
pub enum RoleManError {
    PermissionsError(String),
    FailedToExecute,
    APIFetchError(String),
    DataError,
}

impl std::error::Error for RoleManError {}

impl std::fmt::Display for RoleManError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            match self {
                RoleManError::PermissionsError(s) => format!("PermissionsError: {}", s),
                RoleManError::FailedToExecute => format!("Encountered a runtime error."),
                RoleManError::APIFetchError(s) => format!("Couldn't retrieve data: {}", s),
                RoleManError::DataError => format!("Couldn't fetch guild data."),
            }
        )
    }
}
