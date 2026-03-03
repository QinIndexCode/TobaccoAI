import base64
from pathlib import Path
from typing import Optional, Tuple


ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
MAX_IMAGE_SIZE = 10 * 1024 * 1024

IMAGE_SIGNATURES = {
    b'\xff\xd8\xff': 'jpeg',
    b'\x89PNG\r\n\x1a\n': 'png',
    b'GIF87a': 'gif',
    b'GIF89a': 'gif',
    b'BM': 'bmp',
    b'RIFF': 'webp',
}


def detect_image_type(file_path: str) -> Optional[str]:
    try:
        with open(file_path, 'rb') as f:
            header = f.read(16)
        
        for signature, img_type in IMAGE_SIGNATURES.items():
            if header.startswith(signature):
                return img_type
        
        if header[:4] == b'RIFF' and header[8:12] == b'WEBP':
            return 'webp'
        
        return None
    except Exception:
        return None


def validate_image(image_path: str) -> Tuple[bool, str]:
    path = Path(image_path)
    if not path.exists():
        return False, f"图片文件不存在: {image_path}"
    
    if path.suffix.lower() not in ALLOWED_EXTENSIONS:
        return False, f"不支持的图片格式: {path.suffix}"
    
    file_size = path.stat().st_size
    if file_size > MAX_IMAGE_SIZE:
        return False, f"图片文件过大: {file_size / 1024 / 1024:.2f}MB, 最大允许: {MAX_IMAGE_SIZE / 1024 / 1024}MB"
    
    if file_size == 0:
        return False, "图片文件为空"
    
    image_type = detect_image_type(image_path)
    if image_type is None:
        return False, "无法识别的图片格式"
    
    return True, f"图片验证通过: {image_type}"


def image_to_base64(image_path: str) -> Optional[str]:
    is_valid, message = validate_image(image_path)
    if not is_valid:
        raise ValueError(message)
    
    path = Path(image_path)
    with open(path, 'rb') as f:
        image_data = f.read()
    
    return base64.b64encode(image_data).decode('utf-8')


def get_image_mime_type(image_path: str) -> str:
    path = Path(image_path)
    suffix = path.suffix.lower()
    
    mime_map = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp'
    }
    
    return mime_map.get(suffix, 'image/jpeg')


def prepare_image_for_ollama(image_path: str) -> dict:
    base64_data = image_to_base64(image_path)
    mime_type = get_image_mime_type(image_path)
    
    return {
        'path': image_path,
        'base64': base64_data,
        'mime_type': mime_type,
        'data_uri': f"data:{mime_type};base64,{base64_data}"
    }
