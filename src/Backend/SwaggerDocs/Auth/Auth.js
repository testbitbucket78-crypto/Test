/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Create a new user - userController.insertUser
 *     description: Adds a new user to the database with the provided details.
 *     security:
 *       - bearerAuth: []  # Requires Bearer Token Authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - email_id
 *               - name
 *             properties:
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: "StrongPassword123!"
 *               email_id:
 *                 type: string
 *                 description: The user's email address.
 *                 example: "mailto:user@example.com"
 *               address:
 *                 type: string
 *                 description: The user's address.
 *                 example: "123 Main Street"
 *               name:
 *                 type: string
 *                 description: The user's name.
 *                 example: "John Doe"
 *               mobile_number:
 *                 type: string
 *                 description: The user's mobile number.
 *                 example: "+1234567890"
 *               country:
 *                 type: string
 *                 description: The user's country.
 *                 example: "USA"
 *               timezone:
 *                 type: string
 *                 description: The user's timezone.
 *                 example: "UTC-5"
 *               CreatedDate:
 *                 type: string
 *                 format: date-time
 *                 description: The creation date of the user.
 *                 example: "2024-11-22T12:00:00Z"
 *               LastModifiedDate:
 *                 type: string
 *                 format: date-time
 *                 description: The last modification date of the user.
 *                 example: "2024-11-22T12:00:00Z"
 *               PasswordHint:
 *                 type: string
 *                 description: A hint for the user's password.
 *                 example: "My first pet's name"
 *               securityquestion:
 *                 type: string
 *                 description: A security question for account recovery.
 *                 example: "What is your mother's maiden name?"
 *               Securityanswer:
 *                 type: string
 *                 description: The answer to the security question.
 *                 example: "Smith"
 *               ParentId:
 *                 type: integer
 *                 description: ID of the parent account, if applicable.
 *                 example: 1
 *               UserType:
 *                 type: string
 *                 description: The type of user.
 *                 example: "Admin"
 *               IsDeleted:
 *                 type: boolean
 *                 description: Whether the user account is deleted.
 *                 example: false
 *               IsActive:
 *                 type: boolean
 *                 description: Whether the user account is active.
 *                 example: true
 *     responses:
 *       201:
 *         description: User successfully created.
 *       400:
 *         description: Bad request, invalid input.
 *       401:
 *         description: Unauthorized, invalid token.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /getUsers/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve user details by SP ID
 *     description: Fetches user details for a given service provider ID (SP ID).
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service provider ID.
 *         example: 148
 *     responses:
 *       200:
 *         description: User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Get user"
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 getUser:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       uid:
 *                         type: integer
 *                         example: 669
 *                       RoleName:
 *                         type: string
 *                         example: "Admin"
 *                       SP_ID:
 *                         type: integer
 *                         example: 148
 *                       name:
 *                         type: string
 *                         example: "Web Mail"
 *                       email_id:
 *                         type: string
 *                         format: email
 *                         example: "webmail@yopmail.com"
 *                       mobile_number:
 *                         type: string
 *                         example: "914569874521"
 *                       country_code:
 *                         type: string
 *                         example: "IN +91"
 *                       display_mobile_number:
 *                         type: string
 *                         example: "4569874521"
 *                       CreatedDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-30T10:19:16.000Z"
 *                       LastLogIn:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-16T17:11:28.000Z"
 *                       IsActive:
 *                         type: integer
 *                         example: 1
 *                       LoginIP:
 *                         type: string
 *                         example: "127.0.0.1"
 *                       profile_img:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       password:
 *                         type: string
 *                         example: "$2b$10$GmWL0BuD9VbndjU56oDdOOQNm01qYfEp.pWsJVtfnLaypbLf8We9S"
 *       404:
 *         description: No user found for the provided service provider ID.
 *       500:
 *         description: Internal server error.
 */

