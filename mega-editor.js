/**
 * ULTIMATE DEEP VIDEO EDITOR - Frontend v3.0
 * The Most Advanced Web-Based Deepfake & Face Manipulation Engine
 */

class UltimateDeepEditor {
  constructor() {
    this.selectedFiles = {};
    this.currentTool = null;
    this.baseURL = 'http://localhost:3000/api/v3';
    this.isProcessing = false;
    this.init();
  }

  init() {
    this.setupTabNavigation();
    this.setupFaceSwap();
    this.setupVoiceClone();
    this.setupLipSync();
    this.setupMotionTransfer();
    this.setupVideoEdit();
    this.setupFaceFeatures();
    this.setupAdvancedTools();
    this.setupGlobalSliders();
  }

  // ==================== UTILITIES ====================
  setupUploadZone(zoneId, inputId, fileKey, displayId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);

    zone.addEventListener('click', () => input.click());

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.selectedFiles[fileKey] = file;
        this.updateFileDisplay(displayId, file.name);
      }
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) {
        this.selectedFiles[fileKey] = file;
        input.files = e.dataTransfer.files;
        this.updateFileDisplay(displayId, file.name);
      }
    });
  }

  updateFileDisplay(displayId, fileName) {
    const display = document.getElementById(displayId);
    if (display) {
      display.textContent = `✓ ${fileName}`;
      display.style.display = 'block';
    }
  }

  showLoader(loaderId, show = true) {
    const loader = document.getElementById(loaderId);
    if (loader) {
      loader.classList.toggle('active', show);
    }
  }

  showAlert(alertId, message, type = 'success') {
    const alert = document.getElementById(alertId);
    const textId = alertId + 'Text';
    const textElement = document.getElementById(textId);

    if (alert && textElement) {
      textElement.textContent = message;
      alert.classList.add('show');
      
      setTimeout(() => {
        alert.classList.remove('show');
      }, 5000);
    }
  }

  showResult(cardId, show = true) {
    const card = document.getElementById(cardId);
    if (card) {
      card.classList.toggle('show', show);
    }
  }

  // ==================== FACE SWAP SUITE ====================
  setupFaceSwap() {
    this.setupUploadZone('uploadZoneFaceSwap', 'fileInputFaceSwap', 'videoFaceSwap', 'fileNameFaceSwap');

    document.getElementById('blendFactor')?.addEventListener('input', (e) => {
      document.getElementById('blendValue').textContent = e.target.value + '%';
    });

    document.getElementById('faceSwapBtn')?.addEventListener('click', () => this.handleFaceSwap());
    document.getElementById('resetFaceSwap')?.addEventListener('click', () => this.resetFaceSwap());
  }

  async handleFaceSwap() {
    if (this.isProcessing) return;

    const video = this.selectedFiles.videoFaceSwap;
    const targetUrl = document.getElementById('targetImageUrl')?.value;
    const preserveExpression = document.getElementById('preserveExpression')?.checked;
    const matchLighting = document.getElementById('matchLighting')?.checked;
    const blendFactor = (document.getElementById('blendFactor')?.value || 100) / 100;

    if (!video) {
      this.showAlert('errorFaceSwap', 'Please upload a video file', 'error');
      return;
    }

    if (!targetUrl) {
      this.showAlert('errorFaceSwap', 'Please enter target image URL', 'error');
      return;
    }

    this.isProcessing = true;
    this.showLoader('loaderFaceSwap', true);

    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('targetImageUrl', targetUrl);
      formData.append('preserveExpression', preserveExpression);
      formData.append('matchLighting', matchLighting);
      formData.append('blendFactor', blendFactor);

      const response = await fetch(`${this.baseURL}/multi-faceswap`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const videoElement = document.getElementById('resultVideoFaceSwap');
        videoElement.src = data.url;
        
        document.getElementById('qualityScoreFaceSwap').textContent = Math.round(data.qualityScore) + '%';
        document.getElementById('artifactsFaceSwap').textContent = (data.artifactLevel || 0.1).toFixed(2) + '%';

        this.showResult('resultCardFaceSwap', true);
        this.showAlert('successFaceSwap', '✅ Face swap completed successfully!', 'success');
      } else {
        throw new Error(data.error || 'Face swap failed');
      }
    } catch (error) {
      this.showAlert('errorFaceSwap', `Error: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.showLoader('loaderFaceSwap', false);
    }
  }

  resetFaceSwap() {
    document.getElementById('fileInputFaceSwap').value = '';
    document.getElementById('fileNameFaceSwap').style.display = 'none';
    document.getElementById('targetImageUrl').value = '';
    this.selectedFiles.videoFaceSwap = null;
    this.showResult('resultCardFaceSwap', false);
  }

  // ==================== VOICE CLONE SUITE ====================
  setupVoiceClone() {
    this.setupUploadZone('uploadZoneVoice', 'fileInputVoice', 'audioVoice', 'fileNameVoice');

    document.getElementById('speedVoice')?.addEventListener('input', (e) => {
      document.getElementById('speedValue').textContent = e.target.value + 'x';
    });

    document.getElementById('voiceCloneBtn')?.addEventListener('click', () => this.handleVoiceClone());
  }

  async handleVoiceClone() {
    if (this.isProcessing) return;

    const audio = this.selectedFiles.audioVoice;
    const text = document.getElementById('textToSpeak')?.value;
    const emotion = document.getElementById('emotionVoice')?.value;
    const language = document.getElementById('languageVoice')?.value;
    const speed = document.getElementById('speedVoice')?.value;

    if (!audio) {
      this.showAlert('errorVoice', 'Please upload reference audio', 'error');
      return;
    }

    if (!text) {
      this.showAlert('errorVoice', 'Please enter text to synthesize', 'error');
      return;
    }

    this.isProcessing = true;
    this.showLoader('loaderVoice', true);

    try {
      const formData = new FormData();
      formData.append('audio', audio);
      formData.append('text', text);
      formData.append('emotion', emotion);
      formData.append('language', language);
      formData.append('speed', speed);

      const response = await fetch(`${this.baseURL}/ultra-voice-clone`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const audioElement = document.getElementById('resultAudioVoice');
        audioElement.src = data.url;
        this.showResult('resultCardVoice', true);
        this.showAlert('successVoice', '✅ Voice cloned successfully!', 'success');
      } else {
        throw new Error(data.error || 'Voice cloning failed');
      }
    } catch (error) {
      this.showAlert('errorVoice', `Error: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.showLoader('loaderVoice', false);
    }
  }

  // ==================== LIP-SYNC SUITE ====================
  setupLipSync() {
    this.setupUploadZone('uploadZoneVideoLipSync', 'fileInputVideoLipSync', 'videoLipSync', 'fileNameVideoLipSync');
    this.setupUploadZone('uploadZoneAudioLipSync', 'fileInputAudioLipSync', 'audioLipSync', 'fileNameAudioLipSync');

    document.getElementById('lipSyncBtn')?.addEventListener('click', () => this.handleLipSync());
  }

  async handleLipSync() {
    if (this.isProcessing) return;

    const video = this.selectedFiles.videoLipSync;
    const audio = this.selectedFiles.audioLipSync;
    const precision = document.getElementById('precisionLipSync')?.value;
    const emotionSync = document.getElementById('emotionSyncLipSync')?.checked;

    if (!video || !audio) {
      this.showAlert('errorLipSync', 'Please upload both video and audio files', 'error');
      return;
    }

    this.isProcessing = true;
    this.showLoader('loaderLipSync', true);

    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('audio', audio);
      formData.append('precision', precision);
      formData.append('emotionSync', emotionSync);

      const response = await fetch(`${this.baseURL}/lipsync-pro`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const videoElement = document.getElementById('resultVideoLipSync');
        videoElement.src = data.url;
        this.showResult('resultCardLipSync', true);
        this.showAlert('successLipSync', `✅ Lip-sync completed! Accuracy: ${data.syncAccuracy}%`, 'success');
      } else {
        throw new Error(data.error || 'Lip-sync failed');
      }
    } catch (error) {
      this.showAlert('errorLipSync', `Error: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.showLoader('loaderLipSync', false);
    }
  }

  // ==================== MOTION TRANSFER ====================
  setupMotionTransfer() {
    this.setupUploadZone('uploadZoneSourceMotion', 'fileInputSourceMotion', 'sourceMotion', 'fileNameSourceMotion');
    this.setupUploadZone('uploadZoneTargetMotion', 'fileInputTargetMotion', 'targetMotion', 'fileNameTargetMotion');

    document.getElementById('motionTransferBtn')?.addEventListener('click', () => this.handleMotionTransfer());
  }

  async handleMotionTransfer() {
    if (this.isProcessing) return;

    const sourceVideo = this.selectedFiles.sourceMotion;
    const targetVideo = this.selectedFiles.targetMotion;

    if (!sourceVideo || !targetVideo) {
      this.showAlert('errorMotion', 'Please upload both source and target videos', 'error');
      return;
    }

    this.isProcessing = true;
    this.showLoader('loaderMotion', true);

    try {
      const formData = new FormData();
      formData.append('sourceVideo', sourceVideo);
      formData.append('targetVideo', targetVideo);

      const response = await fetch(`${this.baseURL}/motion-transfer`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const videoElement = document.getElementById('resultVideoMotion');
        videoElement.src = data.url;
        this.showResult('resultCardMotion', true);
        this.showAlert('successMotion', '✅ Motion transfer completed!', 'success');
      } else {
        throw new Error(data.error || 'Motion transfer failed');
      }
    } catch (error) {
      this.showAlert('errorMotion', `Error: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.showLoader('loaderMotion', false);
    }
  }

  // ==================== VIDEO EDIT SUITE ====================
  setupVideoEdit() {
    this.setupUploadZone('uploadZoneVideoEdit', 'fileInputVideoEdit', 'videoEdit', 'fileNameVideoEdit');

    window.selectVideoEdit = (type) => {
      document.getElementById('videoEditPanel').style.display = 'block';
      this.currentTool = type;
      this.updateVideoEditControls(type);
    };

    document.getElementById('processVideoEditBtn')?.addEventListener('click', () => this.handleVideoEdit());
  }

  updateVideoEditControls(type) {
    const controlsContainer = document.getElementById('videoEditControls');
    let html = '';

    const controls = {
      superres: `
        <div class="form-group">
          <label>Upscale Factor</label>
          <select id="upscaleFactor">
            <option value="2">2x (1080p)</option>
            <option value="4" selected>4x (4K)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Denoise Strength</label>
          <div class="slider-group">
            <input type="range" id="denoiseStrength" min="0" max="1" step="0.1" value="0.5">
            <div class="slider-value" id="denoiseValue">0.5</div>
          </div>
        </div>
      `,
      bgremove: `
        <div class="form-group">
          <label>Background Type</label>
          <select id="bgReplacementType">
            <option value="blur">Blur</option>
            <option value="remove">Remove</option>
            <option value="color">Solid Color</option>
          </select>
        </div>
      `,
      objectremove: `
        <div class="form-group">
          <label>Object Description</label>
          <input type="text" id="objectDescription" placeholder="Describe object to remove...">
        </div>
      `,
      frameinterp: `
        <div class="form-group">
          <label>Target FPS</label>
          <select id="targetFps">
            <option value="60">60 FPS</option>
            <option value="120">120 FPS</option>
          </select>
        </div>
      `
    };

    html = controls[type] || '';
    controlsContainer.innerHTML = `<div class="control-section-title"><i class="fas fa-sliders"></i> Settings</div>${html}`;
  }

  async handleVideoEdit() {
    if (!this.currentTool) {
      this.showAlert('errorVideoEdit', 'Please select an editing tool', 'error');
      return;
    }

    if (this.isProcessing) return;

    const video = this.selectedFiles.videoEdit;
    if (!video) {
      this.showAlert('errorVideoEdit', 'Please upload a video', 'error');
      return;
    }

    this.isProcessing = true;
    this.showLoader('loaderVideoEdit', true);

    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('editType', this.currentTool);

      const params = {};
      if (this.currentTool === 'superres') {
        params.upscaleFactor = document.getElementById('upscaleFactor')?.value;
        params.denoise = document.getElementById('denoiseStrength')?.value;
      } else if (this.currentTool === 'bgremove') {
        params.replacementType = document.getElementById('bgReplacementType')?.value;
      } else if (this.currentTool === 'objectremove') {
        params.objectDescription = document.getElementById('objectDescription')?.value;
      } else if (this.currentTool === 'frameinterp') {
        params.targetFps = document.getElementById('targetFps')?.value;
      }

      formData.append('params', JSON.stringify(params));

      const response = await fetch(`${this.baseURL}/video-edit`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const videoElement = document.getElementById('resultVideoEdit');
        videoElement.src = data.url;
        this.showResult('resultCardVideoEdit', true);
        this.showAlert('successVideoEdit', '✅ Video processing completed!', 'success');
      } else {
        throw new Error(data.error || 'Video editing failed');
      }
    } catch (error) {
      this.showAlert('errorVideoEdit', `Error: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.showLoader('loaderVideoEdit', false);
    }
  }

  // ==================== FACE FEATURES ====================
  setupFaceFeatures() {
    this.setupUploadZone('uploadZoneFaceFeatures', 'fileInputFaceFeatures', 'imageFaceFeatures', 'fileNameFaceFeatures');

    ['Eyes', 'Nose', 'Mouth', 'Chin'].forEach(feature => {
      const lowercased = feature.toLowerCase();
      document.getElementById(`feature${feature}`)?.addEventListener('input', (e) => {
        document.getElementById(`${lowercased}Value`).textContent = e.target.value;
      });
    });

    document.getElementById('editFeaturesBtn')?.addEventListener('click', () => this.handleFaceFeatures());
  }

  async handleFaceFeatures() {
    if (this.isProcessing) return;

    const image = this.selectedFiles.imageFaceFeatures;
    if (!image) {
      this.showAlert('errorFaceFeatures', 'Please upload a face image', 'error');
      return;
    }

    this.isProcessing = true;
    this.showLoader('loaderFaceFeatures', true);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('eyes', document.getElementById('featureEyes')?.value || 0);
      formData.append('nose', document.getElementById('featureNose')?.value || 0);
      formData.append('mouth', document.getElementById('featureMouth')?.value || 0);
      formData.append('chin', document.getElementById('featureChin')?.value || 0);

      const response = await fetch(`${this.baseURL}/edit-features`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const imageElement = document.getElementById('resultImageFaceFeatures');
        imageElement.src = data.url;
        this.showResult('resultCardFaceFeatures', true);
        this.showAlert('successFaceFeatures', '✅ Face features edited successfully!', 'success');
      } else {
        throw new Error(data.error || 'Face feature editing failed');
      }
    } catch (error) {
      this.showAlert('errorFaceFeatures', `Error: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.showLoader('loaderFaceFeatures', false);
    }
  }

  // ==================== ADVANCED TOOLS ====================
  setupAdvancedTools() {
    window.selectAdvancedTool = (tool) => {
      document.getElementById('advancedToolPanel').style.display = 'block';
      this.currentTool = tool;
      this.renderAdvancedTool(tool);
    };
  }

  renderAdvancedTool(tool) {
    const panel = document.getElementById('advancedToolPanel');
    let html = '';

    const tools = {
      restoration: `
        <div class="panel-grid">
          <div>
            <h3 style="color: white; margin-bottom: 20px;">Face Restoration</h3>
            <div class="upload-zone" id="uploadZoneRestoration">
              <div class="upload-icon"><i class="fas fa-image"></i></div>
              <p class="upload-text">📸 Drop Image</p>
            </div>
            <input type="file" id="fileInputRestoration" class="file-input" accept="image/*">
            <div class="control-section">
              <div class="control-section-title">Settings</div>
              <div class="form-group">
                <label>Upscale Level</label>
                <select id="upscaleLevelRestoration">
                  <option value="2">2x</option>
                  <option value="4" selected>4x (Ultra)</option>
                </select>
              </div>
            </div>
            <button class="btn-primary" id="processRestorationBtn">
              <i class="fas fa-magic"></i> RESTORE
            </button>
          </div>
          <div>
            <div class="preview-container">
              <div class="preview-header"><i class="fas fa-eye"></i> PREVIEW</div>
              <div class="preview-content" id="previewRestoration">
                <p style="color: #94a3b8;">Upload image to preview</p>
              </div>
            </div>
          </div>
        </div>
      `,
      ageshift: `
        <div class="panel-grid">
          <div>
            <h3 style="color: white; margin-bottom: 20px;">Age Progression</h3>
            <div class="upload-zone" id="uploadZoneAgeShift">
              <div class="upload-icon"><i class="fas fa-image"></i></div>
              <p class="upload-text">📸 Drop Image</p>
            </div>
            <input type="file" id="fileInputAgeShift" class="file-input" accept="image/*">
            <div class="control-section">
              <div class="control-section-title">Settings</div>
              <div class="form-group">
                <label>Age Shift (Years)</label>
                <div class="slider-group">
                  <input type="range" id="ageShiftValue" min="-30" max="30" value="0">
                  <div class="slider-value" id="ageShiftDisplay">0</div>
                </div>
              </div>
            </div>
            <button class="btn-primary" id="processAgeShiftBtn">
              <i class="fas fa-magic"></i> TRANSFORM
            </button>
          </div>
          <div>
            <div class="preview-container">
              <div class="preview-header"><i class="fas fa-eye"></i> PREVIEW</div>
              <div class="preview-content" id="previewAgeShift">
                <p style="color: #94a3b8;">Upload image to preview</p>
              </div>
            </div>
          </div>
        </div>
      `,
      deepfakedetect: `
        <div class="panel-grid">
          <div>
            <h3 style="color: white; margin-bottom: 20px;">Deepfake Detection</h3>
            <div class="upload-zone" id="uploadZoneDetection">
              <div class="upload-icon"><i class="fas fa-video"></i></div>
              <p class="upload-text">📹 Drop Video</p>
            </div>
            <input type="file" id="fileInputDetection" class="file-input" accept="video/*">
            <button class="btn-primary" id="processDetectionBtn">
              <i class="fas fa-microscope"></i> ANALYZE
            </button>
          </div>
          <div>
            <div class="preview-container">
              <div class="preview-header"><i class="fas fa-chart-pie"></i> RESULTS</div>
              <div class="preview-content" id="previewDetection">
                <p style="color: #94a3b8;">Upload video to analyze</p>
              </div>
            </div>
          </div>
        </div>
      `
    };

    html = tools[tool] || '<p>Tool not found</p>';
    panel.innerHTML = html;

    // Setup event listeners for the tool
    if (tool === 'restoration') {
      this.setupUploadZone('uploadZoneRestoration', 'fileInputRestoration', 'imageRestoration', null);
      document.getElementById('upscaleLevelRestoration')?.addEventListener('change', (e) => {
        document.getElementById('uploadZoneRestoration').title = `Upscale to ${e.target.value}x`;
      });
      document.getElementById('processRestorationBtn')?.addEventListener('click', () => this.handleRestoration());
    } else if (tool === 'ageshift') {
      this.setupUploadZone('uploadZoneAgeShift', 'fileInputAgeShift', 'imageAgeShift', null);
      document.getElementById('ageShiftValue')?.addEventListener('input', (e) => {
        document.getElementById('ageShiftDisplay').textContent = e.target.value;
      });
      document.getElementById('processAgeShiftBtn')?.addEventListener('click', () => this.handleAgeShift());
    } else if (tool === 'deepfakedetect') {
      this.setupUploadZone('uploadZoneDetection', 'fileInputDetection', 'videoDetection', null);
      document.getElementById('processDetectionBtn')?.addEventListener('click', () => this.handleDetection());
    }
  }

  async handleRestoration() {
    const image = this.selectedFiles.imageRestoration;
    if (!image) {
      alert('Please upload an image');
      return;
    }

    const upscaleLevel = document.getElementById('upscaleLevelRestoration')?.value;
    this.isProcessing = true;

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('upscaleLevel', upscaleLevel);

      const response = await fetch(`${this.baseURL}/face-restoration`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        document.getElementById('previewRestoration').innerHTML = `<img src="${data.url}" style="max-width: 100%; border-radius: 12px;">`;
        alert('✅ Face restoration completed!');
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  async handleAgeShift() {
    const image = this.selectedFiles.imageAgeShift;
    if (!image) {
      alert('Please upload an image');
      return;
    }

    const ageShift = document.getElementById('ageShiftValue')?.value;
    this.isProcessing = true;

    try {
      const formData = new FormData();
      formData.append('video', image);
      formData.append('ageShift', ageShift);

      const response = await fetch(`${this.baseURL}/age-transformation`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        document.getElementById('previewAgeShift').innerHTML = `<img src="${data.url}" style="max-width: 100%; border-radius: 12px;">`;
        alert('✅ Age transformation completed!');
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  async handleDetection() {
    const video = this.selectedFiles.videoDetection;
    if (!video) {
      alert('Please upload a video');
      return;
    }

    this.isProcessing = true;

    try {
      const formData = new FormData();
      formData.append('video', video);

      const response = await fetch(`${this.baseURL}/deepfake-detection`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const resultsHtml = `
          <div style="padding: 20px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: ${data.isDeepfake ? '#f56565' : '#48bb78'}; margin-bottom: 10px;">
              ${data.isDeepfake ? '⚠️ LIKELY DEEPFAKE' : '✅ LIKELY AUTHENTIC'}
            </div>
            <div style="color: #cbd5e1; margin: 10px 0;">
              Confidence: ${Math.round(data.confidence * 100)}%
            </div>
            <div style="color: #94a3b8; margin: 10px 0;">
              Risk Score: ${data.riskScore}/100
            </div>
          </div>
        `;
        document.getElementById('previewDetection').innerHTML = resultsHtml;
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  // ==================== TAB NAVIGATION ====================
  setupTabNavigation() {
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
        
        e.currentTarget.classList.add('active');
        const tabId = e.currentTarget.getAttribute('data-tab');
        document.getElementById(tabId)?.classList.add('active');
      });
    });
  }

  // ==================== SLIDERS ====================
  setupGlobalSliders() {
    document.querySelectorAll('input[type="range"]').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const valueDisplay = e.target.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('slider-value')) {
          valueDisplay.textContent = e.target.value;
        }
      });
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.editor = new UltimateDeepEditor();
});