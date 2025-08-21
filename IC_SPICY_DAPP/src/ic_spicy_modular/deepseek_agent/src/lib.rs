use ic_cdk_macros::*;
use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod, http_request,
};
use candid::{CandidType, Deserialize};

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}

#[query]
pub fn greet() -> String {
    "Ollama Spicy AI agent is live!".to_string()
}

#[update]
pub async fn ask_ollama(question: String) -> String {
    let url = "https://ollama.com/ICSPICY/SpicyAi".to_string();
    let payload = format!(
        "{{\"question\":\"{}\"}}",
        question.replace('"', "\\\"")
    );
    let headers = vec![
        HttpHeader { name: "Content-Type".to_string(), value: "application/json".to_string() },
    ];
    let arg = CanisterHttpRequestArgument {
        url,
        max_response_bytes: Some(2_000_000),
        method: HttpMethod::POST,
        headers,
        body: Some(payload.as_bytes().to_vec()),
        transform: None,
    };
    let result = http_request(arg, 30_000_000_000).await;
    match result {
        Ok((resp,)) => {
            let body = String::from_utf8_lossy(&resp.body);
            // Try to extract the answer from the JSON
            if let Some(answer) = extract_ollama_answer(&body) {
                answer
            } else {
                format!("Ollama response: {}", body)
            }
        }
        Err(e) => format!("Ollama HTTPS error: {:?}", e),
    }
}

fn extract_ollama_answer(json: &str) -> Option<String> {
    let v: serde_json::Value = serde_json::from_str(json).ok()?;
    v["answer"].as_str().map(|s| s.to_string())
}

candid::export_service!();
