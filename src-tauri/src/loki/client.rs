use std::time::Duration;

use super::error::LokiError;
use super::types::*;

#[derive(Clone)]
pub struct LokiClient {
    client: reqwest::Client,
}

impl LokiClient {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .gzip(true)
            .connect_timeout(Duration::from_secs(10))
            .timeout(Duration::from_secs(60))
            .build()
            .expect("Failed to create HTTP client");
        Self { client }
    }

    fn build_get(
        &self,
        source: &LokiSource,
        path: &str,
    ) -> Result<reqwest::RequestBuilder, LokiError> {
        let base = source.url.trim_end_matches('/');
        let url = format!("{}{}", base, path);
        let parsed = url::Url::parse(&url).map_err(|_| LokiError::InvalidUrl(url.clone()))?;

        let mut req = self.client.get(parsed);
        if let Some(auth) = &source.auth {
            req = req.basic_auth(&auth.username, Some(&auth.password));
        }
        if let Some(tenant) = &source.tenant_id {
            if !tenant.is_empty() {
                req = req.header("X-Scope-OrgID", tenant);
            }
        }
        Ok(req)
    }

    // --- Health check ---

    pub async fn health_check(&self, source: &LokiSource) -> Result<bool, LokiError> {
        let req = self.build_get(source, "/ready")?;
        let resp = req.send().await?;
        Ok(resp.status().is_success())
    }

    // --- Query Range ---

    pub async fn query_range(
        &self,
        source: &LokiSource,
        params: &QueryRequest,
    ) -> Result<QueryResult, LokiError> {
        let mut req = self.build_get(source, "/loki/api/v1/query_range")?;

        let query_params = [
            ("query", params.query.as_str()),
            ("start", &params.start.to_string()),
            ("end", &params.end.to_string()),
            ("limit", &params.limit.to_string()),
            ("direction", &params.direction),
        ];
        req = req.query(&query_params);

        let resp = req.send().await?;
        let status = resp.status();

        if !status.is_success() {
            let body = resp.text().await.unwrap_or_default();
            return Err(LokiError::ApiError {
                status: status.as_u16(),
                message: body,
            });
        }

        let result: QueryResult = resp.json().await?;
        Ok(result)
    }

    // --- Labels ---

    pub async fn labels(
        &self,
        source: &LokiSource,
        params: &LabelsRequest,
    ) -> Result<Vec<String>, LokiError> {
        let mut req = self.build_get(source, "/loki/api/v1/labels")?;

        let mut query_params = vec![];
        if let Some(start) = params.start {
            query_params.push(("start", start.to_string()));
        }
        if let Some(end) = params.end {
            query_params.push(("end", end.to_string()));
        }
        if !query_params.is_empty() {
            let pairs: Vec<(&str, &str)> =
                query_params.iter().map(|(k, v)| (*k, v.as_str())).collect();
            req = req.query(&pairs);
        }

        let resp = req.send().await?;
        let status = resp.status();
        if !status.is_success() {
            let body = resp.text().await.unwrap_or_default();
            return Err(LokiError::ApiError {
                status: status.as_u16(),
                message: body,
            });
        }

        let result: LabelResponse = resp.json().await?;
        Ok(result.data)
    }

    // --- Label Values ---

    pub async fn label_values(
        &self,
        source: &LokiSource,
        label_name: &str,
        params: &LabelsRequest,
    ) -> Result<Vec<String>, LokiError> {
        let path = format!("/loki/api/v1/label/{}/values", label_name);
        let mut req = self.build_get(source, &path)?;

        let mut query_params = vec![];
        if let Some(start) = params.start {
            query_params.push(("start", start.to_string()));
        }
        if let Some(end) = params.end {
            query_params.push(("end", end.to_string()));
        }
        if !query_params.is_empty() {
            let pairs: Vec<(&str, &str)> =
                query_params.iter().map(|(k, v)| (*k, v.as_str())).collect();
            req = req.query(&pairs);
        }

        let resp = req.send().await?;
        let status = resp.status();
        if !status.is_success() {
            let body = resp.text().await.unwrap_or_default();
            return Err(LokiError::ApiError {
                status: status.as_u16(),
                message: body,
            });
        }

        let result: LabelValuesResponse = resp.json().await?;
        Ok(result.data)
    }
}
