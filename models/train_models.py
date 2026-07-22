import os
import sys
import json
import re
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# Add project base directory to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from config import Config
from models.intent_classifier import IntentNeuralNet
from models.disease_predictor import DiseasePredictorNet

# Tokenizer helper
def tokenize(text):
    return re.findall(r'\w+', text.lower())

def bag_of_words(tokenized_sentence, all_words):
    tokenized_sentence = set(tokenized_sentence)
    bag = np.zeros(len(all_words), dtype=np.float32)
    for idx, w in enumerate(all_words):
        if w in tokenized_sentence:
            bag[idx] = 1.0
    return bag

# PyTorch Datasets
class IntentDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)
        
    def __len__(self):
        return len(self.X)
        
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

class DiseaseDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)
        
    def __len__(self):
        return len(self.X)
        
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

def train_intent_model():
    print("--- Training Intent Classifier Neural Network ---")
    with open(Config.INTENTS_JSON_PATH, 'r', encoding='utf-8') as f:
        intents_data = json.load(f)
        
    all_words = []
    tags = []
    xy = []
    
    for intent in intents_data['intents']:
        tag = intent['tag']
        tags.append(tag)
        for pattern in intent['patterns']:
            w = tokenize(pattern)
            all_words.extend(w)
            xy.append((w, tag))
            
    ignore_words = ['?', '!', '.', ',']
    all_words = sorted(list(set([w for w in all_words if w not in ignore_words])))
    tags = sorted(list(set(tags)))
    
    X_train = []
    y_train = []
    for (pattern_sentence, tag) in xy:
        bag = bag_of_words(pattern_sentence, all_words)
        X_train.append(bag)
        label = tags.index(tag)
        y_train.append(label)
        
    X_train = np.array(X_train)
    y_train = np.array(y_train)
    
    dataset = IntentDataset(X_train, y_train)
    train_loader = DataLoader(dataset=dataset, batch_size=Config.INTENT_BATCH_SIZE, shuffle=True)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = IntentNeuralNet(len(all_words), Config.INTENT_HIDDEN_DIM, len(tags)).to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=Config.INTENT_LR)
    
    model.train()
    for epoch in range(Config.INTENT_EPOCHS):
        total_loss = 0
        correct = 0
        total = 0
        for X_batch, y_batch in train_loader:
            X_batch, y_batch = X_batch.to(device), y_batch.to(device)
            optimizer.zero_grad()
            outputs = model(X_batch)
            loss = criterion(outputs, y_batch)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            _, preds = torch.max(outputs, 1)
            correct += (preds == y_batch).sum().item()
            total += y_batch.size(0)
            
        if (epoch + 1) % 50 == 0:
            print(f"Epoch [{epoch+1}/{Config.INTENT_EPOCHS}] - Loss: {total_loss/len(train_loader):.4f} - Acc: {(correct/total)*100:.2f}%")
            
    # Save Model Artifacts
    os.makedirs(Config.MODELS_DIR, exist_ok=True)
    torch.save(model.state_dict(), Config.INTENT_MODEL_PATH)
    
    metadata = {
        "all_words": all_words,
        "tags": tags,
        "input_size": len(all_words),
        "hidden_size": Config.INTENT_HIDDEN_DIM,
        "num_classes": len(tags)
    }
    with open(Config.INTENT_META_PATH, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=4)
        
    print(f"[OK] Intent Model Saved to: {Config.INTENT_MODEL_PATH}")

def train_disease_model():
    print("\n--- Training Disease Predictor Deep Neural Network ---")
    df = pd.read_csv(Config.SYMPTOM_DISEASE_CSV_PATH)
    
    symptoms = [c for c in df.columns if c != 'prognosis']
    le = LabelEncoder()
    df['target'] = le.fit_transform(df['prognosis'])
    diseases = list(le.classes_)
    
    X = df[symptoms].values
    y = df['target'].values
    
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    train_dataset = DiseaseDataset(X_train, y_train)
    val_dataset = DiseaseDataset(X_val, y_val)
    
    train_loader = DataLoader(dataset=train_dataset, batch_size=Config.DISEASE_BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(dataset=val_dataset, batch_size=Config.DISEASE_BATCH_SIZE, shuffle=False)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = DiseasePredictorNet(
        input_dim=len(symptoms),
        hidden_dims=Config.DISEASE_HIDDEN_DIMS,
        num_classes=len(diseases),
        dropout_rate=Config.DISEASE_DROPOUT
    ).to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=Config.DISEASE_LR, weight_decay=1e-4)
    
    for epoch in range(Config.DISEASE_EPOCHS):
        model.train()
        train_loss = 0
        for X_b, y_b in train_loader:
            X_b, y_b = X_b.to(device), y_b.to(device)
            optimizer.zero_grad()
            logits = model(X_b)
            loss = criterion(logits, y_b)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            
        if (epoch + 1) % 50 == 0:
            model.eval()
            val_correct = 0
            val_total = 0
            with torch.no_grad():
                for X_v, y_v in val_loader:
                    X_v, y_v = X_v.to(device), y_v.to(device)
                    logits = model(X_v)
                    _, preds = torch.max(logits, 1)
                    val_correct += (preds == y_v).sum().item()
                    val_total += y_v.size(0)
            print(f"Epoch [{epoch+1}/{Config.DISEASE_EPOCHS}] - Train Loss: {train_loss/len(train_loader):.4f} - Val Acc: {(val_correct/val_total)*100:.2f}%")
            
    # Save Disease Model Artifacts
    torch.save(model.state_dict(), Config.DISEASE_MODEL_PATH)
    
    disease_meta = {
        "symptoms": symptoms,
        "diseases": diseases,
        "input_dim": len(symptoms),
        "hidden_dims": Config.DISEASE_HIDDEN_DIMS,
        "num_classes": len(diseases)
    }
    with open(Config.DISEASE_META_PATH, 'w', encoding='utf-8') as f:
        json.dump(disease_meta, f, indent=4)
        
    print(f"[OK] Disease Model Saved to: {Config.DISEASE_MODEL_PATH}")

if __name__ == '__main__':
    train_intent_model()
    train_disease_model()
