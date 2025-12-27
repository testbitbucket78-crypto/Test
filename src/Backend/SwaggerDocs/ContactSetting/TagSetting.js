/**
 * @swagger
 * /selectTag/{spid}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Retrieve tags by SP_ID - Tags Settings
 *     description: Fetches a list of tags associated with a specific service provider ID (SP_ID).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: spid
 *         required: true
 *         schema:
 *           type: integer
 *         example: 148
 *         description: Service provider ID to retrieve tags for.
 *     responses:
 *       200:
 *         description: Successfully retrieved the tag list.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               taglist:
 *                 - ID: 268
 *                   TagName: "Red"
 *                   TagColour: "#ec1818"
 *                   created_at: "2025-01-02T06:05:04.000Z"
 *                   updated_at: "2025-01-02T06:05:04.000Z"
 *                   tag_count: 0
 *                 - ID: 269
 *                   TagName: "Green"
 *                   TagColour: "#0da026"
 *                   created_at: "2025-01-02T06:05:18.000Z"
 *                   updated_at: "2025-01-02T06:05:18.000Z"
 *                   tag_count: 0
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Invalid request data"
 *               status: 400
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Unauthorized"
 *               status: 401
 *       404:
 *         description: No tags found for the provided SP_ID.
 *         content:
 *           application/json:
 *             example:
 *               msg: "No tags found"
 *               status: 404
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal server error"
 *               status: 500
 */

/**
 * @swagger
 * /addupdateTag:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Add or update a tag
 *     description: Adds a new tag or updates an existing tag for a given Service Provider ID (SP_ID).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - SP_ID
 *               - TagName
 *               - TagColour
 *             properties:
 *               SP_ID:
 *                 type: integer
 *                 description: The Service Provider ID associated with the tag.
 *                 example: 148
 *               ID:
 *                 type: integer
 *                 description: The ID of the tag (0 for new tag, existing ID for update).
 *                 example: 0
 *               TagName:
 *                 type: string
 *                 description: The name of the tag.
 *                 example: "hey"
 *               TagColour:
 *                 type: string
 *                 description: The color code of the tag.
 *                 example: "#703838"
 *     responses:
 *       200:
 *         description: Successfully added or updated the tag.
 *         content:
 *           application/json:
 *             example:
 *               SP_ID: 148
 *               ID: 0
 *               TagColour: "#703838"
 *               TagName: "hey"
 *               msg: "tag added"
 *               status: 200
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Invalid request data"
 *               status: 400
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Unauthorized"
 *               status: 401
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal server error"
 *               status: 500
 */

/**
 * @swagger
 * /deleteTag:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Delete a tag - Tags Settings
 *     description: Deletes a tag by its ID.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ID
 *             properties:
 *               ID:
 *                 type: integer
 *                 description: The ID of the tag to delete.
 *                 example: 280
 *     responses:
 *       200:
 *         description: Successfully deleted the tag.
 *         content:
 *           application/json:
 *             example:
 *               status: 200
 *               tagDelete:
 *                 fieldCount: 0
 *                 affectedRows: 1
 *                 changedRows: 1
 *                 insertId: 0
 *                 serverStatus: 2
 *                 warningCount: 0
 *                 message: "(Rows matched: 1  Changed: 1  Warnings: 0)"
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Invalid request data"
 *               status: 400
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Unauthorized"
 *               status: 401
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               msg: "Internal server error"
 *               status: 500
 */


