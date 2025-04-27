import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers
from tensorflow.keras.layers import Lambda

class DuelingDQNAgent:
    def __init__(
        self,
        state_size,
        action_size,
        lr=1e-3,
        gamma=0.99,
        epsilon=1.0,
        epsilon_min=0.1,
        epsilon_decay=0.995,
        batch_size=32,
        memory_size=2000,
        target_update_freq=50
    ):
        self.state_size = state_size
        self.action_size = action_size
        self.lr = lr
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.batch_size = batch_size
        self.memory = []
        self.memory_size = memory_size
        self.target_update_freq = target_update_freq
        self.train_step = 0

        # Build main and target networks
        self.model = self._build_model()
        self.target_model = self._build_model()
        self.update_target_network()

    def _build_model(self):
        inputs = layers.Input(shape=(self.state_size,))
        x = layers.Dense(64, activation="relu")(inputs)
        x = layers.Dense(64, activation="relu")(x)

        value = layers.Dense(32, activation="relu")(x)
        value = layers.Dense(1)(value)

        advantage = layers.Dense(32, activation="relu")(x)
        advantage = layers.Dense(self.action_size)(advantage)

        # Wrap tf.reduce_mean in a Lambda layer to avoid KerasTensor errors
        mean_advantage = Lambda(lambda a: tf.reduce_mean(a, axis=1, keepdims=True))(advantage)
        q_values = layers.Add()([
            value,
            layers.Subtract()([advantage, mean_advantage])
        ])

        model = models.Model(inputs=inputs, outputs=q_values)
        model.compile(optimizer=optimizers.Adam(learning_rate=self.lr), loss="mse")
        return model

    def remember(self, state, action, reward, next_state, done):
        """Store a transition."""
        if len(self.memory) >= self.memory_size:
            self.memory.pop(0)
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state):
        """Choose action via ε-greedy policy."""
        if np.random.rand() < self.epsilon:
            return np.random.randint(self.action_size)
        q = self.model.predict(state[np.newaxis, :], verbose=0)[0]
        return np.argmax(q)

    def replay(self):
        """Sample a batch and train the network."""
        if len(self.memory) < self.batch_size:
            return

        # Sample indices, not the transitions themselves
        idxs = np.random.choice(len(self.memory), self.batch_size, replace=False)
        batch = [self.memory[i] for i in idxs]

        states, targets = [], []
        for state, action, reward, next_state, done in batch:
            target = self.model.predict(state[np.newaxis, :], verbose=0)[0]
            if done:
                target[action] = reward
            else:
                t = self.target_model.predict(next_state[np.newaxis, :], verbose=0)[0]
                target[action] = reward + self.gamma * np.max(t)
            states.append(state)
            targets.append(target)

        self.model.fit(np.array(states), np.array(targets), epochs=1, verbose=0)

        # Decay epsilon
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

        # Periodically update target network
        self.train_step += 1
        if self.train_step % self.target_update_freq == 0:
            self.update_target_network()

    def update_target_network(self):
        """Copy weights from main network to target network."""
        self.target_model.set_weights(self.model.get_weights())
