/**
 * @swagger
 * /getNotifications/{sp_id}/{uid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Fetch user notifications - Notification
 *     description: Retrieves a list of notifications for a specific user.
 *     parameters:
 *       - in: path
 *         name: sp_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service provider ID.
 *         example: 91
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID.
 *         example: 495
 *     responses:
 *       200:
 *         description: List of notifications retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       notification_id:
 *                         type: integer
 *                         example: 14859
 *                       subject:
 *                         type: string
 *                         example: "New Chat Assigned to You"
 *                       message:
 *                         type: string
 *                         example: "A new Chat has been Assigned to you"
 *                       sent_on:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       read_on:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       uid:
 *                         type: integer
 *                         example: 495
 *                       sp_id:
 *                         type: integer
 *                         example: 91
 *                       module_name:
 *                         type: string
 *                         example: "teambox"
 *                       sent_to:
 *                         type: string
 *                         example: "495"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-09T15:16:40.000Z"
 *                       isRead:
 *                         type: integer
 *                         example: 1
 *       404:
 *         description: No notifications found for the user.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /generalcontroller/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve general settings for a service provider - GeneralSettings
 *     description: Fetches the default action settings and configurations for a given service provider ID.
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
 *         description: General settings retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "default action got successfully !"
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 defaultaction:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 56
 *                       spid:
 *                         type: integer
 *                         example: 148
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-12-30T06:10:41.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: null
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       defaultAdminName:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       defaultAdminUid:
 *                         type: integer
 *                         example: 676
 *                       isAgentActive:
 *                         type: integer
 *                         example: 0
 *                       isAutoReply:
 *                         type: integer
 *                         example: 0
 *                       isAutoReplyDisable:
 *                         type: integer
 *                         example: 0
 *                       isContactAdd:
 *                         type: integer
 *                         example: 1
 *                       media_type:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       pauseAgentActiveTime:
 *                         type: string
 *                         example: "0"
 *                       pauseAutoReplyTime:
 *                         type: string
 *                         example: "0"
 *                       pauseMin_from_teambox_after_agent_reply:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       pausedTill:
 *                         type: string
 *                         example: ""
 *       404:
 *         description: No general settings found for the service provider.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /defaultaction:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Set default action settings - GeneralSettings
 *     description: Configures default action settings for a service provider.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: integer
 *                 description: Service provider ID.
 *                 example: 148
 *               agentActiveTime:
 *                 type: string
 *                 nullable: true
 *                 description: Time when the agent is active.
 *                 example: "10:00 AM - 06:00 PM"
 *               autoReplyTime:
 *                 type: string
 *                 nullable: true
 *                 description: Time range for auto-reply.
 *                 example: "06:00 PM - 09:00 PM"
 *               defaultAdminUid:
 *                 type: integer
 *                 description: Default admin user ID.
 *                 example: 676
 *               isAgentActive:
 *                 type: integer
 *                 description: Flag to indicate if the agent is active (0 = No, 1 = Yes).
 *                 example: 0
 *               isAutoReply:
 *                 type: integer
 *                 description: Flag to enable auto-reply (0 = No, 1 = Yes).
 *                 example: 0
 *               isAutoReplyDisable:
 *                 type: integer
 *                 description: Flag to disable auto-reply (0 = No, 1 = Yes).
 *                 example: 0
 *               isContactAdd:
 *                 type: integer
 *                 description: Flag to indicate if a contact is added (0 = No, 1 = Yes).
 *                 example: 0
 *               pauseAgentActiveTime:
 *                 type: string
 *                 description: Time period to pause agent activity.
 *                 example: "0"
 *               pauseAutoReplyTime:
 *                 type: string
 *                 description: Time period to pause auto-reply.
 *                 example: "0"
 *               pausedTill:
 *                 type: string
 *                 nullable: true
 *                 description: Time until which the settings are paused.
 *                 example: ""
 *     responses:
 *       200:
 *         description: Default action settings updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Default action settings saved successfully!"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */