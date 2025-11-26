from ml_pipeline.evaluate import evaluate_payload

payload = {
    "topic": "climate change",
    "messages": [
        {"user": "alice", "text": "We need to act fast on global warming!"},
        {"user": "bob", "text": "This topic is stupid."},
    ],
    "session_id": "12345"
}

print(evaluate_payload(payload))
