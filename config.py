import os

class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SECRET_KEY = os.environ.get('SECRET_KEY', 'healthcare-ai-secret-key-2026')
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    MODELS_DIR = os.path.join(BASE_DIR, 'models')
    
    # Dataset Paths
    INTENTS_JSON_PATH = os.path.join(DATA_DIR, 'intents.json')
    SYMPTOM_DISEASE_CSV_PATH = os.path.join(DATA_DIR, 'symptom_disease_dataset.csv')
    SYMPTOM_SEVERITY_CSV_PATH = os.path.join(DATA_DIR, 'symptom_severity.csv')
    DISEASE_PRECAUTIONS_CSV_PATH = os.path.join(DATA_DIR, 'disease_precautions.csv')
    
    # Model Artifact Paths
    INTENT_MODEL_PATH = os.path.join(MODELS_DIR, 'intent_model.pth')
    INTENT_META_PATH = os.path.join(MODELS_DIR, 'intent_metadata.json')
    DISEASE_MODEL_PATH = os.path.join(MODELS_DIR, 'disease_model.pth')
    DISEASE_META_PATH = os.path.join(MODELS_DIR, 'disease_metadata.json')
    
    # Hyperparameters
    INTENT_EMBEDDING_DIM = 64
    INTENT_HIDDEN_DIM = 128
    INTENT_EPOCHS = 150
    INTENT_BATCH_SIZE = 16
    INTENT_LR = 0.003
    
    DISEASE_HIDDEN_DIMS = [256, 128, 64]
    DISEASE_EPOCHS = 200
    DISEASE_BATCH_SIZE = 32
    DISEASE_LR = 0.002
    DISEASE_DROPOUT = 0.3
    
    # Safety Triage
    EMERGENCY_KEYWORDS = [
        "chest pain", "shortness of breath", "heart attack", "stroke", 
        "unconscious", "severe bleeding", "anaphylaxis", "coughing blood",
        "paralysis", "sudden numbness", "seizure", "poisoning"
    ]
