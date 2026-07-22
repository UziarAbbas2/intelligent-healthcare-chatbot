# 🏥 Intelligent Healthcare Chatbot using Deep Learning

An advanced AI-powered Healthcare Assistant and Symptom Diagnostics System built using **PyTorch**, **Flask**, and **Google Colab**.

---

## 🌟 Key Features

1. **Dual Deep Learning Engine**:
   - **Intent Neural Network**: Multi-layer PyTorch Deep Neural Network with embeddings and dropout for natural medical dialogue processing.
   - **Disease Diagnostic Residual DNN**: Multi-Layer Perceptron trained on symptom matrices with soft confidence scoring, top recommendations, and disease severity triaging.

2. **Emergency Triage Protocol**:
   - Real-time detection of high-risk medical emergencies (stroke, heart attack, anaphylaxis, severe bleeding) with instant emergency guidance.

3. **Google Colab Jupyter Notebook (`Intelligent_Healthcare_Chatbot.ipynb`)**:
   - Production-ready Jupyter notebook with CUDA GPU acceleration support.
   - Data generation, training visualization (Loss/Accuracy curves, Confusion Matrix), model testing, and `.pth` weight export.

4. **Glassmorphic Responsive Web Application**:
   - Dynamic dark mode styling, medical vital stats, live symptom pill tags, Speech-to-Text, Voice Text-to-Speech synthesis, and PDF/HTML consultation report generator.

---

## 📁 Project Structure

```
d:/Project/Intelligent Healthcare Chatbot/
├── Intelligent_Healthcare_Chatbot.ipynb  # Main Google Colab Jupyter Notebook
├── app.py                                # Flask Web Backend Application
├── config.py                             # Configuration & Hyperparameter Setup
├── requirements.txt                      # Python dependencies
├── data/
│   ├── dataset_generator.py              # Script to build datasets
│   ├── intents.json                      # Medical intent dialogue intents
│   ├── symptom_disease_dataset.csv       # Multi-symptom disease training dataset
│   ├── symptom_severity.csv              # Emergency triage severity weights
│   └── disease_precautions.csv           # Treatments, precautions & specialist info
├── models/
│   ├── intent_classifier.py              # PyTorch Intent Model Class
│   ├── disease_predictor.py              # PyTorch Disease Diagnostic Model Class
│   ├── train_models.py                   # Local training execution runner
│   ├── intent_model.pth                  # Pre-trained intent classifier weights
│   └── disease_model.pth                 # Pre-trained disease diagnostic weights
├── services/
│   ├── chatbot_service.py                # Core NLP & Inference Engine
│   └── report_generator.py               # Consultation summary exporter
├── static/
│   ├── css/style.css                     # Modern glassmorphism UI styling
│   └── js/app.js                         # Dynamic web interactions & Voice I/O
└── templates/
    └── index.html                        # Web Dashboard UI Template
```

---

## 🚀 Getting Started

### 1. Local Setup & Execution

1. Clone or navigate to the project directory:
   ```bash
   cd "d:/Project/Intelligent Healthcare Chatbot"
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Generate datasets & train models locally:
   ```bash
   python data/dataset_generator.py
   python models/train_models.py
   ```

4. Run the Flask web app:
   ```bash
   python app.py
   ```

5. Open your web browser and navigate to: `http://127.0.0.1:5000/`

---

## 💻 Running in Google Colab

1. Upload `Intelligent_Healthcare_Chatbot.ipynb` to [Google Colab](https://colab.research.google.com/).
2. Select **Runtime > Change runtime type > GPU**.
3. Run all cells sequentially.
4. Download the generated `intent_model.pth`, `disease_model.pth`, and metadata JSON files to place in your local `models/` directory if desired.

---

## ⚠️ Medical Disclaimer
*This project is intended strictly for educational, research, and informational purposes. It is not a substitute for professional medical advice, diagnosis, or treatment.*
