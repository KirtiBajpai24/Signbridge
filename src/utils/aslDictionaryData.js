// Complete ASL Vocabulary & Alphabet Data for SignBridge Text-to-Sign & Dictionary

// 26 Manual Alphabet Handshapes with precise anatomical directions
export const ASL_ALPHABET = {
  A: {
    letter: 'A',
    sign: '✊',
    desc: 'Fist with fingers curled tight into palm, thumb resting upright against the side of the index finger.',
    hint: 'Thumb alongside fist'
  },
  B: {
    letter: 'B',
    sign: '🖐️',
    desc: 'Four fingers held straight and together pointing up, thumb folded across the palm.',
    hint: '4 fingers upright, thumb across palm'
  },
  C: {
    letter: 'C',
    sign: '🤏',
    desc: 'Curved hand forming a C-shape, fingers together and thumb opposed facing outward.',
    hint: 'C-shape curve'
  },
  D: {
    letter: 'D',
    sign: '☝️',
    desc: 'Index finger straight up, thumb and remaining three fingers touch tips to form a circle.',
    hint: 'Index straight up, circle at base'
  },
  E: {
    letter: 'E',
    sign: '✊',
    desc: 'All four fingertips curled down resting directly on top of the thumb.',
    hint: 'Curled claws resting on thumb'
  },
  F: {
    letter: 'F',
    sign: '👌',
    desc: 'Index finger and thumb touch tips in a circle, middle, ring, and pinky fingers spread upright.',
    hint: 'OK-circle with 3 fingers up'
  },
  G: {
    letter: 'G',
    sign: '👈',
    desc: 'Index finger and thumb extend parallel horizontally pointing sideways like pinch calipers.',
    hint: 'Horizontal pinch pointing sideways'
  },
  H: {
    letter: 'H',
    sign: '✌️',
    desc: 'Index and middle fingers held together pointing horizontally to the side, thumb folded.',
    hint: 'Index & middle horizontal'
  },
  I: {
    letter: 'I',
    sign: '🤙',
    desc: 'Pinky finger held straight up, all other fingers closed into fist with thumb across.',
    hint: 'Pinky finger straight up'
  },
  J: {
    letter: 'J',
    sign: '🤙',
    desc: 'Make the "I" pinky handshape and draw a small "J" hook curve in the air.',
    hint: 'Pinky trace a J hook'
  },
  K: {
    letter: 'K',
    sign: '✌️',
    desc: 'Index finger straight up, middle finger angled slightly forward, thumb resting on middle knuckle.',
    hint: 'V with thumb between'
  },
  L: {
    letter: 'L',
    sign: '👆',
    desc: 'Index finger pointing straight up, thumb extended horizontally forming a 90-degree L-shape.',
    hint: 'L-shape with index & thumb'
  },
  M: {
    letter: 'M',
    sign: '✊',
    desc: 'Three fingers (index, middle, ring) folded over the thumb, pinky tucked into palm.',
    hint: '3 fingers draped over thumb'
  },
  N: {
    letter: 'N',
    sign: '✊',
    desc: 'Two fingers (index and middle) folded over the thumb, ring and pinky tucked into palm.',
    hint: '2 fingers draped over thumb'
  },
  O: {
    letter: 'O',
    sign: '⭕',
    desc: 'All fingers curved to meet the thumb tip, forming a complete circular O.',
    hint: 'Fingers & thumb form an O'
  },
  P: {
    letter: 'P',
    sign: '👇',
    desc: 'Same handshape as "K", but pointed downward toward the floor.',
    hint: 'K-handshape pointing down'
  },
  Q: {
    letter: 'Q',
    sign: '👇',
    desc: 'Same handshape as "G", but pointed downward toward the floor.',
    hint: 'G-handshape pointing down'
  },
  R: {
    letter: 'R',
    sign: '🤞',
    desc: 'Index and middle fingers crossed tightly (like wishing for good luck).',
    hint: 'Crossed index & middle fingers'
  },
  S: {
    letter: 'S',
    sign: '✊',
    desc: 'Tight fist with the thumb wrapped firmly across the front of all four fingers.',
    hint: 'Fist with thumb in front'
  },
  T: {
    letter: 'T',
    sign: '✊',
    desc: 'Fist with thumb tucked between the index and middle fingers.',
    hint: 'Thumb between index & middle'
  },
  U: {
    letter: 'U',
    sign: '✌️',
    desc: 'Index and middle fingers held together pointing straight up, thumb across ring & pinky.',
    hint: 'Index & middle together up'
  },
  V: {
    letter: 'V',
    sign: '✌️',
    desc: 'Index and middle fingers spread apart into a "V" peace shape, pointing upright.',
    hint: 'V peace fingers spread'
  },
  W: {
    letter: 'W',
    sign: '🖖',
    desc: 'Index, middle, and ring fingers spread apart pointing straight up forming a "W".',
    hint: '3 fingers spread in W'
  },
  X: {
    letter: 'X',
    sign: '☝️',
    desc: 'Index finger hooked/crooked like a pirate hook, remaining fingers closed.',
    hint: 'Hooked bent index finger'
  },
  Y: {
    letter: 'Y',
    sign: '🤙',
    desc: 'Thumb and pinky fingers extended out to the sides, middle three fingers folded into palm.',
    hint: 'Hang loose / shaka hand'
  },
  Z: {
    letter: 'Z',
    sign: '☝️',
    desc: 'Index finger points forward and traces the letter "Z" in the air.',
    hint: 'Index finger trace a Z'
  }
}

