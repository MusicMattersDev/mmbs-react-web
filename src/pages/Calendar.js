import React, { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction"
import firebaseDb from "../firebase-config";  
import { useParams } from 'react-router-dom'
import '../App.css';
import AddEditEvent from './AddEditEvent'
import { IconButton, Snackbar, Alert } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


const Calendar = () => {
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
                        startTime: obj[key].startTime,
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
            startTime: info.event.extendedProps.startTime,
            endTime: info.event.extendedProps.endTime,
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
            copyText += ((start.charAt(0) === "0") ? start.substring(1) : start)  + " to " + ((end.charAt(0) === "0") ? end.substring(1) : end) + "\n";
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

    // used for render the copy button on each day of the calendar
    const renderCopyButton = (content) => {
        const date = content.date;

        let year = date.toLocaleString("default", { year: "numeric" });
        let month = date.toLocaleString("default", { month: "2-digit" });
        let day = date.toLocaleString("default", { day: "2-digit" });
        let formattedDate = year + "-" + month + "-" + day;

        return (
            <div style={{ 
                display: "flex",
                height: "100%",
                width: "100%",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "0px"
            }}>
                <IconButton id={formattedDate} onClick={(event) => handleCopy(event, formattedDate)}
                    aria-label="copy"
                    style={{
                        padding: "3px"
                    }}>
                        <ContentCopyIcon />
                </IconButton>
                <span style={{ marginLeft: "10px" }}>{content.dayNumberText}</span>
            </div>
        );   
    }

    return (
        <>
            <div className='content'>
                <FullCalendar
                    events={events}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    dayCellContent={renderCopyButton}
                />
            </div>  
            <AddEditEvent
                open={openForm}
                setOpen={setOpenForm}
                formType={formType}
                event={currentEvent}
            >
            </AddEditEvent>
            <Snackbar
                open={copied}
                autoHideDuration={3000}
                onClose={handleCopiedClosed}
            >
                <Alert onClose={handleCopiedClosed} severity="success" sx={{ width: '100%' }}>
                    Copied Text!
                </Alert>
            </Snackbar>
        </>
    )
}

export default Calendar;