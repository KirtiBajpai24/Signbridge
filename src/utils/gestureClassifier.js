// Helper to calculate Euclidean distance between two 3D landmarks
export function getDistance(p1, p2) {
  if (!p1 || !p2) return 0
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  const dz = (p1.z || 0) - (p2.z || 0)
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

// 21 MediaPipe hand connections for skeletal rendering
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [0, 17]
]

/**
 * Robust scale-invariant geometric ASL classifier.
 * Computes anatomical ratios normalized by the user's hand palm scale.
 * Works regardless of camera distance, user hand size, or slight angles.
 */
export function classifyHandLandmarks(landmarks, allHandsList = []) {
  if (!landmarks || landmarks.length < 21) return null

  // 1. Two-hand cooperative signs (if 2 hands are present in frame)
  if (allHandsList && allHandsList.length >= 2) {
    const h1 = allHandsList[0]
    const h2 = allHandsList[1]
    if (h1 && h2 && h1.length >= 21 && h2.length >= 21) {
      const pScale1 = getDistance(h1[0], h1[9])
      const pScale2 = getDistance(h2[0], h2[9])
      const avgScale = (pScale1 + pScale2) / 2

      if (avgScale > 0.02) {
        const handsDist = getDistance(h1[0], h2[0]) / avgScale

        // Sign: "Help" 🆘 (One hand in Thumbs-Up resting on or above the other hand's flat open palm)
        const h1IsThumbUp = isThumbsUpPosture(h1, pScale1)
        const h2IsThumbUp = isThumbsUpPosture(h2, pScale2)
        const h1IsFlatPalm = isFlatPalmPosture(h1, pScale1)
        const h2IsFlatPalm = isFlatPalmPosture(h2, pScale2)

        if ((h1IsThumbUp && h2IsFlatPalm) || (h2IsThumbUp && h1IsFlatPalm)) {
          if (handsDist < 3.2) {
            return {
              name: 'Help_Sign',
              displayName: 'Help (ASL Two-Hand) 🆘',
              speech: 'I need help',
              confidence: 0.98,
              category: 'Emergency'
            }
          }
        }

        // Sign: "Thank You / Together" 🙏 (Two open flat palms pressed together or close in front)
        if (h1IsFlatPalm && h2IsFlatPalm && handsDist < 2.2) {
          const tipsDist = getDistance(h1[8], h2[8]) / avgScale
          if (tipsDist < 1.2) {
            return {
              name: 'Thank_You',
              displayName: 'Thank You / Welcome 🙏',
              speech: 'Thank you very much',
              confidence: 0.97,
              category: 'Courtesy'
            }
          }
        }
      }
    }
  }

  // 2. Single-hand anatomical analysis
  const wrist = landmarks[0]
  const middleMcp = landmarks[9]

  // Palm scale (length of palm from wrist to base of middle finger)
  const palmScale = getDistance(wrist, middleMcp)
  if (palmScale < 0.02) return null

  // Normalized distance helper (independent of distance from camera)
  const normDist = (p1, p2) => getDistance(p1, p2) / palmScale

  // Orientation vector (wrist to middle MCP: negative dy means hand is upright)
  const dirY = middleMcp.y - wrist.y
  const isUpright = dirY < -0.05

  // Helper: Determine if a finger is extended or curled
  const checkFinger = (tipIdx, pipIdx, mcpIdx) => {
    const tip = landmarks[tipIdx]
    const pip = landmarks[pipIdx]
    const mcp = landmarks[mcpIdx]

    const tipWrist = getDistance(tip, wrist)
    const pipWrist = getDistance(pip, wrist)
    const tipMcp = getDistance(tip, mcp)
    const pipMcp = getDistance(pip, mcp)

    // Upright constraint: tip must be higher than pip
    if (isUpright && tip.y > pip.y) {
      return false
    }

    // Extended if tip is clearly further from wrist and stretched from MCP
    return tipWrist > pipWrist * 1.1 && tipMcp > pipMcp * 1.25
  }

  const isIndexOpen = checkFinger(8, 6, 5)
  const isMiddleOpen = checkFinger(12, 10, 9)
  const isRingOpen = checkFinger(16, 14, 13)
  const isPinkyOpen = checkFinger(20, 18, 17)

  // Thumb geometry
  const thumbTip = landmarks[4]
  const thumbMcp = landmarks[2]
  const indexMcp = landmarks[5]
  const _indexPip = landmarks[6]
  const indexTip = landmarks[8]
  const middleTip = landmarks[12]
  const ringTip = landmarks[16]
  const _pinkyTip = landmarks[20]

  const thumbIndexDist = normDist(thumbTip, indexMcp)
  const thumbMcpDist = normDist(thumbTip, thumbMcp)
  const thumbWristDist = getDistance(thumbTip, wrist)
  const mcpWristDist = getDistance(thumbMcp, wrist)

  // Thumb is extended outward from palm
  const isThumbOpen =
    thumbIndexDist > 0.42 &&
    thumbMcpDist > 0.42 &&
    thumbWristDist > mcpWristDist * 1.08

  // Thumb tip touching index tip (for "OK" circle)
  const thumbTouchesIndex = normDist(thumbTip, indexTip) < 0.32

  // Thumb pointing direction
  const isThumbPointingUp =
    thumbTip.y < thumbMcp.y - palmScale * 0.2 &&
    thumbTip.y < wrist.y - palmScale * 0.28
  const isThumbPointingDown =
    thumbTip.y > thumbMcp.y + palmScale * 0.15 &&
    thumbTip.y > wrist.y + palmScale * 0.05

  // --- ASL SIGN MATCHING RULES ---

  // 1. "OK" Sign (👌): Thumb & index tips form circle, middle, ring, pinky extended
  if (thumbTouchesIndex && isMiddleOpen && isRingOpen && isPinkyOpen) {
    return {
      name: 'OK_Sign',
      displayName: 'OK / Perfect 👌',
      speech: 'Everything is OK',
      confidence: 0.97,
      category: 'Response'
    }
  }

  // 2. "I Love You" (🤟): Thumb, Index, Pinky extended, Middle & Ring curled
  if (isThumbOpen && isIndexOpen && isPinkyOpen && !isMiddleOpen && !isRingOpen && !thumbTouchesIndex) {
    return {
      name: 'ILoveYou',
      displayName: 'I Love You (ASL) 🤟',
      speech: 'I love you',
      confidence: 0.98,
      category: 'Phrase'
    }
  }

  // 3. ASL Letter "Y" / "Call Me" (🤙): Thumb & Pinky extended, middle three curled
  if (isThumbOpen && isPinkyOpen && !isIndexOpen && !isMiddleOpen && !isRingOpen) {
    return {
      name: 'Y_Sign',
      displayName: 'Call Me / Letter Y 🤙',
      speech: 'Call me, or Letter Y',
      confidence: 0.96,
      category: 'Alphabet'
    }
  }

  // 4. ASL Letter "L" (👉): Thumb & Index extended at right angle, others curled
  if (isThumbOpen && isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
    if (normDist(thumbTip, indexTip) > 0.45) {
      return {
        name: 'L_Sign',
        displayName: 'Letter L 👉',
        speech: 'Letter L',
        confidence: 0.95,
        category: 'Alphabet'
      }
    }
  }

  // 5. Peace / Number Two / Victory (✌️): Index & Middle extended, others curled
  if (isIndexOpen && isMiddleOpen && !isRingOpen && !isPinkyOpen) {
    const tipSpread = normDist(indexTip, middleTip)
    if (tipSpread > 0.14) {
      return {
        name: 'Victory',
        displayName: 'Peace / Number Two ✌️',
        speech: 'Peace, or Number Two',
        confidence: 0.96,
        category: 'Sign'
      }
    }
  }

  // 6. Pointing / One (☝️): Index extended only, middle/ring/pinky curled
  if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
    return {
      name: 'Pointing_Up',
      displayName: 'One / Pointing ☝️',
      speech: 'Number One',
      confidence: 0.95,
      category: 'Sign'
    }
  }

  // 7. Thumbs Up (👍) & Thumbs Down (👎) & Closed Fist (✊)
  if (!isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
    if (isThumbPointingUp) {
      return {
        name: 'Thumb_Up',
        displayName: 'Yes / Good 👍',
        speech: 'Yes, that sounds good',
        confidence: 0.97,
        category: 'Response'
      }
    }
    if (isThumbPointingDown) {
      return {
        name: 'Thumb_Down',
        displayName: 'No / Disagree 👎',
        speech: 'No, I disagree',
        confidence: 0.97,
        category: 'Response'
      }
    }
    // All 4 curled and thumb tucked/flat = Closed Fist
    return {
      name: 'Closed_Fist',
      displayName: 'Fist / Letter S ✊',
      speech: 'Letter S or Ready',
      confidence: 0.94,
      category: 'Alphabet'
    }
  }

  // 8. Letter "W" / Three (🖖): Index, Middle, Ring extended, Pinky curled
  if (isIndexOpen && isMiddleOpen && isRingOpen && !isPinkyOpen) {
    return {
      name: 'W_Sign',
      displayName: 'Letter W / Three 🖖',
      speech: 'Letter W, or Number Three',
      confidence: 0.94,
      category: 'Alphabet'
    }
  }

  // 9. Letter "B" (🖐️): 4 fingers extended together upright, thumb tucked across palm
  if (isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen && !isThumbOpen) {
    const fingerCloseness = normDist(indexTip, middleTip) + normDist(middleTip, ringTip)
    if (fingerCloseness < 0.6) {
      return {
        name: 'B_Sign',
        displayName: 'Letter B 🖐️',
        speech: 'Letter B',
        confidence: 0.95,
        category: 'Alphabet'
      }
    }
  }

  // 10. Single-hand "Thank You" 🙏: Flat open hand held high near upper chest / chin
  if (isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen) {
    if (wrist.y < 0.48) {
      return {
        name: 'Thank_You',
        displayName: 'Thank You 🙏',
        speech: 'Thank you!',
        confidence: 0.94,
        category: 'Courtesy'
      }
    }
  }

  // 11. Hello / Open Palm (✋): All 5 fingers extended spread open
  if (isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen && isThumbOpen) {
    return {
      name: 'Open_Palm',
      displayName: 'Hello / Greeting ✋',
      speech: 'Hello! How are you?',
      confidence: 0.98,
      category: 'Greeting'
    }
  }

  return null
}

