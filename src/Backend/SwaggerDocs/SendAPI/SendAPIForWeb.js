/**
 * @swagger
 * /sendMessage:
 *   post:
 *     summary: Send a message
 *     tags:
 *       - Send API Web
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               MessageVariables:
 *                 type: string
 *                 example: []
 *               headerText:
 *                 type: string
 *                 example: ""
 *               isTemplate:
 *                 type: boolean
 *                 example: false
 *               language:
 *                 type: string
 *                 example: ""
 *               media_type:
 *                 type: string
 *                 example: ""
 *               messageTo:
 *                 type: string
 *                 example: "91940000000000"
 *               message_media:
 *                 type: string
 *                 example: "text"
 *               message_text:
 *                 type: string
 *                 example: "<p>hey</p>"
 *               message_type:
 *                 type: string
 *                 example: "text"
 *               name:
 *                 type: string
 *                 example: ""
 *               spNumber:
 *                 type: string
 *                 example: "911724610945"
 *               apiKey:
 *                 type: string
 *                 example: "key-e8dihe8e3u-1735230342734"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Invalid request
 */