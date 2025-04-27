import os
import numpy as np
import pandas as pd
from dqn_agent import DuelingDQNAgent

def build_state(row):
    return np.array([
        row["module_score"],
        row["improvement_rate"],
        row["moving_avg"]
    ], dtype=np.float32)

def reward_function(prev_score, curr_score):
    return curr_score - prev_score  # Simple diff as reward

def main():
    base_dir   = os.path.dirname(__file__)
    data_csv   = os.path.join(base_dir, "..", "data", "processed_data.csv")
    model_file = os.path.join(base_dir, "dqn_model.h5")

    # Load gameplay data
    if not os.path.exists(data_csv):
        print(f"❌ Processed data not found at: {data_csv}")
        return

    df = pd.read_csv(data_csv)

    # Initialize DQN agent
    state_size = 3
    action_size = 3
    agent = DuelingDQNAgent(state_size, action_size)

    episodes = []
    for student in df["Name"].unique():
        student_df = df[df["Name"] == student].reset_index(drop=True)
        episode = []
        prev_score = None
        prev_state = None

        for _, row in student_df.iterrows():
            curr_state = build_state(row)
            action = np.random.randint(3) if prev_state is None else agent.act(prev_state)

            if prev_state is not None:
                reward = reward_function(prev_score, row["module_score"])
                done = False
                episode.append((prev_state, action, reward, curr_state, done))

            prev_state = curr_state
            prev_score = row["module_score"]

        if episode:
            # Mark last step as done
            episode[-1] = (*episode[-1][:4], True)
            episodes.append(episode)

    # Train the agent
    print(f"🧠 Training on {len(episodes)} student sessions...")
    for epoch in range(30):
        for ep in episodes:
            for transition in ep:
                agent.remember(*transition)
                agent.replay()
        print(f"Epoch {epoch+1}/30 — ε = {agent.epsilon:.3f}")

    # Save model
    try:
        print(f"💾 Saving model to: {model_file}")
        agent.model.save(model_file)
        print(f"✅ Model saved to: {model_file}")
    except Exception as e:
        print(f"❌ Failed to save model: {e}")
        fallback = os.path.join(base_dir, "dqn_model.keras")
        print(f"💾 Trying fallback: {fallback}")
        agent.model.save(fallback)
        print(f"✅ Model saved to fallback path.")

if __name__ == "__main__":
    main()
