import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)

class DeFiDataFetcher:
    """Fetches real DeFi protocol data for AI training"""
    
    def __init__(self):
        self.base_urls = {
            'defillama': 'https://api.llama.fi',
            'coingecko': 'https://api.coingecko.com/api/v3',
            'dune': 'https://api.dune.com/api/v1'
        }
    
    def fetch_protocol_tvl(self, protocol='gmx'):
        """Fetch TVL data for a specific protocol"""
        try:
            url = f"{self.base_urls['defillama']}/protocol/{protocol}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                tvl_data = data.get('tvl', [])
                
                df = pd.DataFrame(tvl_data)
                df['date'] = pd.to_datetime(df['date'], unit='s')
                df['tvl'] = df['totalLiquidityUSD']
                
                return df[['date', 'tvl']]
            
        except Exception as e:
            logger.error(f"Error fetching TVL data: {e}")
        
        return None
    
    def fetch_yield_data(self):
        """Fetch yield farming data from various protocols"""
        try:
            # Fetch yields from DefiLlama
            url = f"{self.base_urls['defillama']}/yields"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                pools = data.get('data', [])
                
                # Filter for stablecoin pools
                stablecoin_pools = [
                    pool for pool in pools 
                    if any(stable in pool.get('symbol', '').lower() 
                          for stable in ['usdt', 'usdc', 'dai', 'busd'])
                ]
                
                df = pd.DataFrame(stablecoin_pools)
                return df[['pool', 'chain', 'project', 'symbol', 'apy', 'tvlUsd']]
            
        except Exception as e:
            logger.error(f"Error fetching yield data: {e}")
        
        return None
    
    def fetch_market_data(self, token='tether'):
        """Fetch market data for specific tokens"""
        try:
            # Get historical price data
            url = f"{self.base_urls['coingecko']}/coins/{token}/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': '365',
                'interval': 'daily'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                prices = data.get('prices', [])
                volumes = data.get('total_volumes', [])
                market_caps = data.get('market_caps', [])
                
                df = pd.DataFrame({
                    'timestamp': [p[0] for p in prices],
                    'price': [p[1] for p in prices],
                    'volume': [v[1] for v in volumes],
                    'market_cap': [m[1] for m in market_caps]
                })
                
                df['date'] = pd.to_datetime(df['timestamp'], unit='ms')
                return df[['date', 'price', 'volume', 'market_cap']]
            
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
        
        return None
    
    def calculate_volatility(self, price_data, window=30):
        """Calculate rolling volatility from price data"""
        if price_data is None or len(price_data) < window:
            return None
        
        price_data['returns'] = price_data['price'].pct_change()
        price_data['volatility'] = price_data['returns'].rolling(window=window).std() * np.sqrt(365) * 100
        
        return price_data[['date', 'volatility']].dropna()
    
    def aggregate_defi_data(self):
        """Aggregate data from multiple sources"""
        try:
            logger.info("Aggregating DeFi data from multiple sources...")
            
            # Fetch different data types
            tvl_data = self.fetch_protocol_tvl('gmx')
            yield_data = self.fetch_yield_data()
            market_data = self.fetch_market_data('tether')
            
            # Calculate additional metrics
            volatility_data = None
            if market_data is not None:
                volatility_data = self.calculate_volatility(market_data)
            
            # Combine data sources
            combined_data = {
                'tvl': tvl_data,
                'yields': yield_data,
                'market': market_data,
                'volatility': volatility_data,
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info("Data aggregation completed")
            return combined_data
            
        except Exception as e:
            logger.error(f"Error aggregating DeFi data: {e}")
            return None
    
    def save_data(self, data, filename):
        """Save aggregated data to file"""
        try:
            with open(filename, 'w') as f:
                # Convert DataFrames to JSON-serializable format
                serializable_data = {}
                for key, value in data.items():
                    if isinstance(value, pd.DataFrame):
                        serializable_data[key] = value.to_dict('records')
                    else:
                        serializable_data[key] = value
                
                json.dump(serializable_data, f, indent=2, default=str)
            
            logger.info(f"Data saved to {filename}")
            
        except Exception as e:
            logger.error(f"Error saving data: {e}")

if __name__ == "__main__":
    fetcher = DeFiDataFetcher()
    data = fetcher.aggregate_defi_data()
    
    if data:
        fetcher.save_data(data, 'defi_data.json')
        print("DeFi data fetched and saved successfully")
    else:
        print("Failed to fetch DeFi data")
