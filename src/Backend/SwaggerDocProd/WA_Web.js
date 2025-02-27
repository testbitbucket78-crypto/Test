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
 *               templateDetails:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: ""
 *               language:
 *                 type: string
 *                 example: ""
 *               hasMedia:
 *                 type: boolean
 *                 example: false
 *                 description: "Indicates whether media is attached to the message."
 *               mediaDetails:
 *                 type: object
 *                 properties:
 *                   media_type:
 *                     type: string
 *                     example: "image/jpeg or video/mp4 etc."
 *                     description: Required if message_media is not "text"
 *                   message_media:
 *                     type: string
 *                     example: "https://example.com/image.jpg or https://example.com/video.mp4"
 *                     description: URL of the media file
 *                 description: Included only if message_media is not "text"
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