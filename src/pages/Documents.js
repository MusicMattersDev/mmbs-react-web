import React, { useState, useEffect } from 'react';
import firebaseDb from "../firebase-config";
import { FormControl, InputLabel, Select, MenuItem, Stack, Button } from "@mui/material";
import { ArtistConfirmation, ArtistInvoice, BookingList, SubjectList, DownloadBookingList, DownloadSubjectLinesList, DownloadInvoices, DownloadConfirmations} from '../components/GeneratePDF';
import * as XLSX from "xlsx";

function Documents() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [venues, setVenues] = useState({});
    const [events, setEvents] = useState({});
    // used for year selector
    const [yearsList, setYearsList] = useState();

    

    useEffect(() => {
        // get list of venues on render
        firebaseDb.child('database/venues').on('value', snapshot => {  
            if (snapshot.val() != null) {  
                setVenues(snapshot.val());
            }
        })

        // get list of events for year selector
        firebaseDb.child('database/events').orderByChild('venue').on('value', (snapshot) => {  
            setEvents((snapshot.val() !== undefined) ? snapshot.val() : {});
        }); 
    }, [])

    useEffect(() => {
        let tempYearsList = [];

        // add each year to tempYearsList
        if (events !== null && Object.keys(events).length !== 0) {
            tempYearsList = Object.keys(events).map((key) => {        
                return events[key].year;
            });
        }
        // filter out duplicates and undefined entries
        let uniqueYears = [];
        tempYearsList = tempYearsList.filter((tempYear) => {
            if (tempYear !== undefined && !uniqueYears.includes(tempYear)) {
                uniqueYears.push(tempYear);
                return true;
            } else {
                return false;
            }
        });
        // sort by year
        tempYearsList.sort();

        setYearsList(tempYearsList);
    }, [events])

    const handleMonthChange = (event) => {
        setMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setYear(event.target.value);
    };

    const togglePreview = (event) => {
        const venueCardID = event.target.id.split('-preview')[0];
        const venueCard = document.getElementById(venueCardID);

        if (venueCard.style.display === "none") {
            venueCard.style.display = "block";
        } else {
            venueCard.style.display = "none";
        }
    };

    function formatDateToCustomFormat(dateString) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dateObj = new Date(dateString);
        
        const dayName = days[dateObj.getUTCDay()];
        const monthName = months[dateObj.getUTCMonth()];
        const dayNumber = dateObj.getUTCDate();
        const year = dateObj.getUTCFullYear();
        
        return `${dayName}, ${monthName} ${dayNumber}, ${year}`;
        
    }

    function generateAndDownloadExcel(month, year) {
        // Convert month name to month number (e.g., 'January' to '01')
        const monthNumber = ("0" + (new Date(`${month} 1 ${year}`).getMonth() + 1)).slice(-2);
    
        // Determine the start and end dates for the month
        const startDate = new Date(Date.UTC(year, parseInt(monthNumber) - 1, 1));
        const endDate = new Date(Date.UTC(year, parseInt(monthNumber), 0, 23, 59, 59, 999)); // Up to the last millisecond of the last day of the month

    
        const startDateString = `${startDate.getUTCFullYear()}-${("0" + (startDate.getUTCMonth() + 1)).slice(-2)}-${("0" + startDate.getUTCDate()).slice(-2)}`;
        const endDateString = `${endDate.getUTCFullYear()}-${("0" + (endDate.getUTCMonth() + 1)).slice(-2)}-${("0" + endDate.getUTCDate()).slice(-2)}`;
    
        // Initialize the Firebase references
        const eventsRef = firebaseDb.child('database/events');
        const clientsRef = firebaseDb.child('database/clients');
        const venuesRef = firebaseDb.child('database/venues');
    
        // Fetch venues data first
        venuesRef.once('value').then(venuesSnapshot => {
            const venuesData = venuesSnapshot.val();
    
            // Then fetch events based on the selected month and year
            eventsRef.orderByChild('date').startAt(startDateString).endAt(endDateString).once('value').then(eventsSnapshot => {
                const eventsData = eventsSnapshot.val();
    
                // If there are no events for the selected month/year, return
                if (!eventsData) return;
    
                // Fetch all clients
                clientsRef.once('value').then(clientsSnapshot => {
                    const clientsData = clientsSnapshot.val();
    
                    let excelData = [];
    
                    Object.values(eventsData).forEach(event => {
                        if (new Date(event.date) < startDate || new Date(event.date) > endDate) return; // Note the change here
                        if (!event.clientID) {  // Safety check: if event does not have a client ID, skip this iteration
                            console.warn(`Event missing client ID. Event data:`, event);
                            return;
                        }
    
                        let client = clientsData[event.clientID];
                        if (!client) {  // Safety check: if client data is not found, skip this iteration
                            console.warn(`No client data found for event with client ID: ${event.clientID}`);
                            return;
                        }
    
                        let email = client.email;
    
                        // Extract the venue name using the venue ID from the event
                        let venue = venuesData[event.venue];
                        let venueName = (venue && venue.name === "Renaissance-Exchange") ? "Exchange" : (venue ? venue.name : "UnknownVenue");
    
                        let timeSuffix = (event.startTime === "17:00" ? " #1" : " #2");
                        let formattedDate = formatDateToCustomFormat(event.date);
                        let invoiceFileName = venueName + " Booking Invoice-" + formattedDate + timeSuffix + ".pdf";
                        let confirmationFileName = venueName + "-Artist Confirmation-" + formattedDate + timeSuffix + ".pdf";
    
                        excelData.push({
                            "Email": email,
                            "Attachment1": confirmationFileName,
                            "SubjectLine": confirmationFileName.replace(".pdf", "") // Removing ".pdf" from the filename
                        });
                    });
    
                    excelData.sort((a, b) => {
                        const extractDateComponents = (filename) => {
                            const datePart = filename.split("-Artist Confirmation-")[1];
                            const month = datePart.split(",")[1].trim().split(" ")[0];
                            const day = parseInt(datePart.split(",")[1].trim().split(" ")[1], 10);
                            const year = parseInt(datePart.split(",")[2].trim(), 10);
                            const timeSuffix = filename.includes("#1") ? 1 : 2;
                            return { year, month, day, timeSuffix };
                        };
                    
                        const dateA = extractDateComponents(a["Attachment1"]);
                        const dateB = extractDateComponents(b["Attachment1"]);
                    
                        if (dateA.year !== dateB.year) return dateA.year - dateB.year;
                        if (dateA.month !== dateB.month) return new Date(dateA.month + " 1, 1970").getMonth() - new Date(dateB.month + " 1, 1970").getMonth();
                        if (dateA.day !== dateB.day) return dateA.day - dateB.day;
                        return dateA.timeSuffix - dateB.timeSuffix;
                    });
    
                    // Use the excelData to generate the Excel file and trigger download
                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.json_to_sheet(excelData);
                    XLSX.utils.book_append_sheet(wb, ws, "Data");
                    XLSX.writeFile(wb, month + " Artist Confirmations Email File.xlsx");
                });
            });
        });
    }
   
    return (
        <div className='content' >
            {/* Card containing all other cards */}
            
            <div className="card" >
                {/* Header displaying which month and year the documents are for */}
                <div className="card-header main-search dash-search"> 
                    <Stack
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                        spacing={2}
                    >
                          
                        <h3>{month} {year} - Documents</h3>
                        <Button variant = "contained" onClick={() => generateAndDownloadExcel(month, year)}>Download Monthly Artist Confitmation Email Data</Button>

                        <div style={{flex: '1 0 0'}} />
                        {/* Month Selector */}
                        <FormControl variant="filled" sx={{ m: 1, minWidth: 135 }}>
                            <InputLabel id="demo-simple-select-label">Month</InputLabel>
                            <Select
                                labelId="documents-month-select-label"
                                id="documents-month-select"
                                value={month}
                                label="Month"
                                onChange={handleMonthChange}
                            >
                                <MenuItem value={"January"}>January</MenuItem>
                                <MenuItem value={"February"}>February</MenuItem>
                                <MenuItem value={"March"}>March</MenuItem>
                                <MenuItem value={"April"}>April</MenuItem>
                                <MenuItem value={"May"}>May</MenuItem>
                                <MenuItem value={"June"}>June</MenuItem>
                                <MenuItem value={"July"}>July</MenuItem>
                                <MenuItem value={"August"}>August</MenuItem>
                                <MenuItem value={"September"}>September</MenuItem>
                                <MenuItem value={"October"}>October</MenuItem>
                                <MenuItem value={"November"}>November</MenuItem>
                                <MenuItem value={"December"}>December</MenuItem>
                            </Select>
                        </FormControl>
                        {/* Year Selector */}
                        {(yearsList !== undefined && yearsList.length !== 0) && <FormControl variant="filled" sx={{ m: 1, minWidth: 90 }}>
                            <InputLabel id="demo-simple-select-label">Year</InputLabel>
                            <Select
                                labelId="documents-year-select-label"
                                id="documents-year-select"
                                value={year}
                                label="Year"
                                onChange={handleYearChange}
                            >
                                {yearsList.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>}
                    </Stack>
                </div>

                {/* Card for each venue containing documents */}
                {Object.keys(venues).map((key, i) => (
                    <div key={i} className="card-body pb-0">
                        {/* Displays venue name */}
                        <div className="card-header main-search dash-search"> 
                            <h3>{venues[key].name}</h3>
                        </div>
                        {/* Booking List */}
                        <div className="card-body pb-0">
                            <div className="card">  
                                <div className="card-header">Booking List</div>  
                                <div className="card-body position-relative">  
                                    <Stack
                                        direction="row"
                                        justifyContent="flex-start"
                                        alignItems="center"
                                        spacing={2}
                                    >
                                        <Button variant="contained" id={venues[key].name + "_bookinglist-preview"} onClick={togglePreview}>Preview</Button>
                                        <DownloadBookingList month={month} year={year} venue={venues[key]} venueID={key} />
                                        <div style={{flex: '1 0 0'}} />
                                        <span className="text-secondary">Last Sent:&nbsp;&nbsp;{
                                            (new Date(venues[key].bookingListLastSent).toLocaleDateString() !== "Invalid Date") ? new Date(venues[key].bookingListLastSent).toLocaleDateString() : "Unknown"
                                        }</span>
                                    </Stack>
                                    <div id={venues[key].name + "_bookinglist"} style={{ 
                                        marginTop: "10px",
                                        overflow: "auto",
                                        paddingBottom: "-16px",
                                        display: "none"
                                    }}>
                                        <BookingList
                                            month={month}
                                            year={year}
                                            venue={venues[key]}
                                            venueID={key}
                                        />
                                    </div>
                                </div>  
                            </div>
                        </div>

                        {/* Artist Confirmations */}
                        <div className="card-body pb-0">
                            <div className="card">  
                                <div className="card-header">Artist Confirmations</div>  
                                <div className="card-body position-relative">  
                                    <Stack
                                        direction="row"
                                        justifyContent="flex-start"
                                        alignItems="center"
                                        spacing={2}
                                    >
                                        <Button variant="contained" id={venues[key].name + "_artistconfirmation-preview"} onClick={togglePreview}>Preview</Button>
                                        <DownloadConfirmations month={month} year={year} venue={venues[key]} venueID={key} />
                                        <div style={{flex: '1 0 0'}} />
                                        <span className="text-secondary">Last Sent:&nbsp;&nbsp;{
                                            (new Date(venues[key].allConfirmationsLastSent).toLocaleDateString() !== "Invalid Date") ? new Date(venues[key].allConfirmationsLastSent).toLocaleDateString() : "Unknown"
                                        }</span>
                                    </Stack>
                                    <div id={venues[key].name + "_artistconfirmation"} style={{ 
                                        marginTop: "10px",
                                        overflow: "auto",
                                        paddingBottom: "-16px",
                                        display: "none"
                                    }}>
                                        <ArtistConfirmation
                                            month={month}
                                            year={year}
                                            venue={venues[key]}
                                            venueID={key}
                                        />
                                    </div>
                                </div>  
                            </div>
                        </div>

                        {/* Artist Invoices */}
                        <div className="card-body pb-3">
                            <div className="card">  
                                <div className="card-header">Artist Invoices</div>  
                                <div className="card-body position-relative">  
                                    <Stack
                                        direction="row"
                                        justifyContent="flex-start"
                                        alignItems="center"
                                        spacing={2}
                                    >

                                        <Button variant="contained" id={venues[key].name + "_artistinvoice-preview"} onClick={togglePreview}>Preview</Button>
                                        <DownloadInvoices month={month} year={year} venue={venues[key]} venueID={key} />
                                        <div style={{flex: '1 0 0'}} />
                                        <span className="text-secondary">Last Sent:&nbsp;&nbsp;{
                                            (new Date(venues[key].allInvoicesLastSent).toLocaleDateString() !== "Invalid Date") ? new Date(venues[key].allInvoicesLastSent).toLocaleDateString() : "Unknown"
                                        }</span>
                                    </Stack>
                                    <div id={venues[key].name + "_artistinvoice"} style={{ 
                                        marginTop: "10px",
                                        overflow: "auto",
                                        paddingBottom: "-16px",
                                        display: "none"
                                    }}>
                                        <ArtistInvoice
                                            month={month}
                                            year={year}
                                            venue={venues[key]}
                                            venueID={key}
                                        />
                                    </div>
                                </div>  
                            </div>
                        </div>
                        
                        {/* Email Information */}
                        <div className="card-body pb-3">
                            <div className="card">  
                                <div className="card-header">PDF Names & Email Subject Lines List</div>  
                                <div className="card-body position-relative">  
                                    <Stack
                                        direction="row"
                                        justifyContent="flex-start"
                                        alignItems="center"
                                        spacing={2}
                                    >
                                        <Button variant="contained" id={venues[key].name + "_subjectlist-preview"} onClick={togglePreview}>Preview</Button>
                                        <DownloadSubjectLinesList month={month} year={year} venue={venues[key]} venueID={key} />
                                        <div style={{flex: '1 0 0'}} />
                                        <span className="text-secondary">Last Sent:&nbsp;&nbsp;{
                                            (new Date(venues[key].allInvoicesLastSent).toLocaleDateString() !== "Invalid Date") ? new Date(venues[key].allInvoicesLastSent).toLocaleDateString() : "Unknown"
                                        }</span>
                                    </Stack>
                                    <div id={venues[key].name + "_subjectlist"} style={{ 
                                        marginTop: "10px",
                                        overflow: "auto",
                                        paddingBottom: "-16px",
                                        display: "none"
                                    }}>
                                        <SubjectList
                                            month={month}
                                            year={year}
                                            venue={venues[key]}
                                            venueID={key}
                                        />
                                    </div>
                                </div>  
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Documents;
