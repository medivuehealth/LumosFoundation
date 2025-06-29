import hashlib
from datetime import datetime
import re

class DataAnonymizer:
    def __init__(self):
        self.salt = hashlib.sha256(datetime.now().isoformat().encode()).hexdigest()[:16]
        
        # Regular expressions for identifying PHI in text
        self.phi_patterns = {
            'name': r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b',  # Matches full names
            'email': r'\b[\w\.-]+@[\w\.-]+\.\w+\b',  # Matches email addresses
            'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # Matches phone numbers
            'ssn': r'\b\d{3}-\d{2}-\d{4}\b',  # Matches SSN
            'mrn': r'\b(MRN|mrn)[:# ]\s*\d+\b',  # Matches Medical Record Numbers
            'date': r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b'  # Matches dates
        }
    
    def generate_anonymous_id(self, patient_id):
        """Generate a consistent but anonymous identifier for a patient"""
        return hashlib.sha256(f"{patient_id}{self.salt}".encode()).hexdigest()
    
    def anonymize_data(self, data_dict):
        """
        Anonymize patient data according to HIPAA Safe Harbor rules
        Returns a copy of the data with sensitive information removed/transformed
        """
        anonymized = data_dict.copy()
        
        # Generate anonymous ID if patient_id exists
        if 'patient_id' in anonymized:
            anonymized['anonymous_id'] = self.generate_anonymous_id(anonymized['patient_id'])
            del anonymized['patient_id']
        
        # Remove any direct identifiers
        identifiers = ['name', 'email', 'phone', 'address', 'ssn', 'mrn']
        for identifier in identifiers:
            if identifier in anonymized:
                del anonymized[identifier]
        
        # Keep age range instead of exact age/birth date
        if 'birth_date' in anonymized:
            age = self.calculate_age(anonymized['birth_date'])
            anonymized['age_range'] = self.get_age_range(age)
            del anonymized['birth_date']
        
        # Generalize location data
        if 'zip_code' in anonymized:
            anonymized['region'] = self.get_region(anonymized['zip_code'])
            del anonymized['zip_code']
        
        return anonymized
    
    def de_identify_notes(self, notes):
        """Remove PHI from clinical notes"""
        if not notes:
            return ""
            
        de_identified = notes
        
        # Replace each type of PHI with a generic placeholder
        for phi_type, pattern in self.phi_patterns.items():
            de_identified = re.sub(
                pattern,
                f"[{phi_type.upper()}]",
                de_identified
            )
        
        return de_identified
    
    def calculate_age(self, birth_date):
        """Calculate age from birth date"""
        if isinstance(birth_date, str):
            birth_date = datetime.strptime(birth_date, '%Y-%m-%d')
        today = datetime.now()
        age = today.year - birth_date.year
        if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
            age -= 1
        return age
    
    def get_age_range(self, age):
        """Convert exact age to age range"""
        ranges = [
            (0, 4), (5, 9), (10, 14), (15, 19),
            (20, 24), (25, 29), (30, 34), (35, 39),
            (40, 44), (45, 49), (50, 54), (55, 59),
            (60, 64), (65, 69), (70, 74), (75, 79),
            (80, 84), (85, 89)
        ]
        
        for start, end in ranges:
            if start <= age <= end:
                return f"{start}-{end}"
        return "90+"
    
    def get_region(self, zip_code):
        """Convert ZIP code to region"""
        # Simple mapping of first digit to region
        region_map = {
            '0': 'northeast',
            '1': 'northeast',
            '2': 'southeast',
            '3': 'southeast',
            '4': 'midwest',
            '5': 'midwest',
            '6': 'midwest',
            '7': 'southwest',
            '8': 'west',
            '9': 'west'
        }
        return region_map.get(str(zip_code)[0], 'unknown') 