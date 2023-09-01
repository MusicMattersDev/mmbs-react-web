import React, { useState, useEffect } from 'react';
import firebaseDb from "../firebase-config";
import { FormControl, InputLabel, Select, MenuItem, Stack, Button } from "@mui/material";
import { ArtistConfirmation, ArtistInvoice, BookingList, SubjectList, DownloadBookingList, DownloadSubjectLinesList, DownloadInvoices, DownloadConfirmations} from '../components/GeneratePDF';

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

    return (
        <div className='content'>
            {/* Card containing all other cards */}
            <div className="card">
                {/* Header displaying which month and year the documents are for */}
                <div className="card-header main-search dash-search"> 
                    <Stack
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                        spacing={2}
                    >
                        <h3>{month} {year} - Documents</h3>
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