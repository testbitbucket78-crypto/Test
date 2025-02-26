/**
 * @swagger
 * /getReplies:
 *   get:
 *     summary: Retrieve replies for a specific SP_ID - Smart Replies
 *     tags:
 *       - Smart Replies
 *     parameters:
 *       - in: query
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: string
 *         example: "55"
 *         description: Service Provider ID to fetch replies.
 *     responses:
 *       200:
 *         description: Successfully retrieved replies.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID:
 *                     type: integer
 *                     example: 579
 *                   Title:
 *                     type: string
 *                     example: "Test9.1"
 *                   Description:
 *                     type: string
 *                     example: "Test9"
 *                   CreatedDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T07:35:05.000Z"
 *                   ModifiedDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T07:35:44.000Z"
 *                   Channel:
 *                     type: string
 *                     example: "WA API"
 *                   KeywordCount:
 *                     type: integer
 *                     example: 1
 *                   MatchingCriteria:
 *                     type: string
 *                     example: "contains"
 *                   ActionCount:
 *                     type: integer
 *                     example: 0
 *       400:
 *         description: Bad request, invalid SP_ID.
 *       401:
 *         description: Unauthorized request.
 *       404:
 *         description: No replies found for the given SP_ID.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /sideNavKeyword:
 *   get:
 *     summary: Retrieve keyword-related data for a specific ID - Smart Replies
 *     tags:
 *       - Smart Replies
 *     parameters:
 *       - in: query
 *         name: ID
 *         required: true
 *         schema:
 *           type: integer
 *         example: 580
 *         description: Unique identifier for the keyword.
 *     responses:
 *       200:
 *         description: Successfully retrieved keyword-related data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID:
 *                     type: integer
 *                     example: 580
 *                   Title:
 *                     type: string
 *                     example: "Test10.1"
 *                   Description:
 *                     type: string
 *                     example: "Test10"
 *                   Keyword:
 *                     type: string
 *                     example: "Test10"
 *                   MatchingCriteria:
 *                     type: string
 *                     example: "contains"
 *                   CreatedDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T07:38:44.000Z"
 *                   ModifiedDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-12-02T07:40:07.000Z"
 *                   Channel:
 *                     type: string
 *                     example: "WA API"
 *                   Message:
 *                     type: string
 *                     format: html
 *                     example: "<p><strong>Header Section</strong></p><p>Some fields are missing...</p>"
 *                   Value:
 *                     type: string
 *                     example: ""
 *                   media_type:
 *                     type: string
 *                     example: "image/jpeg"
 *                   Media:
 *                     type: string
 *                     format: uri
 *                     example: "https://cip-engage-o.s3.ap-south-1.amazonaws.com/..."
 *                   Name:
 *                     type: string
 *                     example: ""
 *                   buttons:
 *                     type: string
 *                     format: json
 *                     example: '[{"type": "Quick Reply", "buttonText": "Quick Reply 1"}, {"type": "Visit Website", "webUrl": "https://www.amazon.in"}]'
 *                   buttonsVariable:
 *                     type: string
 *                     format: json
 *                     example: '[{"type": "Quick Reply", "buttonText": "Quick Reply 1"}]'
 *       400:
 *         description: Bad request, invalid ID.
 *       401:
 *         description: Unauthorized request.
 *       404:
 *         description: No data found for the given ID.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /deletSmartReply:
 *   put:
 *     summary: Delete a smart reply entry by ID - Smart Replies
 *     tags:
 *       - Smart Replies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ID:
 *                 type: integer
 *                 example: 794
 *                 description: The ID of the smart reply to be deleted.
 *     responses:
 *       200:
 *         description: Successfully deleted the smart reply.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 affectedRows:
 *                   type: integer
 *                   example: 1
 *                   description: Number of rows affected by the delete operation.
 *                 changedRows:
 *                   type: integer
 *                   example: 0
 *                   description: Number of rows changed.
 *                 fieldCount:
 *                   type: integer
 *                   example: 0
 *                 insertId:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: ""
 *                 protocol41:
 *                   type: boolean
 *                   example: true
 *                 serverStatus:
 *                   type: integer
 *                   example: 2
 *                 warningCount:
 *                   type: integer
 *                   example: 0
 *       400:
 *         description: Bad request, missing or invalid ID.
 *       401:
 *         description: Unauthorized request.
 *       404:
 *         description: No matching record found for the given ID.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /KeywordMatch:
 *   post:
 *     summary: Match keywords for a given service provider - Smart Replies
 *     tags:
 *       - Smart Replies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: string
 *                 example: "55"
 *                 description: The service provider ID.
 *               Keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["TestSSS1"]
 *                 description: List of keywords to match.
 *     responses:
 *       200:
 *         description: Keyword match successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "keyword ready for add"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *       401:
 *         description: Unauthorized request.
 *       404:
 *         description: No matching records found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /addNewReply:
 *   post:
 *     summary: Add a new smart reply - Smart Replies
 *     tags:
 *       - Smart Replies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SP_ID:
 *                 type: string
 *                 example: "55"
 *                 description: The service provider ID.
 *               Title:
 *                 type: string
 *                 example: "Testinggg"
 *                 description: The title of the smart reply.
 *               Description:
 *                 type: string
 *                 example: "Testinng"
 *                 description: A short description of the smart reply.
 *               Channel:
 *                 type: string
 *                 example: "WA API"
 *                 description: The communication channel.
 *               Keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["TestSSS1"]
 *                 description: List of keywords associated with the smart reply.
 *               MatchingCriteria:
 *                 type: string
 *                 example: "contains"
 *                 description: The matching criteria for triggering the smart reply.
 *               ReplyActions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ActionID:
 *                       type: integer
 *                       example: 0
 *                     Message:
 *                       type: string
 *                       example: "<p>hii</p>"
 *                     Value:
 *                       type: string
 *                       example: ""
 *                     ValueUuid:
 *                       type: string
 *                       example: ""
 *                     Media:
 *                       type: string
 *                       example: ""
 *                     MessageVariables:
 *                       type: string
 *                       example: ""
 *                     bodyText:
 *                       type: string
 *                       example: ""
 *                     buttons:
 *                       type: array
 *                       items:
 *                         type: object
 *                     buttonsVariable:
 *                       type: array
 *                       items:
 *                         type: object
 *                     headerText:
 *                       type: string
 *                       example: ""
 *                     isTemplate:
 *                       type: boolean
 *                       example: false
 *                     language:
 *                       type: string
 *                       example: ""
 *                     media_type:
 *                       type: string
 *                       example: ""
 *                     name:
 *                       type: string
 *                       example: ""
 *               Tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               TagsUuid:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *     responses:
 *       200:
 *         description: Smart reply successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Smart Reply added"
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *       401:
 *         description: Unauthorized request.
 *       500:
 *         description: Internal server error.
 */

