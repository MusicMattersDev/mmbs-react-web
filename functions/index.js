const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const ExcelJS = require('exceljs');

exports.processODS = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        if (request.method !== 'POST') {
            return response.status(405).end();
        }
        console.log('Files:', request.files);
        console.log('Body:', request.body);
        if (!request.files || !request.files.odsFile) {
            return response.status(400).send("Missing ODS file in request.");
        }

        try {
            // Extract uploaded ODS file and event data
            const odsFile = request.files.odsFile.data;
            const events = JSON.parse(request.body.events);

            // Load the ODS file using exceljs
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(odsFile);

            // Get the worksheet for the month (for example, "Sep")
            const month = new Date(events[0].start).toLocaleString('default', { month: 'short' });
            const worksheet = workbook.getWorksheet(month);

            // Process each event and insert it into the worksheet
            events.forEach(event => {
                // Extract necessary event details
                const eventDate = new Date(event.start).getDate(); // Get the day of the month
                let start = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim();
                let end = new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim();
                const timing = ((start.charAt(0) === "0") ? start.substring(1) : start) + " to " + ((end.charAt(0) === "0") ? end.substring(1) : end);
                const artist = event.extendedProps.stage;

                // Find the starting row for the event's date
                let rowIndex = 1;  // Adjust this based on your ODS file structure
                while (rowIndex <= worksheet.rowCount) {
                    const row = worksheet.getRow(rowIndex);
                    if (row.getCell(1).value === eventDate) {  // Check if the cell contains the event date
                        break;
                    }
                    rowIndex++;
                }

                // Insert the artist's name and event timings
                worksheet.getRow(rowIndex + 1).getCell(1).value = artist;  // Adjust these indices based on your ODS file structure
                worksheet.getRow(rowIndex + 2).getCell(1).value = timing;  // Adjust these indices based on your ODS file structure
            });

            // Save the updated workbook to a new ODS file
            const updatedOdsFile = await workbook.xlsx.writeBuffer();

            // Return the updated ODS file as a response
            response.setHeader('Content-Disposition', 'attachment; filename=updated-calendar.ods');
            response.type('application/vnd.oasis.opendocument.spreadsheet');
            response.send(updatedOdsFile);
        } catch (err) {
            console.error('Error processing ODS file:', err);
            response.status(500).send(`Error: ${err.message}`);
        }
    });
});
