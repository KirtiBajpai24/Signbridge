import { useState } from 'react'
import './SignDictionary.css'

const DICTIONARY_SIGNS = [
  // Greetings
  { id: 'hello', word: 'Hello', category: 'Greetings', sign: '✋', handshape: 'Open Palm', description: 'Extend flat hand to forehead and salute outward smoothly.', tip: 'Facing palm slightly forward.' },
  { id: 'thankyou', word: 'Thank You', category: 'Greetings', sign: '🙏', handshape: 'Flat Hand', description: 'Touch fingertips of flat hand to your chin and move hand forward towards the person.', tip: 'Smile naturally while making this sign.' },
  { id: 'welcome', word: 'Welcome', category: 'Greetings', sign: '🤲', handshape: 'Open Hands', description: 'Sweep both open hands toward yourself with palms up.', tip: 'Inviting motion toward the chest.' },
  { id: 'goodbye', word: 'Goodbye', category: 'Greetings', sign: '👋', handshape: 'Open Hand', description: 'Wave hand gently side to side with open palm facing forward.', tip: 'Universal and easily recognized.' },
  { id: 'nice_meet', word: 'Nice to Meet You', category: 'Greetings', sign: '🤝', handshape: 'Two Hands', description: 'Slide dominant flat hand across other palm, then bring index fingers together.', tip: 'Combines "Nice" and "Meet".' },

  // Essential Responses
  { id: 'yes', word: 'Yes', category: 'Responses', sign: '👍', handshape: 'Fist (Nod)', description: 'Make an "S" fist and bob it up and down like a nodding head.', tip: 'Matches a verbal head nod.' },
  { id: 'no', word: 'No', category: 'Responses', sign: '👎', handshape: 'Three Fingers', description: 'Snap index and middle finger down onto your thumb quickly.', tip: 'Resembles a closing beak or fast pinch.' },
  { id: 'please', word: 'Please', category: 'Responses', sign: '🤲', handshape: 'Flat Palm', description: 'Place flat hand on center of chest and rub in a gentle clockwise circle.', tip: 'Shows politeness and care.' },
  { id: 'sorry', word: 'Sorry / Apology', category: 'Responses', sign: '✊', handshape: 'Fist ("A")', description: 'Rub an "A" fist in a circular motion over your heart.', tip: 'Expresses sincere emotion.' },
  { id: 'help', word: 'Help', category: 'Responses', sign: '🆘', handshape: 'Thumbs-up on Palm', description: 'Rest a thumbs-up fist on the flat palm of your other hand and lift both together.', tip: 'Lifting motion symbolizes assisting someone up.' },
  { id: 'ok', word: 'OK / Fine', category: 'Responses', sign: '👌', handshape: 'Circle Pinch', description: 'Touch thumb and index fingertips together while other 3 fingers extend.', tip: 'Recognized globally.' },

  // Everyday Words
  { id: 'water', word: 'Water', category: 'Everyday', sign: '💧', handshape: 'Letter "W"', description: 'Make a "W" with index, middle, and ring fingers; tap index finger to your chin twice.', tip: '"W" stands for water.' },
  { id: 'food', word: 'Food / Eat', category: 'Everyday', sign: '🍽️', handshape: 'Squished O', description: 'Bring fingertips together and tap them against your lips twice.', tip: 'Mimics putting food in the mouth.' },
  { id: 'friend', word: 'Friend', category: 'Everyday', sign: '👥', handshape: 'Interlocked Index', description: 'Hook index fingers together in one direction, then reverse and hook the other way.', tip: 'Shows mutual connection.' },
  { id: 'family', word: 'Family', category: 'Everyday', sign: '🏡', handshape: 'Letter "F"', description: 'Make "F" hands touching at thumbs/index, trace an outward circle, and meet at pinkies.', tip: 'Symbolizes an enclosing circle of loved ones.' },
  { id: 'more', word: 'More', category: 'Everyday', sign: '➕', handshape: 'Tapered Hands', description: 'Bring flattened fingertips of both hands together and tap them repeatedly.', tip: 'Essential for requests.' },

  // Alphabet & Gestures
  { id: 'iloveyou', word: 'I Love You', category: 'Alphabet', sign: '🤟', handshape: 'I-L-Y Hand', description: 'Extend thumb, index finger, and pinky simultaneously with middle and ring fingers folded.', tip: 'Combines letters I, L, and Y.' },
  { id: 'letter_a', word: 'Letter "A"', category: 'Alphabet', sign: '🅰️', handshape: 'Fist Thumb-Up', description: 'Fist with thumb resting firmly against side of index finger.', tip: 'Thumb points upward.' },
  { id: 'letter_b', word: 'Letter "B"', category: 'Alphabet', sign: '🅱️', handshape: '4 Fingers Up', description: 'Four fingers extended straight up together, thumb folded across palm.', tip: 'Keep fingers tightly joined.' },
  { id: 'letter_c', word: 'Letter "C"', category: 'Alphabet', sign: '©️', handshape: 'Curved Hand', description: 'Curve fingers and thumb into the shape of the letter "C".', tip: 'Profiles clearly.' },
  { id: 'letter_l', word: 'Letter "L"', category: 'Alphabet', sign: '👉', handshape: 'Right Angle', description: 'Extend thumb and index finger at a 90-degree right angle.', tip: 'Clearly forms the letter "L".' },
  { id: 'letter_v', word: 'Letter "V" / Peace', category: 'Alphabet', sign: '✌️', handshape: 'Two Fingers', description: 'Extend index and middle finger in a "V" shape.', tip: 'Also signifies number 2.' },
  { id: 'letter_y', word: 'Letter "Y" / Call', category: 'Alphabet', sign: '🤙', handshape: 'Hang Loose', description: 'Extend thumb and pinky finger out, folding middle three fingers.', tip: 'Forms the letter "Y".' },
]

