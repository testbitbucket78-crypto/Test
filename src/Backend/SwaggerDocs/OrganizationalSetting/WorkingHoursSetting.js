/**
 * @swagger
 * /workingDetails:
 *   post:
 *     tags:
 *       - Settings
 *     summary: Set working details - Working Hours
 *     description: Configures the working hours for a service provider.
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
 *                 example: 91
 *               days:
 *                 type: array
 *                 description: List of working days with their respective start and end times.
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       description: Comma-separated list of working days.
 *                       example: "Monday,Tuesday,Thursday,Friday,Saturday,Sunday"
 *                     startTime:
 *                       type: string
 *                       format: time
 *                       description: Start time of the working hours (24-hour format).
 *                       example: "00:00"
 *                     endTime:
 *                       type: string
 *                       format: time
 *                       description: End time of the working hours (24-hour format).
 *                       example: "23:59"
 *     responses:
 *       200:
 *         description: Working details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Working details updated successfully."
 *                 status:
 *                   type: integer
 *                   example: 200
 *       400:
 *         description: Bad request due to missing or invalid fields.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /workingDetails/{spID}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get working details - Working Hours
 *     description: Retrieves the working details for a specific service provider.
 *     parameters:
 *       - in: path
 *         name: SP_ID
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service provider ID.
 *         example: 91
 *     responses:
 *       200:
 *         description: Successfully retrieved working details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "workingDetails got successfully !"
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2088
 *                       SP_ID:
 *                         type: integer
 *                         example: 91
 *                       EventName:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       Description:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         example: "00:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         example: "23:59"
 *                       created_By:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-21T06:25:33.000Z"
 *                       updated_at:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       isDeleted:
 *                         type: integer
 *                         example: 0
 *                       off_days:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       working_days:
 *                         type: string
 *                         example: "Monday,Tuesday,Thursday,Friday,Saturday,Sunday"
 *                       status:
 *                         type: integer
 *                         example: 200
 *       400:
 *         description: Bad request due to missing or invalid SP_ID.
 *       404:
 *         description: No working details found for the given SP_ID.
 *       500:
 *         description: Internal server error.
 */