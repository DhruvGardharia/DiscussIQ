from flask import Flask, request, jsonify
from flask_cors import CORS
from evaluate import evaluate_payload

app = Flask(__name__)
CORS(app)


@app.route('/evaluate', methods=['POST'])
def evaluate():
    payload = request.get_json(force=True)
    results = evaluate_payload(payload)
    return jsonify(results)


if __name__ == '__main__':
    # Default port 5001 to avoid conflict with Node backend
    app.run(host='0.0.0.0', port=5001, debug=True)