export default function SignDictionary({ onSelectSignForPractice }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activeSign, setActiveSign] = useState(DICTIONARY_SIGNS[0])

  const categories = ['All', 'Greetings', 'Responses', 'Everyday', 'Alphabet']

  const filteredSigns = DICTIONARY_SIGNS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch =
      item.word.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.handshape.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="dictionary-container">
      <div className="dictionary-header">
        <div>
          <h3>ASL Sign Dictionary</h3>
          <p>Explore common American Sign Language signs, hand shapes, and visual guides.</p>
        </div>

        {/* Search Input */}
        <div className="dict-search-wrapper">
          <input
            type="text"
            placeholder="Search words, letters or hand shapes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dict-search-input"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="dict-category-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`dict-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Dictionary Content Split */}
      <div className="dict-split-view">
        {/* Sign Cards List */}
        <div className="dict-cards-grid">
          {filteredSigns.map((sign) => (
            <div
              key={sign.id}
              className={`dict-card ${activeSign?.id === sign.id ? 'active' : ''}`}
              onClick={() => setActiveSign(sign)}
            >
              <div className="dict-card-icon">{sign.sign}</div>
              <div className="dict-card-info">
                <h4>{sign.word}</h4>
                <span className="dict-handshape">{sign.handshape}</span>
              </div>
            </div>
          ))}

          {filteredSigns.length === 0 && (
            <div className="dict-empty">
              No signs matched your search. Try "Hello", "Water", or "Letter".
            </div>
          )}
        </div>

        {/* Selected Sign Detail View */}
        {activeSign && (
          <div className="dict-detail-panel">
            <div className="detail-badge">{activeSign.category}</div>
            <div className="detail-hero-icon">{activeSign.sign}</div>
            <h2>{activeSign.word}</h2>
            <div className="detail-handshape-pill">Hand shape: <strong>{activeSign.handshape}</strong></div>

            <div className="detail-instruction-box">
              <h4>How to Make This Sign:</h4>
              <p>{activeSign.description}</p>
            </div>

            <div className="detail-tip-box">
              <span>💡 Pro Tip:</span>
              <p>{activeSign.tip}</p>
            </div>

            {onSelectSignForPractice && (
              <button
                className="dict-practice-btn"
                onClick={() => onSelectSignForPractice(activeSign)}
              >
                📹 Practice this in Camera Studio
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
