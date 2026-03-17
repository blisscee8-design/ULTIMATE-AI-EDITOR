require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const Replicate = require('replicate');
const { v4: uuidv4 } = require('uuid');

// Configure FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static(path.join(__dirname, '.')));

// Setup file upload
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// API Keys
const HF_API_KEY = process.env.HF_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Initialize Replicate
const replicate = new Replicate({
  auth: REPLICATE_API_KEY,
});

// ==================== DEEPFAKE FACE SWAP ====================
app.post('/api/faceswap', upload.single('video'), async (req, res) => {
  try {
    const { targetImageUrl } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const outputPath = `outputs/faceswap_${uuidv4()}.mp4`;
    
    // Ensure output directory exists
    if (!fs.existsSync('outputs')) {
      fs.mkdirSync('outputs', { recursive: true });
    }

    // Use Replicate's face-swap model
    const result = await replicate.run(
      'deepfacestudio/deepface:latest',
      {
        inputs: {
          video: fs.createReadStream(videoFile.path),
          target_image: targetImageUrl,
        },
      }
    );

    // Process result
    if (result && result.url) {
      const videoBuffer = await axios.get(result.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, videoBuffer.data);
      
      res.json({
        success: true,
        output: outputPath,
        url: `/download/${path.basename(outputPath)}`,
        message: 'Face swap completed successfully'
      });
    }
  } catch (error) {
    console.error('Face swap error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== VOICE CLONING ====================
app.post('/api/voice-clone', upload.single('audio'), async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    const audioFile = req.file;

    if (!audioFile && !voiceId) {
      return res.status(400).json({ error: 'Audio file or voice ID required' });
    }

    const outputPath = `outputs/voice_${uuidv4()}.mp3`;

    // Use ElevenLabs for voice cloning
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text, model_id: 'eleven_monolingual_v1' },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    fs.writeFileSync(outputPath, response.data);

    res.json({
      success: true,
      output: outputPath,
      url: `/download/${path.basename(outputPath)}`,
      message: 'Voice clone generated successfully'
    });
  } catch (error) {
    console.error('Voice clone error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LIP SYNC ====================
app.post('/api/lipsync', upload.fields([{ name: 'video' }, { name: 'audio' }]), async (req, res) => {
  try {
    const videoFile = req.files.video?.[0];
    const audioFile = req.files.audio?.[0];

    if (!videoFile || !audioFile) {
      return res.status(400).json({ error: 'Both video and audio files required' });
    }

    const outputPath = `outputs/lipsync_${uuidv4()}.mp4`;

    // Use Replicate's wav2lip model for lip-sync
    const result = await replicate.run(
      'devxpy/wav2lip:8aac6ce0bc402e4b92d9979357bd2c33',
      {
        inputs: {
          face: fs.createReadStream(videoFile.path),
          audio: fs.createReadStream(audioFile.path),
        },
      }
    );

    if (result && result.url) {
      const videoBuffer = await axios.get(result.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, videoBuffer.data);

      res.json({
        success: true,
        output: outputPath,
        url: `/download/${path.basename(outputPath)}`,
        message: 'Lip-sync completed successfully'
      });
    }
  } catch (error) {
    console.error('Lip-sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADVANCED VIDEO EDITING ====================
app.post('/api/video-edit', upload.single('video'), async (req, res) => {
  try {
    const { editType, params } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const outputPath = `outputs/edited_${uuidv4()}.mp4`;

    // Route to different editing functions based on type
    switch (editType) {
      case 'enhance':
        await enhanceVideo(videoFile.path, outputPath, params);
        break;
      case 'filter':
        await applyVideoFilter(videoFile.path, outputPath, params);
        break;
      case 'ai-upscale':
        await aiUpscaleVideo(videoFile.path, outputPath, params);
        break;
      case 'background-remove':
        await removeBackground(videoFile.path, outputPath, params);
        break;
      case 'object-remove':
        await removeObject(videoFile.path, outputPath, params);
        break;
      default:
        return res.status(400).json({ error: 'Unknown edit type' });
    }

    res.json({
      success: true,
      output: outputPath,
      url: `/download/${path.basename(outputPath)}`,
      message: `Video ${editType} completed successfully`
    });
  } catch (error) {
    console.error('Video edit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== VIDEO ENHANCEMENT ====================
async function enhanceVideo(inputPath, outputPath, params) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilter('scale=uhd')
      .videoFilter('eq=brightness=0.1:contrast=1.2')
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

// ==================== AI VIDEO UPSCALE ====================
async function aiUpscaleVideo(inputPath, outputPath, params) {
  try {
    const upscaleModel = 'nightmareai/real-esrgan';
    
    // Use Replicate's upscale model
    const result = await replicate.run(upscaleModel, {
      inputs: {
        image: fs.createReadStream(inputPath),
        scale: params.scale || 4,
      }
    });

    if (result && result.url) {
      const videoBuffer = await axios.get(result.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, videoBuffer.data);
    }
  } catch (error) {
    throw new Error(`Upscale error: ${error.message}`);
  }
}

// ==================== BACKGROUND REMOVAL ====================
async function removeBackground(inputPath, outputPath, params) {
  try {
    const result = await replicate.run(
      'cjwbw/rembg:fb9a7a23f16cea86c39197cc66eba67d91ab2000ad9ea0343d01b52fe3ec16003',
      {
        inputs: {
          image: fs.createReadStream(inputPath),
        },
      }
    );

    if (result && result.url) {
      const imageBuffer = await axios.get(result.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, imageBuffer.data);
    }
  } catch (error) {
    throw new Error(`Background removal error: ${error.message}`);
  }
}

// ==================== OBJECT REMOVAL ====================
async function removeObject(inputPath, outputPath, params) {
  try {
    const result = await replicate.run(
      'pablodawson/video-llava:35f1ff4b3e7db81b0fbdf6b14a8868289043f002',
      {
        inputs: {
          video: fs.createReadStream(inputPath),
          prompt: params.objectPrompt || 'remove unwanted object',
        },
      }
    );

    if (result && result.url) {
      const videoBuffer = await axios.get(result.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, videoBuffer.data);
    }
  } catch (error) {
    throw new Error(`Object removal error: ${error.message}`);
  }
}

// ==================== VIDEO FILTER APPLICATION ====================
async function applyVideoFilter(inputPath, outputPath, params) {
  return new Promise((resolve, reject) => {
    let filterChain = '';

    switch (params.filterType) {
      case 'sepia':
        filterChain = 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131';
        break;
      case 'grayscale':
        filterChain = 'format=gray';
        break;
      case 'blur':
        filterChain = `boxblur=${params.intensity || 5}`;
        break;
      case 'sharpen':
        filterChain = 'unsharp=5:5:1.0:5:5:0.0';
        break;
      default:
        filterChain = 'null';
    }

    ffmpeg(inputPath)
      .videoFilter(filterChain)
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

// ==================== REAL-TIME STYLE TRANSFER ====================
app.post('/api/style-transfer', upload.single('video'), async (req, res) => {
  try {
    const { style } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const outputPath = `outputs/styled_${uuidv4()}.mp4`;

    const result = await replicate.run(
      'daanelson/riffusion:8cf61537eea047fd74b6940400bhf51899c537c45df5ac0bb9e1944abefc4d27',
      {
        inputs: {
          video: fs.createReadStream(videoFile.path),
          style: style || 'oil painting',
        },
      }
    );

    if (result && result.url) {
      const videoBuffer = await axios.get(result.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, videoBuffer.data);

      res.json({
        success: true,
        output: outputPath,
        url: `/download/${path.basename(outputPath)}`,
        message: 'Style transfer completed'
      });
    }
  } catch (error) {
    console.error('Style transfer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== EMOTION TRANSFER ====================
app.post('/api/emotion-transfer', upload.single('video'), async (req, res) => {
  try {
    const { targetEmotion } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const outputPath = `outputs/emotion_${uuidv4()}.mp4`;

    const result = await replicate.run(
      'pablodawson/video-llava:35f1ff4b3e7db81b0fbdf6b14a8868289043f002',
      {
        inputs: {
          video: fs.createReadStream(videoFile.path),
          prompt: `Transform the subject's emotion to ${targetEmotion}`,
        },
      }
    );

    if (result && result.url) {
      const videoBuffer = await axios.get(result.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(outputPath, videoBuffer.data);

      res.json({
        success: true,
        output: outputPath,
        url: `/download/${path.basename(outputPath)}`,
        message: 'Emotion transfer completed'
      });
    }
  } catch (error) {
    console.error('Emotion transfer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DOWNLOAD ENDPOINT ====================
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'outputs', filename);

  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🤖 Advanced AI Editor running on http://localhost:${PORT}`);
  console.log('Available features: Face Swap, Voice Clone, Lip-Sync, Video Editing');
});