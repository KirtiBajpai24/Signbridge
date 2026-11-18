/**
 * Indian Regional Languages Translation & Speech Synthesis Engine
 * Provides:
 * - 10 Indian Regional Languages (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, English)
 * - Sign Language Vocabulary Translations (Native Script + Romanized Phonetics)
 * - Multilingual Speech Synthesis for live vocalization
 */

export const INDIAN_LANGUAGES = [
  { code: 'hi-IN', label: 'हिंदी (Hindi)', native: 'हिंदी', flag: '🇮🇳', voicePrefix: 'hi' },
  { code: 'en-IN', label: 'English (India)', native: 'English', flag: '🇮🇳', voicePrefix: 'en' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)', native: 'தமிழ்', flag: '🇮🇳', voicePrefix: 'ta' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)', native: 'తెలుగు', flag: '🇮🇳', voicePrefix: 'te' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)', native: 'বাংলা', flag: '🇮🇳', voicePrefix: 'bn' },
  { code: 'mr-IN', label: 'मराठी (Marathi)', native: 'मराठी', flag: '🇮🇳', voicePrefix: 'mr' },
  { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)', native: 'ગુજરાતી', flag: '🇮🇳', voicePrefix: 'gu' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', native: 'ಕನ್ನಡ', flag: '🇮🇳', voicePrefix: 'kn' },
  { code: 'ml-IN', label: 'മലയാളം (Malayalam)', native: 'മലയാളം', flag: '🇮🇳', voicePrefix: 'ml' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ (Punjabi)', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', voicePrefix: 'pa' }
]

