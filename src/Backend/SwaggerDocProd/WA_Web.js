/**
 * @swagger
 * /sendMessage:
 *   post:
 *     summary: Send a message
 *     tags:
 *       - Messaging
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spNumber:
 *                 type: string
 *                 example: "911724610945"
 *               messageTo:
 *                 type: string
 *                 example: "91940000000000"
 *               headerText:
 *                 type: string
 *                 example: ""
 *               message_text:
 *                 type: string
 *                 example: "<p>Text Here: {{Name}}</p>"
 *               MessageVariables:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "{{Name}}"
 *                     value:
 *                       type: string
 *                       example: "{{Name}}"
 *                     fallback:
 *                       type: string
 *                       example: ""
 *                     isFallback:
 *                       type: boolean
 *                       example: true
 *                 example:
 *                   - label: "{{Name}}"
 *                     value: "{{Name}}"
 *                     fallback: ""
 *                     isFallback: true
 *               message_type:
 *                 type: string
 *                 example: "text"
 *               isTemplate:
 *                 type: boolean
 *                 example: false
 *               language:
 *                 type: string
 *                 example: ""
 *               media_type:
 *                 type: string
 *                 example: ""
 *               message_media:
 *                 type: string
 *                 example: "text"
 *               name:
 *                 type: string
 *                 example: ""
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