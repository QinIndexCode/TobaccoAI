"""
天气服务 - 从互联网获取环境数据
使用免费的天气 API 获取当前位置或指定位置的环境数据
"""
import aiohttp
import asyncio
from typing import Optional, Dict, Any
from datetime import datetime


class WeatherService:
    """天气服务类 - 获取环境数据"""
    
    def __init__(self):
        # 使用多个免费天气 API 作为备用
        self.api_providers = [
            'open-meteo',  # 免费，无需 API Key
        ]
    
    async def get_weather_data(
        self,
        latitude: float = 39.9042,  # 北京默认纬度
        longitude: float = 116.4074,  # 北京默认经度
    ) -> Optional[Dict[str, Any]]:
        """
        获取天气数据
        
        Args:
            latitude: 纬度
            longitude: 经度
            
        Returns:
            包含气温、湿度等数据的字典，失败返回 None
        """
        for provider in self.api_providers:
            try:
                if provider == 'open-meteo':
                    data = await self._get_openmeteo_data(latitude, longitude)
                    if data:
                        return data
            except Exception as e:
                print(f"从 {provider} 获取天气数据失败：{e}")
                continue
        
        return None
    
    async def _get_openmeteo_data(
        self,
        latitude: float,
        longitude: float
    ) -> Optional[Dict[str, Any]]:
        """
        从 Open-Meteo API 获取天气数据
        API 文档：https://open-meteo.com/
        """
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature",
            "daily": "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min",
            "timezone": "auto",
            "forecast_days": 1
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_openmeteo_response(data)
                    else:
                        print(f"Open-Meteo API 返回状态码：{response.status}")
                        return None
        except Exception as e:
            print(f"请求 Open-Meteo API 失败：{e}")
            return None
    
    def _parse_openmeteo_response(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """解析 Open-Meteo API 响应"""
        try:
            current = data.get('current', {})
            daily = data.get('daily', {})
            
            if not current:
                return None
            
            # 获取当前气温和湿度
            temperature = current.get('temperature_2m')
            humidity = current.get('relative_humidity_2m')
            
            # 获取今日最高最低温
            temp_max = daily.get('temperature_2m_max', [None])[0] if daily.get('temperature_2m_max') else None
            temp_min = daily.get('temperature_2m_min', [None])[0] if daily.get('temperature_2m_min') else None
            
            return {
                'temperature': temperature,
                'air_humidity': humidity,
                'temperature_max': temp_max,
                'temperature_min': temp_min,
                'source': 'open-meteo',
                'update_time': datetime.now().isoformat(),
            }
        except Exception as e:
            print(f"解析 Open-Meteo 响应失败：{e}")
            return None
    
    def validate_weather_data(self, data: Dict[str, Any]) -> Dict[str, bool]:
        """
        验证天气数据的合理性
        
        Returns:
            验证结果字典
        """
        validation = {
            'temperature_valid': False,
            'humidity_valid': False,
        }
        
        # 验证气温（-50°C 到 60°C）
        temp = data.get('temperature')
        if temp is not None and isinstance(temp, (int, float)):
            validation['temperature_valid'] = -50 <= temp <= 60
        
        # 验证湿度（0% 到 100%）
        humidity = data.get('air_humidity')
        if humidity is not None and isinstance(humidity, (int, float)):
            validation['humidity_valid'] = 0 <= humidity <= 100
        
        return validation


# 全局天气服务实例
weather_service = WeatherService()
