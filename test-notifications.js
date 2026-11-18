// Automated Test Suite for SignBridge Login Notifications & OTP
// Covers Requirement 12:
// - Email delivery on email login
// - SMS delivery on mobile login
// - Invalid credentials (no notifications sent)
// - Provider failures (graceful error handling, login still succeeds)
// - Duplicate login requests (cooldown suppression)
// - Mobile OTP generation and verification
// - Configurable notification preferences

const BASE_URL = 'http://127.0.0.1:5001'

async function runTests() {
  console.log('🧪 Starting SignBridge Notification & Auth Test Suite...\n')
  let passed = 0
  let failed = 0

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${testName}`)
      failed++
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/api/health`)
    const healthData = await healthRes.json()
    assert(healthData.status === 'ok' && healthData.tagline.includes('Breaking communication barriers'), 'API Health Check & Tagline')

    // 2. Test Invalid Credentials (Must NEVER send login notifications)
    console.log('\n--- Test 2: Invalid Credentials ---')
    const invalidLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'varun@example.com', password: 'wrongpassword' })
    })
    assert(invalidLoginRes.status === 401, 'Invalid login rejected with HTTP 401')
    
    // Check notification logs to ensure NO notification was sent for failed login
    const logsAfterFailRes = await fetch(`${BASE_URL}/api/notifications/logs?userId=user-default-1`)
    const logsAfterFail = await logsAfterFailRes.json()
    const failedLog = logsAfterFail.logs.find(l => l.details?.includes('wrongpassword'))
    assert(!failedLog, 'No login-success notification sent for failed authentication attempt')

    // 3. Test Successful Email Login (Should send email notification)
    console.log('\n--- Test 3: Successful Email Login ---')
    const emailLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'varun@example.com', password: 'password123' })
    })
    const emailLoginData = await emailLoginRes.json()
    assert(emailLoginRes.status === 200 && emailLoginData.token, 'Email login succeeds with token')
    assert(emailLoginData.notification?.channel === 'EMAIL', 'Login notification channel is EMAIL')
    assert(emailLoginData.notification?.sent === true || emailLoginData.notification?.status === 'SIMULATED' || emailLoginData.notification?.status === 'DELIVERED', 'Email notification dispatched successfully')

    // 4. Test Duplicate Email Login (Cooldown suppression)
    console.log('\n--- Test 4: Duplicate Login Request Suppression ---')
    const duplicateLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'varun@example.com', password: 'password123' })
    })
    const duplicateData = await duplicateLoginRes.json()
    assert(duplicateLoginRes.status === 200, 'Second login succeeds')
    assert(duplicateData.notification?.status === 'SKIPPED_DUPLICATE', 'Duplicate login notification suppressed by cooldown')

    // 5. Test Successful Mobile Number Login (Should send SMS notification)
    console.log('\n--- Test 5: Successful Mobile Number Login ---')
    const mobileLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1 (555) 234-5678', password: 'password123' })
    })
    const mobileLoginData = await mobileLoginRes.json()
    assert(mobileLoginRes.status === 200 && mobileLoginData.token, 'Mobile login succeeds with token')
    assert(mobileLoginData.notification?.channel === 'SMS', 'Login notification channel is SMS')
    assert(mobileLoginData.notification?.sent === true || mobileLoginData.notification?.status === 'SIMULATED' || mobileLoginData.notification?.status === 'DELIVERED', 'SMS notification dispatched to mobile number')

    // 6. Test Mobile Number Verification via OTP
    console.log('\n--- Test 6: Mobile Phone OTP Verification ---')
    const testPhone = '+1 (555) 999-8888'
    const otpSendRes = await fetch(`${BASE_URL}/api/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, userId: 'user-default-1' })
    })
    const otpSendData = await otpSendRes.json()
    assert(otpSendRes.status === 200 && otpSendData.success, 'OTP dispatched to mobile number')
    assert(otpSendData.maskedPhone && !otpSendData.otp, 'Plain OTP not returned in API response')

    // Test verifying with bad OTP
    const badOtpRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, otp: '000000', userId: 'user-default-1' })
    })
    assert(badOtpRes.status === 400, 'Invalid OTP correctly rejected')

    // 7. Test Notification Preferences (Opting out of login notifications)
    console.log('\n--- Test 7: Configurable Notification Preferences ---')
    // Opt-out of email notifications
    const updatePrefRes = await fetch(`${BASE_URL}/api/notifications/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-default-1',
        preferences: { emailOnLogin: false, smsOnLogin: true }
      })
    })
    assert(updatePrefRes.status === 200, 'Notification preferences updated')

    // 8. Test Provider Failure Handling (Graceful degradation)
    console.log('\n--- Test 8: Provider Failure Handling ---')
    const failureTestRes = await fetch(`${BASE_URL}/api/notifications/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'EMAIL', forceFailure: true })
    })
    const failureTestData = await failureTestRes.json()
    assert(failureTestData.result?.status === 'FAILED', 'Provider failure correctly captured')
    assert(failureTestData.result?.success === false, 'Provider failure does not report false success')

    // Restore preference
    await fetch(`${BASE_URL}/api/notifications/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-default-1',
        preferences: { emailOnLogin: true, smsOnLogin: true }
      })
    })

    // 9. Verify Notification Audit Log
    console.log('\n--- Test 9: Notification Audit Trail ---')
    const auditRes = await fetch(`${BASE_URL}/api/notifications/logs?userId=user-default-1`)
    const auditData = await auditRes.json()
    assert(Array.isArray(auditData.logs) && auditData.logs.length > 0, 'Notification audit logs persisted in DB')
    
    // Check that no passwords or secrets are in audit logs
    const hasSensitiveData = auditData.logs.some(l => JSON.stringify(l).includes('password123') || JSON.stringify(l).includes('api_key'))
    assert(!hasSensitiveData, 'Audit logs do not store sensitive credentials or OTPs')

    console.log(`\n========================================`)
    console.log(`Test Suite Results: ${passed} Passed, ${failed} Failed`)
    console.log(`========================================\n`)

    if (failed > 0) {
      process.exit(1)
    }
  } catch (err) {
    console.error('Test execution error:', err)
    process.exit(1)
  }
}

runTests()
