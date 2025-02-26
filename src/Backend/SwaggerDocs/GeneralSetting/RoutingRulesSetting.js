
/**
 * @swagger
 * /getroutingrules/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve routing rules for a service provider - Routing Rules
 *     description: Fetches routing rules and auto-addition settings for a given service provider ID.
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
 *         description: Routing rules retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "auto_addition got successfully !"
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 autoaddition:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 18
 *                       SP_ID:
 *                         type: integer
 *                         example: 148
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-15T10:52:49.000Z"
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-24T07:04:14.000Z"
 *                       contactowner:
 *                         type: integer
 *                         example: 1
 *                       assignagent:
 *                         type: integer
 *                         example: 1
 *                       broadcast:
 *                         type: integer
 *                         example: 1
 *                       roundrobin:
 *                         type: integer
 *                         example: 0
 *                       conversationallowed:
 *                         type: string
 *                         example: ""
 *                       manualassign:
 *                         type: integer
 *                         example: 0
 *                       assignuser:
 *                         type: string
 *                         example: ""
 *                       timeoutperiod:
 *                         type: string
 *                         example: "2"
 *                       isadmin:
 *                         type: integer
 *                         example: 1
 *                       assignspecificuser:
 *                         type: integer
 *                         example: 0
 *                       selectuser:
 *                         type: string
 *                         example: ""
 *                       isMissChatAssigContactOwner:
 *                         type: integer
 *                         example: 0
 *                       manualAssignUid:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       SpecificUserUid:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       adminName:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       adminUid:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       enableAdmin:
 *                         type: integer
 *                         example: 0
 *                       isMissedChat:
 *                         type: integer
 *                         example: 1
 *       404:
 *         description: No routing rules found for the service provider.
 *       500:
 *         description: Internal server error.
 */


/**
 * @swagger
 * /rotingsave:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Save routing settings - Routing Rules
 *     description: Allows users to configure routing rules for chat assignments.
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
 *               SpecificUserUid:
 *                 type: integer
 *                 description: User ID of a specific assigned user.
 *                 example: 669
 *               assignagent:
 *                 type: integer
 *                 description: Flag to assign agent (0 = No, 1 = Yes).
 *                 example: 1
 *               assignspecificuser:
 *                 type: integer
 *                 description: Flag to assign a specific user (0 = No, 1 = Yes).
 *                 example: 0
 *               assignuser:
 *                 type: string
 *                 description: Assigned user's name or ID.
 *                 example: ""
 *               broadcast:
 *                 type: integer
 *                 description: Flag to enable broadcasting (0 = No, 1 = Yes).
 *                 example: 1
 *               contactowner:
 *                 type: integer
 *                 description: Flag to assign chat to the contact owner (0 = No, 1 = Yes).
 *                 example: 1
 *               conversationallowed:
 *                 type: string
 *                 description: Allowed conversation type.
 *                 example: ""
 *               enableAdmin:
 *                 type: integer
 *                 description: Flag to enable admin access (0 = No, 1 = Yes).
 *                 example: 0
 *               isMissChatAssigContactOwner:
 *                 type: integer
 *                 description: Flag to assign missed chat to contact owner (0 = No, 1 = Yes).
 *                 example: 0
 *               isMissedChat:
 *                 type: integer
 *                 description: Flag to track if the chat was missed (0 = No, 1 = Yes).
 *                 example: 1
 *               isadmin:
 *                 type: integer
 *                 description: Flag to mark as admin (0 = No, 1 = Yes).
 *                 example: 1
 *               manualassign:
 *                 type: integer
 *                 description: Flag for manual assignment (0 = No, 1 = Yes).
 *                 example: 0
 *               roundrobin:
 *                 type: integer
 *                 description: Flag for round-robin assignment (0 = No, 1 = Yes).
 *                 example: 0
 *               selectuser:
 *                 type: string
 *                 description: User selection criteria.
 *                 example: "Web Mail"
 *               timeoutperiod:
 *                 type: string
 *                 description: Timeout period for assignment.
 *                 example: "2"
 *     responses:
 *       200:
 *         description: Routing settings saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Routing settings updated successfully!"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */