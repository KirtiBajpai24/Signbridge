const SCENARIOS = [
  {
    id: 'healthcare',
    badge: 'Emergency & Clinic',
    title: 'Healthcare & Consultations',
    subtitle: 'Connecting medical staff with deaf patients when every second counts.',
    description: 'Enables patients to sign symptoms, allergies, pain ratings, and consent, while nurses and doctors can speak and have their diagnosis and instructions translated on-screen.',
    samplePhrase: 'I need assistance, please.',
    imageSvg: (
      <svg viewBox="0 0 320 180" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="180" rx="16" fill="#f0fdf4" />
        {/* Hospital Cross Badge */}
        <circle cx="160" cy="50" r="28" fill="#dcfce7" stroke="#86efac" strokeWidth="2" />
        <rect x="154" y="34" width="12" height="32" rx="4" fill="#16a34a" />
        <rect x="144" y="44" width="32" height="12" rx="4" fill="#16a34a" />
        {/* Doctor & Patient Silhouette Elements */}
        <rect x="50" y="100" width="80" height="60" rx="12" fill="#bbf7d0" />
        <circle cx="90" cy="85" r="18" fill="#86efac" />
        <rect x="190" y="100" width="80" height="60" rx="12" fill="#dcfce7" stroke="#86efac" strokeWidth="2" />
        <circle cx="230" cy="85" r="18" fill="#bbf7d0" />
        {/* Connection Wave */}
        <path d="M 120 115 C 145 105, 175 105, 200 115" stroke="#15803d" strokeWidth="3" strokeDasharray="4 4" />
      </svg>
    )
  },
  {
    id: 'classroom',
    badge: 'Inclusive Education',
    title: 'Classrooms & Lectures',
    subtitle: 'Active participation for deaf students in seminars and group study.',
    description: 'Allows teachers to speak naturally while captions appear live, and empowers deaf students to sign questions during seminars with instant audio translation to the entire classroom.',
    samplePhrase: 'Can you please repeat the question?',
    imageSvg: (
      <svg viewBox="0 0 320 180" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="180" rx="16" fill="#eff6ff" />
        {/* Blackboard & Graduation Cap */}
        <rect x="40" y="30" width="240" height="90" rx="12" fill="#1e293b" />
        <line x1="60" y1="55" x2="180" y2="55" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1="60" y1="75" x2="220" y2="75" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
        <line x1="60" y1="95" x2="140" y2="95" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
        {/* Sign Hand overlay */}
        <circle cx="240" cy="130" r="32" fill="#ffffff" stroke="#bfdbfe" strokeWidth="2" />
        <text x="228" y="142" fontSize="26">🤟</text>
      </svg>
    )
  },
  {
    id: 'retail',
    badge: 'Daily Public Life',
    title: 'Cafes, Retail & Transit',
    subtitle: 'Frictionless orders, customer service, and everyday transactions.',
    description: 'Ordering food at busy counters, asking for train platforms, or checking out at supermarkets without needing paper and pen or awkward misunderstandings.',
    samplePhrase: 'I would like to order food and water.',
    imageSvg: (
      <svg viewBox="0 0 320 180" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="180" rx="16" fill="#fffbeb" />
        {/* Cafe Cup and Counter */}
        <rect x="30" y="110" width="260" height="50" rx="8" fill="#fde68a" />
        <circle cx="110" cy="75" r="26" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
        <text x="98" y="85" fontSize="24">☕</text>
        <circle cx="210" cy="75" r="26" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
        <text x="198" y="85" fontSize="24">🛒</text>
        {/* Speech Bubble */}
        <rect x="120" y="25" width="80" height="30" rx="8" fill="#fbbf24" />
        <text x="142" y="45" fontSize="14" fill="#78350f" fontWeight="bold">"OK 👌"</text>
      </svg>
    )
  },
  {
    id: 'workplace',
    badge: 'Remote & Office',
    title: 'Workplace & Standups',
    subtitle: 'Equal representation in daily meetings and team brainstorming.',
    description: 'Integrated two-way bridge that enables deaf employees to contribute ideas, lead presentations, and collaborate smoothly alongside hearing teammates.',
    samplePhrase: 'Yes, that sounds great. Thank you!',
    imageSvg: (
      <svg viewBox="0 0 320 180" width="100%" height="160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="180" rx="16" fill="#faf5ff" />
        {/* Laptop & Collaborative Screen */}
        <rect x="70" y="40" width="180" height="100" rx="12" fill="#ffffff" stroke="#d8b4fe" strokeWidth="2" />
        <circle cx="110" cy="80" r="18" fill="#ede9fe" />
        <text x="100" y="88" fontSize="18">👩‍💻</text>
        <circle cx="210" cy="80" r="18" fill="#ede9fe" />
        <text x="200" y="88" fontSize="18">👨‍💼</text>
        <path d="M 135 80 L 185 80" stroke="#a855f7" strokeWidth="3" strokeDasharray="4 4" />
        <rect x="50" y="140" width="220" height="12" rx="4" fill="#cbd5e1" />
      </svg>
    )
  }
]

export default function RealWorldScenarios({ onSelectPhrase }) {
  return (
    <div className="scenarios-container">
      <div className="section-heading">
        <span>REAL-WORLD SCENARIOS</span>
        <h2>Breaking Communication Barriers Everywhere</h2>
        <p>
          SignBridge is built for the moments that matter most — from critical hospital consultations to daily interactions.
        </p>
      </div>

      <div className="scenarios-grid">
        {SCENARIOS.map((item) => (
          <div key={item.id} className="scenario-card">
            <div className="scenario-image-wrapper">
              {item.imageSvg}
            </div>

            <div className="scenario-body">
              <span className="scenario-badge">{item.badge}</span>
              <h3>{item.title}</h3>
              <p className="scenario-sub">{item.subtitle}</p>
              <p className="scenario-desc">{item.description}</p>

              <div className="scenario-action-box">
                <span className="sample-label">Sample Phrase:</span>
                <span className="sample-text">"{item.samplePhrase}"</span>
                {onSelectPhrase && (
                  <button
                    className="try-phrase-btn"
                    onClick={() => onSelectPhrase(item.samplePhrase)}
                  >
                    Test in Studio ➔
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
