from flask import Flask, request, jsonify
import os
import numpy as np
import tensorflow as tf

app = Flask(__name__)

# Load trained Dueling DQN model
model_path = os.path.join(os.path.dirname(__file__), "model", "dqn_model.h5")
dqn_model = tf.keras.models.load_model(model_path)

@app.route("/")
def home():
    return "🎮 MindBridge DQN API is running!"

@app.route("/api/get-next-level", methods=["POST"])
def get_next_level():
    try:
        # Parse incoming JSON
        data = request.get_json()
        module_score     = float(data.get("module_score", 0))
        improvement_rate = float(data.get("improvement_rate", 0))
        moving_avg       = float(data.get("moving_avg", 0))

        # Format for prediction
        state = np.array([[module_score, improvement_rate, moving_avg]], dtype=np.float32)

        # Predict difficulty using DQN
        q_values = dqn_model.predict(state, verbose=0)[0]
        action = int(np.argmax(q_values))
        difficulty = ["Easy", "Medium", "Hard"][action]

        # Return result
        return jsonify({
            "recommended_difficulty": difficulty,
            "q_values": q_values.tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)