// Core Vocabulary Matrix for Sign Language concepts across Indian Regional Languages
export const REGIONAL_VOCABULARY = {
  'hello': {
    'hi-IN': { text: 'नमस्ते', phonetic: 'Namaste' },
    'en-IN': { text: 'Hello / Namaste', phonetic: 'Hello' },
    'ta-IN': { text: 'வணக்கம்', phonetic: 'Vanakkam' },
    'te-IN': { text: 'నమస్కారం', phonetic: 'Namaskaram' },
    'bn-IN': { text: 'নমস্কার', phonetic: 'Nomoshkar' },
    'mr-IN': { text: 'नमस्कार', phonetic: 'Namaskar' },
    'gu-IN': { text: 'નમસ્તે', phonetic: 'Namaste' },
    'kn-IN': { text: 'ನಮಸ್ಕಾರ', phonetic: 'Namaskara' },
    'ml-IN': { text: 'നമസ്കാരം', phonetic: 'Namaskaram' },
    'pa-IN': { text: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ', phonetic: 'Sat Sri Akal' }
  },
  'namaste': {
    'hi-IN': { text: 'नमस्ते', phonetic: 'Namaste' },
    'en-IN': { text: 'Namaste (Greetings)', phonetic: 'Namaste' },
    'ta-IN': { text: 'வணக்கம்', phonetic: 'Vanakkam' },
    'te-IN': { text: 'నమస్కారం', phonetic: 'Namaskaram' },
    'bn-IN': { text: 'নমস্কার', phonetic: 'Nomoshkar' },
    'mr-IN': { text: 'नमस्कार', phonetic: 'Namaskar' },
    'gu-IN': { text: 'નમસ્તે', phonetic: 'Namaste' },
    'kn-IN': { text: 'ನಮಸ್ಕಾರ', phonetic: 'Namaskara' },
    'ml-IN': { text: 'നമസ്കാരം', phonetic: 'Namaskaram' },
    'pa-IN': { text: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ', phonetic: 'Sat Sri Akal' }
  },
  'thank you': {
    'hi-IN': { text: 'धन्यवाद', phonetic: 'Dhanyavaad' },
    'en-IN': { text: 'Thank you very much', phonetic: 'Thank You' },
    'ta-IN': { text: 'நன்றி', phonetic: 'Nandri' },
    'te-IN': { text: 'ధన్యవాదాలు', phonetic: 'Dhanyavadalu' },
    'bn-IN': { text: 'ধন্যবাদ', phonetic: 'Dhonnobad' },
    'mr-IN': { text: 'धन्यवाद', phonetic: 'Dhanyavaad' },
    'gu-IN': { text: 'આભાર', phonetic: 'Aabhar' },
    'kn-IN': { text: 'ಧನ್ಯವಾದಗಳು', phonetic: 'Dhanyavadagalu' },
    'ml-IN': { text: 'നന്ദി', phonetic: 'Nandi' },
    'pa-IN': { text: 'ਧੰਨਵਾਦ', phonetic: 'Dhanvaad' }
  },
  'help': {
    'hi-IN': { text: 'मुझे मदद चाहिए', phonetic: 'Mujhe madad chahiye' },
    'en-IN': { text: 'I need help (Emergency)', phonetic: 'Help' },
    'ta-IN': { text: 'எனக்கு உதவி வேண்டும்', phonetic: 'Enakku uthavi vendum' },
    'te-IN': { text: 'నాకు సహాయం కావాలి', phonetic: 'Naaku sahaayam kaavaali' },
    'bn-IN': { text: 'আমার সাহায্য দরকার', phonetic: 'Aamar sahajjo dorkar' },
    'mr-IN': { text: 'मला मदत हवी आहे', phonetic: 'Mala madat havi aahe' },
    'gu-IN': { text: 'મને મદદ જોઈએ છે', phonetic: 'Mane madad joie chhe' },
    'kn-IN': { text: 'ನನಗೆ ಸಹಾಯ ಬೇಕು', phonetic: 'Nanage sahaaya beku' },
    'ml-IN': { text: 'എനിക്ക് സഹായം വേണം', phonetic: 'Enikku sahaayam venam' },
    'pa-IN': { text: 'ਮੈਨੂੰ ਮਦਦ ਚਾਹੀਦੀ ਹੈ', phonetic: 'Mainu madad chahidi hai' }
  },
  'water': {
    'hi-IN': { text: 'पानी चाहिए', phonetic: 'Paani chahiye' },
    'en-IN': { text: 'I need water', phonetic: 'Water' },
    'ta-IN': { text: 'தண்ணீர் வேண்டும்', phonetic: 'Thanneer vendum' },
    'te-IN': { text: 'మంచినీళ్లు కావాలి', phonetic: 'Manchineellu kaavaali' },
    'bn-IN': { text: 'জল চাই', phonetic: 'Jol chai' },
    'mr-IN': { text: 'पाणी हवे आहे', phonetic: 'Paani have aahe' },
    'gu-IN': { text: 'પાણી જોઈએ છે', phonetic: 'Paani joie chhe' },
    'kn-IN': { text: 'ನೀರು ಬೇಕು', phonetic: 'Neeru beku' },
    'ml-IN': { text: 'വെള്ളം വേണം', phonetic: 'Vellam venam' },
    'pa-IN': { text: 'ਪਾਣੀ ਚਾਹੀਦਾ ਹੈ', phonetic: 'Paani chahida hai' }
  },
  'food': {
    'hi-IN': { text: 'खाना चाहिए', phonetic: 'Khaana chahiye' },
    'en-IN': { text: 'I need food / hungry', phonetic: 'Food' },
    'ta-IN': { text: 'உணவு வேண்டும்', phonetic: 'Unavu vendum' },
    'te-IN': { text: 'ఆహారం కావాలి', phonetic: 'Aahaaram kaavaali' },
    'bn-IN': { text: 'খাবার চাই', phonetic: 'Khabar chai' },
    'mr-IN': { text: 'जेवण हवे आहे', phonetic: 'Jevan have aahe' },
    'gu-IN': { text: 'જમવાનું જોઈએ છે', phonetic: 'Jamvaanu joie chhe' },
    'kn-IN': { text: 'ಊಟ ಬೇಕು', phonetic: 'Oota beku' },
    'ml-IN': { text: 'ഭക്ഷണം വേണം', phonetic: 'Bhakshanam venam' },
    'pa-IN': { text: 'ਰੋਟੀ ਚਾਹੀਦੀ ਹੈ', phonetic: 'Roti chahidi hai' }
  },
  'tea': {
    'hi-IN': { text: 'चाय', phonetic: 'Chai' },
    'en-IN': { text: 'Tea / Chai', phonetic: 'Chai' },
    'ta-IN': { text: 'தேநீர்', phonetic: 'Theaneer' },
    'te-IN': { text: 'టీ / చాయ్', phonetic: 'Tea / Chaay' },
    'bn-IN': { text: 'চা', phonetic: 'Cha' },
    'mr-IN': { text: 'चहा', phonetic: 'Chaha' },
    'gu-IN': { text: 'ચા', phonetic: 'Chaa' },
    'kn-IN': { text: 'ಚಹಾ', phonetic: 'Chaha' },
    'ml-IN': { text: 'ചായ', phonetic: 'Chaaya' },
    'pa-IN': { text: 'ਚਾਹ', phonetic: 'Chaah' }
  },
  'yes': {
    'hi-IN': { text: 'हाँ', phonetic: 'Haan' },
    'en-IN': { text: 'Yes', phonetic: 'Yes' },
    'ta-IN': { text: 'ஆம்', phonetic: 'Aam' },
    'te-IN': { text: 'అవును', phonetic: 'Avunu' },
    'bn-IN': { text: 'হ্যাঁ', phonetic: 'Hae' },
    'mr-IN': { text: 'होय', phonetic: 'Hoy' },
    'gu-IN': { text: 'હા', phonetic: 'Haa' },
    'kn-IN': { text: 'ಹೌದು', phonetic: 'Haudu' },
    'ml-IN': { text: 'അതെ', phonetic: 'Athe' },
    'pa-IN': { text: 'ਹਾਂ', phonetic: 'Haan' }
  },
  'no': {
    'hi-IN': { text: 'नहीं', phonetic: 'Nahin' },
    'en-IN': { text: 'No', phonetic: 'No' },
    'ta-IN': { text: 'இல்லை', phonetic: 'Illai' },
    'te-IN': { text: 'కాదు / లేదు', phonetic: 'Kaadu / Ledu' },
    'bn-IN': { text: 'না', phonetic: 'Na' },
    'mr-IN': { text: 'नाही', phonetic: 'Naahi' },
    'gu-IN': { text: 'ના', phonetic: 'Naa' },
    'kn-IN': { text: 'ಇಲ್ಲ', phonetic: 'Illa' },
    'ml-IN': { text: 'ഇല്ല', phonetic: 'Illa' },
    'pa-IN': { text: 'ਨਹੀਂ', phonetic: 'Nahin' }
  },
  'doctor': {
    'hi-IN': { text: 'डॉक्टर बुलाओ', phonetic: 'Doctor bulao' },
    'en-IN': { text: 'Call a Doctor', phonetic: 'Doctor' },
    'ta-IN': { text: 'மருத்துவரை அழையுங்கள்', phonetic: 'Maruthuvarai azhaiyungal' },
    'te-IN': { text: 'డాక్టర్‌ని పిలవండి', phonetic: 'Doctor-ni pilavandi' },
    'bn-IN': { text: 'ডাক্তার ডাকুন', phonetic: 'Daktar dakun' },
    'mr-IN': { text: 'डॉक्टरांना बोलवा', phonetic: 'Doctoranna bolva' },
    'gu-IN': { text: 'ડૉક્ટરને બોલાવો', phonetic: 'Doctor-ne bolaavo' },
    'kn-IN': { text: 'ವೈದ್ಯರನ್ನು ಕರೆಯಿರಿ', phonetic: 'Vaidyaranu kareyiri' },
    'ml-IN': { text: 'ഡോക്ടറെ വിളിക്കൂ', phonetic: 'Doctare vilikku' },
    'pa-IN': { text: 'ਡਾਕਟਰ ਨੂੰ ਬੁਲਾਓ', phonetic: 'Doctor nu bulao' }
  },
  'how are you': {
    'hi-IN': { text: 'आप कैसे हैं?', phonetic: 'Aap kaise hain?' },
    'en-IN': { text: 'How are you?', phonetic: 'How are you?' },
    'ta-IN': { text: 'எப்படி இருக்கிறீர்கள்?', phonetic: 'Eppadi irukkireergal?' },
    'te-IN': { text: 'మీరు ఎలా ఉన్నారు?', phonetic: 'Meeru ela unnaaru?' },
    'bn-IN': { text: 'আপনি কেমন আছেন?', phonetic: 'Aapni kemon aachen?' },
    'mr-IN': { text: 'तुम्ही कसे आहात?', phonetic: 'Tumhi kase aahaat?' },
    'gu-IN': { text: 'તમે કેમ છો?', phonetic: 'Tame kem chho?' },
    'kn-IN': { text: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?', phonetic: 'Neevu hegiddiri?' },
    'ml-IN': { text: 'സുഖമാണോ?', phonetic: 'Sukhamaano?' },
    'pa-IN': { text: 'ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?', phonetic: 'Tusi kivein ho?' }
  },
  'i love you': {
    'hi-IN': { text: 'मैं आपसे प्यार करता हूँ', phonetic: 'Main aapse pyaar karta hoon' },
    'en-IN': { text: 'I love you', phonetic: 'I love you' },
    'ta-IN': { text: 'நான் உன்னை நேசிக்கிறேன்', phonetic: 'Naan unnai nesikkiren' },
    'te-IN': { text: 'నేను నిన్ను ప్రేమిస్తున్నాను', phonetic: 'Nenu ninnu premistunnaanu' },
    'bn-IN': { text: 'আমি তোমাকে ভালোবাসি', phonetic: 'Aami tomake bhalobashi' },
    'mr-IN': { text: 'माझे तुझ्यावर प्रेम आहे', phonetic: 'Maajhe tujhyavar prem aahe' },
    'gu-IN': { text: 'હું તમને પ્રેમ કરું છું', phonetic: 'Hu tamne prem karu chhu' },
    'kn-IN': { text: 'ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ', phonetic: 'Naanu ninnannu preethisuththene' },
    'ml-IN': { text: 'ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു', phonetic: 'Njaan ninne snehikkunnu' },
    'pa-IN': { text: 'ਮੈਂ ਤੈਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ', phonetic: 'Main tainu pyaar karda haan' }
  },
  'good morning': {
    'hi-IN': { text: 'सुप्रभात', phonetic: 'Suprabhat' },
    'en-IN': { text: 'Good morning', phonetic: 'Good morning' },
    'ta-IN': { text: 'காலை வணக்கம்', phonetic: 'Kaalai vanakkam' },
    'te-IN': { text: 'శుభోదయం', phonetic: 'Shubhodayam' },
    'bn-IN': { text: 'সুপ্রভাত', phonetic: 'Suprobhat' },
    'mr-IN': { text: 'शुभ सकाळ', phonetic: 'Shubh sakaal' },
    'gu-IN': { text: 'સુપ્રભાત', phonetic: 'Suprabhat' },
    'kn-IN': { text: 'ಶುಭೋದಯ', phonetic: 'Shubhdaya' },
    'ml-IN': { text: 'സുപ്രഭാതം', phonetic: 'Suprabhatham' },
    'pa-IN': { text: 'ਸ਼ੁਭ ਸਵੇਰ', phonetic: 'Shubh saver' }
  },
  'india': {
    'hi-IN': { text: 'भारत', phonetic: 'Bharat' },
    'en-IN': { text: 'India / Bharat', phonetic: 'Bharat' },
    'ta-IN': { text: 'இந்தியா / பாரதம்', phonetic: 'India / Bharatham' },
    'te-IN': { text: 'భారతదేశం', phonetic: 'Bharatadesham' },
    'bn-IN': { text: 'ভারত', phonetic: 'Bharat' },
    'mr-IN': { text: 'भारत', phonetic: 'Bharat' },
    'gu-IN': { text: 'ભારત', phonetic: 'Bharat' },
    'kn-IN': { text: 'ಭಾರತ', phonetic: 'Bharatha' },
    'ml-IN': { text: 'ഭാരതം', phonetic: 'Bharatham' },
    'pa-IN': { text: 'ਭਾਰਤ', phonetic: 'Bharat' }
  },
  'family': {
    'hi-IN': { text: 'परिवार', phonetic: 'Parivaar' },
    'en-IN': { text: 'Family', phonetic: 'Family' },
    'ta-IN': { text: 'குடும்பம்', phonetic: 'Kudumbam' },
    'te-IN': { text: 'కుటుంబం', phonetic: 'Kutumbam' },
    'bn-IN': { text: 'পরিবার', phonetic: 'Poribar' },
    'mr-IN': { text: 'कुटुंब', phonetic: 'Kutumb' },
    'gu-IN': { text: 'પરિવાર', phonetic: 'Parivar' },
    'kn-IN': { text: 'ಕುಟುಂಬ', phonetic: 'Kutumba' },
    'ml-IN': { text: 'കുടുംബം', phonetic: 'Kudumbam' },
    'pa-IN': { text: 'ਪਰਿਵਾਰ', phonetic: 'Parivaar' }
  },
  'friend': {
    'hi-IN': { text: 'दोस्त / मित्र', phonetic: 'Dost / Mitra' },
    'en-IN': { text: 'Friend', phonetic: 'Friend' },
    'ta-IN': { text: 'நண்பர்', phonetic: 'Nanbar' },
    'te-IN': { text: 'స్నేహితుడు', phonetic: 'Snehithudu' },
    'bn-IN': { text: 'বন্ধু', phonetic: 'Bondhu' },
    'mr-IN': { text: 'मित्र', phonetic: 'Mitra' },
    'gu-IN': { text: 'મિત્ર / દોસ્ત', phonetic: 'Mitra' },
    'kn-IN': { text: 'ಸ್ನೇಹಿತ', phonetic: 'Snehitha' },
    'ml-IN': { text: 'സുഹൃത്ത്', phonetic: 'Suhruth' },
    'pa-IN': { text: 'ਦੋਸਤ / ਮਿੱਤਰ', phonetic: 'Dost' }
  }
}

/**
 * Translate an English sign phrase to target Indian regional language
 */
export function translateToRegional(englishText, targetLangCode = 'hi-IN') {
  if (!englishText || typeof englishText !== 'string') {
    return { text: '', phonetic: '', langCode: targetLangCode }
  }

  const clean = englishText.toLowerCase().trim()

  // 1. Direct dictionary match
  if (REGIONAL_VOCABULARY[clean] && REGIONAL_VOCABULARY[clean][targetLangCode]) {
    return {
      text: REGIONAL_VOCABULARY[clean][targetLangCode].text,
      phonetic: REGIONAL_VOCABULARY[clean][targetLangCode].phonetic,
      langCode: targetLangCode
    }
  }

  // 2. Partial / Substring matching for phrases (e.g., "Help_Sign" -> "help")
  for (const [key, mapping] of Object.entries(REGIONAL_VOCABULARY)) {
    if (clean.includes(key) && mapping[targetLangCode]) {
      return {
        text: mapping[targetLangCode].text,
        phonetic: mapping[targetLangCode].phonetic,
        langCode: targetLangCode
      }
    }
  }

  // 3. Fallback: Return original text with language tag
  return {
    text: englishText,
    phonetic: englishText,
    langCode: targetLangCode
  }
}

/**
 * Multilingual Speech Synthesis for Indian Regional Languages
 */
export function speakInRegionalLanguage(text, targetLangCode = 'hi-IN', rate = 1.0) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false
  }

  try {
    window.speechSynthesis.cancel()

    const translation = translateToRegional(text, targetLangCode)
    const textToSpeak = translation.text || text

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.rate = rate || 1.0
    utterance.pitch = 1.0
    utterance.lang = targetLangCode

    // Find best voice for this regional language
    const voices = window.speechSynthesis.getVoices()
    if (voices && voices.length > 0) {
      // Find voice matching exact lang code (e.g. hi-IN or ta-IN)
      const exactVoice = voices.find((v) => v.lang === targetLangCode || v.lang.replace('_', '-') === targetLangCode)
      // Or matching prefix (e.g. hi or ta)
      const prefix = targetLangCode.split('-')[0]
      const prefixVoice = voices.find((v) => v.lang.startsWith(prefix))

      if (exactVoice) {
        utterance.voice = exactVoice
      } else if (prefixVoice) {
        utterance.voice = prefixVoice
      }
    }

    window.speechSynthesis.speak(utterance)
    return true
  } catch (err) {
    console.warn('[Regional Speech Error]:', err)
    return false
  }
}
