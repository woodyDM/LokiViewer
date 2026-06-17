use std::sync::Mutex;
use tokio::sync::oneshot;

use crate::loki::error::CommandError;

pub struct QueryControl {
    cancel: Mutex<Option<oneshot::Sender<()>>>,
}

impl QueryControl {
    pub fn new() -> Self {
        Self {
            cancel: Mutex::new(None),
        }
    }

    /// Register a new cancellation channel, returns the receiver half.
    /// Call this before starting a query.
    pub fn register(&self) -> oneshot::Receiver<()> {
        let (tx, rx) = oneshot::channel();
        *self.cancel.lock().unwrap() = Some(tx);
        rx
    }

    /// Send the cancellation signal. Does nothing if no query is running.
    pub fn abort(&self) {
        if let Some(sender) = self.cancel.lock().unwrap().take() {
            let _ = sender.send(());
        }
    }
}

#[tauri::command]
pub async fn cancel_query(
    control: tauri::State<'_, QueryControl>,
) -> Result<(), CommandError> {
    control.abort();
    Ok(())
}
