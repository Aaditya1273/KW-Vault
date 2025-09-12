from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import logging
from datetime import datetime
import threading
import time
from ai_yield_predictor import YieldPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global predictor instance
predictor = YieldPredictor()
prediction_cache = {}
cache_ttl = 600  # 10 minutes

def update_predictions():
    """Background task to update predictions periodically"""
    global prediction_cache
    
    while True:
        try:
            logger.info("Updating AI predictions...")
            
            # Fetch fresh data
            data = predictor.fetch_market_data()
            if data is not None:
                # Make prediction
                recent_data = data.tail(50)
                predicted_apy = predictor.predict_yield(recent_data)
                
                if predicted_apy:
                    recommendations = predictor.get_rebalance_recommendation(recent_data, predicted_apy)
                    
                    prediction_cache = {
                        'timestamp': datetime.now().isoformat(),
                        'predicted_apy': predicted_apy,
                        'current_apy': recent_data['apy'].iloc[-1],
                        'recommendations': recommendations,
                        'market_data': {
                            'tvl': recent_data['tvl'].iloc[-1],
                            'volume_24h': recent_data['volume_24h'].iloc[-1],
                            'volatility': recent_data['volatility'].iloc[-1],
                            'liquidity_ratio': recent_data['liquidity_ratio'].iloc[-1]
                        }
                    }
                    
                    logger.info(f"Predictions updated. APY: {predicted_apy:.2f}%")
            
        except Exception as e:
            logger.error(f"Error updating predictions: {e}")
        
        # Wait 10 minutes before next update
        time.sleep(600)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': predictor.model is not None
    })

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    """Get current yield predictions"""
    try:
        if not prediction_cache:
            return jsonify({'error': 'No predictions available yet'}), 503
        
        return jsonify({
            'success': True,
            'data': prediction_cache
        })
        
    except Exception as e:
        logger.error(f"Error getting predictions: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/rebalance', methods=['POST'])
def get_rebalance_advice():
    """Get rebalancing advice based on current conditions"""
    try:
        data = request.get_json()
        
        # Extract current vault conditions
        current_hedge_ratio = data.get('hedge_ratio', 50)
        current_tvl = data.get('tvl', 0)
        target_apy = data.get('target_apy', 8.0)
        
        if not prediction_cache:
            return jsonify({'error': 'No predictions available'}), 503
        
        recommendations = prediction_cache.get('recommendations', {})
        
        # Enhance recommendations with current vault state
        enhanced_recommendations = {
            **recommendations,
            'current_hedge_ratio': current_hedge_ratio,
            'current_tvl': current_tvl,
            'target_apy': target_apy,
            'should_rebalance': False
        }
        
        # Determine if rebalancing is needed
        predicted_apy = prediction_cache.get('predicted_apy', 0)
        new_hedge_ratio = recommendations.get('new_hedge_ratio', current_hedge_ratio)
        
        ratio_change = abs(new_hedge_ratio - current_hedge_ratio)
        apy_deviation = abs(predicted_apy - target_apy)
        
        if ratio_change >= 5 or apy_deviation >= 1.0:  # 5% ratio change or 1% APY deviation
            enhanced_recommendations['should_rebalance'] = True
            enhanced_recommendations['urgency'] = 'high' if ratio_change >= 10 else 'medium'
        
        return jsonify({
            'success': True,
            'data': enhanced_recommendations
        })
        
    except Exception as e:
        logger.error(f"Error getting rebalance advice: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/market-analysis', methods=['GET'])
def get_market_analysis():
    """Get detailed market analysis"""
    try:
        if not prediction_cache:
            return jsonify({'error': 'No analysis available yet'}), 503
        
        market_data = prediction_cache.get('market_data', {})
        
        # Calculate additional metrics
        analysis = {
            'market_sentiment': 'neutral',
            'risk_level': 'medium',
            'opportunity_score': 7.5,
            'market_data': market_data,
            'insights': []
        }
        
        # Determine market sentiment
        predicted_apy = prediction_cache.get('predicted_apy', 0)
        current_apy = prediction_cache.get('current_apy', 0)
        
        if predicted_apy > current_apy + 0.5:
            analysis['market_sentiment'] = 'bullish'
            analysis['insights'].append('Market conditions suggest increasing yields')
        elif predicted_apy < current_apy - 0.5:
            analysis['market_sentiment'] = 'bearish'
            analysis['insights'].append('Market conditions suggest declining yields')
        
        # Determine risk level
        volatility = market_data.get('volatility', 15)
        if volatility > 25:
            analysis['risk_level'] = 'high'
            analysis['insights'].append('High volatility detected - consider defensive positioning')
        elif volatility < 10:
            analysis['risk_level'] = 'low'
            analysis['insights'].append('Low volatility environment - opportunity for higher exposure')
        
        # Calculate opportunity score (0-10)
        tvl = market_data.get('tvl', 0)
        liquidity_ratio = market_data.get('liquidity_ratio', 0.5)
        
        opportunity_score = 5.0  # Base score
        opportunity_score += min(2.0, predicted_apy / 5)  # APY contribution
        opportunity_score += min(1.5, liquidity_ratio * 3)  # Liquidity contribution
        opportunity_score -= min(2.0, volatility / 15)  # Volatility penalty
        
        analysis['opportunity_score'] = max(0, min(10, opportunity_score))
        
        return jsonify({
            'success': True,
            'data': analysis
        })
        
    except Exception as e:
        logger.error(f"Error getting market analysis: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/train', methods=['POST'])
def retrain_model():
    """Retrain the AI model with fresh data"""
    try:
        logger.info("Starting model retraining...")
        
        # Fetch fresh data
        data = predictor.fetch_market_data()
        if data is None:
            return jsonify({'error': 'Failed to fetch training data'}), 500
        
        # Train model
        history = predictor.train_model(data)
        if history is None:
            return jsonify({'error': 'Failed to train model'}), 500
        
        # Save model
        predictor.save_model('yield_prediction_model.h5')
        
        logger.info("Model retraining completed")
        
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error retraining model: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def initialize_predictor():
    """Initialize the predictor with training data"""
    try:
        logger.info("Initializing AI predictor...")
        
        # Try to load existing model
        try:
            predictor.load_model('yield_prediction_model.h5')
            logger.info("Loaded existing model")
        except:
            logger.info("No existing model found, training new model...")
            
            # Fetch data and train
            data = predictor.fetch_market_data()
            if data is not None:
                predictor.train_model(data)
                predictor.save_model('yield_prediction_model.h5')
                logger.info("New model trained and saved")
        
        # Start background prediction updates
        prediction_thread = threading.Thread(target=update_predictions, daemon=True)
        prediction_thread.start()
        logger.info("Background prediction updates started")
        
    except Exception as e:
        logger.error(f"Error initializing predictor: {e}")

if __name__ == '__main__':
    initialize_predictor()
    app.run(host='0.0.0.0', port=5000, debug=False)
