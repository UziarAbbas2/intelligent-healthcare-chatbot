import os
import sys
from flask import Flask, render_template, request, jsonify, send_file
import io

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from config import Config
from services.chatbot_service import chatbot_service
from services.report_generator import ConsultationReportGenerator

app = Flask(__name__)
app.config['SECRET_KEY'] = Config.SECRET_KEY

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def api_chat():
    try:
        data = request.get_json() or {}
        user_message = data.get('message', '').strip()
        selected_symptoms = data.get('symptoms', [])
        preferred_city = data.get('city', None)
        preferred_specialty = data.get('specialty', None)
        search_type = data.get('search_type', None)

        if not user_message and not selected_symptoms:
            return jsonify({
                "status": "error",
                "message": "Message or symptoms required."
            }), 400

        response_data = chatbot_service.process_query(
            user_message=user_message,
            selected_symptoms=selected_symptoms,
            preferred_city=preferred_city,
            preferred_specialty=preferred_specialty,
            search_type=search_type
        )

        return jsonify({
            "status": "success",
            "data": response_data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/predict_disease', methods=['POST'])
def api_predict_disease():
    try:
        data = request.get_json() or {}
        symptoms = data.get('symptoms', [])
        preferred_city = data.get('city', None)
        
        if not symptoms:
            return jsonify({
                "status": "error",
                "message": "At least one symptom is required."
            }), 400

        diagnostic_result = chatbot_service.predict_disease(symptoms, preferred_city=preferred_city)
        return jsonify({
            "status": "success",
            "data": diagnostic_result
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/hospitals', methods=['GET'])
def api_hospitals():
    try:
        query = request.args.get('query', '')
        specialty = request.args.get('specialty', '')
        city = request.args.get('city', '')
        is_emergency = request.args.get('emergency', 'false').lower() == 'true'

        results = chatbot_service.hospital_service.search_hospitals(
            query=query,
            specialty=specialty,
            is_emergency=is_emergency,
            city=city
        )

        return jsonify({
            "status": "success",
            "total": len(results),
            "hospitals": results
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/doctors', methods=['GET'])
def api_doctors():
    try:
        query = request.args.get('query', '')
        specialty = request.args.get('specialty', '')
        city = request.args.get('city', '')

        results = chatbot_service.doctor_service.search_doctors(
            query=query,
            specialty=specialty,
            city=city
        )

        return jsonify({
            "status": "success",
            "total": len(results),
            "doctors": results
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/hospitals/bed_availability', methods=['GET'])
def api_hospital_bed_availability():
    try:
        city = request.args.get('city', '')
        results = chatbot_service.hospital_service.search_hospitals(city=city)
        bed_data = [{
            "id": h.get('id'),
            "name": h.get('name'),
            "city": h.get('city'),
            "phone": h.get('phone'),
            "live_beds": h.get('live_beds')
        } for h in results]
        return jsonify({"status": "success", "hospitals": bed_data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/parse_lab_report', methods=['POST'])
def api_parse_lab_report():
    try:
        report_text = ""
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json() or {}
            report_text = data.get('report_text', '')

        if not report_text and 'file' in request.files:
            uploaded_file = request.files['file']
            file_bytes = uploaded_file.read()
            report_text = chatbot_service.extract_text_from_file_bytes(file_bytes, filename=uploaded_file.filename)

        if not report_text or len(report_text.strip()) == 0:
            return jsonify({
                "status": "error",
                "message": "Unable to extract text from file. Please ensure it is a valid PDF, Image (PNG/JPG), or Text report."
            }), 400

        result = chatbot_service.parse_lab_report_text(report_text)
        return jsonify({
            "status": "success",
            "extracted_text_preview": report_text[:200] + ("..." if len(report_text) > 200 else ""),
            "data": result
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/analyze_medical_image', methods=['POST'])
def api_analyze_medical_image():
    try:
        if 'image' not in request.files and 'file' not in request.files:
            return jsonify({"status": "error", "message": "No medical image file uploaded."}), 400

        uploaded_file = request.files.get('image') or request.files.get('file')
        file_bytes = uploaded_file.read()
        
        vision_result = chatbot_service.vision_ai_service.analyze_medical_image_bytes(
            image_bytes=file_bytes,
            filename=uploaded_file.filename
        )

        return jsonify({
            "status": "success",
            "vision_analysis": vision_result
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/realtime_health', methods=['GET'])
def api_realtime_health():
    try:
        data = chatbot_service.realtime_service.get_realtime_context("live ticker health data")
        return jsonify({
            "status": "success",
            "realtime_data": data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/symptoms', methods=['GET'])
def api_symptoms():
    try:
        symptoms_data = [
            {"id": s, "name": s.replace('_', ' ').title()}
            for s in chatbot_service.symptom_list
        ]
        return jsonify({
            "status": "success",
            "symptoms": symptoms_data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/download_report', methods=['POST'])
def api_download_report():
    try:
        data = request.get_json() or {}
        patient_name = data.get('patient_name', 'Patient')
        symptoms = data.get('symptoms', [])
        chat_history = data.get('chat_history', [])

        disease_diag = chatbot_service.predict_disease(symptoms) if symptoms else None

        html_content = ConsultationReportGenerator.generate_html_report({
            "patient_name": patient_name,
            "symptoms": symptoms,
            "diagnostic": disease_diag,
            "chat_history": chat_history
        })

        buffer = io.BytesIO()
        buffer.write(html_content.encode('utf-8'))
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"Consultation_Report_{patient_name}.html",
            mimetype="text/html"
        )
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Intelligent Healthcare Chatbot Server on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
