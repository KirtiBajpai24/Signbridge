// In-process Unit and Integration Test for Notification Engine
import {
  TAGLINE,
  sendEmail,
  sendSms,
  buildWelcomeEmail,
  buildLoginAlertEmail,
  buildWelcomeSms,
  buildLoginAlertSms,
  buildOtpSms,
  generatePhoneOtp,
  verifyPhoneOtp,
  isDuplicate,
  maskEmail,
  maskPhone
} from './server/notificationService.js'

async function runUnitTests() {
  console.log('🧪 Starting SignBridge Notification In-Process Test Suite...\n')
  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${message}`)
      failed++
    }
  }

  // 1. Tagline verification
  assert(TAGLINE === 'Breaking communication barriers with technology.', 'Tagline is exact match')

  // 2. Email Masking
  assert(maskEmail('varun@example.com') === 'va***@example.com', 'Email masking masks correctly')
  assert(maskPhone('+1 (555) 234-5678') === '+1 ****5678', 'Phone masking masks correctly')

  // 3. Welcome Email Builder
  const user = { name: 'Alex Johnson', email: 'alex@example.com' }
  const welcomeEmail = buildWelcomeEmail(user)
  assert(welcomeEmail.subject.includes('Welcome to SignBridge, Alex Johnson!'), 'Welcome email subject includes user name')
  assert(welcomeEmail.text.includes(TAGLINE), 'Welcome email includes SignBridge tagline')
  assert(welcomeEmail.text.toLowerCase().includes('successful initial login') || welcomeEmail.text.toLowerCase().includes('account is now active'), 'Welcome email includes login/account confirmation')

  // 4. Login Alert Email Builder
  const alertEmail = buildLoginAlertEmail(user, { method: 'Email Authentication', timestamp: new Date() })
  assert(alertEmail.subject.includes('Security Alert: Successful Login'), 'Login alert email subject is distinctive')
  assert(alertEmail.text.includes('Alex Johnson'), 'Login alert includes user name')
  assert(alertEmail.text.includes(TAGLINE), 'Login alert email includes SignBridge tagline')
  assert(alertEmail.text.includes('Email Authentication'), 'Login alert includes login method')

  // 5. Welcome & Login SMS Builders
  const welcomeSms = buildWelcomeSms(user)
  assert(welcomeSms.includes('Welcome to SignBridge, Alex Johnson!'), 'Welcome SMS includes user name')
  assert(welcomeSms.includes(TAGLINE), 'Welcome SMS includes tagline')

  const alertSms = buildLoginAlertSms(user, { method: 'Mobile Phone' })
  assert(alertSms.includes('Alex Johnson') && alertSms.includes('successful login confirmed'), 'Login alert SMS includes name & confirmation')
  assert(alertSms.includes(TAGLINE), 'Login alert SMS includes tagline')

  // 6. OTP SMS Builder & Verification
  const testPhone = '+15550001111'
  const generatedOtp = generatePhoneOtp(testPhone)
  assert(generatedOtp && generatedOtp.length === 6 && /^\d{6}$/.test(generatedOtp), 'Generates 6-digit numeric OTP')
  
  const otpSms = buildOtpSms(generatedOtp)
  assert(otpSms.includes(generatedOtp) && otpSms.includes(TAGLINE), 'OTP SMS includes code and tagline')

  // Verify correct OTP
  const isValid = verifyPhoneOtp(testPhone, generatedOtp)
  assert(isValid === true, 'Valid OTP verifies successfully')

  // Verify consumed/bad OTP
  const isInvalidNow = verifyPhoneOtp(testPhone, generatedOtp)
  assert(isInvalidNow === false, 'Consumed OTP cannot be reused')

  const badPhone = '+15550002222'
  generatePhoneOtp(badPhone)
  const isWrongOtp = verifyPhoneOtp(badPhone, '999999')
  assert(isWrongOtp === false, 'Incorrect OTP is rejected')

  // 7. Duplicate Prevention (Cooldown)
  const testUser = 'user-cooldown-test'
  const firstCheck = isDuplicate(testUser, 'EMAIL', 'LOGIN_ALERT', 60)
  assert(firstCheck === false, 'First notification request is not duplicate')

  const secondCheck = isDuplicate(testUser, 'EMAIL', 'LOGIN_ALERT', 60)
  assert(secondCheck === true, 'Repeated notification within cooldown is marked duplicate')

  // 8. Simulated Email Delivery
  const dummyDb = { notifications: [] }
  const mockReadDb = () => dummyDb
  const mockWriteDb = (data) => { Object.assign(dummyDb, data) }

  const emailRes = await sendEmail({
    to: 'test@example.com',
    subject: welcomeEmail.subject,
    html: welcomeEmail.html,
    text: welcomeEmail.text,
    userId: 'user-unit-1',
    type: 'WELCOME_EMAIL',
    readDb: mockReadDb,
    writeDb: mockWriteDb
  })
  assert(emailRes.success === true && (emailRes.status === 'SIMULATED' || emailRes.status === 'DELIVERED'), 'Email sending succeeds in simulation mode')
  assert(dummyDb.notifications.length === 1, 'Email notification logged in database')
  assert(dummyDb.notifications[0].recipient.includes('***'), 'Email logged with masked address for privacy')

  // 9. Simulated SMS Delivery
  const smsRes = await sendSms({
    to: '+15551234567',
    text: welcomeSms,
    userId: 'user-unit-1',
    type: 'WELCOME_SMS',
    readDb: mockReadDb,
    writeDb: mockWriteDb
  })
  assert(smsRes.success === true && (smsRes.status === 'SIMULATED' || smsRes.status === 'DELIVERED'), 'SMS sending succeeds in simulation mode')
  assert(dummyDb.notifications.length === 2, 'SMS notification logged in database')

  // 10. Provider Failure Handling (Rule 7)
  const failedEmailRes = await sendEmail({
    to: 'test@example.com',
    subject: 'Fail Test',
    html: '<p>Fail</p>',
    userId: 'user-fail-test',
    type: 'TEST_FAIL',
    forceFailure: true,
    readDb: mockReadDb,
    writeDb: mockWriteDb
  })
  assert(failedEmailRes.success === false, 'Provider failure returns success: false')
  assert(failedEmailRes.status === 'FAILED', 'Provider failure records status FAILED')
  assert(dummyDb.notifications.some(n => n.status === 'FAILED'), 'Provider failure logged accurately in audit trail')

  console.log(`\n========================================`)
  console.log(`Unit Test Results: ${passed} Passed, ${failed} Failed`)
  console.log(`========================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runUnitTests()