// 60+ Common ASL Words & Multi-word Phrases
export const ASL_WORDS_MAP = {
  // Common multi-word phrases first (for greedy tokenization)
  'good day': {
    label: 'GOOD DAY',
    sign: '☀️',
    badge: 'Phrase',
    motion: '⬇️ ➔ 🌅',
    desc: '1. Sign "GOOD": Flat right hand touches chin and drops onto open flat left palm.\n2. Sign "DAY": Non-dominant arm horizontal (horizon), dominant arm arcs like the sun crossing the sky.',
    category: 'Greeting'
  },
  'good morning': {
    label: 'GOOD MORNING',
    sign: '🌅',
    badge: 'Phrase',
    motion: '⬇️ ➔ ⬆️',
    desc: '1. Sign "GOOD" (chin to open palm).\n2. Sign "MORNING": Non-dominant arm horizontal, dominant open hand rises from under arm like the rising sun.',
    category: 'Greeting'
  },
  'good afternoon': {
    label: 'GOOD AFTERNOON',
    sign: '🌤️',
    badge: 'Phrase',
    motion: '⬇️ ➔ ↘️',
    desc: '1. Sign "GOOD" (chin to open palm).\n2. Sign "AFTERNOON": Dominant open flat hand arches slightly downward past midday.',
    category: 'Greeting'
  },
  'good night': {
    label: 'GOOD NIGHT',
    sign: '🌙',
    badge: 'Phrase',
    motion: '⬇️ ➔ ⤵️',
    desc: '1. Sign "GOOD" (chin to open palm).\n2. Sign "NIGHT": Dominant curved hand hooks over the horizontal edge of non-dominant arm like the setting sun.',
    category: 'Greeting'
  },
  'how are you': {
    label: 'HOW ARE YOU?',
    sign: '🤝',
    badge: 'Phrase',
    motion: '🔄 ➔ 👉',
    desc: '1. Sign "HOW": Curved hands roll outward from chest.\n2. Sign "YOU": Index finger points smoothly forward to your conversation partner.',
    category: 'Question'
  },
  'nice to meet you': {
    label: 'NICE TO MEET YOU',
    sign: '🤝',
    badge: 'Phrase',
    motion: '👋 ➔ 🤜🤛',
    desc: '1. Sign "NICE": Flat dominant hand slides across non-dominant palm.\n2. Sign "MEET": Both index fingers held upright and brought together.',
    category: 'Greeting'
  },
  'thank you': {
    label: 'THANK YOU',
    sign: '🙏',
    badge: 'Courtesy',
    motion: '👄 ➔ 🫱',
    desc: 'Fingertips of open flat hand touch lips/chin, then move gracefully forward towards the person with a gentle nod.',
    category: 'Courtesy'
  },
  'i love you': {
    label: 'I LOVE YOU',
    sign: '🤟',
    badge: 'Affection',
    motion: '✋ ➔ 🤟',
    desc: 'Extend thumb (I), index (L), and pinky (Y) simultaneously while folding middle and ring fingers, palm facing forward.',
    category: 'Affection'
  },
  'see you later': {
    label: 'SEE YOU LATER',
    sign: '👀',
    badge: 'Phrase',
    motion: '👀 ➔ ⏰',
    desc: '1. Sign "SEE": V-handshape moves outward from eyes.\n2. Sign "LATER": L-handshape snaps forward at wrist.',
    category: 'Greeting'
  },

  // Single Words
  good: {
    label: 'GOOD',
    sign: '👍',
    badge: 'Sign',
    motion: '👄 ➔ 🫲',
    desc: 'Fingertips of flat right hand touch chin/lips, then move downward to land gently in the palm of the flat left hand.',
    category: 'Courtesy'
  },
  day: {
    label: 'DAY',
    sign: '☀️',
    badge: 'Sign',
    motion: '💪 ➔ 🌅',
    desc: 'Non-dominant arm held flat horizontally across chest (the horizon). Dominant elbow rests on non-dominant fingertips, and dominant arm arcs across like the sun.',
    category: 'Time'
  },
  hello: {
    label: 'HELLO',
    sign: '✋',
    badge: 'Sign',
    motion: '🫡 ➔ 🫱',
    desc: 'Open flat hand with thumb tucked in touches side of forehead/temple and extends forward in a gentle wave/salute.',
    category: 'Greeting'
  },
  hi: {
    label: 'HI',
    sign: '👋',
    badge: 'Sign',
    motion: '👋',
    desc: 'Open palm facing forward at shoulder height gently waving side to side.',
    category: 'Greeting'
  },
  how: {
    label: 'HOW',
    sign: '🤝',
    badge: 'Sign',
    motion: '🔄',
    desc: 'Both hands bent at knuckles with backs of fingers touching, rolling outward until palms face up.',
    category: 'Question'
  },
  you: {
    label: 'YOU',
    sign: '👉',
    badge: 'Sign',
    motion: '👉',
    desc: 'Index finger points forward directly toward the person you are communicating with.',
    category: 'Pronoun'
  },
  me: {
    label: 'ME / I',
    sign: '👈',
    badge: 'Sign',
    motion: '👈',
    desc: 'Index finger points gently toward your own chest center.',
    category: 'Pronoun'
  },
  i: {
    label: 'I',
    sign: '👈',
    badge: 'Sign',
    motion: '👈',
    desc: 'Index finger or I-pinky touches the center of your chest.',
    category: 'Pronoun'
  },
  we: {
    label: 'WE',
    sign: '👥',
    badge: 'Sign',
    motion: '↩️↪️',
    desc: 'Index finger touches dominant shoulder, then arcs in front of chest to touch non-dominant shoulder.',
    category: 'Pronoun'
  },
  they: {
    label: 'THEY',
    sign: '👉',
    badge: 'Sign',
    motion: '➡️➡️',
    desc: 'Index finger points outward and sweeps across in an arc.',
    category: 'Pronoun'
  },
  yes: {
    label: 'YES',
    sign: '✊',
    badge: 'Sign',
    motion: '↕️',
    desc: 'Fist (S-handshape) held in front of chest, nodding up and down from the wrist like a head nodding in agreement.',
    category: 'Response'
  },
  no: {
    label: 'NO',
    sign: '🤏',
    badge: 'Sign',
    motion: '🫰',
    desc: 'Index and middle fingers snap down together against the thumb, resembling a mouth firmly snapping shut.',
    category: 'Response'
  },
  please: {
    label: 'PLEASE',
    sign: '🤲',
    badge: 'Sign',
    motion: '⭕',
    desc: 'Flat open palm placed on the center of the chest and rubbed in a smooth circular motion.',
    category: 'Courtesy'
  },
  sorry: {
    label: 'SORRY',
    sign: '✊',
    badge: 'Sign',
    motion: '⭕',
    desc: 'A-fist (thumb on side) rubbed in a circular motion over the heart with a remorseful facial expression.',
    category: 'Courtesy'
  },
  thanks: {
    label: 'THANKS',
    sign: '🙏',
    badge: 'Sign',
    motion: '👄 ➔ 🫱',
    desc: 'Fingertips of flat hand touch chin and extend outward towards the person.',
    category: 'Courtesy'
  },
  welcome: {
    label: 'WELCOME',
    sign: '👐',
    badge: 'Sign',
    motion: '🫱 ➔ 🫲',
    desc: 'Open curved hand sweeps inward toward the waist in an inviting, hospitable motion.',
    category: 'Courtesy'
  },
  help: {
    label: 'HELP',
    sign: '🆘',
    badge: 'Sign',
    motion: '⬆️',
    desc: 'Closed fist with thumb upright (A-hand) rests on flat open palm of the non-dominant hand; both lift upward together.',
    category: 'Emergency'
  },
  emergency: {
    label: 'EMERGENCY',
    sign: '🚨',
    badge: 'Sign',
    motion: '↔️',
    desc: 'E-handshape shaken vigorously side to side in front of the body with an urgent expression.',
    category: 'Emergency'
  },
  doctor: {
    label: 'DOCTOR',
    sign: '👨‍⚕️',
    badge: 'Sign',
    motion: '⌚',
    desc: 'Fingertips of M-hand or bent flat hand tap the inside of the non-dominant wrist twice, feeling for a pulse.',
    category: 'Medical'
  },
  hospital: {
    label: 'HOSPITAL',
    sign: '🏥',
    badge: 'Sign',
    motion: '✝️',
    desc: 'H-fingers draw a small cross on the upper non-dominant arm/shoulder.',
    category: 'Medical'
  },
  medicine: {
    label: 'MEDICINE',
    sign: '💊',
    badge: 'Sign',
    motion: '🔄',
    desc: 'Middle finger rocks back and forth into the center of the non-dominant open palm as if grinding a pill.',
    category: 'Medical'
  },
  pain: {
    label: 'PAIN / HURT',
    sign: '⚡',
    badge: 'Sign',
    motion: '👉👈',
    desc: 'Both index fingers point toward each other and twist toward one another repeatedly near the location of discomfort.',
    category: 'Medical'
  },
  water: {
    label: 'WATER',
    sign: '💧',
    badge: 'Sign',
    motion: '👄',
    desc: 'W-handshape (three middle fingers up) taps index finger twice against the chin/lower lip.',
    category: 'Daily'
  },
  food: {
    label: 'FOOD / EAT',
    sign: '🍎',
    badge: 'Sign',
    motion: '👄',
    desc: 'Squashed O-handshape (fingertips touching thumb) brought to touch the lips twice.',
    category: 'Daily'
  },
  eat: {
    label: 'EAT',
    sign: '🍽️',
    badge: 'Sign',
    motion: '👄',
    desc: 'Fingertips of squashed O-handshape tap the lips once or twice.',
    category: 'Daily'
  },
  drink: {
    label: 'DRINK',
    sign: '🥤',
    badge: 'Sign',
    motion: '👄',
    desc: 'C-handshape mimics holding a small cup and tipping it toward open mouth.',
    category: 'Daily'
  },
  bathroom: {
    label: 'BATHROOM / RESTROOM',
    sign: '🚻',
    badge: 'Sign',
    motion: '↔️',
    desc: 'T-handshape (thumb between index and middle fingers) shakes gently side to side.',
    category: 'Daily'
  },
  restroom: {
    label: 'RESTROOM',
    sign: '🚻',
    badge: 'Sign',
    motion: '↔️',
    desc: 'R-handshape (crossed fingers) bounces twice, or T-handshape shakes side to side.',
    category: 'Daily'
  },
  friend: {
    label: 'FRIEND',
    sign: '🤝',
    badge: 'Sign',
    motion: '🤞',
    desc: 'Both index fingers hook together once, then flip and hook the opposite way, signifying mutual connection.',
    category: 'People'
  },
  family: {
    label: 'FAMILY',
    sign: '👨‍👩‍👧',
    badge: 'Sign',
    motion: '⭕',
    desc: 'Both hands form "F" shapes with thumbs and index fingers touching; hands circle forward and join at pinkies.',
    category: 'People'
  },
  name: {
    label: 'NAME',
    sign: '🏷️',
    badge: 'Sign',
    motion: '✌️✌️',
    desc: 'H-fingers (index and middle together) of dominant hand tap twice across H-fingers of non-dominant hand at right angles.',
    category: 'Identity'
  },
  nice: {
    label: 'NICE / CLEAN',
    sign: '✨',
    badge: 'Sign',
    motion: '➡️',
    desc: 'Dominant flat open palm slides smoothly forward across flat open non-dominant palm.',
    category: 'Description'
  },
  meet: {
    label: 'MEET',
    sign: '🤝',
    badge: 'Sign',
    motion: '☝️☝️',
    desc: 'Both hands have index fingers pointing up like two people, bringing knuckles together until they meet.',
    category: 'Social'
  },
  happy: {
    label: 'HAPPY',
    sign: '😊',
    badge: 'Sign',
    motion: '⬆️⬆️',
    desc: 'Open flat hands brush upward against the chest twice in an uplifting motion, accompanied by a genuine smile.',
    category: 'Emotion'
  },
  sad: {
    label: 'SAD',
    sign: '😢',
    badge: 'Sign',
    motion: '⬇️',
    desc: 'Both open hands in front of face drop downward slowly as head tilts down with a sad expression.',
    category: 'Emotion'
  },
  love: {
    label: 'LOVE',
    sign: '❤️',
    badge: 'Sign',
    motion: '🫂',
    desc: 'Both arms crossed over chest hugging upper body close.',
    category: 'Emotion'
  },
  like: {
    label: 'LIKE',
    sign: '👍',
    badge: 'Sign',
    motion: '🤏',
    desc: 'Thumb and middle finger placed on chest and pulled outward, snapping together.',
    category: 'Emotion'
  },
  need: {
    label: 'NEED / MUST',
    sign: '⚠️',
    badge: 'Sign',
    motion: '⬇️⬇️',
    desc: 'X-handshape (bent index finger) nods downward firmly twice.',
    category: 'Urgent'
  },
  want: {
    label: 'WANT',
    sign: '🤲',
    badge: 'Sign',
    motion: '🫴',
    desc: 'Both hands open palms up with clawed fingers pulling in toward the body.',
    category: 'Action'
  },
  stop: {
    label: 'STOP',
    sign: '🛑',
    badge: 'Sign',
    motion: '✋',
    desc: 'Edge of dominant flat open hand chops firmly down into the open palm of the non-dominant hand.',
    category: 'Action'
  },
  wait: {
    label: 'WAIT',
    sign: '⏳',
    badge: 'Sign',
    motion: '🖐️',
    desc: 'Both hands held up with palms facing body, wiggling fingers patiently.',
    category: 'Action'
  },
  go: {
    label: 'GO',
    sign: '👉',
    badge: 'Sign',
    motion: '➡️',
    desc: 'Both index fingers point forward and arc smoothly away from the body.',
    category: 'Action'
  },
  come: {
    label: 'COME',
    sign: '👈',
    badge: 'Sign',
    motion: '⬅️',
    desc: 'Both index fingers point upward and beckon toward the body.',
    category: 'Action'
  },
  fine: {
    label: 'FINE',
    sign: '👌',
    badge: 'Sign',
    motion: '✋',
    desc: 'Open 5-hand with thumb touching chest, fingers gently wiggled or held relaxed.',
    category: 'Response'
  },
  time: {
    label: 'TIME',
    sign: '⌚',
    badge: 'Sign',
    motion: '👉',
    desc: 'Index finger taps the back of non-dominant wrist twice where a wristwatch sits.',
    category: 'Time'
  },
  today: {
    label: 'TODAY / NOW',
    sign: '📅',
    badge: 'Sign',
    motion: '⬇️⬇️',
    desc: 'Both hands in Y-shape (thumb & pinky extended) drop slightly twice in front of the body.',
    category: 'Time'
  },
  tomorrow: {
    label: 'TOMORROW',
    sign: '⏩',
    badge: 'Sign',
    motion: '⤴️',
    desc: 'Thumb of A-fist touches jaw/cheek and arcs forward into the future.',
    category: 'Time'
  },
  yesterday: {
    label: 'YESTERDAY',
    sign: '⏪',
    badge: 'Sign',
    motion: '⤵️',
    desc: 'Thumb of A-fist touches jaw near mouth then moves back toward ear into the past.',
    category: 'Time'
  },
  where: {
    label: 'WHERE',
    sign: '❓',
    badge: 'Sign',
    motion: '↔️',
    desc: 'Index finger held upright wagging side to side with furrowed brow inquiring location.',
    category: 'Question'
  },
  what: {
    label: 'WHAT',
    sign: '❔',
    badge: 'Sign',
    motion: '🤷',
    desc: 'Both open hands held out palms up sweeping side to side with questioning expression.',
    category: 'Question'
  },
  who: {
    label: 'WHO',
    sign: '👤',
    badge: 'Sign',
    motion: '⭕',
    desc: 'Index finger points upright while thumb rests on chin; index wiggles inward.',
    category: 'Question'
  },
  why: {
    label: 'WHY',
    sign: '💡',
    badge: 'Sign',
    motion: '🧠 ➔ 🤙',
    desc: 'Fingertips touch temple then drop away into a Y-handshape.',
    category: 'Question'
  },
  when: {
    label: 'WHEN',
    sign: '⏳',
    badge: 'Sign',
    motion: '🔄',
    desc: 'Dominant index finger circles around stationary non-dominant index and lands on its tip.',
    category: 'Question'
  },
  home: {
    label: 'HOME',
    sign: '🏠',
    badge: 'Sign',
    motion: '👄 ➔ 👂',
    desc: 'Flat O-hand touches cheek near mouth, then cheek near ear (where one eats and sleeps).',
    category: 'Daily'
  },
  school: {
    label: 'SCHOOL',
    sign: '🏫',
    badge: 'Sign',
    motion: '👏',
    desc: 'Flat hands clap together twice horizontally like a teacher gathering attention.',
    category: 'Daily'
  },
  work: {
    label: 'WORK',
    sign: '💼',
    badge: 'Sign',
    motion: '🤜🤛',
    desc: 'Dominant fist taps wrist/heel of non-dominant fist twice.',
    category: 'Daily'
  },
  learn: {
    label: 'LEARN',
    sign: '📚',
    badge: 'Sign',
    motion: '📖 ➔ 🧠',
    desc: 'Fingertips grasp information from open non-dominant palm and bring it to touch the forehead.',
    category: 'Education'
  },
  see: {
    label: 'SEE',
    sign: '👀',
    badge: 'Sign',
    motion: '👀 ➔ 🫱',
    desc: 'V-handshape near eyes moves outward in the direction of sight.',
    category: 'Action'
  },
  later: {
    label: 'LATER',
    sign: '⏰',
    badge: 'Sign',
    motion: '⤴️',
    desc: 'L-handshape with index pointing forward snaps forward at the wrist.',
    category: 'Time'
  }
}

