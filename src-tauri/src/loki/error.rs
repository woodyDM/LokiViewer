use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum LokiError {
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Invalid URL: {0}")]
    InvalidUrl(String),

    #[error("Source not found: {0}")]
    SourceNotFound(String),

    #[error("Connection refused: {0}")]
    ConnectionRefused(String),

    #[error("Loki API error: {status} - {message}")]
    ApiError { status: u16, message: String },

    #[error("Timeout")]
    Timeout,

    #[error("Config error: {0}")]
    Config(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

#[derive(Debug, Clone, Serialize)]
pub struct CommandError {
    pub kind: String,
    pub message: String,
}

impl From<LokiError> for CommandError {
    fn from(e: LokiError) -> Self {
        let kind = match &e {
            LokiError::Http(_) => "http",
            LokiError::InvalidUrl(_) => "invalid_url",
            LokiError::SourceNotFound(_) => "source_not_found",
            LokiError::ConnectionRefused(_) => "connection_refused",
            LokiError::ApiError { .. } => "api_error",
            LokiError::Timeout => "timeout",
            LokiError::Config(_) => "config",
            LokiError::Serialization(_) => "serialization",
        };
        CommandError {
            kind: kind.to_string(),
            message: e.to_string(),
        }
    }
}

impl From<LokiError> for String {
    fn from(e: LokiError) -> String {
        e.to_string()
    }
}
