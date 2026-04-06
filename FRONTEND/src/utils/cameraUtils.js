/**
 * Face Detection and Camera utilities for DermAI
 * Uses face-api.js for real-time face detection
 */

import * as faceapi from 'face-api.js'

let modelsLoaded = false

/**
 * Initialize the face-api.js models
 */
export async function initializeFaceDetector() {
  if (modelsLoaded) return true

  try {
    // Load models from CDN
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ])

    modelsLoaded = true
    console.log('✅ Face Detector initialized')
    return true
  } catch (err) {
    console.warn('⚠️ Face detection not available, using fallback:', err)
    return false
  }
}

/**
 * Detect faces in an image
 * @param {HTMLVideoElement | HTMLCanvasElement | HTMLImageElement} imageSource
 * @returns {Object} Detection results with faces array
 */
export async function detectFaces(imageSource) {
  if (!modelsLoaded) {
    await initializeFaceDetector()
  }

  try {
    const detections = await faceapi.detectAllFaces(
      imageSource,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceExpressions()

    const detected = detections && detections.length > 0

    return {
      faces: detections || [],
      detected,
      confidence: detected ? Math.round(detections[0].detection.score * 100) : 0
    }
  } catch (err) {
    console.warn('Face detection failed:', err)
    return { faces: [], detected: false }
  }
}

/**
 * Detection result for a single face
 * @typedef {Object} FaceDetection
 * @property {number} x - X coordinate of bounding box
 * @property {number} y - Y coordinate of bounding box
 * @property {number} width - Width of bounding box
 * @property {number} height - Height of bounding box
 * @property {number} confidence - Detection confidence 0-1
 */

/**
 * Get face bounding box in pixel coordinates
 * @param {Object} detection - face-api detection object
 * @returns {FaceDetection}
 */
export function getFaceBoundingBox(detection) {
  if (!detection.detection.box) {
    return null
  }

  const box = detection.detection.box

  return {
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    confidence: detection.detection.score,
    center: {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    }
  }
}

/**
 * Check if face is properly centered and sized
 * @param {FaceDetection} bbox - Bounding box
 * @param {Object} imageSize - {width, height} of image
 * @param {number} tolerance - Tolerance from center (0-0.5)
 * @returns {Object} Validation result
 */
export function validateFacePosition(bbox, imageSize, tolerance = 0.15) {
  if (!bbox || !imageSize) {
    return {
      isValid: false,
      centered: false,
      properSize: false,
      message: 'No face detected'
    }
  }

  // Normalize to 0-1 range
  const centerX = bbox.center.x / imageSize.width
  const centerY = bbox.center.y / imageSize.height
  const normalizedWidth = bbox.width / imageSize.width
  const normalizedHeight = bbox.height / imageSize.height

  // Check if face is centered
  const centered = Math.abs(centerX - 0.5) < tolerance && Math.abs(centerY - 0.5) < tolerance

  // Check if face is proper size (not too small, not too large)
  const properSize = normalizedWidth > 0.3 && normalizedWidth < 0.85 && normalizedHeight > 0.3 && normalizedHeight < 0.85

  let message = ''
  if (!centered) {
    if (centerX < 0.35) message = 'Move face to the right'
    else if (centerX > 0.65) message = 'Move face to the left'
    else if (centerY < 0.35) message = 'Move face down'
    else if (centerY > 0.65) message = 'Move face up'
  } else if (!properSize) {
    if (normalizedWidth < 0.3) message = 'Move face closer to camera'
    else if (normalizedWidth > 0.85) message = 'Move face away from camera'
  } else {
    message = '✓ Face properly positioned'
  }

  return {
    isValid: centered && properSize,
    centered,
    properSize,
    message,
    bbox
  }
}

/**
 * Draw face detection box on canvas
 */
export function drawFaceBox(ctx, bbox, options = {}) {
  const {
    color = '#00B4D8',
    lineWidth = 3
  } = options

  // Draw rectangle
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height)

  // Draw circles at corners
  const cornerRadius = 8
  const corners = [
    { x: bbox.x, y: bbox.y },
    { x: bbox.x + bbox.width, y: bbox.y },
    { x: bbox.x, y: bbox.y + bbox.height },
    { x: bbox.x + bbox.width, y: bbox.y + bbox.height }
  ]

  corners.forEach(corner => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(corner.x, corner.y, cornerRadius, 0, Math.PI * 2)
    ctx.fill()
  })
}

/**
 * Draw zone indicators on canvas
 */
export function drawZoneIndicators(ctx, bbox, options = {}) {
  const {
    opacity = 0.3
  } = options

  ctx.globalAlpha = opacity
  ctx.strokeStyle = '#4F6FD1'
  ctx.lineWidth = 2

  const x = bbox.x
  const y = bbox.y
  const w = bbox.width
  const h = bbox.height

  // Draw zone grid (7-zone model)
  // Forehead/T-Zone
  ctx.strokeRect(x + w * 0.15, y + h * 0.15, w * 0.7, h * 0.25)

  // Left cheek
  ctx.strokeRect(x + w * 0.05, y + h * 0.35, w * 0.25, h * 0.35)

  // Right cheek  
  ctx.strokeRect(x + w * 0.7, y + h * 0.35, w * 0.25, h * 0.35)

  // Chin
  ctx.strokeRect(x + w * 0.2, y + h * 0.7, w * 0.6, h * 0.25)

  ctx.globalAlpha = 1
}

/**
 * Create a scanning animation frame
 */
export function drawScanningFrame(ctx, progress, bbox, options = {}) {
  const {
    color = '#00B4D8'
  } = options

  progress = progress % 1 // 0-1
  const angle = progress * Math.PI * 2

  const x = bbox.center.x
  const y = bbox.center.y
  const radius = Math.max(bbox.width, bbox.height) * 0.6

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.6

  // Draw scanning arc
  ctx.beginPath()
  ctx.arc(x, y, radius, angle, angle + Math.PI / 2)
  ctx.stroke()

  ctx.globalAlpha = 1
}

/**
 * Capture canvas as image data
 */
export function captureFrameAsImage(canvas) {
  return canvas.toDataURL('image/jpeg', 0.95)
}

/**
 * Capture canvas as base64 blob
 */
export async function captureFrameAsBlob(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    }, 'image/jpeg', 0.95)
  })
}

/**
 * Get camera permissions
 */
export async function requestCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        facingMode: 'user'
      }
    })
    return { granted: true, stream }
  } catch (err) {
    return {
      granted: false,
      error: err.name === 'NotAllowedError'
        ? 'Camera permission denied'
        : 'Camera not available',
      details: err.message
    }
  }
}

/**
 * Stop all camera tracks
 */
export function stopCameraStream(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
}

export default {
  initializeFaceDetector,
  detectFaces,
  getFaceBoundingBox,
  validateFacePosition,
  drawFaceBox,
  drawZoneIndicators,
  drawScanningFrame,
  captureFrameAsImage,
  captureFrameAsBlob,
  requestCameraPermission,
  stopCameraStream
}
