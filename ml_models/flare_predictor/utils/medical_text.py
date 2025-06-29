"""Medical text processing utilities with IBD-specific features"""

import re
import json
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import spacy
from spacy.tokens import Doc, Span
from spacy.language import Language
from config.settings import NLP_CONFIG, DATA_DIR

class MedicalTextProcessor:
    """Process medical text with IBD-specific features"""
    
    def __init__(self):
        """Initialize the medical text processor"""
        self.nlp = spacy.load(NLP_CONFIG['spacy_model'])
        
        # Load custom patterns
        self.patterns = self._load_patterns()
        
        # Add custom pipeline components
        self._add_custom_components()
    
    def _load_patterns(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load custom NLP patterns"""
        patterns_file = NLP_CONFIG['custom_patterns_file']
        
        if not Path(patterns_file).exists():
            # Create default patterns if file doesn't exist
            default_patterns = {
                'symptoms': [
                    {'label': 'SYMPTOM', 'pattern': 'abdominal pain'},
                    {'label': 'SYMPTOM', 'pattern': 'diarrhea'},
                    {'label': 'SYMPTOM', 'pattern': 'bloody stool'},
                    {'label': 'SYMPTOM', 'pattern': 'fatigue'},
                    {'label': 'SYMPTOM', 'pattern': 'weight loss'},
                    {'label': 'SYMPTOM', 'pattern': 'fever'},
                ],
                'medications': [
                    {'label': 'MEDICATION', 'pattern': 'mesalamine'},
                    {'label': 'MEDICATION', 'pattern': 'prednisone'},
                    {'label': 'MEDICATION', 'pattern': 'budesonide'},
                    {'label': 'MEDICATION', 'pattern': 'azathioprine'},
                    {'label': 'MEDICATION', 'pattern': 'mercaptopurine'},
                    {'label': 'MEDICATION', 'pattern': 'infliximab'},
                    {'label': 'MEDICATION', 'pattern': 'adalimumab'},
                ],
                'procedures': [
                    {'label': 'PROCEDURE', 'pattern': 'colonoscopy'},
                    {'label': 'PROCEDURE', 'pattern': 'endoscopy'},
                    {'label': 'PROCEDURE', 'pattern': 'biopsy'},
                    {'label': 'PROCEDURE', 'pattern': 'surgery'},
                ],
                'measurements': [
                    {'label': 'MEASUREMENT', 'pattern': 'CRP'},
                    {'label': 'MEASUREMENT', 'pattern': 'calprotectin'},
                    {'label': 'MEASUREMENT', 'pattern': 'hemoglobin'},
                    {'label': 'MEASUREMENT', 'pattern': 'ESR'},
                ],
                'disease_terms': [
                    {'label': 'DISEASE', 'pattern': "Crohn's disease"},
                    {'label': 'DISEASE', 'pattern': 'ulcerative colitis'},
                    {'label': 'DISEASE', 'pattern': 'IBD'},
                    {'label': 'DISEASE', 'pattern': 'inflammatory bowel disease'},
                ],
                'anatomical_terms': [
                    {'label': 'ANATOMY', 'pattern': 'colon'},
                    {'label': 'ANATOMY', 'pattern': 'small intestine'},
                    {'label': 'ANATOMY', 'pattern': 'rectum'},
                    {'label': 'ANATOMY', 'pattern': 'ileum'},
                ]
            }
            
            # Save default patterns
            Path(patterns_file).parent.mkdir(parents=True, exist_ok=True)
            with open(patterns_file, 'w') as f:
                json.dump(default_patterns, f, indent=2)
            
            return default_patterns
        else:
            with open(patterns_file, 'r') as f:
                return json.load(f)
    
    def _add_custom_components(self):
        """Add custom pipeline components to spaCy"""
        
        @Language.component('ibd_symptom_patterns')
        def ibd_symptom_patterns(doc: Doc) -> Doc:
            """Add IBD symptom pattern matching"""
            matches = []
            for pattern_type, patterns in self.patterns.items():
                for pattern in patterns:
                    for match_id, start, end in self.nlp.get_pipe('attribute_ruler').matcher(doc):
                        span = doc[start:end]
                        matches.append((span, pattern['label']))
            
            doc.ents = list(doc.ents) + [
                Span(doc, start, end, label=label)
                for (start, end), label in matches
            ]
            return doc
        
        @Language.component('severity_detector')
        def severity_detector(doc: Doc) -> Doc:
            """Detect severity indicators"""
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
                    token._.set('severity_level', severity_terms[token.text.lower()])
            
            return doc
        
        @Language.component('temporal_analyzer')
        def temporal_analyzer(doc: Doc) -> Doc:
            """Analyze temporal relationships"""
            temporal_patterns = {
                'frequency': r'(?:daily|weekly|monthly|every\s+\d+\s+(?:day|week|month)s?)',
                'duration': r'(?:for|during|over)\s+(\d+)\s+(?:day|week|month|year)s?',
                'onset': r'(?:started|began|onset)\s+(\d+)\s+(?:day|week|month|year)s?\s+ago'
            }
            
            for name, pattern in temporal_patterns.items():
                matches = re.finditer(pattern, doc.text, re.IGNORECASE)
                for match in matches:
                    start, end = match.span()
                    span = doc.char_span(start, end)
                    if span:
                        span._.set('temporal_type', name)
                        if match.groups():
                            span._.set('temporal_value', match.group(1))
            
            return doc
        
        # Add custom token extensions
        if not Doc.has_extension('severity_level'):
            Doc.set_extension('severity_level', default=None)
        if not Span.has_extension('temporal_type'):
            Span.set_extension('temporal_type', default=None)
        if not Span.has_extension('temporal_value'):
            Span.set_extension('temporal_value', default=None)
        
        # Add components to pipeline
        self.nlp.add_pipe('ibd_symptom_patterns')
        self.nlp.add_pipe('severity_detector')
        self.nlp.add_pipe('temporal_analyzer')
    
    def process_text(self, text: str) -> Dict[str, Any]:
        """
        Process medical text and extract IBD-related information
        
        Args:
            text: Medical text to process
        
        Returns:
            Dictionary with extracted information
        """
        # Truncate text if too long
        if len(text) > NLP_CONFIG['max_text_length']:
            text = text[:NLP_CONFIG['max_text_length']]
        
        doc = self.nlp(text)
        
        # Extract entities
        entities = {}
        for ent in doc.ents:
            if ent.label_ not in entities:
                entities[ent.label_] = []
            
            # Get context window
            start = max(0, ent.start - NLP_CONFIG['context_window'])
            end = min(len(doc), ent.end + NLP_CONFIG['context_window'])
            context = doc[start:end].text
            
            # Get severity if available
            severity = None
            for token in doc[max(0, ent.start-5):min(len(doc), ent.end+5)]:
                if token._.get('severity_level'):
                    severity = token._.get('severity_level')
                    break
            
            # Get temporal information
            temporal_info = {}
            for span in doc[max(0, ent.start-10):min(len(doc), ent.end+10)].spans:
                if span._.get('temporal_type'):
                    temporal_info[span._.get('temporal_type')] = span._.get('temporal_value')
            
            entities[ent.label_].append({
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char,
                'context': context,
                'severity': severity,
                'temporal_info': temporal_info
            })
        
        return {
            'entities': entities,
            'text_length': len(text),
            'processed_tokens': len(doc)
        }
    
    def extract_relationships(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract relationships between medical entities
        
        Args:
            text: Medical text to process
        
        Returns:
            List of relationship dictionaries
        """
        doc = self.nlp(text)
        relationships = []
        
        for sent in doc.sents:
            entities = list(sent.ents)
            
            for i, e1 in enumerate(entities):
                for e2 in entities[i+1:]:
                    # Check if entities are connected by a verb
                    path = self._find_path(e1.root, e2.root)
                    if path:
                        relationships.append({
                            'entity1': {
                                'text': e1.text,
                                'label': e1.label_
                            },
                            'entity2': {
                                'text': e2.text,
                                'label': e2.label_
                            },
                            'relation': ' '.join(t.text for t in path),
                            'sentence': sent.text
                        })
        
        return relationships
    
    def _find_path(self, token1: spacy.tokens.Token, 
                  token2: spacy.tokens.Token) -> Optional[List[spacy.tokens.Token]]:
        """Find the shortest path between two tokens in the dependency tree"""
        if token1 == token2:
            return [token1]
        
        visited = set()
        queue = [(token1, [token1])]
        
        while queue:
            token, path = queue.pop(0)
            
            for child in token.children:
                if child not in visited:
                    if child == token2:
                        return path + [child]
                    queue.append((child, path + [child]))
                    visited.add(child)
            
            if token.head not in visited:
                if token.head == token2:
                    return path + [token.head]
                queue.append((token.head, path + [token.head]))
                visited.add(token.head)
        
        return None
    
    def analyze_symptom_progression(self, texts: List[str]) -> Dict[str, Any]:
        """
        Analyze symptom progression across multiple texts
        
        Args:
            texts: List of medical texts in chronological order
        
        Returns:
            Dictionary with progression analysis
        """
        progression = {
            'symptoms': {},
            'severity_changes': [],
            'new_symptoms': [],
            'resolved_symptoms': []
        }
        
        previous_symptoms = set()
        
        for i, text in enumerate(texts):
            doc = self.nlp(text)
            current_symptoms = set()
            
            for ent in doc.ents:
                if ent.label_ == 'SYMPTOM':
                    symptom = ent.text.lower()
                    current_symptoms.add(symptom)
                    
                    if symptom not in progression['symptoms']:
                        progression['symptoms'][symptom] = []
                    
                    # Get severity
                    severity = None
                    for token in doc[max(0, ent.start-5):min(len(doc), ent.end+5)]:
                        if token._.get('severity_level'):
                            severity = token._.get('severity_level')
                            break
                    
                    progression['symptoms'][symptom].append({
                        'time_point': i,
                        'severity': severity,
                        'context': ent.sent.text
                    })
            
            # Track changes
            if i > 0:
                new = current_symptoms - previous_symptoms
                resolved = previous_symptoms - current_symptoms
                
                if new:
                    progression['new_symptoms'].append({
                        'time_point': i,
                        'symptoms': list(new)
                    })
                
                if resolved:
                    progression['resolved_symptoms'].append({
                        'time_point': i,
                        'symptoms': list(resolved)
                    })
            
            previous_symptoms = current_symptoms
        
        # Analyze severity changes
        for symptom, occurrences in progression['symptoms'].items():
            previous_severity = None
            for occurrence in occurrences:
                if previous_severity is not None and occurrence['severity'] != previous_severity:
                    progression['severity_changes'].append({
                        'symptom': symptom,
                        'time_point': occurrence['time_point'],
                        'from_severity': previous_severity,
                        'to_severity': occurrence['severity']
                    })
                previous_severity = occurrence['severity']
        
        return progression 