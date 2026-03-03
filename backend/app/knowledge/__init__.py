import json
import os
from typing import List, Dict, Optional

_KNOWLEDGE_DIR = os.path.dirname(os.path.abspath(__file__))

def _load_json(filename: str) -> List[Dict]:
    filepath = os.path.join(_KNOWLEDGE_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_growth_stages() -> List[Dict]:
    return _load_json('growth_stages.json')

def get_growth_stage_by_name(stage_name: str) -> Optional[Dict]:
    stages = get_growth_stages()
    for stage in stages:
        if stage['stage'] == stage_name:
            return stage
    return None

def get_diseases() -> List[Dict]:
    return _load_json('diseases.json')

def get_disease_by_name(name: str) -> Optional[Dict]:
    diseases = get_diseases()
    for disease in diseases:
        if disease['name'] == name:
            return disease
    return None

def get_diseases_by_type(disease_type: str) -> List[Dict]:
    diseases = get_diseases()
    return [d for d in diseases if d['type'] == disease_type]

def get_nutrient_deficiencies() -> List[Dict]:
    return _load_json('nutrient_deficiency.json')

def get_nutrient_deficiency_by_name(name: str) -> Optional[Dict]:
    deficiencies = get_nutrient_deficiencies()
    for deficiency in deficiencies:
        if deficiency['name'] == name:
            return deficiency
    return None

__all__ = [
    'get_growth_stages',
    'get_growth_stage_by_name',
    'get_diseases',
    'get_disease_by_name',
    'get_diseases_by_type',
    'get_nutrient_deficiencies',
    'get_nutrient_deficiency_by_name',
]
