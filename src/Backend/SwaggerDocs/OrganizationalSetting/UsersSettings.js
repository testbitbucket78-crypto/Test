/**
 * @swagger
 * /getActiveUser/{spid}/{IsActive}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get active users by SP ID - User Settings
 *     description: Retrieves a list of users based on their service provider ID (SP_ID) and active status.
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         example: 148
 *         description: The service provider ID associated with the users.
 *       - in: path
 *         name: IsActive
 *         required: true
 *         schema:
 *           type: integer
 *         example: 0
 *         description: Active status of the users (0 for inactive, 1 for active).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the user list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: "Get user list"
 *                 getUser:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       uid:
 *                         type: integer
 *                         example: 669
 *                       name:
 *                         type: string
 *                         example: "Web Mail"
 *                       email_id:
 *                         type: string
 *                         example: "webmail@yopmail.com"
 *                       RoleName:
 *                         type: string
 *                         example: "Admin"
 *                       mobile_number:
 *                         type: string
 *                         example: "914569874521"
 *                       country_code:
 *                         type: string
 *                         example: "IN +91"
 *                       display_mobile_number:
 *                         type: string
 *                         example: "4569874521"
 *                       profile_img:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       LastLogIn:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-16T17:11:28.000Z"
 *                       CreatedDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-30T10:19:16.000Z"
 *       400:
 *         description: Invalid request parameters.
 *       404:
 *         description: No users found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /addUser:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add a new user - User Settings
 *     description: Creates a new user with the provided details and assigns a role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: integer
 *                 example: 148
 *                 description: The service provider ID.
 *               UserType:
 *                 type: string
 *                 example: "635"
 *                 description: The user type.
 *               email_id:
 *                 type: string
 *                 format: email
 *                 example: "ayus@gmail.com"
 *                 description: The email address of the user.
 *               registerPhone:
 *                 type: string
 *                 example: "918987987877"
 *                 description: The full mobile number including country code.
 *               country_code:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["IN +91"]
 *                 description: List of country codes associated with the user.
 *               display_mobile_number:
 *                 type: string
 *                 example: "8987987877"
 *                 description: The user's displayed mobile number.
 *               name:
 *                 type: string
 *                 example: "Testing1232"
 *                 description: The user's full name.
 *               role:
 *                 type: string
 *                 example: "Admin"
 *                 description: The assigned role for the user.
 *               uid:
 *                 type: integer
 *                 example: 0
 *                 description: The user ID (0 for new users).
 *               Channel:
 *                 type: string
 *                 example: "web"
 *                 description: The platform through which the user is being added.
 *     responses:
 *       200:
 *         description: User successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "user details has been sent"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /getUserByuid/{spid}/{uid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get user details by SP_ID and UID - User Settings
 *     description: Fetches user details based on the service provider ID (`spid`) and user ID (`uid`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         example: 148
 *         description: The service provider ID.
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         example: 733
 *         description: The unique user ID.
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
 *                         example: 733
 *                         description: The user's unique ID.
 *                       RoleName:
 *                         type: string
 *                         example: "Admin"
 *                         description: The role assigned to the user.
 *                       team_name:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The team name (if applicable).
 *                       Channel:
 *                         type: string
 *                         example: "web"
 *                         description: The platform through which the user is registered.
 *                       CreatedDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-21T07:05:37.000Z"
 *                         description: User creation timestamp.
 *                       IsActive:
 *                         type: integer
 *                         example: 3
 *                         description: User's active status.
 *                       LastLogIn:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                         description: Last login timestamp.
 *                       LastModifiedDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-21T07:05:37.000Z"
 *                         description: Last modification timestamp.
 *                       email_id:
 *                         type: string
 *                         format: email
 *                         example: "ayuhjhs@gmail.com"
 *                         description: User's email ID.
 *                       mobile_number:
 *                         type: string
 *                         example: "918987987877"
 *                         description: The full mobile number with country code.
 *                       country_code:
 *                         type: string
 *                         example: "IN +91"
 *                         description: The user's country code.
 *       400:
 *         description: Invalid request parameters.
 *       401:
 *         description: Unauthorized access.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /editUser/:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Edit user details - User Settings
 *     description: Updates user details based on provided data.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: integer
 *                 example: 148
 *                 description: Service provider ID.
 *               uid:
 *                 type: integer
 *                 example: 733
 *                 description: Unique user ID.
 *               UserType:
 *                 type: integer
 *                 example: 635
 *                 description: Type of user.
 *               email_id:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *                 description: User's email ID.
 *               registerPhone:
 *                 type: string
 *                 example: "919876543210"
 *                 description: Full mobile number with country code.
 *               country_code:
 *                 type: string
 *                 example: "IN +91"
 *                 description: The country code of the user.
 *               display_mobile_number:
 *                 type: string
 *                 example: "9876543210"
 *                 description: Mobile number displayed to others.
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: User's name.
 *               role:
 *                 type: string
 *                 example: "Admin"
 *                 description: Role assigned to the user.
 *               Channel:
 *                 type: string
 *                 example: "web"
 *                 description: The platform used by the user.
 *     responses:
 *       200:
 *         description: User details updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               msg: "User details updated successfully"
 *               status: 200
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Invalid request data"
 *               status: 400
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Unauthorized"
 *               status: 401
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             example:
 *               msg: "User not found"
 *               status: 404
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal server error"
 *               status: 500
 */

/**
 * @swagger
 * /deleteUser:
 *   post:
 *     tags:
 *       - Settings 
 *     summary: Delete a user - User Settings
 *     description: Deletes a user based on the provided `uid`.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: integer
 *                 example: 733
 *                 description: Unique user ID to delete.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Deleted Successfully"
 *               deleteUser:
 *                 fieldCount: 0
 *                 affectedRows: 1
 *                 insertId: 0
 *                 serverStatus: 2
 *                 warningCount: 0
 *                 changedRows: 1
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Invalid request data"
 *               status: 400
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Unauthorized"
 *               status: 401
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             example:
 *               msg: "User not found"
 *               status: 404
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal server error"
 *               status: 500
 */