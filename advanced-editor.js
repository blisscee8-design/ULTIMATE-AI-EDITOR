// Advanced AI Editor - DeepTech Edition

class AdvancedAIEditor {
  constructor() {
    this.currentTab = 'faceswap';
    this.selectedFiles = {};
    this.init();
  }

  init() {
    this.setupTabNavigation();
    this.setupFaceSwapUI();
    this.setupVoiceCloneUI();
    this.setupLipSyncUI();
    this.setupVideoEditUI();
    this.setupStyleTransferUI();
    this.setupEmotionTransferUI();
  }

  setupTabNavigation() {
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        e.target.classList.add('active');
        const tabId = e.target.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
        this.currentTab = tabId;
      });
    });
  }

  // ===== FACE SWAP =====
  setupFaceSwapUI() {
    const uploadZone = document.getElementById('uploadZoneFaceSwap');
    const fileInput = document.getElementById('fileInputFaceSwap');
    const btn = document.getElementById('faceSwapBtn');

    this.setupUploadZone(uploadZone, fileInput, 'videoFaceSwap');
    
    btn.addEventListener('click', () => this.handleFaceSwap());
  }

  async handleFaceSwap() {
    const video = this.selectedFiles.videoFaceSwap;
    const targetUrl = document.getElementById('targetImageUrl').value;

    if (!video) {
      this.showError('faceSwap', 'Please upload a video');
      return;
    }

    if (!targetUrl) {
      this.showError('faceSwap', 'Please enter target image URL');
      return;
    }

    this.showLoader('faceSwap', true);

    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('targetImageUrl', targetUrl);

      const response = await fetch('http://localhost:3000/api/faceswap', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const videoElement = document.getElementById('resultVideoFaceSwap');
        videoElement.src = data.url;
        document.getElementById('downloadFaceSwap').href = data.url;
        document.getElementById('resultFaceSwap').classList.add('show');
        this.showSuccess('faceSwap', data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      this.showError('faceSwap', error.message);
    } finally {
      this.showLoader('faceSwap', false);
    }
  }

  // ===== VOICE CLONE =====
  setupVoiceCloneUI() {
    const uploadZone = document.getElementById('uploadZoneVoice');
    const fileInput = document.getElementById('fileInputVoice');
    const btn = document.getElementById('voiceCloneBtn');

    this.setupUploadZone(uploadZone, fileInput, 'audioVoice');
    
    btn.addEventListener('click', () => this.handleVoiceClone());
  }

  async handleVoiceClone() {
    const audio = this.selectedFiles.audioVoice;
    const text = document.getElementById('textToSpeak').value;
    const voiceId = document.getElementById('voiceId').value;

    if (!audio) {
      this.showError('voice', 'Please upload reference audio');
      return;
    }

    if (!text) {
      this.showError('voice', 'Please enter text to speak');
      return;
    }

    if (!voiceId) {
      this.showError('voice', 'Please enter voice ID');
      return;
    }

    this.showLoader('voice', true);

    try {
      const formData = new FormData();
      formData.append('audio', audio);
      formData.append('text', text);
      formData.append('voiceId', voiceId);

      const response = await fetch('http://localhost:3000/api/voice-clone', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const audioElement = document.getElementById('resultAudioVoice');
        audioElement.src = data.url;
        document.getElementById('downloadVoice').href = data.url;
        document.getElementById('resultVoice').classList.add('show');
        this.showSuccess('voice', data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      this.showError('voice', error.message);
    } finally {
      this.showLoader('voice', false);
    }
  }

  // ===== LIP SYNC =====
  setupLipSyncUI() {
    const uploadZoneVideo = document.getElementById('uploadZoneVideo');
    const fileInputVideo = document.getElementById('fileInputVideo');
    const uploadZoneAudio = document.getElementById('uploadZoneAudio');
    const fileInputAudio = document.getElementById('fileInputAudio');
    const btn = document.getElementById('lipSyncBtn');

    this.setupUploadZone(uploadZoneVideo, fileInputVideo, 'videoLipSync');
    this.setupUploadZone(uploadZoneAudio, fileInputAudio, 'audioLipSync');
    
    btn.addEventListener('click', () => this.handleLipSync());
  }

  async handleLipSync() {
    const video = this.selectedFiles.videoLipSync;
    const audio = this.selectedFiles.audioLipSync;

    if (!video || !audio) {
      this.showError('lipSync', 'Please upload both video and audio');
      return;
    }

    this.showLoader('lipSync', true);

    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('audio', audio);

      const response = await fetch('http://localhost:3000/api/lipsync', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const videoElement = document.getElementById('resultVideoLipSync');
        videoElement.src = data.url;
        document.getElementById('downloadLipSync').href = data.url;
        document.getElementById('resultLipSync').classList.add('show');
        this.showSuccess('lipSync', data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      this.showError('lipSync', error.message);
    } finally {
      this.showLoader('lipSync', false);
    }
  }

  // ===== VIDEO EDIT =====
  setupVideoEditUI() {
    const uploadZone = document.getElementById('uploadZoneEdit');
    const fileInput = document.getElementById('fileInputEdit');
    const editType = document.getElementById('editType');
    const btn = document.getElementById('videoEditBtn');

    this.setupUploadZone(uploadZone, fileInput, 'videoEdit');
    
    editType.addEventListener('change', (e) => {
      this.updateEditTypeOptions(e.target.value);
    });
    
    btn.addEventListener('click', () => this.handleVideoEdit());
  }

  updateEditTypeOptions(editType) {
    document.getElementById('filterTypeGroup').style.display = editType === 'filter' ? 'block' : 'none';
    document.getElementById('filterIntensityGroup').style.display = editType === 'filter' ? 'block' : 'none';
    document.getElementById('upscaleScaleGroup').style.display = editType === 'ai-upscale' ? 'block' : 'none';
    document.getElementById('objectPromptGroup').style.display = editType === 'object-remove' ? 'block' : 'none';
  }

  async handleVideoEdit() {
    const video = this.selectedFiles.videoEdit;
    const editType = document.getElementById('editType').value;

    if (!video) {
      this.showError('edit', 'Please upload a video');
      return;
    }

    if (!editType) {
      this.showError('edit', 'Please select edit type');
      return;
    }

    this.showLoader('edit', true);

    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('editType', editType);

      const params = {};
      if (editType === 'filter') {
        params.filterType = document.getElementById('filterType').value;
        params.intensity = document.getElementById('filterIntensity').value;
      } else if (editType === 'ai-upscale') {
        params.scale = parseInt(document.getElementById('upscaleScale').value);
      } else if (editType === 'object-remove') {
        params.objectPrompt = document.getElementById('objectPrompt').value;
      }

      formData.append('params', JSON.stringify(params));

      const response = await fetch('http://localhost:3000/api/video-edit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const videoElement = document.getElementById('resultVideoEdit');
        videoElement.src = data.url;
        document.getElementById('downloadEdit').href = data.url;
        document.getElementById('resultEdit').classList.add('show');
        this.showSuccess('edit', data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      this.showError('edit', error.message);
    } finally {
      this.showLoader('edit', false);
    }
  }

  // ===== STYLE TRANSFER =====
  setupStyleTransferUI() {
    const uploadZone = document.getElementById('uploadZoneStyle');
    const fileInput = document.getElementById('fileInputStyle');
    const btn = document.getElementById('styleTransferBtn');

    this.setupUploadZone(uploadZone, fileInput, 'videoStyle');
    
    btn.addEventListener('click', () => this.handleStyleTransfer());
  }

  async handleStyleTransfer() {
    const video = this.selectedFiles.videoStyle;
    const style = document.getElementById('styleType').value;

    if (!video) {
      this.showError('style', 'Please upload a video');
      return;
    }

    this.showLoader('style', true);

    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('style', style);

      const response = await fetch('http://localhost:3000/api/style-transfer', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const videoElement = document.getElementById('resultVideoStyle');
        videoElement.src = data.url;
        document.getElementById('downloadStyle').href = data.url;
        document.getElementById('resultStyle').classList.add('show');
        this.showSuccess('style', data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      this.showError('style', error.message);
    } finally {
      this.showLoader('style', false);
    }
  }

  // ===== EMOTION TRANSFER =====
  setupEmotionTransferUI() {
    const uploadZone = document.getElementById('uploadZoneEmotion');
    const fileInput = document.getElementById('fileInputEmotion');
    const btn = document.getElementById('emotionTransferBtn');

    this.setupUploadZone(uploadZone, fileInput, 'videoEmotion');
    
    btn.addEventListener('click', () => this.handleEmotionTransfer());
  }

  async handleEmotionTransfer() {
    const video = this.selectedFiles.videoEmotion;
    const emotion = document.getElementById('targetEmotion').value;

    if (!video) {
      this.showError('emotion', 'Please upload a video');
      return;
    }

    this.showLoader('emotion', true);

    try {
      const formData = new FormData();
      formData.append('video', video);
      formData.append('targetEmotion', emotion);

      const response = await fetch('http://localhost:3000/api/emotion-transfer', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const videoElement = document.getElementById('resultVideoEmotion');
        videoElement.src = data.url;
        document.getElementById('downloadEmotion').href = data.url;
        document.getElementById('resultEmotion').classList.add('show');
        this.showSuccess('emotion', data.message);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      this.showError('emotion', error.message);
    } finally {
      this.showLoader('emotion', false);
    }
  }

  // ===== UTILITY FUNCTIONS =====
  setupUploadZone(uploadZone, fileInput, key) {
    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.selectedFiles[key] = file;
        const fileNameElement = uploadZone.querySelector('.file-name');
        fileNameElement.textContent = `✓ Selected: ${file.name}`;
      }
    });

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) {
        this.selectedFiles[key] = file;
        fileInput.files = e.dataTransfer.files;
        const fileNameElement = uploadZone.querySelector('.file-name');
        fileNameElement.textContent = `✓ Selected: ${file.name}`;
      }
    });
  }

  showError(section, message) {
    const errorElement = document.getElementById(`error${this.capitalize(section)}`);
    errorElement.textContent = `❌ ${message}`;
    errorElement.classList.add('show');
    setTimeout(() => errorElement.classList.remove('show'), 5000);
  }

  showSuccess(section, message) {
    const successElement = document.getElementById(`success${this.capitalize(section)}`);
    successElement.textContent = `✓ ${message}`;
    successElement.classList.add('show');
    setTimeout(() => successElement.classList.remove('show'), 5000);
  }

  showLoader(section, isLoading) {
    const loaderElement = document.getElementById(`loader${this.capitalize(section)}`);
    if (isLoading) {
      loaderElement.classList.add('active');
    } else {
      loaderElement.classList.remove('active');
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AdvancedAIEditor();
});