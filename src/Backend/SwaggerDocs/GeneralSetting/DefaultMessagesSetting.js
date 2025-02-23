/**
 * @swagger
 * /columns/{spid}:
 *   get:
 *     tags:
 *       - Settings 
 *     summary: Retrieve column metadata for a service provider - Default Settings
 *     description: Fetches column details including display names and actual database field names based on a given service provider ID.
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
 *         description: Successfully retrieved column metadata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       displayName:
 *                         type: string
 *                         example: "Phone_number"
 *                       ActuallName:
 *                         type: string
 *                         example: "Phone_number"
 *       404:
 *         description: No column data found for the given service provider.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /getdefaultmessages/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve default auto-reply messages for a service provider - Default Settings
 *     description: Fetches predefined auto-reply messages and their metadata based on a given service provider ID.
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
 *         description: Successfully retrieved default messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "default action got successfully !"
 *                 defaultaction:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       uid:
 *                         type: integer
 *                         example: 43
 *                       SP_ID:
 *                         type: integer
 *                         example: 148
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       Is_disable:
 *                         type: integer
 *                         example: 1
 *                       Created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-15T10:50:38.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-21T06:41:05.000Z"
 *                       title:
 *                         type: string
 *                         example: "Out of Office"
 *                       description:
 *                         type: string
 *                         example: "When the customer messages out of business working hours, and no keyword is matched, customer will be sent a message as defined here."
 *                       value:
 *                         type: string
 *                         example: "<p>Hi,</p><p>I’m currently out of the office...</p>"
 *                       message_type:
 *                         type: string
 *                         example: "image/jpeg"
 *                       link:
 *                         type: string
 *                         format: url
 *                         example: "https://example.com/image.jpg"
 *                       override:
 *                         type: string
 *                         example: "0"
 *                       pauseAgentActiveTime:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       pauseAutoReplyTime:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *       404:
 *         description: No default messages found for the given service provider.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /addAndUpdateDefaultMsg:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add or update a default message - Default Settings
 *     description: Allows users to add or update a default message for customer interactions.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spid:
 *                 type: integer
 *                 description: Service provider ID.
 *                 example: 148
 *               uid:
 *                 type: integer
 *                 description: User ID who is updating the message.
 *                 example: 47
 *               title:
 *                 type: string
 *                 description: Title of the default message.
 *                 example: "Welcome Greeting"
 *               description:
 *                 type: string
 *                 description: Detailed explanation of the message's purpose.
 *                 example: "A default welcome message will be sent to the customers when they message for the very first time."
 *               value:
 *                 type: string
 *                 description: The actual message content (supports HTML).
 *                 example: "<p>Hi there! 😊</p><p><br></p><p>Welcome! We’re so glad to have you here. Let us know how we can make your experience amazing today!<br></p>"
 *               link:
 *                 type: string
 *                 format: uri
 *                 description: URL of the media file attached to the message.
 *                 example: "https://cip-engage-o.s3.ap-south-1.amazonaws.com/148/defaultmessages/dbbc96b7-4ac5-4d28-a39c-77651c0b4a93/1740079771255-d6d909d8-f61a-44cb-9a33-6a51efc448bb-1719468053029-5cac6b9e846ce.jpeg"
 *               message_type:
 *                 type: string
 *                 description: Type of the attached media file.
 *                 example: "image/jpeg"
 *               autoreply:
 *                 type: integer
 *                 description: Flag indicating if auto-reply is enabled (0 = No, 1 = Yes).
 *                 example: 0
 *               override:
 *                 type: integer
 *                 description: Flag indicating if the message should override existing settings (0 = No, 1 = Yes).
 *                 example: 0
 *               Is_disable:
 *                 type: integer
 *                 description: Flag indicating if the message is disabled (0 = No, 1 = Yes).
 *                 example: 0
 *     responses:
 *       200:
 *         description: Default message added/updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Default message updated successfully!"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /deletedefaultactions/:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Delete default actions - Default Settings
 *     description: Deletes a default action based on the provided service provider ID and user ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spid:
 *                 type: integer
 *                 description: Service provider ID.
 *                 example: 148
 *               uid:
 *                 type: integer
 *                 description: User ID.
 *                 example: 45
 *     responses:
 *       200:
 *         description: Default action deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Default action deleted successfully."
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */