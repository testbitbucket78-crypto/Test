/**
 * @swagger
 * /getautodeletion/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve auto-deletion settings for a service provider - Manage Storage
 *     description: Fetches auto-deletion settings, storage management, and message retention policies for a given service provider ID.
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
 *         description: Auto-deletion settings retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "routing got successfully !"
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 managestroage:
 *                   type: integer
 *                   example: 0
 *                 storageUtilization:
 *                   type: integer
 *                   example: 0
 *                 resultbyspid:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 883
 *                       SP_ID:
 *                         type: integer
 *                         example: 148
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-21T15:44:05.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-24T06:19:13.000Z"
 *                       autodeletion_contacts:
 *                         type: string
 *                         example: "-1"
 *                       autodeletion_media:
 *                         type: string
 *                         example: "-1"
 *                       autodeletion_message:
 *                         type: string
 *                         example: "-1"
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       manually_deletion_days:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       message_type:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       numberof_messages:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       sizeof_messages:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *       404:
 *         description: No auto-deletion settings found for the service provider.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /getmanualDelation/:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Retrieve message size details for manual deletion - Manage Storage
 *     description: Fetches the size of messages and media for a given service provider ID and message type.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SPID:
 *                 type: integer
 *                 description: Service provider ID.
 *                 example: 148
 *               message_type:
 *                 type: string
 *                 description: Type of message (if applicable).
 *                 example: ""
 *     responses:
 *       200:
 *         description: Message size details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "messageSize got successfully !"
 *                 textSize:
 *                   type: string
 *                   nullable: true
 *                   example: ""
 *                 mediaSize:
 *                   type: string
 *                   nullable: true
 *                   example: ""
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Invalid request body.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /manualDelation/:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Manually delete messages - Manage Storage
 *     description: Configures manual deletion settings for messages based on the provided service provider ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SPID:
 *                 type: integer
 *                 description: Service provider ID.
 *                 example: 91
 *               manually_deletion_days:
 *                 type: string
 *                 description: Number of days after which messages will be manually deleted.
 *                 example: "1"
 *               Text:
 *                 type: boolean
 *                 description: Indicates if text messages should be deleted.
 *                 example: true
 *               media:
 *                 type: string
 *                 nullable: true
 *                 description: Indicates if media messages should be deleted. Can be null.
 *                 example: null
 *               message_type:
 *                 type: string
 *                 description: Type of message to delete.
 *                 example: "Text"
 *     responses:
 *       200:
 *         description: Manual deletion settings updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Manual deletion settings updated successfully."
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */