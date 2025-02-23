/**
 * @swagger
 * /getAllInteraction:
 *   post:
 *     summary: Get all interactions - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               SearchKey:
 *                 type: string
 *                 description: Search key for filtering interactions
 *                 example: ""
 *               FilterBy:
 *                 type: string
 *                 description: Filter criteria
 *                 example: "All"
 *               AgentId:
 *                 type: integer
 *                 description: ID of the agent
 *                 example: 495
 *               SPID:
 *                 type: string
 *                 description: Service Provider ID
 *                 example: "91"
 *               AgentName:
 *                 type: string
 *                 description: Name of the agent
 *                 example: "Ayush Chauhan"
 *               RangeStart:
 *                 type: integer
 *                 description: Pagination start range
 *                 example: 0
 *               RangeEnd:
 *                 type: integer
 *                 description: Pagination end range
 *                 example: 10
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 isCompleted:
 *                   type: boolean
 *                   example: false
 *                 conversations:
 *                   type: array
 *                   description: List of conversations
 *                   items:
 *                     type: object
 *                     properties:
 *                       InteractionId:
 *                         type: integer
 *                         description: Unique ID of the interaction
 *                         example: 4422
 *                       customerId:
 *                         type: integer
 *                         description: ID of the customer
 *                         example: 83697
 *                       Phone_number:
 *                         type: string
 *                         description: Customer's phone number
 *                         example: "918894436686"
 *                       Name:
 *                         type: string
 *                         description: Name of the customer
 *                         example: "Anshul"
 *                       interaction_status:
 *                         type: string
 *                         description: Status of the interaction
 *                         example: "Resolved"
 *                       channel:
 *                         type: string
 *                         description: Communication channel used
 *                         example: "WA Web"
 *                       LastMessageDate:
 *                         type: string
 *                         format: date-time
 *                         description: Date of the last message
 *                         example: "2025-02-17T15:44:50.000Z"
 */

/**
 * @swagger
 * /customers/{spID}/{RangeStart}/{RangeEnd}:
 *   get:
 *     summary: Get Customers List - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spID
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Provider ID
 *       - in: path
 *         name: RangeStart
 *         required: true
 *         schema:
 *           type: integer
 *         description: Starting index for pagination
 *       - in: path
 *         name: RangeEnd
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ending index for pagination
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       customerId:
 *                         type: integer
 *                         example: 83519
 *                       Phone_number:
 *                         type: string
 *                         example: "919876473632"
 *                       Name:
 *                         type: string
 *                         example: "Vijay"
 *                       InteractionId:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       source:
 *                         type: string
 *                         example: "WithoutInteraction"
 *                 isCompleted:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /getquickReply/{SPID}:
 *   get:
 *     summary: Get Quick Replies - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: SPID
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Provider ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 quickReplies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 123
 *                       message:
 *                         type: string
 *                         example: "Hello, how can I help you?"
 *                       createdBy:
 *                         type: string
 *                         example: "AgentName"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-23T15:44:50.000Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /messages/{InteractionId}/{Type}/{RangeStart}/{RangeEnd}/{spid}:
 *   get:
 *     summary: Get all messages for an interaction - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: InteractionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the interaction
 *       - in: path
 *         name: Type
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of message (e.g., "text", "media")
 *       - in: path
 *         name: RangeStart
 *         required: true
 *         schema:
 *           type: integer
 *         description: The starting range for pagination
 *       - in: path
 *         name: RangeEnd
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ending range for pagination
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: string
 *         description: Service Provider ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 isCompleted:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       messageId:
 *                         type: integer
 *                         example: 101
 *                       interactionId:
 *                         type: integer
 *                         example: 4422
 *                       messageText:
 *                         type: string
 *                         example: "Hello, how can I assist you?"
 *                       sender:
 *                         type: string
 *                         example: "Agent"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-23T15:44:50.000Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /updateinteraction/:
 *   post:
 *     summary: Update an interaction status - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               InteractionId:
 *                 type: integer
 *                 example: 4422
 *               SP_ID:
 *                 type: string
 *                 example: "91"
 *               Status:
 *                 type: string
 *                 example: "Open"
 *               action:
 *                 type: string
 *                 example: "Conversation Opened"
 *               action_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-23T16:23:41.276Z"
 *               action_by:
 *                 type: string
 *                 example: "Ayush Chauhan"
 *     responses:
 *       200:
 *         description: Successful update of interaction status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fieldCount:
 *                   type: integer
 *                   example: 0
 *                 affectedRows:
 *                   type: integer
 *                   example: 1
 *                 insertId:
 *                   type: integer
 *                   example: 0
 *                 serverStatus:
 *                   type: integer
 *                   example: 2
 *                 warningCount:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "(Rows matched: 1  Changed: 1  Warnings: 0)"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /resetInteractionMapping/:
 *   post:
 *     summary: Reset interaction mapping - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               InteractionId:
 *                 type: integer
 *                 example: 4422
 *               AgentId:
 *                 type: integer
 *                 example: 495
 *               MappedBy:
 *                 type: integer
 *                 example: 495
 *               SP_ID:
 *                 type: string
 *                 example: "91"
 *               action:
 *                 type: string
 *                 example: "Conversation Assigned to Self"
 *               action_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-23T16:25:00.158Z"
 *               action_by:
 *                 type: string
 *                 example: "Ayush Chauhan"
 *               lastAssistedAgent:
 *                 type: integer
 *                 example: 495
 *     responses:
 *       200:
 *         description: Successfully reset interaction mapping
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fieldCount:
 *                   type: integer
 *                   example: 0
 *                 affectedRows:
 *                   type: integer
 *                   example: 1
 *                 insertId:
 *                   type: integer
 *                   example: 0
 *                 serverStatus:
 *                   type: integer
 *                   example: 34
 *                 warningCount:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "(Rows matched: 1  Changed: 1  Warnings: 0)"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /interactionmapping/:
 *   post:
 *     summary: Assign an interaction to an agent - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               InteractionId:
 *                 type: integer
 *                 example: 4422
 *               AgentId:
 *                 type: integer
 *                 example: 495
 *               MappedBy:
 *                 type: integer
 *                 example: 495
 *               SP_ID:
 *                 type: string
 *                 example: "91"
 *               action:
 *                 type: string
 *                 example: "Conversation Assigned to Self"
 *               action_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-23T16:25:00.158Z"
 *               action_by:
 *                 type: string
 *                 example: "Ayush Chauhan"
 *               lastAssistedAgent:
 *                 type: integer
 *                 example: 495
 *     responses:
 *       200:
 *         description: Successfully assigned interaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fieldCount:
 *                   type: integer
 *                   example: 0
 *                 affectedRows:
 *                   type: integer
 *                   example: 1
 *                 insertId:
 *                   type: integer
 *                   example: 8010
 *                 serverStatus:
 *                   type: integer
 *                   example: 2
 *                 warningCount:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: ""
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /editCustomContact:
 *   post:
 *     summary: Edit a custom contact - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 83697
 *       - in: query
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: string
 *         example: "91"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               result:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     displayName:
 *                       type: string
 *                       example: "anshull"
 *                     ActuallName:
 *                       type: string
 *                       example: "Name"
 *     responses:
 *       200:
 *         description: Successfully updated contact
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *                   properties:
 *                     affectedRows:
 *                       type: integer
 *                       example: 1
 *                     changedRows:
 *                       type: integer
 *                       example: 1
 *                     message:
 *                       type: string
 *                       example: "(Rows matched: 1  Changed: 1  Warnings: 0)"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /blockcustomer:
 *   post:
 *     summary: Block or unblock a customer - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 83697
 *               isBlocked:
 *                 type: integer
 *                 description: "1 for blocked, 0 for unblocked"
 *                 example: 1
 *               SP_ID:
 *                 type: string
 *                 example: "91"
 *               action:
 *                 type: string
 *                 example: "Contact Updated"
 *     responses:
 *       200:
 *         description: Successfully updated customer block status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *                   properties:
 *                     affectedRows:
 *                       type: integer
 *                       example: 1
 *                     changedRows:
 *                       type: integer
 *                       example: 1
 *                     message:
 *                       type: string
 *                       example: "(Rows matched: 1  Changed: 1  Warnings: 0)"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /newmessage:
 *   post:
 *     summary: Send a new message - TeamBox
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               InteractionId:
 *                 type: integer
 *                 example: 4414
 *               CustomerId:
 *                 type: integer
 *                 example: 83527
 *               SPID:
 *                 type: string
 *                 example: "55"
 *               SP_ID:
 *                 type: string
 *                 example: "55"
 *               AgentId:
 *                 type: integer
 *                 example: 380
 *               action:
 *                 type: string
 *                 example: "edited by EngageKart"
 *               action_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-23T16:37:46.556Z"
 *               action_by:
 *                 type: string
 *                 example: ""
 *               bodyText:
 *                 type: string
 *                 example: "<p><strong>Success Messages (Body Section)</strong></p><p><strong>hi,&nbsp;<span><span contenteditable=\"false\" class=\"e-mention-chip\"><a title=\"\">{{Name}}</a></span></span><span contenteditable=\"true\">&nbsp;</span></strong></p><p>Ignore this message only testing purpose&nbsp;</p><p>Enagekart.com<br></p>"
 *               buttons:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               buttonsVariable:
 *                 type: string
 *                 example: "[]"
 *               created_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-02-23T16:37:46.556Z"
 *               headerText:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *               isTemplate:
 *                 type: boolean
 *                 example: true
 *               language:
 *                 type: string
 *                 example: "en"
 *               media_type:
 *                 type: string
 *                 example: ""
 *               messageTo:
 *                 type: string
 *                 example: "919876473632"
 *               message_media:
 *                 type: string
 *                 example: "text"
 *               message_text:
 *                 type: string
 *                 example: "<p><p> <strong>Success Messages (Body Section)</strong></p><p> <strong>hi,&nbsp; <span><span contenteditable=\"false\" class=\"e-mention-chip\"><a title=\"\">{{Name}}</a></span></span> <span contenteditable=\"true\">&nbsp;</span></strong></p><p>Ignore this message only testing purpose&nbsp;</p><p>Enagekart.com<br></p></p><p class=\"temp-footer\">Thanks for supporting</p>"
 *               message_type:
 *                 type: string
 *                 example: "text"
 *               name:
 *                 type: string
 *                 example: "no_media_template"
 *               quick_reply_id:
 *                 type: string
 *                 example: ""
 *               spNumber:
 *                 type: string
 *                 example: "911724610945"
 *               template_id:
 *                 type: string
 *                 example: ""
 *               uidMentioned:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               MessageVariables:
 *                 type: string
 *                 example: "[{\"label\":\"{{Name}}\",\"value\":\"{{Name}}\",\"fallback\":\"\",\"isFallback\":true}]"
 *     responses:
 *       200:
 *         description: Successfully sent message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 insertId:
 *                   type: integer
 *                   example: 58259
 *                 middlewareresult:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: integer
 *                       example: 200
 *                     message:
 *                       type: object
 *                       properties:
 *                         messaging_product:
 *                           type: string
 *                           example: "whatsapp"
 *                         contacts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               input:
 *                                 type: string
 *                                 example: "919876473632"
 *                               wa_id:
 *                                 type: string
 *                                 example: "919876473632"
 *                         messages:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "wamid.HBgMOTE5ODc2NDczNjMyFQIAERgSMEQ2Mzg1OEQyRDM2MjIwQjFFAA=="
 *                               message_status:
 *                                 type: string
 *                                 example: "accepted"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /addcustomers:
 *   post:
 *     summary: Add a new customer - TeamBox
 *     tags:
 *       - Authentication
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
 *                 type: string
 *                 example: "55"
 *               Name:
 *                 type: string
 *                 example: "Test"
 *               country_code:
 *                 type: string
 *                 example: "IN +91"
 *               Phone_number:
 *                 type: string
 *                 example: "918627089494"
 *               displayPhoneNumber:
 *                 type: string
 *                 example: "8627089494"
 *               Channel:
 *                 type: string
 *                 example: "WA API"
 *               OptInStatus:
 *                 type: string
 *                 example: "Yes"
 *               OptedIn:
 *                 type: string
 *                 example: "Yes"
 *               isTemporary:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully added customer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Contact added successfully."
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 customerId:
 *                   type: integer
 *                   example: 84474
 *                 interactionId:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: []
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

