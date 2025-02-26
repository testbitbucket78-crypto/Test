/**
 * @swagger
 * /Subscribers:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get subscriber opt-in status count - Dashboard
 *     description: Retrieves the count of subscribers based on their opt-in status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sPid
 *         in: query
 *         required: true
 *         description: Service Provider ID
 *         schema:
 *           type: integer
 *           example: 91
 *     responses:
 *       200:
 *         description: Successfully retrieved subscriber counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   OptInStatus:
 *                     type: string
 *                     enum: ["Yes", "No"]
 *                     example: "Yes"
 *                   count:
 *                     type: integer
 *                     example: 58
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /recentConversation/{spid}:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get recent conversations - Dashboard
 *     description: Retrieves the list of recent conversations associated with a given Service Provider ID (spid).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: spid
 *         in: path
 *         required: true
 *         description: Service Provider ID
 *         schema:
 *           type: integer
 *           example: 91
 *     responses:
 *       200:
 *         description: Successfully retrieved recent conversations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   InteractionId:
 *                     type: integer
 *                     example: 4422
 *                   Name:
 *                     type: string
 *                     example: "Anshul"
 *                   Phone_Number:
 *                     type: string
 *                     example: "918894436686"
 *                   message_text:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *                   interaction_date:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     example: null
 *                   is_pinned:
 *                     type: integer
 *                     example: 1
 *                   isread:
 *                     type: boolean
 *                     nullable: true
 *                     example: null
 *                   media_type:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *                   message_direction:
 *                     type: string
 *                     nullable: true
 *                     example: null
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /Agents/{sPid}:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get agent status counts - Dashboard
 *     description: Retrieves the count of active and inactive agents for a given Service Provider ID (sPid).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sPid
 *         in: path
 *         required: true
 *         description: Service Provider ID
 *         schema:
 *           type: integer
 *           example: 91
 *     responses:
 *       200:
 *         description: Successfully retrieved agent status counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   IsActive:
 *                     type: string
 *                     example: "1"
 *                     description: "Agent status (1 = Active, 0 = Inactive, 'Total Agents' = Total count)"
 *                   count:
 *                     type: integer
 *                     example: 3
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /Campaigns/{sPid}:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get campaign status counts - Dashboard
 *     description: Retrieves the count of campaigns for a given Service Provider ID (sPid) based on their status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sPid
 *         in: path
 *         required: true
 *         description: Service Provider ID
 *         schema:
 *           type: integer
 *           example: 91
 *     responses:
 *       200:
 *         description: Successfully retrieved campaign status counts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   STATUS:
 *                     type: integer
 *                     example: 3
 *                     description: "Campaign status identifier"
 *                   COUNT:
 *                     type: integer
 *                     example: 145
 *                     description: "Number of campaigns with this status"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /Interactions/{sPid}:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get interaction counts by status - Dashboard
 *     description: Retrieves the count of interactions for a given Service Provider ID (sPid) based on their status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sPid
 *         in: path
 *         required: true
 *         description: Service Provider ID
 *         schema:
 *           type: integer
 *           example: 91
 *     responses:
 *       200:
 *         description: Successfully retrieved interaction counts by status.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   interaction_status:
 *                     type: string
 *                     example: "Open"
 *                     description: "Status of the interaction (e.g., Open, Resolved)"
 *                   count:
 *                     type: integer
 *                     example: 79
 *                     description: "Number of interactions with this status"
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: No data found
 *       500:
 *         description: Internal server error
 */


