/**
 * @swagger
 * /getWhatsAppDetails/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve WhatsApp details for a specific service provider - Account Setting
 *     description: Fetches WhatsApp channel details, including connection status, message limits, and other configurations for the given service provider ID (`spid`).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         description: The service provider ID for which WhatsApp details are retrieved.
 *     responses:
 *       200:
 *         description: Successfully retrieved WhatsApp details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 channelCounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       channel_id:
 *                         type: string
 *                         example: "WA Web"
 *                       count_of_channel_id:
 *                         type: integer
 *                         example: 1
 *                 whatsAppDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 88
 *                       channel_id:
 *                         type: string
 *                         example: "WA Web"
 *                       connected_id:
 *                         type: string
 *                         example: "918627019494"
 *                       channel_status:
 *                         type: integer
 *                         example: 0
 *                       is_deleted:
 *                         type: integer
 *                         example: 0
 *                       online_status:
 *                         type: integer
 *                         example: 0
 *                       WAVersion:
 *                         type: string
 *                         example: "2.23.24.82"
 *                       spid:
 *                         type: integer
 *                         example: 91
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-18T12:52:29.000Z"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: No WhatsApp details found for the given spid
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /addGetAPIKeys:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Generate or retrieve API keys for a service provider - Account Setting
 *     description: This endpoint generates a new API key or retrieves existing ones for the specified service provider.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spId:
 *                 type: integer
 *                 example: 91
 *               ip:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               isSave:
 *                 type: boolean
 *                 example: true
 *               isRegenerate:
 *                 type: boolean
 *                 example: false
 *               tokenName:
 *                 type: string
 *                 example: "Send Message Api"
 *     responses:
 *       200:
 *         description: Successfully generated or retrieved an API key.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 7
 *                 spId:
 *                   type: integer
 *                   example: 91
 *                 apiKey:
 *                   type: string
 *                   example: "key-9viyinfixz-1736491521154"
 *                 isEnabled:
 *                   type: boolean
 *                   example: true
 *                 ips:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["127.0.0.1"]
 *                 tokenName:
 *                   type: string
 *                   example: "Send Message Api"
 *                 webhookURL:
 *                   type: string
 *                   format: uri
 *                   example: "https://webhook.site/b023f35b-378c-409b-9520-db409ff9c6a9"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-10T06:45:21.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-10T07:42:10.000Z"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Internal server error
 */