/**
 * Tokenizes natural English sentences into ASL conceptual signs and fingerspelled sequences.
 * Greedy multi-word matcher (e.g. finds "good day", "how are you", "thank you" first).
 */
export function translateTextToAslSequence(inputText) {
  if (!inputText || !inputText.trim()) return []

  const normalized = inputText.trim().toLowerCase().replace(/[^\w\s]/gi, ' ')
  const words = normalized.split(/\s+/).filter(Boolean)

  const sequence = []
  let i = 0

  while (i < words.length) {
    // Check 3-word phrase
    const threeWord = words.slice(i, i + 3).join(' ')
    if (ASL_WORDS_MAP[threeWord]) {
      sequence.push({
        type: 'word',
        original: words.slice(i, i + 3).join(' '),
        ...ASL_WORDS_MAP[threeWord]
      })
      i += 3
      continue
    }

    // Check 2-word phrase (e.g. "good day", "thank you", "good night")
    const twoWord = words.slice(i, i + 2).join(' ')
    if (ASL_WORDS_MAP[twoWord]) {
      sequence.push({
        type: 'word',
        original: words.slice(i, i + 2).join(' '),
        ...ASL_WORDS_MAP[twoWord]
      })
      i += 2
      continue
    }

    // Check single word
    const singleWord = words[i]
    if (ASL_WORDS_MAP[singleWord]) {
      sequence.push({
        type: 'word',
        original: singleWord,
        ...ASL_WORDS_MAP[singleWord]
      })
      i += 1
      continue
    }

    // Word not in concept dictionary: break down into exact ASL manual alphabet letters!
    const letters = singleWord.toUpperCase().split('')
    const letterObjects = letters.map((ch) => {
      const alpha = ASL_ALPHABET[ch] || { letter: ch, sign: '✋', desc: `Letter ${ch}`, hint: `Sign ${ch}` }
      return {
        type: 'letter',
        letter: ch,
        word: singleWord.toUpperCase(),
        sign: alpha.sign,
        label: `LETTER ${ch}`,
        badge: 'Fingerspell',
        desc: alpha.desc,
        hint: alpha.hint,
        category: 'Alphabet'
      }
    })

    sequence.push({
      type: 'fingerspell_word',
      word: singleWord.toUpperCase(),
      label: singleWord.toUpperCase(),
      sign: '🔤',
      badge: 'Fingerspell',
      desc: `Fingerspelling "${singleWord.toUpperCase()}" letter-by-letter: ${letters.join(' - ')}`,
      letters: letterObjects,
      category: 'Alphabet'
    })

    i += 1
  }

  return sequence
}
