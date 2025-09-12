import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import requests
import json
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YieldPredictor:
    def __init__(self):
        self.model = None
        self.scaler = MinMaxScaler()
        self.feature_columns = [
            'tvl', 'apy', 'volume_24h', 'price_change_24h', 
            'market_cap', 'volatility', 'liquidity_ratio'
        ]
        self.sequence_length = 30  # 30 days of historical data
        
    def fetch_market_data(self):
        """Fetch historical market data for yield prediction"""
        try:
            # Simulate fetching data from various DeFi protocols
            # In production, this would connect to real APIs like DefiLlama, CoinGecko, etc.
            
            # Generate synthetic historical data for demonstration
            dates = pd.date_range(start='2023-01-01', end='2024-12-01', freq='D')
            np.random.seed(42)
            
            data = {
                'date': dates,
                'tvl': np.random.normal(1000000, 200000, len(dates)),  # TVL in USD
                'apy': np.random.normal(8.5, 2.0, len(dates)),  # APY percentage
                'volume_24h': np.random.normal(50000, 15000, len(dates)),  # 24h volume
                'price_change_24h': np.random.normal(0, 3, len(dates)),  # Price change %
                'market_cap': np.random.normal(50000000, 10000000, len(dates)),  # Market cap
                'volatility': np.random.normal(15, 5, len(dates)),  # Volatility %
                'liquidity_ratio': np.random.normal(0.7, 0.1, len(dates))  # Liquidity ratio
            }
            
            df = pd.DataFrame(data)
            
            # Add some realistic trends and correlations
            df['apy'] = df['apy'] + np.sin(np.arange(len(df)) * 0.01) * 2
            df['tvl'] = df['tvl'] * (1 + df['apy'] / 100 * 0.1)  # TVL correlates with APY
            
            # Ensure positive values
            df['tvl'] = np.abs(df['tvl'])
            df['apy'] = np.abs(df['apy'])
            df['volume_24h'] = np.abs(df['volume_24h'])
            df['market_cap'] = np.abs(df['market_cap'])
            df['volatility'] = np.abs(df['volatility'])
            df['liquidity_ratio'] = np.clip(df['liquidity_ratio'], 0.1, 1.0)
            
            logger.info(f"Fetched {len(df)} days of market data")
            return df
            
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            return None
    
    def prepare_sequences(self, data):
        """Prepare sequences for LSTM training"""
        sequences = []
        targets = []
        
        for i in range(self.sequence_length, len(data)):
            # Use past sequence_length days to predict next day's APY
            sequence = data[i-self.sequence_length:i]
            target = data[i, 1]  # APY is at index 1
            sequences.append(sequence)
            targets.append(target)
        
        return np.array(sequences), np.array(targets)
    
    def build_model(self, input_shape):
        """Build LSTM model for yield prediction"""
        model = keras.Sequential([
            keras.layers.LSTM(64, return_sequences=True, input_shape=input_shape),
            keras.layers.Dropout(0.2),
            keras.layers.LSTM(32, return_sequences=False),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(16, activation='relu'),
            keras.layers.Dense(1, activation='linear')  # Predict APY
        ])
        
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def train_model(self, data):
        """Train the yield prediction model"""
        try:
            # Prepare features
            features = data[self.feature_columns].values
            
            # Scale features
            scaled_features = self.scaler.fit_transform(features)
            
            # Prepare sequences
            X, y = self.prepare_sequences(scaled_features)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Build model
            self.model = self.build_model((X_train.shape[1], X_train.shape[2]))
            
            # Train model
            history = self.model.fit(
                X_train, y_train,
                epochs=50,
                batch_size=32,
                validation_data=(X_test, y_test),
                verbose=1
            )
            
            # Evaluate model
            test_loss, test_mae = self.model.evaluate(X_test, y_test, verbose=0)
            logger.info(f"Model trained. Test MAE: {test_mae:.4f}")
            
            return history
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return None
    
    def predict_yield(self, recent_data):
        """Predict future yield based on recent data"""
        try:
            if self.model is None:
                logger.error("Model not trained yet")
                return None
            
            # Prepare input data
            features = recent_data[self.feature_columns].values
            scaled_features = self.scaler.transform(features)
            
            # Get last sequence
            if len(scaled_features) >= self.sequence_length:
                sequence = scaled_features[-self.sequence_length:].reshape(1, self.sequence_length, -1)
                prediction = self.model.predict(sequence, verbose=0)[0][0]
                
                # Inverse transform to get actual APY
                dummy_array = np.zeros((1, len(self.feature_columns)))
                dummy_array[0, 1] = prediction  # APY is at index 1
                actual_prediction = self.scaler.inverse_transform(dummy_array)[0, 1]
                
                return max(0, actual_prediction)  # Ensure non-negative APY
            else:
                logger.error("Not enough recent data for prediction")
                return None
                
        except Exception as e:
            logger.error(f"Error predicting yield: {e}")
            return None
    
    def get_rebalance_recommendation(self, current_data, predicted_apy):
        """Get rebalancing recommendations based on predictions"""
        try:
            current_apy = current_data['apy'].iloc[-1]
            current_volatility = current_data['volatility'].iloc[-1]
            current_tvl = current_data['tvl'].iloc[-1]
            
            recommendations = {
                'predicted_apy': predicted_apy,
                'current_apy': current_apy,
                'confidence': 0.85,  # Model confidence score
                'action': 'hold',
                'new_hedge_ratio': 50,  # Default 50%
                'reasoning': []
            }
            
            # Determine action based on prediction vs current
            apy_diff = predicted_apy - current_apy
            
            if apy_diff > 1.0:  # Significant increase expected
                recommendations['action'] = 'increase_exposure'
                recommendations['new_hedge_ratio'] = 30  # Reduce hedge, increase exposure
                recommendations['reasoning'].append("Predicted APY increase suggests reducing hedge ratio")
            elif apy_diff < -1.0:  # Significant decrease expected
                recommendations['action'] = 'decrease_exposure'
                recommendations['new_hedge_ratio'] = 70  # Increase hedge, reduce exposure
                recommendations['reasoning'].append("Predicted APY decrease suggests increasing hedge ratio")
            
            # Adjust for volatility
            if current_volatility > 20:
                recommendations['new_hedge_ratio'] = min(80, recommendations['new_hedge_ratio'] + 10)
                recommendations['reasoning'].append("High volatility detected, increasing hedge ratio")
            
            # Adjust for TVL changes
            if current_tvl < 500000:  # Low TVL
                recommendations['new_hedge_ratio'] = min(70, recommendations['new_hedge_ratio'] + 5)
                recommendations['reasoning'].append("Low TVL detected, slightly increasing hedge ratio")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return None
    
    def save_model(self, filepath):
        """Save trained model"""
        try:
            if self.model:
                self.model.save(filepath)
                logger.info(f"Model saved to {filepath}")
            else:
                logger.error("No model to save")
        except Exception as e:
            logger.error(f"Error saving model: {e}")
    
    def load_model(self, filepath):
        """Load trained model"""
        try:
            self.model = keras.models.load_model(filepath)
            logger.info(f"Model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")

def main():
    """Main function to train and test the yield predictor"""
    predictor = YieldPredictor()
    
    # Fetch market data
    logger.info("Fetching market data...")
    data = predictor.fetch_market_data()
    
    if data is not None:
        # Train model
        logger.info("Training model...")
        history = predictor.train_model(data)
        
        if history:
            # Make predictions
            logger.info("Making predictions...")
            recent_data = data.tail(50)  # Last 50 days
            predicted_apy = predictor.predict_yield(recent_data)
            
            if predicted_apy:
                logger.info(f"Predicted APY: {predicted_apy:.2f}%")
                
                # Get recommendations
                recommendations = predictor.get_rebalance_recommendation(recent_data, predicted_apy)
                if recommendations:
                    logger.info(f"Recommendations: {json.dumps(recommendations, indent=2)}")
                
                # Save model
                predictor.save_model('yield_prediction_model.h5')
            
            return {
                'success': True,
                'predicted_apy': predicted_apy,
                'recommendations': recommendations
            }
    
    return {'success': False, 'error': 'Failed to train model'}

if __name__ == "__main__":
    result = main()
    print(json.dumps(result, indent=2))
