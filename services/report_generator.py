import os
import json
from datetime import datetime

class ConsultationReportGenerator:
    @staticmethod
    def generate_html_report(session_data):
        patient_name = session_data.get('patient_name', 'Anonymous Patient')
        symptoms = session_data.get('symptoms', [])
        diagnostic = session_data.get('diagnostic', {})
        chat_history = session_data.get('chat_history', [])
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        predictions_html = ""
        hospitals_html = ""
        
        if diagnostic and 'predictions' in diagnostic:
            for pred in diagnostic['predictions']:
                precautions_list = "".join([f"<li>{p}</li>" for p in pred.get('precautions', [])])
                tests_str = pred.get('recommended_tests', 'Complete Blood Count (CBC)')
                predictions_html += f"""
                <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
                    <h4 style="margin:0 0 5px 0; color:#1e293b;">{pred['disease']} ({pred['confidence']}% Probability)</h4>
                    <p style="margin:0 0 5px 0; font-size: 14px; color:#475569;"><strong>Recommended Specialist:</strong> {pred['specialist']}</p>
                    <p style="margin:0 0 5px 0; font-size: 13px; color:#0d9488;"><strong>Recommended Diagnostic Tests:</strong> {tests_str}</p>
                    <p style="margin:5px 0; font-size: 13px; color:#334155;">{pred.get('description', '')}</p>
                    <strong style="font-size: 13px; color: #4338ca;">Key Precautions:</strong>
                    <ul style="margin: 5px 0 0 20px; font-size: 13px; color: #475569;">
                        {precautions_list}
                    </ul>
                </div>
                """
                
            if 'recommended_hospitals' in diagnostic and diagnostic['recommended_hospitals']:
                for h in diagnostic['recommended_hospitals']:
                    hospitals_html += f"""
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                        <h4 style="margin: 0 0 4px 0; color: #166534;">🏥 {h['name']} ({h['rating']} ⭐)</h4>
                        <p style="margin: 0 0 4px 0; font-size: 13px; color: #374151;"><strong>Address:</strong> {h['address']}</p>
                        <p style="margin: 0; font-size: 13px; color: #dc2626;"><strong>Emergency Helpline:</strong> {h['emergency_hotline']}</p>
                    </div>
                    """
        else:
            predictions_html = "<p style='color:#64748b;'>No specific disease diagnostic triggered in this session.</p>"

        history_html = ""
        for msg in chat_history:
            sender = "Patient" if msg['sender'] == 'user' else "AI Healthcare Bot"
            color = "#4f46e5" if msg['sender'] == 'user' else "#059669"
            history_html += f"""
            <div style="margin-bottom: 10px; font-size: 14px;">
                <strong style="color:{color};">{sender}:</strong> {msg['text']}
            </div>
            """

        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Medical Consultation & Hospital Summary Report</title>
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; background: #f1f5f9; }}
                .report-card {{ max-width: 850px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }}
                .header {{ border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }}
                .badge {{ display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #e0e7ff; color: #4338ca; }}
                .disclaimer {{ background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px; border-radius: 6px; font-size: 12px; margin-top: 25px; }}
            </style>
        </head>
        <body>
            <div class="report-card">
                <div class="header">
                    <h2 style="margin:0; color:#0f172a;">🏥 Healthcare Diagnostic & Hospital Recommendation Summary</h2>
                    <p style="margin:5px 0 0 0; color:#64748b; font-size: 13px;">Generated on {timestamp}</p>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <div><strong>Patient Name:</strong> {patient_name}</div>
                    <div><span class="badge">AI Diagnostic & Hospital Finder</span></div>
                </div>

                <h3>🩺 Analyzed Symptoms</h3>
                <p style="background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 14px;">
                    {', '.join([s.replace('_', ' ').title() for s in symptoms]) if symptoms else 'No explicit symptoms logged'}
                </p>

                <h3>📊 Deep Learning Diagnostic Findings & Recommended Tests</h3>
                {predictions_html}

                {f"<h3>🏥 Recommended Specialist Hospitals</h3>{hospitals_html}" if hospitals_html else ""}

                <h3>💬 Dialogue Summary</h3>
                <div style="background: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #f1f5f9;">
                    {history_html if history_html else '<p>No conversation transcript.</p>'}
                </div>

                <div class="disclaimer">
                    ⚠️ <strong>Medical Disclaimer:</strong> This summary report is automatically generated by an artificial intelligence model for preliminary informational guidance. It does not constitute an official medical diagnosis. Please present this document to a certified medical professional for evaluation.
                </div>
            </div>
        </body>
        </html>
        """
        return html_template
