"""
天气路由器 - 提供环境数据获取 API
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
import aiohttp
from app.services.weather_service import weather_service

router = APIRouter(prefix="/api/weather", tags=["weather"])


async def get_location_name(lat: float, lon: float) -> Optional[str]:
    """
    使用 OpenStreetMap Nominatim API 获取位置名称
    """
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10&accept-language=zh-CN"
        headers = {
            'User-Agent': 'TobaccoSmart/1.0'
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    # 尝试获取城市名称
                    address = data.get('address', {})
                    city = (
                        address.get('city') or 
                        address.get('town') or 
                        address.get('village') or 
                        address.get('county') or 
                        address.get('state')
                    )
                    if city:
                        return city
    except Exception as e:
        # 静默失败，不影响天气数据返回
        pass
    
    return None


@router.get("/current")
async def get_current_weather(
    latitude: Optional[float] = Query(None, description="纬度", ge=-90, le=90),
    longitude: Optional[float] = Query(None, description="经度", ge=-180, le=180),
):
    """
    获取当前位置天气数据
    
    Args:
        latitude: 纬度（可选，默认北京）
        longitude: 经度（可选，默认北京）
        
    Returns:
        天气数据字典
    """
    # 默认使用北京坐标
    lat = latitude if latitude is not None else 39.9042
    lon = longitude if longitude is not None else 116.4074
    
    # 获取天气数据
    weather_data = await weather_service.get_weather_data(lat, lon)
    
    if not weather_data:
        raise HTTPException(
            status_code=503,
            detail="无法获取天气数据，请检查网络连接或稍后重试"
        )
    
    # 验证数据
    validation = weather_service.validate_weather_data(weather_data)
    
    # 获取位置名称
    location_name = None
    if latitude is not None and longitude is not None:
        location_name = await get_location_name(lat, lon)
    
    return {
        **weather_data,
        'validation': validation,
        'location': {
            'latitude': lat,
            'longitude': lon,
            'name': location_name or '当前位置',
            'city': location_name,
        }
    }


@router.get("/validate")
async def validate_environment_data(
    temperature: float = Query(..., description="气温"),
    air_humidity: float = Query(..., description="空气湿度"),
    soil_humidity: Optional[float] = Query(None, description="土壤湿度"),
    soil_ph: Optional[float] = Query(None, description="土壤 pH 值"),
):
    """
    验证环境数据的合理性
    
    Returns:
        验证结果和建议
    """
    issues = []
    warnings = []
    suggestions = []
    
    # 验证气温
    if temperature < -20 or temperature > 50:
        issues.append(f"气温 {temperature}°C 超出合理范围（-20°C 到 50°C）")
    elif temperature < 0 or temperature > 40:
        warnings.append(f"气温 {temperature}°C 可能对烟草生长不利")
    
    # 验证空气湿度
    if air_humidity < 0 or air_humidity > 100:
        issues.append(f"空气湿度 {air_humidity}% 超出合理范围（0% 到 100%）")
    elif air_humidity < 30 or air_humidity > 90:
        warnings.append(f"空气湿度 {air_humidity}% 可能对烟草生长不利")
    
    # 验证土壤湿度
    if soil_humidity is not None:
        if soil_humidity < 0 or soil_humidity > 100:
            issues.append(f"土壤湿度 {soil_humidity}% 超出合理范围（0% 到 100%）")
        elif soil_humidity < 20 or soil_humidity > 80:
            warnings.append(f"土壤湿度 {soil_humidity}% 可能对烟草生长不利")
    
    # 验证土壤 pH
    if soil_ph is not None:
        if soil_ph < 4.0 or soil_ph > 9.0:
            issues.append(f"土壤 pH {soil_ph} 超出合理范围（4.0 到 9.0）")
        elif soil_ph < 5.5 or soil_ph > 7.5:
            warnings.append(f"土壤 pH {soil_ph} 可能对烟草生长不利（推荐 5.5-7.5）")
        else:
            suggestions.append("土壤 pH 值适宜烟草生长")
    
    # 综合评估
    is_valid = len(issues) == 0
    severity = "error" if len(issues) > 0 else ("warning" if len(warnings) > 0 else "ok")
    
    return {
        'valid': is_valid,
        'severity': severity,
        'issues': issues,
        'warnings': warnings,
        'suggestions': suggestions,
        'data': {
            'temperature': temperature,
            'air_humidity': air_humidity,
            'soil_humidity': soil_humidity,
            'soil_ph': soil_ph,
        }
    }
