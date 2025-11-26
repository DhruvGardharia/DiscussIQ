from typing import Dict, Any
import numpy as np
import joblib
from transformers import pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

# ---------- Utility ----------
def _safe_mean(values):
    if not values:
        return 0.0
    return sum(values) / len(values)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

constructiveness_regressor = joblib.load(os.path.join(BASE_DIR, "constructiveness_regressor.pkl"))
toxicity_regressor = joblib.load(os.path.join(BASE_DIR, "toxicity_regressor.pkl"))
constructive_vectorizer = joblib.load(os.path.join(BASE_DIR, "constructive_vectorizer.pkl"))
toxicity_vectorizer = joblib.load(os.path.join(BASE_DIR, "toxicity_vectorizer.pkl"))


# ---------- Relevance Model ----------
relevance_model = pipeline("zero-shot-classification", model="valhalla/distilbart-mnli-12-3")



# ---------- ML Scoring ----------
def score_message(concatenated_text: str, topic: str):
    """Scores text using saved regressors (toxicity & constructiveness) and transformer (relevance)."""
    X_constr = constructive_vectorizer.transform([concatenated_text])
    X_toxic = toxicity_vectorizer.transform([concatenated_text])

    constructiveness = constructiveness_regressor.predict(X_constr)[0]
    toxicity = toxicity_regressor.predict(X_toxic)[0]

    # Normalize constructiveness [-1,1] → [0,1]
    constructiveness = float(np.clip((constructiveness + 1) / 2, 0, 1))
    # Toxicity already in [0,1]
    toxicity = float(np.clip(toxicity, 0, 1))

    result = relevance_model(concatenated_text, candidate_labels=[topic, "off-topic"])
    relevance = float(result["scores"][0])  # first label’s score corresponds to topic relevance

    return {"toxicity": toxicity, "relevance": relevance, "constructiveness": constructiveness}


# ---------- Main Evaluation ----------
def evaluate_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    topic = payload.get('topic', '').lower()
    messages = payload.get('messages', [])
    session_id = payload.get('session_id', 'unknown')

    users = {}
    total_messages = len(messages)

    # Group messages by user
    for m in messages:
        if isinstance(m.get('sender'), dict):
            user = m['sender'].get('name') or m['sender'].get('_id')
        else:
            user = m.get('sender') or m.get('user') or m.get('userId') or 'anonymous'

        text = m.get('text', '').lower()
        users.setdefault(user, []).append(text)

    results = {}
    topic_keywords = set(topic.split())
    user_scores, user_concat = {}, {}

    # ---------- Per-user Base Metrics ----------
    for user, msg_texts in users.items():
        concatenated_text = " ".join(msg_texts)
        msg_count = len(msg_texts)

        scores = score_message(concatenated_text, topic)
        toxicity = scores['toxicity']
        relevance = scores['relevance']  # use model relevance directly
        constructiveness = scores['constructiveness']

        # Flow heuristic (engagement)
        flow = min(1.0, 0.3 + (0.7 * min(1.0, msg_count / max(1, total_messages))))

        user_scores[user] = {
            'relevance': relevance,
            'flow': flow,
            'constructiveness': constructiveness,
            'toxicity': toxicity,
        }
        user_concat[user] = concatenated_text


    # ---------- Originality ----------
    users_list = list(user_concat.keys())
    texts = list(user_concat.values())
    if len(texts) > 1:
        tfidf = TfidfVectorizer(max_features=3000, stop_words="english")
        vecs = tfidf.fit_transform(texts)
        sim_matrix = cosine_similarity(vecs)
    else:
        sim_matrix = np.array([[1.0]])

    for i, u in enumerate(users_list):
        others = [sim_matrix[i][j] for j in range(len(users_list)) if j != i]
        mean_sim = np.mean(others) if others else 0.0
        originality_score = 1.0 - mean_sim

        # Make originality grading stricter
        originality = 0.2 + 0.6 * originality_score  # tighter scaling

        rel = user_scores[u].get("relevance", 0)
        tox = user_scores[u].get("toxicity", 0)

        # Force penalties for irrelevance or toxicity
        if rel < 0.5:
            originality = 0.3
        if tox > 0.45:
            originality = 0.1

        user_scores[u]["originality"] = float(np.clip(originality, 0.0, 1.0))


    # ---------- Final Scoring + Feedback ----------
    for user, msg_texts in users.items():
        m = user_scores[user]
        weights = {'originality': 0.25, 'relevance': 0.3, 'flow': 0.2, 'constructiveness': 0.25}
        base_score = sum(weights[k] * m[k] for k in weights)
        score = int(round(base_score * (1 - m['toxicity']) * 100))

        feedback_points = []
        if m['toxicity'] > 0.4:
            feedback_points.append("Use more positive and respectful language")
        if m['constructiveness'] < 0.5:
            feedback_points.append("Try to provide more detailed and constructive responses")
        if m['relevance'] < 0.5:
            feedback_points.append("Try to stay more focused on the discussion topic")
        if m['flow'] < 0.5:
            feedback_points.append("Consider engaging more consistently in the conversation")
        if m['originality'] < 0.5:
            feedback_points.append("Bring more unique perspectives to the discussion")

        feedback = " and ".join(feedback_points) if feedback_points else "Good job participating in the discussion!"

        msg_count = len(msg_texts)
        participation_rate = msg_count / max(1, total_messages)
        if participation_rate < 0.1:
            feedback = "Try to participate more in the discussion. " + feedback
        elif participation_rate > 0.5:
            feedback = "Good engagement level. " + feedback

        avg_length = _safe_mean([len(m.split()) for m in msg_texts])
        topic_matches = sum(1 for m in msg_texts if any(kw in m for kw in topic_keywords))
        topic_relevance_rate = round(topic_matches / max(1, msg_count) * 100, 1)

        results[user] = {
            'score': score,
            'metrics': {
                'relevance': round(m['relevance'], 3),
                'flow': round(m['flow'], 3),
                'constructiveness': round(m['constructiveness'], 3),
                'toxicity': round(m['toxicity'], 3),
                'originality': round(m['originality'], 3),
            },
            'feedback': feedback,
            'stats': {
                'message_count': msg_count,
                'participation_rate': round(participation_rate * 100, 1),
                'avg_message_length': round(avg_length, 1),
                'topic_relevance_rate': topic_relevance_rate,
            }
        }

    return results


# ---------- Example Run ----------

# if __name__ == "__main__":
#     payload = {
#         "topic": "global warming",
#         "session_id": "abc123",
#         "messages": [
#             {"user": "Alice", "text": "Global warming is a critical issue. We should reduce carbon emissions and switch to renewable energy."},  # constructive
#             {"user": "Bob", "text": "None of this matters. People exaggerate everything for attention."},  # destructive
#             {"user": "Charlie", "text": "This whole topic is stupid. Anyone who believes in global warming is dumb."},  # toxic
#             {"user": "Diana", "text": "I don’t really have an opinion on this topic."},  # neutral
#             {"user": "Eve", "text": "What if we used ocean algae farms to absorb CO2 and create biofuel? That could be a creative solution!"},  # original
#             {"user": "Alice", "text": "That’s a great idea, Eve! Collaboration like this could make a real difference."},  # constructive
#             {"user": "Bob", "text": "You're wasting your time thinking about these things."},  # destructive
#             {"user": "Charlie", "text": "You people make me sick talking about this nonsense."},  # toxic
#             {"user": "Diana", "text": "Interesting points from everyone here."}  # neutral
#         ]
#     }


#     from pprint import pprint
#     pprint(evaluate_payload(payload))