// Helpers for multi-hand postures
function isThumbsUpPosture(hand, palmScale) {
  const _wrist = hand[0]
  const thumbTip = hand[4]
  const thumbMcp = hand[2]
  const indexTip = hand[8]
  const middleTip = hand[12]

  const indexCurled = getDistance(indexTip, hand[5]) < getDistance(hand[6], hand[5]) * 1.2
  const middleCurled = getDistance(middleTip, hand[9]) < getDistance(hand[10], hand[9]) * 1.2
  const thumbUp = thumbTip.y < thumbMcp.y - palmScale * 0.18

  return indexCurled && middleCurled && thumbUp
}

function isFlatPalmPosture(hand, _palmScale) {
  const wrist = hand[0]
  const indexTip = hand[8]
  const middleTip = hand[12]
  const ringTip = hand[16]

  const indexExtended = getDistance(indexTip, wrist) > getDistance(hand[6], wrist) * 1.1
  const middleExtended = getDistance(middleTip, wrist) > getDistance(hand[10], wrist) * 1.1
  const ringExtended = getDistance(ringTip, wrist) > getDistance(hand[14], wrist) * 1.1

  return indexExtended && middleExtended && ringExtended
}

// AR Canvas drawer for glowing neon hand landmarks, skeletal connections & HUD pill
export function drawHandLandmarks(ctx, landmarksList, width, height, detectedSign = null, options = {}) {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  if (!landmarksList || landmarksList.length === 0) return

  const showSkeleton = options.showSkeleton !== false
  const showJoints = options.showJoints !== false
  const showBoundingBox = options.showBoundingBox === true
  const showBadge = options.showBadge !== false

  for (let hIdx = 0; hIdx < landmarksList.length; hIdx++) {
    const landmarks = landmarksList[hIdx]
    if (!landmarks || landmarks.length < 21) continue

    // 1. Draw glowing neon bones (connections)
    if (showSkeleton) {
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'
      ctx.shadowBlur = 14
      ctx.shadowColor = '#6366f1'
      ctx.strokeStyle = '#818cf8'

      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const p1 = landmarks[startIdx]
        const p2 = landmarks[endIdx]
        if (!p1 || !p2) continue

        ctx.beginPath()
        ctx.moveTo(p1.x * width, p1.y * height)
        ctx.lineTo(p2.x * width, p2.y * height)
        ctx.stroke()
      }
    }

    // 2. Draw glowing cyan landmark joint circles
    if (showJoints) {
      ctx.shadowBlur = 10
      ctx.shadowColor = '#38bdf8'

      for (let i = 0; i < landmarks.length; i++) {
        const p = landmarks[i]
        if (!p) continue
        const x = p.x * width
        const y = p.y * height

        ctx.beginPath()
        const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20
        const radius = isTip ? 6.5 : 4
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = isTip ? '#38bdf8' : '#ffffff'
        ctx.fill()

        if (isTip) {
          ctx.beginPath()
          ctx.arc(x, y, 9.5, 0, 2 * Math.PI)
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      }
    }

    // 3. Draw scale-invariant bounding box if requested
    if (showBoundingBox) {
      let minX = 1, maxX = 0, minY = 1, maxY = 0
      for (const lm of landmarks) {
        if (lm.x < minX) minX = lm.x
        if (lm.x > maxX) maxX = lm.x
        if (lm.y < minY) minY = lm.y
        if (lm.y > maxY) maxY = lm.y
      }

      const padX = (maxX - minX) * 0.15 * width
      const padY = (maxY - minY) * 0.15 * height
      const bx = Math.max(0, minX * width - padX)
      const by = Math.max(0, minY * height - padY)
      const bw = Math.min(width - bx, (maxX - minX) * width + padX * 2)
      const bh = Math.min(height - by, (maxY - minY) * height + padY * 2)

      ctx.save()
      ctx.strokeStyle = '#0d9488'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 6])
      ctx.strokeRect(bx, by, bw, bh)
      ctx.fillStyle = 'rgba(13, 148, 136, 0.08)'
      ctx.fillRect(bx, by, bw, bh)
      ctx.restore()
    }

    // 4. Draw on-screen AR HUD Badge above the primary hand
    if (showBadge && hIdx === 0 && detectedSign && detectedSign.displayName) {
      const middleTip = landmarks[12]
      const badgeX = Math.max(80, Math.min(width - 80, middleTip.x * width))
      const badgeY = Math.max(36, middleTip.y * height - 32)

      ctx.shadowBlur = 12
      ctx.shadowColor = 'rgba(99, 102, 241, 0.6)'

      // Background rounded pill
      const text = `${detectedSign.displayName}`
      ctx.font = 'bold 14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      const textWidth = ctx.measureText(text).width
      const pillWidth = textWidth + 24
      const pillHeight = 28
      const pillX = badgeX - pillWidth / 2
      const pillY = badgeY - pillHeight / 2

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)'
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 1.8

      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 14)
      } else {
        ctx.rect(pillX, pillY, pillWidth, pillHeight)
      }
      ctx.fill()
      ctx.stroke()

      // Text inside pill
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, badgeX, badgeY)
    }
  }
}
