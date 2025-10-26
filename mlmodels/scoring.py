"""
Lightweight scoring stub for development.
This file provides a simple evaluate_payload() function that returns
per-user metrics and a combined score. Replace with full ML pipeline later.
"""
from typing import Dict, Any


def _safe_mean(values):
    if not values:
        return 0.0
    return sum(values) / len(values)


def evaluate_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate payload and return per-user metrics and feedback.

    Expected payload:
    {
      "topic": "...",
      "messages": [ {"user": "user1", "text": "..."}, ... ],
      "session_id": "1234"
    }
    """
    topic = payload.get('topic', '').lower()
    messages = payload.get('messages', [])

    # Group messages by user and maintain order
    users = {}
    user_message_counts = {}
    total_messages = len(messages)
    
    for idx, m in enumerate(messages):
        # Try to get user information in order of precedence
        user = None
        if isinstance(m.get('sender'), dict):
            user = m['sender'].get('name') or m['sender'].get('_id')
        else:
            user = m.get('sender') or m.get('user') or m.get('userId') or 'anonymous'
        
        text = m.get('text', '').lower()
        users.setdefault(user, []).append({
            'text': text,
            'position': idx / max(1, total_messages - 1)  # normalized position 0-1
        })
        user_message_counts[user] = user_message_counts.get(user, 0) + 1

    results = {}
    topic_keywords = set(topic.split())
    
    for user, msgs in users.items():
        msg_texts = [m['text'] for m in msgs]
        msg_positions = [m['position'] for m in msgs]
        msg_count = len(msgs)
        
        # Relevance: topic keyword matches and context
        topic_matches = sum(
            1 for m in msg_texts 
            if any(kw in m for kw in topic_keywords)
        )
        relevance = min(1.0, (0.4 + (0.6 * topic_matches / max(1, msg_count))))

        # Flow: message spacing and conversation engagement
        position_gaps = [
            pos2 - pos1 
            for pos1, pos2 in zip(msg_positions[:-1], msg_positions[1:])
        ]
        avg_gap = _safe_mean(position_gaps) if position_gaps else 1.0
        flow = min(1.0, 0.3 + (0.7 * (1 - avg_gap)))  # smaller gaps = better flow
        
        # Constructiveness: message length, question marks, references
        msg_lengths = [len(m.split()) for m in msg_texts]
        avg_length = _safe_mean(msg_lengths)
        questions = sum('?' in m for m in msg_texts)
        constructiveness = min(1.0, (
            0.2 +  # base
            0.4 * min(1.0, avg_length / 15) +  # reward reasonable length
            0.2 * min(1.0, questions / max(1, msg_count)) +  # reward questions
            0.2 * min(1.0, msg_count / max(1, total_messages * 0.3))  # reward participation
        ))

        # Toxicity: negative patterns
        negative_patterns = ['hate', 'stupid', 'wrong', 'idiot', 'shut up']
        toxicity_matches = sum(
            1 for m in msg_texts
            if any(pat in m for pat in negative_patterns)
        )
        toxicity = min(1.0, 0.1 * toxicity_matches / max(1, msg_count))

        # Originality: unique words and message variance
        all_words = set(word for m in msg_texts for word in m.split())
        unique_ratio = len(all_words) / max(1, sum(len(m.split()) for m in msg_texts))
        originality = min(1.0, 0.3 + (0.7 * unique_ratio))

        # Collect all metrics in a dictionary
        metrics = {
            'originality': originality,
            'relevance': relevance,
            'flow': flow,
            'constructiveness': constructiveness,
            'toxicity': toxicity
        }

        # Dynamic scoring weights based on discussion context
        weights = {
            'originality': 0.25,
            'relevance': 0.3,
            'flow': 0.2,
            'constructiveness': 0.25
        }

        # Composite score with toxicity penalty
        base_score = sum(
            weight * metrics[metric]
            for metric, weight in weights.items()
        )
        score = base_score * (1 - toxicity)  # apply toxicity penalty
        score = int(round(score * 100))  # scale to 0-100

        # Generate specific feedback
        feedback_points = []
        if relevance < 0.5:
            feedback_points.append("Try to stay more focused on the discussion topic")
        if flow < 0.5:
            feedback_points.append("Consider engaging more consistently in the conversation")
        if constructiveness < 0.5:
            feedback_points.append("Try to provide more detailed and constructive responses")
        if toxicity > 0.2:
            feedback_points.append("Be mindful of using more positive and respectful language")
        if originality < 0.5:
            feedback_points.append("Try to bring more unique perspectives to the discussion")
        
        feedback = " and ".join(feedback_points) if feedback_points else "Good job participating in the discussion!"
        
        # Additional context-specific feedback
        participation_rate = msg_count / max(1, total_messages)
        if participation_rate < 0.1:
            feedback = "Try to participate more in the discussion. " + feedback
        elif participation_rate > 0.5:
            feedback = "Good engagement level. " + feedback

        results[user] = {
            'score': score,
            'metrics': {
                'relevance': round(relevance, 3),
                'flow': round(flow, 3),
                'constructiveness': round(constructiveness, 3),
                'toxicity': round(toxicity, 3),
                'originality': round(originality, 3),
            },
            'feedback': feedback,
            'stats': {
                'message_count': msg_count,
                'participation_rate': round(participation_rate * 100, 1),
                'avg_message_length': round(_safe_mean(msg_lengths), 1),
                'topic_relevance_rate': round(topic_matches / max(1, msg_count) * 100, 1),
            }
        }

    return results
