import React, { useEffect, useState, useCallback, useRef} from 'react';

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction"
import firebaseDb from "../firebase-config";  
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';
import AddEditEvent from './AddEditEvent'
import { IconButton, Snackbar, Alert,} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import DownloadIcon from '@mui/icons-material/Download';
import { Button } from "@mui/material";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


function Calendar({ showSidebar, setShowSidebar }) {
    const navigate = useNavigate();
    
    // whether or not the form is open
    const [openForm, setOpenForm] = useState(false);
    // whether or not the event text has been copied
    const [copied, setCopied] = useState(false);
    // used to make sure dateclick event doesn't open add/edit form while user is copying
    const [isCopying, setIsCopying] = useState(false);
    // for changing the form title based on whether you are adding / editting
    const [formType, setFormType] = useState("Add");
    const { venue } = useParams();
    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState({});
    const calendarRef = useRef(null);
    const [hoveredDay, setHoveredDay] = useState(null);



    // get events on render
    useEffect(() => {
        firebaseDb.child('database/events').orderByChild('venue').equalTo(venue).on('value', (snapshot) => {
            let obj = snapshot.val()
            let arr = []

            // create array of events in the following format to be passed into full calendar
            arr = Object.keys(obj).map((key) => {
                return { 
                    title: obj[key].stage,
                    start: obj[key].start,
                    end: obj[key].end,
                    extendedProps: {
                        date: obj[key].date,
                        stage: obj[key].stage,
                        performers: obj[key].performers,
                        startTime: obj[key].startTime,
                        email: obj[key].email,
                        endTime: obj[key].endTime,
                        price: obj[key].price,
                        venue: obj[key].venue,
                        eventID: key
                    }
                };
            });
            
            setEvents(arr);
        })
    }, []);
    
    // open add event form when a date is clicked
    const handleDateClick = (DateClickArg) => {
        // if user is copying, stop dateclick event
        if (isCopying) { return; }
        // pass a mostly empty event object with only the date and venue properties filled out
        const event = {
            date: DateClickArg.dateStr,
            venue: venue
        };
        setFormType("Add");
        setCurrentEvent(event);
        setOpenForm(true);
    }
    // open edit event form when an event is clicked
    const handleEventClick = (info) => {
        // pass a filled out event object with the properties of the clicked event
        const event = {
            stage: info.event.extendedProps.stage,
            performers: info.event.extendedProps.performers,
            startTime: info.event.extendedProps.startTime,
            endTime: info.event.extendedProps.endTime,
            email: info.event.extendedProps.email,
            price: info.event.extendedProps.price,
            date: info.event.extendedProps.date,
            eventID: info.event.extendedProps.eventID,
            venue: info.event.extendedProps.venue,
            start: info.event.startStr,
            end: info.event.endStr
        };
        setFormType("Edit");
        setCurrentEvent(event);
        setOpenForm(true);
    }
    // run when user presses the copy button
    const handleCopy = async (event, formattedDate) => {
        setIsCopying(true);
        // get all events on the day for which the copy button was clicked. excludes blank stage names
        const eventsOnDay = events.filter(obj => {
            return ((obj.extendedProps.date === formattedDate) && (obj.extendedProps.stage !== undefined && obj.extendedProps.stage !== ""));
        });
        let copyText = "";
        
        eventsOnDay.sort((a, b) => a.extendedProps.startTime.substring(0, 2) - b.extendedProps.startTime.substring(0, 2)).forEach((eventOnDay) => {
            // 2022-11-01T17:00 --> 05
            // set minute: "2-digit" if you need 05:00 format
            let start = new Date(eventOnDay.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim();
            let end = new Date(eventOnDay.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim();
            // artist's stage name for event
            copyText += (eventOnDay.extendedProps.stage + "\n");
            // time of event. trims leading 0 if there is one
            console.log("eventsOnDay", {eventsOnDay});
            console.log("eventOnDay", {eventOnDay});
            console.log("start", {start});
            copyText += to12HourFormat(start) + " to " + to12HourFormat(end) + "\n";
            console.log("copyText",{copyText});
        })
        // write text to clipboard
        setTimeout(async () => { 
            await navigator.clipboard.writeText(copyText); 
            setCopied(true);
        }, 100)
        // used to make sure dateclick event doesn't open add/edit form while user is copying
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(1000);
        setIsCopying(false);
    }
    // run when the copied alert is closed
    const handleCopiedClosed = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setCopied(false);
    }

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    
    function to12HourFormat(timeString) {
        // Splitting the time string into hours and minutes
        const [hour, minute] = timeString.split(":");
        const hours = parseInt(hour, 10);
        
        // Determining AM or PM
        let period = "AM";
        if (hours >= 12) {
            period = "PM";
        }
        
        // Converting 24-hour format to 12-hour format
        let hour12 = hours % 12;
        if (hour12 === 0) {
            hour12 = 12;
        }
        
        return `${hour12}:${minute} ${period}`;
    }
    
    


    // used for render the copy button on each day of the calendar
    const renderCopyButton = (content) => {
        const date = content.date;
    
        let year = date.toLocaleString("default", { year: "numeric" });
        let month = date.toLocaleString("default", { month: "2-digit" });
        let day = date.toLocaleString("default", { day: "2-digit" });
        let formattedDate = year + "-" + month + "-" + day;
    
        return (
            <div 
                onMouseEnter={() => setHoveredDay(formattedDate)}
                onMouseLeave={() => setHoveredDay(null)}
                style={{ 
                    display: "flex",
                    height: "100%",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "0px",
                    position: 'relative'   // To ensure child positioning
                }}
            >
                <IconButton 
                    id={formattedDate} 
                    onClick={(event) => handleCopy(event, formattedDate)}
                    aria-label="copy"
                    style={{
                        padding: "3px",
                        visibility: hoveredDay === formattedDate ? 'visible' : 'hidden',
                        position: 'absolute',  // Absolute positioning
                        right: '8px',          // Positioned to the right
                        top: '50%',            // Centered vertically
                        transform: 'translateY(-50%)'  // Adjust for exact centering
                    }}
                >
                    <ContentCopyIcon />
                </IconButton>
                <span style={{ marginLeft: "10px" }}>{content.dayNumberText}</span>
            </div>
        );
    }
    
    
    
    const downloadPDF = () => {
      
        html2canvas(document.querySelector('#calendar')).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            
            // Create a new instance of jsPDF in landscape mode
            const pdf = new jsPDF({
                orientation: 'landscape',
            });
    
            // Get the width and height of the canvas
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
    
            // Calculate the width-to-height ratio
            const canvasRatio = canvasWidth / canvasHeight;
    
            // Get the width and height of the PDF in points
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
    
            // Calculate the width and height for the image
            let imgWidth = pdfWidth;
            let imgHeight = pdfWidth / canvasRatio;
    
            // If the calculated height is greater than the PDF height, adjust accordingly
            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = pdfHeight * canvasRatio;
            }
    
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save("Calendar.pdf");
        });
    };

    

    return (
        <>
            <style jsx>{`
                .fc-event-title, .fc-event .fc-title {
                    white-space: normal;
                    overflow: visible;
                    lineHeight: 1.2;
                }
                .fc-daygrid-day.fc-day-other .fc-event {
                    display: none;
                }
                .fc-event{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
            `}</style>
    <div className='content' >
    <div className='calendarButtons' style={{paddingLeft: '30px', paddingTop:'15px'}}>

                <Button style={{ paddingRight: '30px' }}  startIcon={<KeyboardDoubleArrowLeftIcon />}  onClick={() => navigate('/venues')}> Return to Venues </Button>
                <Button variant="contained" endIcon ={<DownloadIcon />} onClick={downloadPDF}>Download as PDF</Button>
    </div>
                <div id="calendar" style={{paddingLeft: '30px', paddingRight: '30px', paddingTop: '30px', paddingBottom: '30px'}}
                >
                    <div className="calendar-container">
                    <FullCalendar
                        ref={calendarRef}
                        events={events}
                        headerToolbar={{
                            center: 'title',
                            right: 'prev,next today',
                            left: 'prev,next today'
                        }}
                        eventContent={({ event }) => (
                            <div 
                                style={{ 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '100%',
                                }}
                            >
                                <strong style={{ fontSize: '16px', color: 'black' }}>{event.title}</strong>
                                <br />
                                <i style={{ fontSize: '14px', fontWeight: 'bold' }}>{to12HourFormat(event.extendedProps.startTime)} - {to12HourFormat(event.extendedProps.endTime)}</i>
                            </div>
                        )}
                        contentHeight="auto"
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        dayCellContent={renderCopyButton}
                    />
                    </div>
                </div>
                
                <AddEditEvent
                    open={openForm}
                    setOpen={setOpenForm}
                    formType={formType}
                    event={currentEvent}
                />
                
                <Snackbar
                    open={copied}
                    autoHideDuration={3000}
                    onClose={handleCopiedClosed}
                >
                    <Alert onClose={handleCopiedClosed} severity="success" sx={{ width: '100%' }}>
                        Copied Text!
                    </Alert>
                </Snackbar>
            </div>
        </>
    );
            };
            export default Calendar    