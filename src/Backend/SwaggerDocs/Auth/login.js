/**
 * @swagger
 * /isSpAlreadyExist:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Check if Service Provider already exists - Login
 *     description: Validates whether a service provider with the given details already exists in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mobile_number
 *               - email_id
 *               - password
 *               - confirmPassword
 *               - country_code
 *               - display_mobile_number
 *               - Channel
 *             properties:
 *               name:
 *                 type: string
 *                 description: The full name of the user.
 *                 example: "Ayush Chauhan"
 *               mobile_number:
 *                 type: string
 *                 description: The complete mobile number with country code.
 *                 example: "918627019894"
 *               display_mobile_number:
 *                 type: string
 *                 description: The mobile number without country code for display purposes.
 *                 example: "8627019894"
 *               email_id:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *                 example: "ayudfsdfs@gmail.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *                 example: "Test@123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: The confirmation of the user's password.
 *                 example: "Test@123"
 *               country_code:
 *                 type: string
 *                 description: The country code of the user.
 *                 example: "IN +91"
 *               Channel:
 *                 type: string
 *                 description: The channel through which the request is made.
 *                 example: "web"
 *     responses:
 *       200:
 *         description: Request successful, user status returned.
 *       400:
 *         description: Bad request, invalid input parameters.
 *       401:
 *         description: Unauthorized, authentication failed.
 *       409:
 *         description: Conflict, user already exists.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /verifyPhoneOtp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify OTP for Phone Authentication - Login
 *     description: Validates the OTP sent to the user's phone or email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otpfieldvalue
 *               - otpfieldMobilevalue
 *               - otp
 *             properties:
 *               otpfieldvalue:
 *                 type: string
 *                 description: The email or identifier associated with the OTP.
 *                 example: "example@gmail.com"
 *               otpfieldMobilevalue:
 *                 type: string
 *                 description: The mobile number to which the OTP was sent.
 *                 example: "919000000000"
 *               otp:
 *                 type: integer
 *                 description: The OTP entered by the user.
 *                 example: 1234
 *               otp1:
 *                 type: string
 *                 description: Additional OTP field (optional, may be empty).
 *                 example: ""
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       400:
 *         description: Bad request, missing or invalid OTP.
 *       401:
 *         description: Unauthorized, invalid or expired OTP.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /verifyOtp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify OTP For Email - Login
 *     description: Validates the OTP sent to the user's phone or email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otpfieldvalue
 *               - otpfieldMobilevalue
 *               - otp
 *               - otp1
 *             properties:
 *               otpfieldvalue:
 *                 type: string
 *                 description: The email or identifier associated with the OTP.
 *                 example: "user@example.com"
 *               otpfieldMobilevalue:
 *                 type: string
 *                 description: The mobile number to which the OTP was sent.
 *                 example: "911234567890"
 *               otp:
 *                 type: integer
 *                 description: The OTP entered by the user.
 *                 example: 123456
 *               otp1:
 *                 type: integer
 *                 description: An additional OTP field.
 *                 example: 654321
 *     responses:
 *       200:
 *         description: OTP verified successfully.
 *       400:
 *         description: Bad request, missing or invalid OTP.
 *       401:
 *         description: Unauthorized, invalid or expired OTP.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /sendOtp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend OTP - Login
 *     description: Sends an OTP to the user's email or phone number for verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_id
 *               - mobile_number
 *               - name
 *               - otpFor
 *             properties:
 *               email_id:
 *                 type: string
 *                 description: The user's email address to send the OTP.
 *                 example: "user@example.com"
 *               mobile_number:
 *                 type: string
 *                 description: The user's mobile number to send the OTP.
 *                 example: "911234567890"
 *               name:
 *                 type: string
 *                 description: The name of the user.
 *                 example: "John Doe"
 *               otpFor:
 *                 type: string
 *                 description: Specifies whether the OTP is for phone or email verification user "email" or "Phone" or "Both".
 *                 example: "phone or email or both"
 *               Channel:
 *                 type: string
 *                 description: The communication channel used for OTP.
 *                 example: "web or api"
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *       400:
 *         description: Bad request, invalid input.
 *       401:
 *         description: Unauthorized, invalid token.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user - Login
 *     description: Creates a new user account and returns a token upon successful registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email_id
 *               - mobile_number
 *               - registerPhone
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 description: The full name of the user.
 *                 example: "John Doe"
 *               email_id:
 *                 type: string
 *                 description: The user's email address.
 *                 example: "user@example.com"
 *               mobile_number:
 *                 type: string
 *                 description: The user's mobile number.
 *                 example: "911234567890"
 *               display_mobile_number:
 *                 type: string
 *                 description: The displayed version of the mobile number.
 *                 example: "1234567890"
 *               registerPhone:
 *                 type: string
 *                 description: The phone number used for registration.
 *                 example: "911234567890"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *                 example: "Test@123"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Confirm password field.
 *                 example: "Test@123"
 *               country_code:
 *                 type: string
 *                 description: The country code for the user's phone number.
 *                 example: "IN +91"
 *               Channel:
 *                 type: string
 *                 description: The platform from which the registration request is made.
 *                 example: "web"
 *     responses:
 *       200:
 *         description: Registration successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Registered!"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     fieldCount:
 *                       type: integer
 *                       example: 0
 *                     affectedRows:
 *                       type: integer
 *                       example: 1
 *                     insertId:
 *                       type: integer
 *                       example: 0
 *                     serverStatus:
 *                       type: integer
 *                       example: 34
 *                     warningCount:
 *                       type: integer
 *                       example: 0
 *                     message:
 *                       type: string
 *                       example: ""
 *                     protocol41:
 *                       type: boolean
 *                       example: true
 *                     changedRows:
 *                       type: integer
 *                       example: 0
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request, invalid input.
 *       409:
 *         description: User already exists.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User Login - Login
 *     description: Authenticates a user and returns a JWT token upon successful login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_id
 *               - password
 *             properties:
 *               email_id:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *                 example: "Test@123"
 *               agree:
 *                 type: boolean
 *                 description: Whether the user has agreed to terms (optional).
 *                 example: false
 *               flash:
 *                 type: boolean
 *                 description: Flash login session.
 *                 example: true
 *               LoginIP:
 *                 type: string
 *                 description: The IP address of the user logging in.
 *                 example: "127.0.0.1"
 *               Channel:
 *                 type: string
 *                 description: The platform from which the login request is made.
 *                 example: "web"
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Login successful!"
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /forgotPassword:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Forgot Password
 *     description: Sends a reset password link or a new password to the user's registered email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email_id
 *             properties:
 *               email_id:
 *                 type: string
 *                 format: email
 *                 description: The email address associated with the user account.
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Password has been sent"
 *                 id:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       uid:
 *                         type: integer
 *                         example: 495
 *                       password:
 *                         type: string
 *                         description: Hashed password.
 *                         example: "$2b$10$GmWL0BuD9VbndjU56oDdOOQNm01qYfEp.pWsJVtfnLaypbLf8We9S"
 *                       email_id:
 *                         type: string
 *                         example: "user@example.com"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       mobile_number:
 *                         type: string
 *                         example: "918627019494"
 *                       country_code:
 *                         type: string
 *                         example: "IN +91"
 *                       LastLogIn:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-20T10:22:20.000Z"
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       IsActive:
 *                         type: integer
 *                         example: 1
 *                       display_mobile_number:
 *                         type: string
 *                         example: "8627019494"
 *                       registerPhone:
 *                         type: string
 *                         example: "918627019494"
 *                       Channel:
 *                         type: string
 *                         example: "web"
 *       404:
 *         description: Email not found.
 *       500:
 *         description: Internal server error.
 */

