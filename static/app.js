document.addEventListener('DOMContentLoaded', () => {
    let selectedSymptoms = [];
    let supportedSymptoms = [];
    let chatLog = [];
    let isVoiceEnabled = true;

    // DOM Elements
    const chatHistory = document.getElementById('chatHistory');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const symptomSearchInput = document.getElementById('symptomSearchInput');
    const symptomDropdown = document.getElementById('symptomDropdown');
    const activeSymptomTags = document.getElementById('activeSymptomTags');
    const activeSymptomCount = document.getElementById('activeSymptomCount');
    const analyzeSymptomsBtn = document.getElementById('analyzeSymptomsBtn');
    const citySelect = document.getElementById('citySelect');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const searchHospitalsBtn = document.getElementById('searchHospitalsBtn');
    const searchDoctorsBtn = document.getElementById('searchDoctorsBtn');
    const emergencyBanner = document.getElementById('emergencyBanner');
    const emergencyMsgText = document.getElementById('emergencyMsgText');
    const voiceToggleBtn = document.getElementById('voiceToggleBtn');
    const exportReportBtn = document.getElementById('exportReportBtn');
    const findHospHeaderBtn = document.getElementById('findHospHeaderBtn');
    const findDoctorHeaderBtn = document.getElementById('findDoctorHeaderBtn');

    fetch('/api/symptoms')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                supportedSymptoms = data.symptoms;
            }
        });

    symptomSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            symptomDropdown.style.display = 'none';
            return;
        }

        const filtered = supportedSymptoms.filter(s => 
            s.name.toLowerCase().includes(query) || s.id.includes(query)
        ).slice(0, 8);

        if (filtered.length > 0) {
            symptomDropdown.innerHTML = filtered.map(s => `
                <div class="symptom-option" data-id="${s.id}" data-name="${s.name}">
                    <i class="fa-solid fa-plus" style="color: var(--primary); margin-right: 6px;"></i> ${s.name}
                </div>
            `).join('');
            symptomDropdown.style.display = 'block';
        } else {
            symptomDropdown.style.display = 'none';
        }
    });

    symptomDropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.symptom-option');
        if (option) {
            const symId = option.dataset.id;
            const symName = option.dataset.name;
            addSymptomTag(symId, symName);
            symptomSearchInput.value = '';
            symptomDropdown.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.symptom-input-wrapper')) {
            symptomDropdown.style.display = 'none';
        }
    });

    function addSymptomTag(symId, symName) {
        if (!selectedSymptoms.includes(symId)) {
            selectedSymptoms.push(symId);
            renderSymptomTags();
        }
    }

    function removeSymptomTag(symId) {
        selectedSymptoms = selectedSymptoms.filter(s => s !== symId);
        renderSymptomTags();
    }

    function renderSymptomTags() {
        activeSymptomCount.textContent = selectedSymptoms.length;
        if (selectedSymptoms.length === 0) {
            activeSymptomTags.innerHTML = `<span style="font-size: 0.78rem; color: var(--text-dim); padding: 6px;">No symptoms selected yet.</span>`;
            return;
        }

        activeSymptomTags.innerHTML = selectedSymptoms.map(symId => {
            const symObj = supportedSymptoms.find(s => s.id === symId);
            const displayName = symObj ? symObj.name : symId.replace(/_/g, ' ');
            return `
                <div class="symptom-tag">
                    ${displayName}
                    <span class="remove-btn" data-id="${symId}">&times;</span>
                </div>
            `;
        }).join('');

        activeSymptomTags.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeSymptomTag(e.target.dataset.id);
            });
        });
    }

    // Interactive Visual Anatomy Body Map Region Mapping
    const anatomyMap = {
        head: [
            { id: "headache", name: "Headache" },
            { id: "dizziness", name: "Dizziness" },
            { id: "slurred_speech", name: "Slurred Speech" },
            { id: "blurred_and_distorted_vision", name: "Blurred Vision" },
            { id: "loss_of_smell", name: "Loss of Smell" }
        ],
        chest: [
            { id: "chest_pain", name: "Chest Pain" },
            { id: "breathlessness", name: "Breathlessness" },
            { id: "cough", name: "Cough" },
            { id: "sweating", name: "Excessive Sweating" },
            { id: "fast_heart_rate", name: "Fast Heart Rate" }
        ],
        abdomen: [
            { id: "stomach_pain", name: "Stomach Pain" },
            { id: "acidity", name: "Acidity & Heartburn" },
            { id: "vomiting", name: "Vomiting" },
            { id: "diarrhea", name: "Diarrhea" },
            { id: "yellowish_skin", name: "Yellowish Skin / Jaundice" }
        ],
        spine: [
            { id: "neck_pain", name: "Neck Pain" },
            { id: "stiff_neck", name: "Stiff Neck" },
            { id: "back_pain", name: "Back Pain" },
            { id: "radicular_arm_numbness", name: "Arm Numbness" }
        ],
        limbs: [
            { id: "joint_pain", name: "Joint Pain" },
            { id: "swollen_legs", name: "Swollen Legs / Ankles" },
            { id: "knee_stiffness", name: "Knee Stiffness" },
            { id: "muscle_weakness", name: "Muscle Weakness" }
        ],
        skin: [
            { id: "skin_rash", name: "Skin Rash" },
            { id: "itching", name: "Skin Itching" },
            { id: "high_fever", name: "High Fever" },
            { id: "chills", name: "Chills" },
            { id: "fatigue", name: "Fatigue" }
        ]
    };

    const anatomyBtns = document.querySelectorAll('.anatomy-btn');
    const anatomyQuickPanel = document.getElementById('anatomyQuickPanel');

    anatomyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const region = btn.dataset.region;
            
            // Toggle active state
            anatomyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const symptoms = anatomyMap[region] || [];
            anatomyQuickPanel.innerHTML = symptoms.map(s => `
                <span class="anatomy-chip" data-id="${s.id}" data-name="${s.name}">
                    + ${s.name}
                </span>
            `).join('');
            anatomyQuickPanel.style.display = 'flex';
        });
    });

    if (anatomyQuickPanel) {
        anatomyQuickPanel.addEventListener('click', (e) => {
            const chip = e.target.closest('.anatomy-chip');
            if (chip) {
                const symId = chip.dataset.id;
                const symName = chip.dataset.name;
                addSymptomTag(symId, symName);
            }
        });
    }

    // Health Vitals & BMI Calculator Logic
    const calculateVitalsBtn = document.getElementById('calculateVitalsBtn');
    const vitalsResultBox = document.getElementById('vitalsResultBox');

    if (calculateVitalsBtn) {
        calculateVitalsBtn.addEventListener('click', () => {
            const hCm = parseFloat(document.getElementById('vitalHeight').value);
            const wKg = parseFloat(document.getElementById('vitalWeight').value);
            const sysBp = parseFloat(document.getElementById('vitalSys').value);
            const diaBp = parseFloat(document.getElementById('vitalDia').value);

            if (!hCm || !wKg || hCm <= 0 || wKg <= 0) {
                vitalsResultBox.innerHTML = `<span style="color: var(--accent-rose);"><i class="fa-solid fa-triangle-exclamation"></i> Please enter valid Height (cm) and Weight (kg).</span>`;
                vitalsResultBox.style.display = 'flex';
                return;
            }

            const hM = hCm / 100.0;
            const bmi = (wKg / (hM * hM)).toFixed(1);
            
            let bmiStatus = "Normal Weight";
            let bmiClass = "normal";
            if (bmi < 18.5) {
                bmiStatus = "Underweight";
                bmiClass = "warning";
            } else if (bmi >= 25.0 && bmi < 29.9) {
                bmiStatus = "Overweight";
                bmiClass = "warning";
            } else if (bmi >= 30.0) {
                bmiStatus = "Obese";
                bmiClass = "danger";
            }

            const minIdealW = (18.5 * hM * hM).toFixed(1);
            const maxIdealW = (24.9 * hM * hM).toFixed(1);
            const waterIntake = (wKg * 0.033).toFixed(1);

            let bpHtml = '';
            if (sysBp && diaBp) {
                let bpCategory = "Normal Blood Pressure";
                let bpClass = "normal";
                if (sysBp > 180 || diaBp > 120) {
                    bpCategory = "HYPERTENSIVE CRISIS WARNING";
                    bpClass = "danger";
                } else if (sysBp >= 140 || diaBp >= 90) {
                    bpCategory = "Stage 2 Hypertension";
                    bpClass = "danger";
                } else if ((sysBp >= 130 && sysBp <= 139) || (diaBp >= 80 && diaBp <= 89)) {
                    bpCategory = "Stage 1 Hypertension";
                    bpClass = "warning";
                } else if (sysBp >= 120 && sysBp <= 129 && diaBp < 80) {
                    bpCategory = "Elevated Blood Pressure";
                    bpClass = "warning";
                }

                bpHtml = `
                    <div class="vital-metric-row" style="margin-top: 4px; border-top: 1px solid var(--panel-border); padding-top: 4px;">
                        <span>Blood Pressure (${sysBp}/${diaBp}):</span>
                        <span class="vital-badge ${bpClass}">${bpCategory}</span>
                    </div>
                `;
            }

            appendMessage('bot', `I have calculated your Body Mass Index (BMI) and physiological health vitals:`);
            const lastBubble = chatHistory.querySelector('.message-row.bot:last-child .message-bubble');
            if (lastBubble) {
                const vitalsDiv = document.createElement('div');
                vitalsDiv.className = 'vitals-card';
                vitalsDiv.style.marginTop = '8px';
                vitalsDiv.innerHTML = `
                    <div class="vital-metric-row">
                        <span>Body Mass Index (BMI):</span>
                        <span class="vital-badge ${bmiClass}">${bmi} kg/m² (${bmiStatus})</span>
                    </div>
                    <div class="vital-metric-row">
                        <span>Ideal Body Weight:</span>
                        <strong style="color: var(--accent-teal);">${minIdealW} - ${maxIdealW} kg</strong>
                    </div>
                    <div class="vital-metric-row">
                        <span>Daily Hydration Goal:</span>
                        <strong style="color: #60a5fa;">💧 ${waterIntake} Liters/day</strong>
                    </div>
                    ${bpHtml}
                `;
                lastBubble.appendChild(vitalsDiv);
            }
            if (bmiModal) bmiModal.style.display = 'none';
        });
    }

    // Top Header Modal Open/Close Triggers
    const bmiModal = document.getElementById('bmiModal');
    const labModal = document.getElementById('labModal');
    const visionModal = document.getElementById('visionModal');

    const btnOpenBmiModal = document.getElementById('btnOpenBmiModal');
    const btnOpenLabModal = document.getElementById('btnOpenLabModal');
    const btnOpenVisionModal = document.getElementById('btnOpenVisionModal');

    if (btnOpenBmiModal && bmiModal) {
        btnOpenBmiModal.addEventListener('click', () => bmiModal.style.display = 'flex');
    }
    if (btnOpenLabModal && labModal) {
        btnOpenLabModal.addEventListener('click', () => labModal.style.display = 'flex');
    }
    if (btnOpenVisionModal && visionModal) {
        btnOpenVisionModal.addEventListener('click', () => visionModal.style.display = 'flex');
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const mId = btn.dataset.modal;
            if (mId) document.getElementById(mId).style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
        }
    });

    // Medical Lab Report OCR Reader Engine
    const uploadLabFileBtn = document.getElementById('uploadLabFileBtn');
    const labReportFileInput = document.getElementById('labReportFileInput');
    const parseLabReportBtn = document.getElementById('parseLabReportBtn');
    const labReportTextInput = document.getElementById('labReportTextInput');
    let selectedLabFile = null;

    if (uploadLabFileBtn && labReportFileInput) {
        uploadLabFileBtn.addEventListener('click', () => labReportFileInput.click());
        labReportFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedLabFile = file;
                uploadLabFileBtn.innerHTML = `<i class="fa-solid fa-file-circle-check" style="color: var(--accent-teal);"></i> Attached: ${file.name}`;
                if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        labReportTextInput.value = event.target.result;
                    };
                    reader.readAsText(file);
                } else {
                    labReportTextInput.value = `[Medical Report File Attached: ${file.name}]`;
                }
            }
        });
    }

    if (parseLabReportBtn) {
        parseLabReportBtn.addEventListener('click', () => {
            const reportText = labReportTextInput.value.trim();
            if (!reportText && !selectedLabFile) {
                alert('Please paste lab report text or upload a PDF / Image / Text file.');
                return;
            }

            parseLabReportBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Extracting PDF/Image Text...`;

            let fetchPromise;
            if (selectedLabFile) {
                const formData = new FormData();
                formData.append('file', selectedLabFile);
                if (reportText && !reportText.startsWith('[Medical Report File')) {
                    formData.append('report_text', reportText);
                }
                fetchPromise = fetch('/api/parse_lab_report', {
                    method: 'POST',
                    body: formData
                });
            } else {
                fetchPromise = fetch('/api/parse_lab_report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ report_text: reportText })
                });
            }

            fetchPromise.then(res => res.json())
            .then(data => {
                parseLabReportBtn.innerHTML = `<i class="fa-solid fa-microscope"></i> Extract & Analyze Lab Report`;
                if (data.status === 'success') {
                    const resData = data.data;
                    renderLabReportResultCard(resData);
                } else {
                    alert('Error parsing lab report: ' + (data.message || 'Unknown error'));
                }
            })
            .catch(err => {
                parseLabReportBtn.innerHTML = `<i class="fa-solid fa-microscope"></i> Extract & Analyze Lab Report`;
                alert('Connection error communicating with Lab Report API.');
            });
        });
    }

    function renderLabReportResultCard(labData) {
        const metrics = labData.extracted_metrics || [];
        const symptoms = labData.mapped_symptoms || [];

        if (symptoms.length > 0) {
            symptoms.forEach(sym => addSymptomTag(sym, sym));
        }

        const metricsHtml = metrics.length > 0 ? metrics.map(m => `
            <div class="lab-metric-item">
                <div class="vital-metric-row">
                    <span class="lab-metric-name">${m.name}: <strong>${m.value}</strong></span>
                    <span class="vital-badge ${m.badge}">${m.status}</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">Normal Reference: ${m.normal_range}</div>
            </div>
        `).join('') : '<div style="font-size: 0.78rem; color: var(--text-muted);">No standard clinical lab metrics detected in text.</div>';

        const lDiag = labData.lab_diagnostic;
        const dedicatedLabDiagHtml = lDiag ? `
            <div class="dedicated-lab-diag-card">
                <div style="font-weight:700; font-size:0.84rem; color:var(--accent-teal);">
                    <i class="fa-solid fa-notes-medical"></i> Pathology Clinical Diagnostic Impression:
                </div>
                <div style="font-size:0.88rem; font-weight:700; color:#ffffff;">
                    ${lDiag.pathology_impression}
                </div>
                <div style="display:flex; gap:12px; font-size:0.76rem; color:var(--text-muted); margin-top:2px;">
                    <span><i class="fa-solid fa-chart-line" style="color:var(--accent-teal);"></i> <strong>Confidence:</strong> ${lDiag.diagnostic_confidence}%</span>
                    <span><i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-amber);"></i> <strong>Severity:</strong> ${lDiag.pathology_severity}</span>
                </div>
                ${lDiag.abnormal_indicators && lDiag.abnormal_indicators.length > 0 ? `
                    <div style="font-size:0.76rem; color:#fca5a5; margin-top:2px;">
                        <i class="fa-solid fa-circle-exclamation"></i> <strong>Flagged Out-of-Range Markers:</strong> ${lDiag.abnormal_indicators.join(', ')}
                    </div>
                ` : ''}
                <div style="font-size:0.76rem; color:#a5b4fc; margin-top:2px;">
                    <i class="fa-solid fa-vial-circle-check"></i> <strong>Recommended Follow-up Tests:</strong> ${lDiag.recommended_followup_labs}
                </div>
            </div>
        ` : '';

        const labCardHtml = `
            <div class="lab-report-card">
                <div class="lab-header">
                    <span><i class="fa-solid fa-microscope"></i> Medical Lab Report OCR Extraction:</span>
                    <span class="tag-badge"><i class="fa-solid fa-vial"></i> ${metrics.length} Metrics Extracted</span>
                </div>
                <div class="lab-metric-grid">
                    ${metricsHtml}
                </div>
                ${symptoms.length > 0 ? `
                    <div style="font-size: 0.78rem; color: var(--accent-amber); margin-top: 4px;">
                        <i class="fa-solid fa-link"></i> <strong>Mapped Clinical Symptoms:</strong> ${symptoms.map(s => s.replace(/_/g, ' ')).join(', ')}
                    </div>
                ` : ''}
                ${dedicatedLabDiagHtml}
            </div>
        `;

        appendMessage('bot', `I have completed the pathology analysis of your uploaded lab report:`);
        
        const lastBubble = chatHistory.querySelector('.message-row.bot:last-child .message-bubble');
        if (lastBubble) {
            const labDiv = document.createElement('div');
            labDiv.innerHTML = labCardHtml;
            lastBubble.appendChild(labDiv);
        }
        if (labModal) labModal.style.display = 'none';
    }

    // Multi-Modal Medical Image AI Scanner Engine
    const uploadVisionImageBtn = document.getElementById('uploadVisionImageBtn');
    const medicalImageInput = document.getElementById('medicalImageInput');
    const analyzeVisionImageBtn = document.getElementById('analyzeVisionImageBtn');
    let selectedVisionImageFile = null;

    if (uploadVisionImageBtn && medicalImageInput) {
        uploadVisionImageBtn.addEventListener('click', () => medicalImageInput.click());
        medicalImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedVisionImageFile = file;
                uploadVisionImageBtn.innerHTML = `<i class="fa-solid fa-file-circle-check" style="color: var(--accent-amber);"></i> Loaded: ${file.name}`;
            }
        });
    }

    if (analyzeVisionImageBtn) {
        analyzeVisionImageBtn.addEventListener('click', () => {
            if (!selectedVisionImageFile) {
                alert('Please upload an X-Ray, MRI/CT, or Skin Scan image.');
                return;
            }

            analyzeVisionImageBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Medical Scan...`;

            const formData = new FormData();
            formData.append('image', selectedVisionImageFile);

            fetch('/api/analyze_medical_image', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                analyzeVisionImageBtn.innerHTML = `<i class="fa-solid fa-eye"></i> Scan & Analyze Medical Image`;
                if (data.status === 'success') {
                    renderMedicalVisionCard(data.vision_analysis);
                } else {
                    alert('Error analyzing medical image: ' + (data.message || 'Error'));
                }
            })
            .catch(err => {
                analyzeVisionImageBtn.innerHTML = `<i class="fa-solid fa-eye"></i> Scan & Analyze Medical Image`;
                alert('Connection error with Vision AI API.');
            });
        });
    }

    function renderMedicalVisionCard(vData) {
        const symptoms = vData.detected_symptoms || [];
        if (symptoms.length > 0) {
            symptoms.forEach(sym => addSymptomTag(sym, sym));
        }

        const findingsHtml = vData.findings ? vData.findings.map(f => `<li>${f}</li>`).join('') : '';

        const vDiag = vData.vision_diagnostic;
        const dedicatedVisionDiagHtml = vDiag ? `
            <div class="dedicated-vision-diag-card">
                <div style="font-weight:700; font-size:0.84rem; color:var(--accent-amber);">
                    <i class="fa-solid fa-x-ray"></i> Dedicated Radiological Category Prediction:
                </div>
                <div style="font-size:0.88rem; font-weight:700; color:#ffffff;">
                    Category: <span style="color:#fbbf24;">${vDiag.radiological_category}</span>
                </div>
                <div style="display:flex; gap:12px; font-size:0.76rem; color:var(--text-muted); margin-top:2px;">
                    <span><i class="fa-solid fa-layer-group" style="color:var(--accent-teal);"></i> <strong>Scan Modality:</strong> ${vDiag.scan_type}</span>
                    <span><i class="fa-solid fa-shield-halved" style="color:var(--accent-amber);"></i> <strong>Confidence Match:</strong> ${vDiag.radiological_confidence}%</span>
                </div>
                <div style="font-size:0.76rem; color:#fca5a5; margin-top:2px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> <strong>Radiological Severity Grade:</strong> ${vDiag.severity_grade}
                </div>
                <div style="font-size:0.76rem; color:#a5b4fc; margin-top:2px;">
                    <i class="fa-solid fa-user-doctor"></i> <strong>Radiologist Action Plan:</strong> ${vDiag.radiologist_action}
                </div>
            </div>
        ` : '';

        const visionCardHtml = `
            <div class="vision-card">
                <div class="vision-header">
                    <span><i class="fa-solid fa-x-ray"></i> Multi-Modal Medical Vision AI Scan Analysis:</span>
                    <span class="vital-badge normal">${vData.confidence}% Vision Accuracy</span>
                </div>
                <div style="font-size:0.82rem; color:#ffffff; font-weight:700;">
                    Modality: <span style="color:var(--accent-teal);">${vData.modality}</span> (${vData.image_dimensions})
                </div>
                <div class="vision-finding-list" style="margin-top:4px;">
                    <div style="font-weight:700; color:var(--accent-amber); margin-bottom:2px;"><i class="fa-solid fa-microscope"></i> Radiological Region Findings:</div>
                    <ul style="margin-left:16px;">${findingsHtml}</ul>
                </div>
                ${dedicatedVisionDiagHtml}
                <div style="font-size:0.72rem; color:var(--text-dim); margin-top:4px;">
                    <i class="fa-solid fa-brain"></i> Engine: ${vData.ai_engine_badge}
                </div>
            </div>
        `;

        appendMessage('bot', `I have completed the Multi-Modal Vision AI analysis of your medical scan **${vData.filename}**:`);
        const lastBubble = chatHistory.querySelector('.message-row.bot:last-child .message-bubble');
        if (lastBubble) {
            const vDiv = document.createElement('div');
            vDiv.innerHTML = visionCardHtml;
            lastBubble.appendChild(vDiv);
        }
        if (visionModal) visionModal.style.display = 'none';
    }

    // Leaflet.js Interactive Hospital Map Engine
    const cityMapCenterCoords = {
        "Chennai": [13.0827, 80.2707],
        "Mumbai": [19.0760, 72.8777],
        "Delhi / NCR": [28.6139, 77.2090],
        "Bengaluru": [12.9716, 77.5946],
        "Hyderabad": [17.3850, 78.4867],
        "Kolkata": [22.5726, 88.3639],
        "Coimbatore": [11.0168, 76.9558],
        "Pune": [18.5204, 73.8567],
        "Ahmedabad": [23.0225, 72.5714],
        "Jaipur": [26.9124, 75.7873],
        "Lucknow": [26.8467, 80.9462],
        "Kochi": [9.9312, 76.2673],
        "Chandigarh": [30.7333, 76.7794],
        "Visakhapatnam": [17.6868, 83.2185],
        "Indore": [22.7196, 75.8577],
        "Bhubaneswar": [20.2961, 85.8245],
        "Nagpur": [21.1458, 79.0882],
        "Guwahati": [26.1445, 91.7362]
    };

    function renderHospitalMap(hospitals, targetCity, mapId) {
        if (!hospitals || hospitals.length === 0 || typeof L === 'undefined') return;

        setTimeout(() => {
            const mapContainer = document.getElementById(mapId);
            if (!mapContainer) return;

            const cityCoords = cityMapCenterCoords[targetCity] || [20.5937, 78.9629];
            const zoomLevel = (targetCity && targetCity !== "All") ? 12 : 5;

            try {
                const map = L.map(mapId).setView(cityCoords, zoomLevel);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);

                hospitals.forEach(h => {
                    if (h.latitude && h.longitude) {
                        const popupContent = `
                            <div class="map-popup-card">
                                <div class="map-popup-title">🏥 ${h.name}</div>
                                <div><i class="fa-solid fa-star" style="color: #fbbf24;"></i> ${h.rating} • ${h.city}</div>
                                <span class="map-popup-badge">${h.accreditation || 'JCI/NABH Accredited'}</span>
                                <div style="font-size: 0.74rem; color: #94a3b8; margin-top: 2px;">
                                    <strong>ER Phone:</strong> ${h.emergency_hotline || '108 / 112 Emergency'}
                                </div>
                            </div>
                        `;
                        L.marker([h.latitude, h.longitude])
                            .addTo(map)
                            .bindPopup(popupContent);
                    }
                });

                setTimeout(() => {
                    map.invalidateSize();
                }, 250);
            } catch (err) {
                console.warn("Leaflet map initialization warning:", err);
            }
        }, 150);
    }

    function buildHospitalGridHtml(hospitals, targetCity, mapId) {
        if (!hospitals || hospitals.length === 0) return '';

        const mapHtml = `
            <div class="hospital-map-container">
                <div class="map-header-bar">
                    <span><i class="fa-solid fa-map-location-dot" style="color: var(--primary);"></i> Interactive Hospital & 24/7 ER Map</span>
                    <span style="font-size: 0.74rem; color: var(--accent-teal);"><i class="fa-solid fa-layer-group"></i> OpenStreetMap Live</span>
                </div>
                <div id="${mapId}" style="height: 280px; width: 100%; z-index: 10;"></div>
            </div>
        `;

        const cardsHtml = hospitals.map(h => {
            const desc = h.description || `Premier multispecialty medical center in ${h.city} providing world-class tertiary healthcare and clinical excellence.`;
            const accreditationHtml = h.accreditation ? `<span style="font-size: 0.72rem; color: #6ee7b7; background: rgba(16, 185, 129, 0.18); border: 1px solid var(--accent-teal); padding: 2px 6px; border-radius: 4px; font-weight: 600;"><i class="fa-solid fa-award"></i> ${h.accreditation}</span>` : '';
            const bedsHtml = h.bed_capacity ? `<span style="font-size: 0.72rem; color: #a5b4fc; background: rgba(99, 102, 241, 0.18); padding: 2px 6px; border-radius: 4px; font-weight: 600;"><i class="fa-solid fa-bed-pulse"></i> ${h.bed_capacity}</span>` : '';
            const unitsHtml = h.specialized_units ? `<div style="font-size: 0.74rem; color: var(--accent-amber); margin-top: 4px;"><i class="fa-solid fa-layer-group"></i> <strong>Specialized Units:</strong> ${h.specialized_units.join(' • ')}</div>` : '';

            const beds = h.live_beds || { icu_available: 5, ventilators_available: 2, general_beds_available: 20, er_wait_mins: 10 };
            const bedTrackerHtml = `
                <div class="bed-tracker-box">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
                        <span style="font-weight:700; color:#6ee7b7;"><i class="fa-solid fa-bed-pulse"></i> Live ER & Bed Status Stream:</span>
                        <span class="vital-badge normal">Live Sync</span>
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:2px;">
                        <span class="bed-metric-pill"><i class="fa-solid fa-procedures"></i> ICU: ${beds.icu_available}/20 Free</span>
                        <span class="bed-metric-pill" style="background:rgba(99,102,241,0.18); color:#a5b4fc;"><i class="fa-solid fa-lungs"></i> Vent: ${beds.ventilators_available} Free</span>
                        <span class="bed-metric-pill" style="background:rgba(245,158,11,0.18); color:#fbbf24;"><i class="fa-solid fa-clock"></i> ER Wait: ${beds.er_wait_mins} mins</span>
                    </div>
                </div>
            `;

            return `
                <div class="hospital-card">
                    <div class="hospital-name">
                        <i class="fa-solid fa-hospital" style="color: var(--primary);"></i> ${h.name}
                    </div>
                    <div class="hospital-meta" style="flex-wrap: wrap; gap: 4px;">
                        <span><i class="fa-solid fa-star" style="color: var(--accent-amber);"></i> ${h.rating} (${h.reviews_count || 3000} reviews)</span>
                        <span class="tag-badge"><i class="fa-solid fa-location-dot"></i> ${h.city}</span>
                        ${accreditationHtml}
                        ${bedsHtml}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; margin-top: 2px;">
                        <strong>Key Specialties:</strong> ${h.specialties.join(', ')}
                    </div>
                    ${unitsHtml}
                    ${bedTrackerHtml}
                    <div style="font-size: 0.76rem; color: var(--text-dim); line-height: 1.35; margin-top: 4px;">
                        <i class="fa-solid fa-circle-info" style="color: var(--primary);"></i> ${desc}
                    </div>
                    <div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 4px;">
                        <i class="fa-solid fa-map-location-dot"></i> ${h.address}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div style="margin-top: 14px;">
                ${mapHtml}
                <div style="font-weight: 700; font-size: 0.88rem; color: var(--accent-teal); margin-bottom: 6px;">
                    <i class="fa-solid fa-building-hospital"></i> Recommended Major Hospitals:
                </div>
                <div class="hospital-grid">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }

    function buildDoctorGridHtml(doctors) {
        if (!doctors || doctors.length === 0) return '';

        const cardsHtml = doctors.map(d => {
            const subSpecHtml = d.sub_specialization ? `<div style="font-size: 0.75rem; color: var(--accent-teal); font-weight: 600; margin-top: 2px;"><i class="fa-solid fa-microscope"></i> Sub-Specialization: ${d.sub_specialization}</div>` : '';
            const surgeriesHtml = d.surgeries_performed_count ? `<span class="tag-badge" style="background: rgba(16, 185, 129, 0.18); color: #6ee7b7;"><i class="fa-solid fa-scalpel"></i> ${d.surgeries_performed_count.toLocaleString()}+ Procedures</span>` : '';
            const langsHtml = d.languages_spoken ? `<div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 2px;"><i class="fa-solid fa-language"></i> ${d.languages_spoken}</div>` : '';

            return `
                <div class="doctor-card">
                    <div class="doctor-name">
                        <i class="fa-solid fa-user-doctor" style="color: var(--accent-teal);"></i> ${d.name} <span style="font-size: 0.78rem; font-weight: normal; color: var(--text-muted);">(${d.qualification})</span>
                    </div>
                    <div class="doctor-meta" style="flex-wrap: wrap; gap: 4px;">
                        <span style="font-size: 0.76rem; color: var(--accent-amber);"><i class="fa-solid fa-medal"></i> ${d.awards || 'Top Specialist'}</span>
                        <span class="tag-badge"><i class="fa-solid fa-user-check"></i> ${d.experience_years}+ Yrs Exp</span>
                        ${surgeriesHtml}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-main); font-weight: 600; margin-top: 2px;">
                        ${d.designation} (${d.specialty})
                    </div>
                    ${subSpecHtml}
                    <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">
                        <i class="fa-solid fa-hospital-user"></i> ${d.hospital} (${d.city})
                    </div>
                    ${langsHtml}
                    <div style="font-size: 0.74rem; color: var(--text-dim); line-height: 1.35; margin-top: 4px;">
                        ${d.profile_summary}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div style="margin-top: 14px;">
                <div style="font-weight: 700; font-size: 0.88rem; color: var(--accent-amber); margin-bottom: 6px;">
                    <i class="fa-solid fa-user-doctor"></i> Recommended Top Doctors & Specialists:
                </div>
                <div class="hospital-grid">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }

    function appendMessage(sender, text, diagnosticData = null, hospitalData = null, doctorData = null, realtimeInfo = null, clarificationData = null) {
        chatLog.push({ sender, text });
        const row = document.createElement('div');
        row.className = `message-row ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = `avatar ${sender}`;
        avatar.innerHTML = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        const textDiv = document.createElement('div');
        textDiv.innerHTML = text;
        bubble.appendChild(textDiv);

        // REASSURING & EMPATHETIC DIAGNOSTIC ANALYSIS RENDERER
        if (diagnosticData && diagnosticData.predictions && diagnosticData.predictions.length > 0) {
            const diagCard = document.createElement('div');
            diagCard.className = 'diagnostic-card';

            const riskClass = diagnosticData.triage_level === 'High Risk' ? 'high' : 
                             (diagnosticData.triage_level === 'Moderate Risk' ? 'moderate' : 'mild');

            // Render Input Symptoms Pills
            const symptomsAnalyzed = diagnosticData.symptoms_analyzed || [];
            const symptomsPillsHtml = symptomsAnalyzed.map(s => `
                <span class="symptom-tag" style="font-size: 0.74rem; padding: 2px 8px; background: rgba(99, 102, 241, 0.25); border: 1px solid var(--primary); font-weight: 500;">
                    ${s.replace(/_/g, ' ')}
                </span>
            `).join(' ');

            const symptomSummaryHtml = symptomsAnalyzed.length > 0 ? `
                <div class="symptom-summary-box">
                    <i class="fa-solid fa-stethoscope" style="color: var(--primary);"></i>
                    <strong style="color: var(--text-muted);">User Input Symptoms:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-left: 4px;">
                        ${symptomsPillsHtml}
                    </div>
                </div>
            ` : '';

            const topPrediction = diagnosticData.predictions[0];
            const primaryDiseaseHtml = `
                <div class="disease-primary-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                        <span style="font-size: 1rem; font-weight: 700; color: #ffffff;">
                            <i class="fa-solid fa-disease" style="color: var(--accent-teal);"></i> Predicted Disease: <span style="color: #a5b4fc;">${topPrediction.disease}</span>
                        </span>
                        <span style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid var(--accent-teal); padding: 3px 10px; border-radius: 12px; font-size: 0.82rem; font-weight: 700;">
                            ${topPrediction.confidence}% Likelihood Match
                        </span>
                    </div>
                    <div class="progress-bar-bg" style="margin: 6px 0;">
                        <div class="progress-bar-fill" style="width: ${topPrediction.confidence}%;"></div>
                    </div>
                    <div style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.45;">
                        <i class="fa-solid fa-file-medical" style="color: var(--primary);"></i> <strong>Clinical Overview:</strong> ${topPrediction.description}
                    </div>
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
                        <span><i class="fa-solid fa-user-doctor" style="color: var(--accent-amber);"></i> <strong>Consult Specialist:</strong> ${topPrediction.specialist}</span>
                        <span><i class="fa-solid fa-vial-circle-check" style="color: var(--primary);"></i> <strong>Recommended Tests:</strong> ${topPrediction.recommended_tests}</span>
                    </div>
                </div>
            `;

            const reassuranceHtml = diagnosticData.empathetic_reassurance ? `
                <div style="background: rgba(99, 102, 241, 0.12); border-left: 4px solid var(--primary); padding: 12px 16px; border-radius: 6px; font-size: 0.86rem; line-height: 1.55; color: #e2e8f0;">
                    <i class="fa-solid fa-heart-pulse" style="color: var(--accent-rose); margin-right: 6px;"></i> 
                    <strong>Empathetic Medical Reassurance:</strong><br>
                    ${diagnosticData.empathetic_reassurance}
                </div>
            ` : '';

            let otherPredictionsHtml = '';
            if (diagnosticData.predictions.length > 1) {
                const others = diagnosticData.predictions.slice(1).map(p => `
                    <li style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 2px;">
                        <strong>${p.disease}</strong> (${p.confidence}% match) — Specialist: ${p.specialist}
                    </li>
                `).join('');
                otherPredictionsHtml = `
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                        <i class="fa-solid fa-code-fork" style="color: var(--text-dim);"></i> <strong>Differential Diagnostic Possibilities:</strong>
                        <ul style="margin-left: 18px; margin-top: 4px;">
                            ${others}
                        </ul>
                    </div>
                `;
            }

            const solutions = diagnosticData.clinical_solutions || {};
            const homeCareHtml = solutions.home_care ? `
                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 12px;">
                    <div style="font-weight: 700; font-size: 0.84rem; color: var(--accent-teal); margin-bottom: 6px;">
                        <i class="fa-solid fa-kit-medical"></i> Actionable Clinical Solutions & Treatment Action Plan for ${topPrediction.disease}:
                    </div>
                    <ul style="margin-left: 18px; font-size: 0.8rem; color: #e2e8f0; line-height: 1.55;">
                        ${solutions.home_care.map(hc => `<li>${hc}</li>`).join('')}
                    </ul>
                </div>
            ` : '';

            const redFlagsHtml = solutions.red_flags ? `
                <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 8px; padding: 12px;">
                    <div style="font-weight: 700; font-size: 0.84rem; color: var(--accent-rose); margin-bottom: 6px;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Emergency Warning Indicators (Seek Immediate Care if Present):
                    </div>
                    <ul style="margin-left: 18px; font-size: 0.8rem; color: #fca5a5; line-height: 1.55;">
                        ${solutions.red_flags.map(rf => `<li>${rf}</li>`).join('')}
                    </ul>
                </div>
            ` : '';

            const biobertHtml = diagnosticData.biobert_info ? `
                <div style="font-size: 0.75rem; color: #a5b4fc; background: rgba(99, 102, 241, 0.12); border: 1px solid var(--primary); padding: 4px 10px; border-radius: 6px; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-brain-circuit" style="color: var(--accent-amber);"></i>
                    <span><strong>Bio_ClinicalBERT Transformer Engine:</strong> ${diagnosticData.biobert_info.badge_text}</span>
                </div>
            ` : '';

            diagCard.innerHTML = `
                <div class="diagnostic-header">
                    <span style="font-weight:700; font-size:0.9rem;"><i class="fa-solid fa-notes-medical" style="color: var(--primary);"></i> Clinical Diagnostic Analysis & Treatment Plan</span>
                    <span class="risk-badge ${riskClass}">${diagnosticData.triage_level}</span>
                </div>
                ${symptomSummaryHtml}
                ${primaryDiseaseHtml}
                ${biobertHtml}
                ${reassuranceHtml}
                ${otherPredictionsHtml}
                ${homeCareHtml}
                ${redFlagsHtml}
            `;
            bubble.appendChild(diagCard);
        }

        // Multi-Turn Symptom Clarifier Card rendering
        const cData = clarificationData || (realtimeInfo && realtimeInfo.clarification_data);
        if (cData && cData.has_clarification) {
            const clarCard = document.createElement('div');
                clarCard.className = 'clarification-card';
                clarCard.innerHTML = `
                    <div class="clarification-header">
                        <i class="fa-solid fa-user-doctor"></i> Doctor Follow-Up Clarification:
                    </div>
                    <div class="clarification-question">${cData.question}</div>
                    <div class="clarification-chips-grid">
                        ${cData.options.map(opt => `
                            <span class="clarification-chip" data-id="${opt.id}" data-name="${opt.name}">
                                <i class="fa-solid fa-plus-circle"></i> ${opt.name}
                                <span class="clarification-hint">(${opt.disease_hint})</span>
                            </span>
                        `).join('')}
                    </div>
                `;

                clarCard.querySelectorAll('.clarification-chip').forEach(chip => {
                    chip.addEventListener('click', () => {
                        const symId = chip.dataset.id;
                        const symName = chip.dataset.name;
                        addSymptomTag(symId, symName);
                        sendMessage();
                    });
                });

                bubble.appendChild(clarCard);
        }

        // Show ONLY Doctor cards in Doctor Section (do not append Hospital cards below doctors)
        if (doctorData && doctorData.length > 0 && !diagnosticData) {
            const docGrid = document.createElement('div');
            docGrid.innerHTML = buildDoctorGridHtml(doctorData);
            bubble.appendChild(docGrid);
        } else if (hospitalData && hospitalData.length > 0 && !diagnosticData) {
            const mapId = `hosp_map_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const hospGrid = document.createElement('div');
            hospGrid.innerHTML = buildHospitalGridHtml(hospitalData, citySelect.value, mapId);
            bubble.appendChild(hospGrid);

            row.appendChild(avatar);
            row.appendChild(bubble);
            chatHistory.appendChild(row);
            chatHistory.scrollTop = chatHistory.scrollHeight;

            renderHospitalMap(hospitalData, citySelect.value, mapId);

            if (sender === 'bot' && isVoiceEnabled) {
                speakText(text);
            }
            return;
        }

        row.appendChild(avatar);
        row.appendChild(bubble);
        chatHistory.appendChild(row);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        if (sender === 'bot' && isVoiceEnabled) {
            speakText(text);
        }
    }

    function sendMessage(customMessage = null, searchType = null) {
        const text = customMessage !== null ? customMessage : userInput.value.trim();
        if (!text && selectedSymptoms.length === 0) return;

        let displayUserMsg = text;
        if (selectedSymptoms.length > 0 && customMessage === null) {
            const formattedSyms = selectedSymptoms.map(s => s.replace(/_/g, ' ')).join(', ');
            displayUserMsg = text ? `${text} [Symptoms: ${formattedSyms}]` : `Checking symptoms: ${formattedSyms}`;
        }

        appendMessage('user', displayUserMsg);
        if (customMessage === null) userInput.value = '';

        const selectedCity = citySelect ? citySelect.value : 'All';
        const selectedSpecialty = specialtyFilter ? specialtyFilter.value : '';

        const typingRow = document.createElement('div');
        typingRow.className = 'message-row bot';
        typingRow.id = 'typingIndicator';
        typingRow.innerHTML = `
            <div class="avatar bot"><i class="fa-solid fa-robot"></i></div>
            <div class="message-bubble" style="font-style: italic; color: var(--text-muted);">
                <i class="fa-solid fa-circle-notch fa-spin"></i> Processing Request...
            </div>
        `;
        chatHistory.appendChild(typingRow);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                symptoms: selectedSymptoms,
                city: selectedCity,
                specialty: selectedSpecialty,
                search_type: searchType
            })
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('typingIndicator')?.remove();
            if (data.status === 'success') {
                const resData = data.data;
                if (resData.is_emergency) {
                    emergencyBanner.style.display = 'block';
                    emergencyMsgText.textContent = resData.emergency_msg;
                } else {
                    emergencyBanner.style.display = 'none';
                }

                appendMessage('bot', resData.response, resData.disease_diagnostic, resData.hospitals, resData.doctors, resData.realtime_info, resData.clarification_data);
            } else {
                appendMessage('bot', 'Sorry, I encountered an error processing your request.');
            }
        })
        .catch(err => {
            document.getElementById('typingIndicator')?.remove();
            appendMessage('bot', 'Connection error with the Flask API server.');
        });
    }

    sendBtn.addEventListener('click', () => sendMessage());
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    analyzeSymptomsBtn.addEventListener('click', () => {
        if (selectedSymptoms.length === 0) {
            alert('Please select at least one symptom from the sidebar search box.');
            return;
        }
        sendMessage();
    });

    searchHospitalsBtn.addEventListener('click', () => {
        const spec = specialtyFilter.value;
        const selectedCity = citySelect.value;

        let msg = "Find top hospitals";
        if (selectedCity && selectedCity !== "All") msg += ` in ${selectedCity}`;
        if (spec) msg += ` for ${spec}`;

        sendMessage(msg, 'hospitals');
    });

    if (searchDoctorsBtn) {
        searchDoctorsBtn.addEventListener('click', () => {
            const spec = specialtyFilter.value;
            const selectedCity = citySelect.value;

            let msg = "Find top specialist doctors";
            if (selectedCity && selectedCity !== "All") msg += ` in ${selectedCity}`;
            if (spec) msg += ` for ${spec}`;

            sendMessage(msg, 'doctors');
        });
    }

    if (findHospHeaderBtn) {
        findHospHeaderBtn.addEventListener('click', () => {
            const selectedCity = citySelect ? citySelect.value : 'All';
            if (selectedCity && selectedCity !== 'All') {
                sendMessage(`Show top hospitals in ${selectedCity}`);
            } else {
                sendMessage("Show top high profile hospitals across major Indian cities");
            }
        });
    }

    if (findDoctorHeaderBtn) {
        findDoctorHeaderBtn.addEventListener('click', () => {
            sendMessage("Show top doctors and cardiac surgeons in India");
        });
    }

    function speakText(text) {
        if (!isVoiceEnabled) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            return;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const cleanText = text.replace(/<[^>]*>?/gm, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    }

    voiceToggleBtn.addEventListener('click', () => {
        isVoiceEnabled = !isVoiceEnabled;
        if (!isVoiceEnabled && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        voiceToggleBtn.innerHTML = isVoiceEnabled ? 
            '<i class="fa-solid fa-volume-high"></i> Voice Audio: ON' : 
            '<i class="fa-solid fa-volume-xmark" style="color: var(--accent-rose);"></i> Voice Audio: OFF';
    });

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            micBtn.classList.remove('active');
        };

        recognition.onerror = () => micBtn.classList.remove('active');
        recognition.onend = () => micBtn.classList.remove('active');

        micBtn.addEventListener('click', () => {
            micBtn.classList.add('active');
            recognition.start();
        });
    } else {
        micBtn.style.display = 'none';
    }

    exportReportBtn.addEventListener('click', () => {
        fetch('/api/download_report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_name: 'Consultation Guest',
                symptoms: selectedSymptoms,
                chat_history: chatLog
            })
        })
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'India_Healthcare_Report.html';
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    });

});
