"""NLP processor for extracting IBD-related features from medical text"""

import spacy
import re
from typing import List, Dict, Any, Tuple
import logging
from collections import defaultdict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IBDTextProcessor:
    """Process medical text to extract IBD-related features"""
    
    def __init__(self):
        """Initialize the NLP processor"""
        self.nlp = spacy.load("en_core_web_sm")
        
        # Define feature extraction patterns
        self.patterns = {
            'demographics': {
                'age': r'(?:age[ds]?\s*(?:range|group|between)?\s*)?(\d+(?:\s*-\s*\d+)?)\s*(?:years?|yrs?)?(?:\s*old)?',
                'gender': r'(?:male|female|men|women|boys|girls)',
                'ethnicity': r'(?:caucasian|asian|african|hispanic|latino)'
            },
            'symptoms': {
                'pain': r'(?:abdominal|stomach)\s+pain',
                'diarrhea': r'diarrhea|loose stools?',
                'blood': r'(?:blood|bloody)\s+(?:stool|diarrhea|bowel)',
                'fatigue': r'fatigue|tired|exhaustion',
                'weight': r'weight\s+(?:loss|gain)',
                'appetite': r'(?:decreased|increased|poor|loss of)\s+appetite'
            },
            'measurements': {
                'crp': r'(?:crp|c-reactive protein)\s*(?:level|value)?\s*(?:of|:)?\s*(\d+(?:\.\d+)?)',
                'calprotectin': r'(?:calprotectin|fecal calprotectin)\s*(?:level|value)?\s*(?:of|:)?\s*(\d+(?:\.\d+)?)',
                'hemoglobin': r'(?:h[ae]emoglobin|hb)\s*(?:level|value)?\s*(?:of|:)?\s*(\d+(?:\.\d+)?)'
            },
            'treatments': {
                'medications': r'(?:mesalamine|prednisone|budesonide|azathioprine|mercaptopurine|infliximab|adalimumab)',
                'dosage': r'(\d+(?:\.\d+)?)\s*(?:mg|g|mcg|µg)',
                'frequency': r'(?:once|twice|three times|daily|weekly|monthly)'
            },
            'outcomes': {
                'remission': r'(?:clinical|complete)?\s*remission',
                'flare': r'(?:disease)?\s*(?:flare|relapse|exacerbation)',
                'response': r'(?:clinical|treatment)?\s*response'
            }
        }
    
    def process_text(self, text: str) -> Dict[str, Any]:
        """Process text and extract all relevant features"""
        doc = self.nlp(text)
        
        features = {
            'demographics': self._extract_demographics(text),
            'symptoms': self._extract_symptoms(text),
            'measurements': self._extract_measurements(text),
            'treatments': self._extract_treatments(text),
            'outcomes': self._extract_outcomes(text),
            'temporal_patterns': self._extract_temporal_patterns(doc),
            'severity_indicators': self._extract_severity_indicators(doc)
        }
        
        return features
    
    def _extract_demographics(self, text: str) -> Dict[str, Any]:
        """Extract demographic information"""
        demographics = {}
        
        for feature, pattern in self.patterns['demographics'].items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            values = [match.group(0) for match in matches]
            if values:
                demographics[feature] = values
        
        return demographics
    
    def _extract_symptoms(self, text: str) -> Dict[str, List[str]]:
        """Extract symptom information"""
        symptoms = defaultdict(list)
        
        for symptom, pattern in self.patterns['symptoms'].items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                # Look for severity indicators near the symptom
                context = text[max(0, match.start()-20):min(len(text), match.end()+20)]
                severity = self._determine_severity(context)
                symptoms[symptom].append({
                    'mention': match.group(0),
                    'severity': severity,
                    'context': context.strip()
                })
        
        return dict(symptoms)
    
    def _extract_measurements(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """Extract clinical measurements"""
        measurements = defaultdict(list)
        
        for measure, pattern in self.patterns['measurements'].items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    value = float(match.group(1))
                    measurements[measure].append({
                        'value': value,
                        'unit': self._determine_unit(match.group(0)),
                        'context': text[max(0, match.start()-20):min(len(text), match.end()+20)].strip()
                    })
                except (IndexError, ValueError):
                    continue
        
        return dict(measurements)
    
    def _extract_treatments(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """Extract treatment information"""
        treatments = defaultdict(list)
        
        # Extract medication mentions
        for match in re.finditer(self.patterns['treatments']['medications'], text, re.IGNORECASE):
            medication = match.group(0)
            context = text[max(0, match.start()-30):min(len(text), match.end()+30)]
            
            # Look for dosage and frequency near the medication mention
            dosage = None
            frequency = None
            
            dosage_match = re.search(self.patterns['treatments']['dosage'], context)
            if dosage_match:
                dosage = dosage_match.group(0)
            
            freq_match = re.search(self.patterns['treatments']['frequency'], context)
            if freq_match:
                frequency = freq_match.group(0)
            
            treatments['medications'].append({
                'name': medication,
                'dosage': dosage,
                'frequency': frequency,
                'context': context.strip()
            })
        
        return dict(treatments)
    
    def _extract_outcomes(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """Extract outcome information"""
        outcomes = defaultdict(list)
        
        for outcome, pattern in self.patterns['outcomes'].items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                context = text[max(0, match.start()-30):min(len(text), match.end()+30)]
                outcomes[outcome].append({
                    'mention': match.group(0),
                    'context': context.strip(),
                    'temporal_info': self._extract_temporal_info(context)
                })
        
        return dict(outcomes)
    
    def _extract_temporal_patterns(self, doc) -> List[Dict[str, Any]]:
        """Extract temporal patterns and relationships"""
        temporal_patterns = []
        
        for ent in doc.ents:
            if ent.label_ in ['DATE', 'TIME', 'DURATION']:
                temporal_patterns.append({
                    'type': ent.label_,
                    'text': ent.text,
                    'context': doc[max(0, ent.start-5):min(len(doc), ent.end+5)].text
                })
        
        return temporal_patterns
    
    def _extract_severity_indicators(self, doc) -> List[Dict[str, Any]]:
        """Extract disease severity indicators"""
        severity_indicators = []
        
        severity_terms = {
            'mild': 1,
            'moderate': 2,
            'severe': 3,
            'minimal': 1,
            'significant': 2,
            'extreme': 3
        }
        
        for token in doc:
            if token.text.lower() in severity_terms:
                severity_indicators.append({
                    'term': token.text,
                    'level': severity_terms[token.text.lower()],
                    'context': doc[max(0, token.i-5):min(len(doc), token.i+5)].text
                })
        
        return severity_indicators
    
    def _determine_severity(self, context: str) -> str:
        """Determine symptom severity from context"""
        severity_indicators = {
            'mild': ['mild', 'slight', 'minimal'],
            'moderate': ['moderate', 'significant'],
            'severe': ['severe', 'extreme', 'intense']
        }
        
        for severity, indicators in severity_indicators.items():
            if any(indicator in context.lower() for indicator in indicators):
                return severity
        
        return 'unspecified'
    
    def _determine_unit(self, text: str) -> str:
        """Determine measurement unit from text"""
        unit_patterns = {
            'mg': r'mg|milligrams?',
            'g': r'g|grams?',
            'mcg': r'mcg|µg|micrograms?',
            'ml': r'ml|milliliters?',
            '%': r'%|percent'
        }
        
        for unit, pattern in unit_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                return unit
        
        return 'unknown'
    
    def _extract_temporal_info(self, context: str) -> Dict[str, Any]:
        """Extract temporal information from context"""
        temporal_info = {
            'duration': None,
            'frequency': None,
            'timing': None
        }
        
        # Duration patterns
        duration_pattern = r'(\d+)\s*(?:day|week|month|year)s?'
        duration_match = re.search(duration_pattern, context, re.IGNORECASE)
        if duration_match:
            temporal_info['duration'] = duration_match.group(0)
        
        # Frequency patterns
        freq_pattern = r'(?:daily|weekly|monthly|every\s+\d+\s+(?:day|week|month)s?)'
        freq_match = re.search(freq_pattern, context, re.IGNORECASE)
        if freq_match:
            temporal_info['frequency'] = freq_match.group(0)
        
        # Timing patterns
        timing_pattern = r'(?:morning|afternoon|evening|night|before|after|during)'
        timing_match = re.search(timing_pattern, context, re.IGNORECASE)
        if timing_match:
            temporal_info['timing'] = timing_match.group(0)
        
        return temporal_info 