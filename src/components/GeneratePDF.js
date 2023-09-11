import React, { useEffect, useState } from 'react';
import firebaseDb from "../firebase-config";
import { Page, Text, Document, View, PDFViewer, StyleSheet, Font, pdf, PDFDownloadLink} from "@react-pdf/renderer";
import { color, textAlign } from '@mui/system';
import { saveAs } from 'file-saver';
import { Button } from "@mui/material";
import JSZip from 'jszip';

Font.register({ family: "Times-Bold" });

const styles = StyleSheet.create({
    pdfViewer: {
        width: '100%',
        height: "70vw"
    },
    page: {
        // padding was 7
        padding: "10%",
        paddingBottom: "12%",
        fontFamily: "Times-Bold",
    },
    heading: {
        textAlign: "center",
        marginBottom: "25px",
        fontSize: "22px"
    },
    // Booking List & Email Subject List
    table: {
        width: '100%',
        // margin: "10px"
    },
    tableHeading: {
        marginVertical: "10px",
        fontSize: "16px"
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: '14px',
        textAlign: "center",
    },
    bookingTitle: {
        fontSize: '16px',
    },
    day: {
        // 5
        width: '5%'
    },
    artist: {
        // 40
        // 42 if header is font 22px
        width: '44%',
        textAlign: "left"
    },
    gigTime: {
        // 35%
        // 36 if header is font 22px
        width: '26%',
        textAlign: "left"
    },
    compensation: {
        // 20%
        // 22 if header is font 22px
        width: '30%'
    },
    subjectArtist: {
        width: '42%',
        textAlign: "left"
    },
    artistInfo: {
        width: '68%',
        textAlign: "left"
    },
    subjectRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: '13px',
        textAlign: "center",
        paddingBottom: '10px'
    },
    confirmationHeader: {
        fontSize: '15px',
        textAlign: "center",
        fontFamily: "Times-Bold",
        textTransform: "uppercase",
        marginBottom: "40px",
    },
    paragraph: {
        fontSize: '13px',
        textAlign: "center",
        marginBottom: "15px",
        lineHeight: "1.3",
    },
    documentField: {
        textDecoration: "underline",
    },
    phoneNumber: {
        textDecoration: "underline",
        color: "#000080"
    }
})


export function DownloadBookingList(props) {   
    const { month, year, venue, venueID } = props;
    const [events, setEvents] = useState({});
    const [bookings, setBookings] = useState([]);
    const [data, setData] = useState(<></>);

    // get list of events when month or venueID changes
    useEffect(() => {
        firebaseDb.child('database/events').orderByChild('venue_month_year').equalTo(venueID + "__" + month + "__" + year).on('value', (snapshot) => {  
            setEvents((snapshot.val() !== undefined) ? snapshot.val() : {});
        });
    }, [month, year, venueID])

    // format events into bookings for the pdf when events changes
    useEffect(() => {
        let tempBookings = [];

        if (events !== null && Object.keys(events).length !== 0) {
            tempBookings = Object.keys(events).map((key) => {
                const start = new Date(events[key].start);
                const end = new Date(events[key].end);
        
                return {
                    day: start.getDate(),
                    stage: events[key].stage,
                    // formatting  |  05:00 PM to 07:00 PM  --->  05:00 to 07:00
                    startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    // NOTE: hardcoded in the .00
                    price: events[key].price + ".00"
                };
            });
            // filter out entries with no stage name
            tempBookings = tempBookings.filter(tempBooking => tempBooking["stage"] !== undefined);
        }
        
        setBookings(tempBookings);
    }, [events])

    // sets new data for pdf rendering when bookings change
    useEffect(() => {
        let tempData = <></>;
        let fileName = (venue.name + " Booking List " + month + ", " + year);

        if (bookings !== null && Object.keys(bookings).length !== 0) {
            tempData = (
                <Document title={fileName}>
                    <Page style={styles.page}>
                        <View style={styles.heading} fixed>
                            {/* <Text>{venue.name} Live Music Bookings</Text> */}
                            <Text style={styles.bookingTitle}>The Exchange Live Music Bookings</Text>
                            <Text style={styles.bookingTitle}>by Date</Text>
                            <Text style={styles.bookingTitle}>{month} {year}</Text> 
                        </View>
                        {/* Table containing bookings */}
                        <View style={styles.table}>
                            {/* Column headers */}
                            <View style={[styles.row, styles.tableHeading]} fixed>
                                {/* <Text style={styles.day}></Text> */}
                                <Text style={styles.artist}>Artist</Text>
                                <Text style={styles.gigTime}>Gig Time</Text>
                                <Text style={styles.compensation}>Compensation</Text>
                            </View>
                            {/* Display sorted bookings by time and day */}
                            {bookings.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((booking, i) => (
                                <View key={i} style={styles.row} wrap={false}>
                                    <Text style={styles.artist}>{booking.day}-{booking.stage}</Text>
                                    <Text style={styles.gigTime}>
                                        {(booking.startTime.charAt(0) === "0") ? booking.startTime.substring(1) : booking.startTime} to {(booking.endTime.charAt(0) === "0") ? booking.endTime.substring(1) : booking.endTime}
                                    </Text>
                                    <Text style={styles.compensation}>${booking.price}</Text>
                                </View>
                            ))}
                        </View>
                    </Page>
                </Document>
            );
        } else {
            tempData = (<span>No bookings available</span>);
        }
        setData(tempData);
    }, [month, bookings, venue.name, year])

    return (
        <PDFDownloadLink document={data} fileName={((venue.name === "Renaissance-Exchange") ? "Exchange" : venue.name) + " Booking List " + month + ", " + year}>
          {({ blob, url, loading, error }) => (
            <Button variant="contained">
            {loading ? 'Loading Document...' : url ? 'Download' : 'Loading Document...'}
            </Button>
        )}
        </PDFDownloadLink>
    );
};

export function DownloadConfirmations(props) {
    const { month, year, venue, venueID } = props;

    const [events, setEvents] = useState({});
    const [confirmations, setConfirmations] = useState([]);
    const [data, setData] = useState('Generating Confirmations...');
    const [pdfBlobs, setPdfBlobs] = useState([]);

    // get list of events when month or venueID changes
    useEffect(() => {
        firebaseDb.child('database/events').orderByChild('venue_month_year').equalTo(venueID + "__" + month + "__" + year).on('value', (snapshot) => {
            setEvents((snapshot.val() !== undefined) ? snapshot.val() : {});
        });
    }, [month, year, venueID]);

    // format events into confirmations for the pdf when events changes
    useEffect(() => {
        // options for customizing date format
        const dateOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
        const dateOptions2 = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        let tempConfirmations = [];

        if (events !== null && Object.keys(events).length !== 0) {
            tempConfirmations = Object.keys(events).map((key) => {
                const start = new Date(events[key].start);
                const end = new Date(events[key].end);
                const dateStr = start.toLocaleDateString(undefined, dateOptions);
                const dateForFile = start.toLocaleDateString(undefined, dateOptions2);

                return {
                    day: start.getDate(),
                    stage: events[key].stage,
                    // formatting  |  05:00 PM to 07:00 PM  --->  05:00 to 07:00
                    startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    price: parseFloat(events[key].price + ".00").toFixed(2),
                    dateStr: dateStr,
                    dateForFile: dateForFile
                };
            });
            // filter out entries with no stage name
            tempConfirmations = tempConfirmations.filter(tempConfirmation => tempConfirmation["stage"] !== undefined);
        }
        setConfirmations(tempConfirmations);
    }, [events]);

    // sets new data for pdf rendering when confirmations change
    useEffect(() => {
        let venueName = venue.name;
        const venueText = {
            "Renaissance-Exchange": "The Renaissance/ Exchange Bar"
        };
        const venueAddress = `${venue.address.street1}, ${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
        const venueCityState = `${venue.address.city}, ${venue.address.state}.`;

        if (confirmations !== null && Object.keys(confirmations).length !== 0) {
            const pdfPromises = confirmations.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((confirmation, i) => {
                const fileName =(((venue.name === "Renaissance-Exchange") ? "Exchange" : venue.name) + "-Artist Confirmation-" + confirmation.dateForFile + ((confirmation.startTime === "05:00") ? " #1" : " #2"))
                const confirmationDataIndiv = (
                    <Document title={fileName}>
                        <Page key={i} style={styles.page}>
                            <View style={styles.confirmationHeader}>
                                <Text style={{ marginBottom: "15px" }}>{venueName} {venueCityState}</Text>
                                <Text style={{ marginBottom: "15px" }}>Live performance contract/confirmation</Text>
                                <Text>musicmattersbookings.com</Text> 
                            </View>
                            <View>
                                <Text style={styles.paragraph}>
                                    <Text style={styles.documentField}>{confirmation.stage}</Text> artist/performers agree to perform live music at {venueText[venueName] !== undefined ? venueText[venueName] : venueName}, {venueAddress} on the evening of <Text style={styles.documentField}>{confirmation.dateStr}</Text> between the listed hours of <Text style={styles.documentField}>{(confirmation.startTime.charAt(0) === "0") ? confirmation.startTime.substring(1) : confirmation.startTime}pm to {(confirmation.endTime.charAt(0) === "0") ? confirmation.endTime.substring(1) : confirmation.endTime}pm</Text> and {venueText[venueName] !== undefined ? venueText[venueName] : venueName} in {venueCityState} agrees to pay the above named artists <Text style={styles.documentField}>${confirmation.price}</Text> and said payment to be paid upon completion of this performance.
                                </Text>
                                <Text style={styles.paragraph}>
                                    If for reasons beyond your control you are unable to make your scheduled confirmed performance time and date; It is our expectation that you will contact Mike Moody at <Text style={styles.phoneNumber}>619-307-5866</Text>. If he cannot be reached please call Perry Wiley at <Text style={styles.phoneNumber}>334-224-3814</Text>. This should be done at the earliest possible time, but no later than four hours prior to your set. Thank you in advance for complying to this request. MusicMattersBookings.com and The {venueName}.
                                </Text>
                            </View>
                        </Page>
                    </Document>
                );
                // takes PDF data and converts to blob format before zipping
                return pdf(confirmationDataIndiv).toBlob().then(blob => {
                    setPdfBlobs(prevPdfBlobs => [...prevPdfBlobs, { fileName, blob }]);
                });
            })
            // gives user notification if pdf files were successfully generated for the specific location
            Promise.all(pdfPromises).then(() => {
                setData('            ** PDF files for zip successfully generated **');
            });
        } else {
            setData([<span key={0}>Processing Documents / None available</span>]);
        }
    }, [month, confirmations, venue, year]);

        // Zip all pdf confirmations
    function handleDownloadAll() {
        const zip = new JSZip();
        pdfBlobs.forEach(({ fileName, blob }) => {
            zip.file(fileName + '.pdf', blob);
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, 'Confirmations.zip');
        });
    }

    return (
        <div style={{ width: '70%' }}>
            <Button variant="contained" onClick={handleDownloadAll}>
                Download all Confirmations
            </Button>
            {data}
        </div>
    );
};

export function DownloadInvoices(props) { /* DONE!!!!!! */
    const { month, year, venue, venueID } = props;

    const [events, setEvents] = useState({});
    const [invoices, setInvoices] = useState([]);
    const [data, setData] = useState(<></>);
    const [pdfBlobs, setPdfBlobs] = useState([]);

    // get list of events when month or venueID changes
    useEffect(() => {
        firebaseDb.child('database/events').orderByChild('venue_month_year').equalTo(venueID + "__" + month + "__" + year).on('value', (snapshot) => {
            setEvents((snapshot.val() !== undefined) ? snapshot.val() : {});
        });
    }, [month, year, venueID]);

    // format events into invoices for the pdf when events changes
    useEffect(() => {
        // options for customizing date format
        const dateOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
        const dateOptions2 = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        let tempInvoices = [];

        if (events !== null && Object.keys(events).length !== 0) {
            tempInvoices = Object.keys(events).map((key) => {
                const start = new Date(events[key].start);
                const end = new Date(events[key].end);
                const dateStr = start.toLocaleDateString(undefined, dateOptions);
                const dateForFile = start.toLocaleDateString(undefined, dateOptions2);

                return {
                    day: start.getDate(),
                    stage: events[key].stage,
                    // formatting  |  05:00 PM to 07:00 PM  --->  05:00 to 07:00
                    startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    price: parseFloat(events[key].price + ".00").toFixed(2),
                    dateStr: dateStr,
                    dateForFile: dateForFile
                };
            });
            // filter out entries with no stage name
            tempInvoices = tempInvoices.filter(tempInvoice => tempInvoice["stage"] !== undefined);
        }
        setInvoices(tempInvoices);
    }, [events]);

    // sets new data for pdf rendering when invoices change
    useEffect(() => {
        let venueName = venue.name;
        const venueText = {
            "Renaissance-Exchange": "The Renaissance /Exchange Bar"
        };
        const venueAddress = `${venue.address.street1}, ${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
        const venueCityState = `${venue.address.city}, ${venue.address.state}.`;

        if (invoices !== null && Object.keys(invoices).length !== 0) {
            const pdfPromises = invoices.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((invoice, i) => {
                const fileName = ((venue.name === "Renaissance-Exchange") ? "Exchange" : venue.name) + " Booking Invoice-" + invoice.dateForFile + ((invoice.startTime === "05:00") ? " #1" : " #2");
                const invoiceDataIndiv = (
                    <Document title={fileName}>
                        <Page key={i} style={styles.page}>
                            <View style={styles.confirmationHeader}>
                                <Text style={{ marginBottom: "15px" }}>{venueName} {venueCityState}</Text>
                                <Text style={{ marginBottom: "15px" }}>Live performance contract/confirmation</Text>
                                <Text style={{ marginBottom: "15px" }}>Invoice</Text>
                                <Text>musicmattersbookings.com</Text>
                            </View>
                            <View>
                                <Text textBreakStrategy="simple" style={styles.paragraph}>
                                    <Text style={styles.documentField}>&nbsp;&nbsp;&nbsp;{invoice.stage}&nbsp;&nbsp;&nbsp;</Text> artist/performers agree to perform live music at {venueText[venueName] !== undefined ? venueText[venueName] : venueName}, {venueAddress} on the evening of <Text style={styles.documentField}>&nbsp;&nbsp;&nbsp;{invoice.dateStr}&nbsp;&nbsp;&nbsp;</Text> between the listed hours of <Text style={styles.documentField}>&nbsp;&nbsp;&nbsp;{(invoice.startTime.charAt(0) === "0") ? invoice.startTime.substring(1) : invoice.startTime}pm to {(invoice.endTime.charAt(0) === "0") ? invoice.endTime.substring(1) : invoice.endTime}pm&nbsp;&nbsp;&nbsp;</Text> and {venueText[venueName] !== undefined ? venueText[venueName] : venueName} in {venueCityState} agrees to pay the above named artists <Text style={styles.documentField}> ${invoice.price} </Text> and said payment to be paid upon completion of this performance.
                                </Text>
                            </View>
                        </Page>
                    </Document>
                );
            // takes PDF data and converts to blob format before zipping
                return pdf(invoiceDataIndiv).toBlob().then(blob => {
                    setPdfBlobs(prevPdfBlobs => [...prevPdfBlobs, { fileName, blob }]);
                });
            });

     // gives user notification if pdf files were successfully generated for the specific location
            Promise.all(pdfPromises).then(() => {
                setData('            ** PDF files for zip successfully generated **');
            });
        } else {
            setData([<span key={0}>Processing Documents / None Available</span>]);
        }
    }, [month, invoices, venue, year]);

    // Zip all pdf invoices
    function handleDownloadAll() {
        const zip = new JSZip();
        pdfBlobs.forEach(({ fileName, blob }) => {
            zip.file(fileName + '.pdf', blob);
        });
        zip.generateAsync({ type: 'blob' }).then(content => {
            saveAs(content, 'Invoices.zip');
        });
    }

    return (
        <div style={{ width: '70%' }}>
            <Button variant="contained" onClick={handleDownloadAll}>
                Download all Invoices
            </Button>
            {data}
        </div>
    );
};

export function DownloadSubjectLinesList(props) {   

const { month, year, venue, venueID } = props;

const [events, setEvents] = useState({});
const [bookings, setBookings] = useState([]);
const [data, setData] = useState(<></>);

// get list of events when month or venueID changes
useEffect(() => {
    firebaseDb.child('database/events').orderByChild('venue_month_year').equalTo(venueID + "__" + month + "__" + year).on('value', (snapshot) => {  
        setEvents((snapshot.val() !== undefined) ? snapshot.val() : {});
    });
}, [month, year, venueID])

// format events into bookings for the pdf when events changes
useEffect(() => {
    // options for customizing date format
    const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    let tempBookings = [];

    if (events !== null && Object.keys(events).length !== 0) {
        tempBookings = Object.keys(events).map((key) => {
            const start = new Date(events[key].start);
            const end = new Date(events[key].end);
            const dateStr = start.toLocaleDateString(undefined, dateOptions);
    
            return {
                day: start.getDate(),
                stage: events[key].stage,
                email: events[key].email,
                performer: events[key].performer,
                // formatting  |  05:00 PM to 07:00 PM  --->  05:00 to 07:00
                startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                // NOTE: hardcoded in the .00
                price: events[key].price + ".00",
                dateStr: dateStr
            };
        });
        // filter out entries with no stage name
        tempBookings = tempBookings.filter(tempBooking => tempBooking["stage"] !== undefined);
    }
    
    setBookings(tempBookings);
}, [events])

// sets new data for pdf rendering when bookings change
useEffect(() => {
    let tempData = <></>;
    const fileName = (venue.name + " Subect Line List " + month + ", " + year);

    if (bookings !== null && Object.keys(bookings).length !== 0) {
        tempData = (
            <Document title={fileName}>
                <Page style={styles.page}>
                    <View style={styles.heading}>
                        <Text style={styles.bookingTitle}>{venue.name} Live Music</Text>
                        <Text style={styles.bookingTitle}>Email Subject Line List</Text>
                        <Text style={styles.bookingTitle}>by Date</Text>
                        <Text style={styles.bookingTitle}>{month} {year}</Text> 
                    </View>
                    <View style={{ textAlign: 'center'}}>
                        <Text style={styles.bookingTitle}>{'\n'}Artist Confirmations Information{'\n'}</Text>
                    </View>
                    {/* Table containing infromation on pdf names and email subject lines for confirmations*/}
                    <View style={styles.table}>
                        {/* Column headers */}
                        <View style={[styles.subjectRow, styles.tableHeading]}>
                            <Text style={styles.subjectArtist}>Artist</Text>
                            <Text style={styles.artistInfo}>PDF File Name & Email Subject Line</Text>
                        </View>
                        {/* Display sorted bookings by time and day */}
                        {bookings.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((booking, i) => (
                            <View key={i} style={styles.subjectRow} wrap={false}>
                                {/* <Text style={styles.subjectArtist}>{booking.day}-{booking.stage}</Text> */}
                                {/* <Text style={styles.subjectArtist}>{booking.day}</Text> */}
                                <Text style={styles.subjectArtist}>{booking.email}</Text>
                                <Text textBreakStrategy="simple" style={styles.artistInfo}>
                                    {(venue.name === "Renaissance-Exchange") ? (<Text>Exchange</Text> ) : (<Text>venue.name</Text>)}-Artist Confirmation-{booking.dateStr}&nbsp;{(booking.startTime === "05:00") ? (<Text>#1</Text> ) : (<Text>#2</Text>)}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <View style={{ textAlign: 'center'}}>
                        <Text style={styles.bookingTitle}>{'\n'}Invoices Information{'\n'}</Text>
                    </View>
                    {/* Table containing infromation on pdf names and email subject lines for invoices */}
                    <View style={styles.table}>
                        {/* Column headers */}
                        <View style={[styles.subjectRow, styles.tableHeading]}>
                            <Text style={styles.subjectArtist}>Artist</Text>
                            <Text style={styles.artistInfo}>PDF File Name & Email Subject Line</Text>
                        </View>
                        {/* Display sorted bookings by time and day */}
                        {bookings.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((booking, i) => (
                            <View key={i} style={styles.subjectRow} wrap={false}>
                                <Text style={styles.subjectArtist}>{booking.day}-{booking.stage}</Text>
                                <Text textBreakStrategy="simple" style={styles.artistInfo}>
                                    {(venue.name === "Renaissance-Exchange") ? (<Text>Exchange</Text> ) : (<Text>venue.name</Text>)}&nbsp;Booking Invoice-{booking.dateStr}&nbsp;{(booking.startTime === "05:00") ? (<Text>#1</Text> ) : (<Text>#2</Text>)}
                                    {'\n'}
                                    
                                </Text>
                            </View>
                        ))}
                    </View>
                </Page>
            </Document>
        );
    } else {
        tempData = (<span>No subject lines available</span>);
    }
    setData(tempData);
}, [month, bookings, venue.name, year])

return (
    <PDFDownloadLink document={data} fileName={((venue.name === "Renaissance-Exchange") ? "Exchange" : venue.name) + " Subject Lines List " + month + ", " + year}>
        {({ blob, url, loading, error }) => (
        <Button variant="contained">
        {loading ? 'Loading Document...' : url ? 'Download' : 'Loading Document...'}
        </Button>
    )}
    </PDFDownloadLink>
    );
};
  
export function BookingList(props) {    
    const { month, year, venue, venueID } = props;

    const [events, setEvents] = useState({});
    const [bookings, setBookings] = useState([]);
    const [data, setData] = useState(<></>);

    // get list of events when month or venueID changes
    useEffect(() => {
        firebaseDb.child('database/events').orderByChild('venue_month_year').equalTo(venueID + "__" + month + "__" + year).on('value', (snapshot) => {  
            setEvents((snapshot.val() !== undefined) ? snapshot.val() : {});
        });
    }, [month, year, venueID])

    // format events into bookings for the pdf when events changes
    useEffect(() => {
        let tempBookings = [];

        if (events !== null && Object.keys(events).length !== 0) {
            tempBookings = Object.keys(events).map((key) => {
                const start = new Date(events[key].start);
                const end = new Date(events[key].end);
        
                return {
                    day: start.getDate(),
                    stage: events[key].stage,
                    // formatting  |  05:00 PM to 07:00 PM  --->  05:00 to 07:00
                    startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    // NOTE: hardcoded in the .00
                    price: events[key].price + ".00"
                };
            });
            // filter out entries with no stage name
            tempBookings = tempBookings.filter(tempBooking => tempBooking["stage"] !== undefined);
        }
        
        setBookings(tempBookings);
    }, [events])

    // sets new data for pdf rendering when bookings change
    useEffect(() => {
        let tempData = <></>;
        const fileName = (venue.name + " Booking List " + month + ", " + year);

        if (bookings !== null && Object.keys(bookings).length !== 0) {
            tempData = (
                <>
                    <PDFViewer style={styles.pdfViewer}>
                        <Document title={fileName}>
                            <Page style={styles.page}>
                                <View style={styles.heading} fixed>
                                    {/* <Text>{venue.name} Live Music Bookings</Text> */}
                                    <Text style={styles.bookingTitle}>The Exchange Live Music Bookings</Text>
                                    <Text style={styles.bookingTitle}>by Date</Text>
                                    <Text style={styles.bookingTitle}>{month} {year}</Text> 
                                </View>
                                {/* Table containing bookings */}
                                <View style={styles.table}>
                                    {/* Column headers */}
                                    <View style={[styles.row, styles.tableHeading]} fixed>
                                        {/* <Text style={styles.day}></Text> */}
                                        <Text style={styles.artist}>Artist</Text>
                                        <Text style={styles.gigTime}>Gig Time</Text>
                                        <Text style={styles.compensation}>Compensation</Text>
                                    </View>
                                    {/* Display sorted bookings by time and day */}
                                    {bookings.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((booking, i) => (
                                        <View key={i} style={styles.row} wrap={false}>
                                            <Text style={styles.artist}>{booking.day}-{booking.stage}</Text>
                                            {/* <Text style={styles.day}>{booking.day}-</Text>
                                            <Text style={styles.artist}>{booking.stage}</Text> */}
                                            <Text style={styles.gigTime}>
                                                {(booking.startTime.charAt(0) === "0") ? booking.startTime.substring(1) : booking.startTime} to {(booking.endTime.charAt(0) === "0") ? booking.endTime.substring(1) : booking.endTime}
                                            </Text>
                                            <Text style={styles.compensation}>${booking.price}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Page>
                        </Document>
                    </PDFViewer>
                </>
            );
        } else {
            tempData = (<span>No bookings available</span>);
        }
        setData(tempData);
    }, [month, bookings, venue.name, year])

    return(data);
}

export function ArtistConfirmation(props) {
    const { month, year, venue, venueID } = props;
    
    const [events, setEvents] = useState({});
    const [confirmations, setConfirmations] = useState([]);
    const [data, setData] = useState(<></>);

    // get list of events when month or venueID changes
    useEffect(() => {
        firebaseDb.child('database/events').orderByChild('venue_month_year').equalTo(venueID + "__" + month + "__" + year).on('value', (snapshot) => {  
            setEvents((snapshot.val() !== undefined) ? snapshot.val() : {});
        });
    }, [month, year, venueID])

    // format events into confirmations for the pdf when events changes
    useEffect(() => {
        // options for customizing date format
        const dateOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
        const dateOptions2 = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        let tempConfirmations = [];

        if (events !== null && Object.keys(events).length !== 0) {
            tempConfirmations = Object.keys(events).map((key) => {
                const start = new Date(events[key].start);
                const end = new Date(events[key].end);
                const dateStr = start.toLocaleDateString(undefined, dateOptions);
                const dateForFile = start.toLocaleDateString(undefined, dateOptions2);
        
                return {
                    day: start.getDate(),
                    stage: events[key].stage,
                    // formatting  |  05:00 PM to 07:00 PM  --->  05:00 to 07:00
                    startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    price: parseFloat(events[key].price + ".00").toFixed(2),
                    dateStr: dateStr,
                    dateForFile: dateForFile
                };
            });
            // filter out entries with no stage name
            tempConfirmations = tempConfirmations.filter(tempConfirmation => tempConfirmation["stage"] !== undefined);
        }
        setConfirmations(tempConfirmations);
    }, [events])

    // sets new data for pdf rendering when confirmations change
    useEffect(() => {
        let tempData = <></>;
        let venueName = venue.name;
        // correct formatting for venue name
        // if (venueName === "Renaissance-Exchange"){
        //     venueName = "Renaissance/Exchange"
        // };
        const venueText = {
            "Renaissance-Exchange": "The Renaissance/ Exchange Bar"
        };
        const venueAddress = `${venue.address.street1}, ${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
        const venueCityState = `${venue.address.city}, ${venue.address.state}.`
        // const fileName = (venueName + " Artist Confirmation " + month + ", " + year);

        if (confirmations !== null && Object.keys(confirmations).length !== 0) {
            tempData = confirmations.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((confirmation, i) => {
                const fileName =(((venue.name === "Renaissance-Exchange") ? "Exchange" : venue.name) + "-Artist Confirmation-" + confirmation.dateForFile + ((confirmation.startTime === "05:00") ? " #1" : " #2"))
                const confirmationDataIndiv = (
                    <>
                        <PDFViewer key={i} style={styles.pdfViewer}>
                            <Document title={fileName}>
                                <Page key={i} style={styles.page}>
                                    <View style={styles.confirmationHeader}>
                                        <Text style={{ marginBottom: "15px" }}>{venueName} {venueCityState}</Text>
                                        <Text style={{ marginBottom: "15px" }}>Live performance contract/confirmation</Text>
                                        <Text>musicmattersbookings.com</Text> 
                                    </View>
                                    <View>
                                        <Text style={styles.paragraph}>
                                            <Text style={styles.documentField}>{confirmation.stage}</Text> artist/performers agree to perform live music at {venueText[venueName] !== undefined ? venueText[venueName] : venueName}, {venueAddress} on the evening of <Text style={styles.documentField}>{confirmation.dateStr}</Text> between the listed hours of <Text style={styles.documentField}>{(confirmation.startTime.charAt(0) === "0") ? confirmation.startTime.substring(1) : confirmation.startTime}pm to {(confirmation.endTime.charAt(0) === "0") ? confirmation.endTime.substring(1) : confirmation.endTime}pm</Text> and {venueText[venueName] !== undefined ? venueText[venueName] : venueName} in {venueCityState} agrees to pay the above named artists <Text style={styles.documentField}>${confirmation.price}</Text> and said payment to be paid upon completion of this performance.
                                        </Text>
                                        <Text style={styles.paragraph}>
                                            If for reasons beyond your control you are unable to make your scheduled confirmed performance time and date; It is our expectation that you will contact Mike Moody at <Text style={styles.phoneNumber}>619-307-5866</Text>. If he cannot be reached please call Perry Wiley at <Text style={styles.phoneNumber}>334-224-3814</Text>. This should be done at the earliest possible time, but no later than four hours prior to your set. Thank you in advance for complying to this request. MusicMattersBookings.com and The {venueName}.
                                        </Text>
                                    </View>
                                </Page>
                            </Document>
                        </PDFViewer>
                    </>
                );
                return confirmationDataIndiv
            });
        } else {
            tempData = (<span>No confirmations available</span>);
        }
        setData(tempData);
    }, [month, confirmations, venue, year])

    return(data);
}

export function ArtistInvoice(props) {
    const { month, year, venue, venueID } = props;

    const [events, setEvents] = useState({});
    const [invoices, setInvoices] = useState([]);
    const [data, setData] = useState(<></>);

    // get list of events when month or venueID changes
    useEffect(() => {
        firebaseDb.child('database/events').orderByChild('venue_month_year').equalTo(venueID + "__" + month + "__" + year).on('value', (snapshot) => {  
            setEvents((snapshot.val() !== undefined) ? snapshot.val() : {});
        });
    }, [month, year, venueID])

    // format events into invoices for the pdf when events changes
    useEffect(() => {
        // options for customizing date format
        const dateOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
        const dateOptions2 = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        let tempInvoices = [];

        if (events !== null && Object.keys(events).length !== 0) {
            tempInvoices = Object.keys(events).map((key) => {
                const start = new Date(events[key].start);
                const end = new Date(events[key].end);
                const dateStr = start.toLocaleDateString(undefined, dateOptions);
                const dateForFile = start.toLocaleDateString(undefined, dateOptions2);
        
                return {
                    day: start.getDate(),
                    stage: events[key].stage,
                    // formatting  |  05:00 PM to 07:00 PM  --->  05:00 to 07:00
                    startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    price: parseFloat(events[key].price + ".00").toFixed(2),
                    dateStr: dateStr,
                    dateForFile: dateForFile
                };
            });
            // filter out entries with no stage name
            tempInvoices = tempInvoices.filter(tempInvoice => tempInvoice["stage"] !== undefined);
        }
        setInvoices(tempInvoices);
    }, [events])

    // sets new data for pdf rendering when invoices change
    useEffect(() => {
        let tempData = <></>;
        let venueName = venue.name;
        const venueText = {
            "Renaissance-Exchange": "The Renaissance /Exchange Bar"
        };
        const venueAddress = `${venue.address.street1}, ${venue.address.city}, ${venue.address.state} ${venue.address.zip}`;
        const venueCityState = `${venue.address.city}, ${venue.address.state}.`

        if (invoices !== null && Object.keys(invoices).length !== 0) {
            tempData = invoices.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((invoice, i) => {
                const fileName = ((venue.name === "Renaissance-Exchange") ? "Exchange" : venue.name) + " Booking Invoice-" + invoice.dateForFile + ((invoice.startTime === "05:00") ? " #1" : " #2");;
                const invoiceDataIndiv = (
                    <>
                        <PDFViewer key={i} style={styles.pdfViewer}>
                            <Document title={fileName}>
                            {/* <Document onRender={ (blob) => onRenderDocument(blob, 'myCustomFilename.pdf') } title={fileName}> */}
                                <Page key={i} style={styles.page}>
                                    <View style={styles.confirmationHeader}>
                                        <Text style={{ marginBottom: "15px" }}>{venueName} {venueCityState}</Text>
                                        <Text style={{ marginBottom: "15px" }}>Live performance contract/confirmation</Text>
                                        <Text style={{ marginBottom: "15px" }}>Invoice</Text> 
                                        <Text>musicmattersbookings.com</Text>
                                    </View>
                                    <View>
                                        <Text textBreakStrategy="simple" style={styles.paragraph}>
                                            <Text style={styles.documentField}>&nbsp;&nbsp;&nbsp;{invoice.stage}&nbsp;&nbsp;&nbsp;</Text> artist/performers agree to perform live music at {venueText[venueName] !== undefined ? venueText[venueName] : venueName}, {venueAddress} on the evening of <Text style={styles.documentField}>&nbsp;&nbsp;&nbsp;{invoice.dateStr}&nbsp;&nbsp;&nbsp;</Text> between the listed hours of <Text style={styles.documentField}>&nbsp;&nbsp;&nbsp;{(invoice.startTime.charAt(0) === "0") ? invoice.startTime.substring(1) : invoice.startTime}pm to {(invoice.endTime.charAt(0) === "0") ? invoice.endTime.substring(1) : invoice.endTime}pm&nbsp;&nbsp;&nbsp;</Text> and {venueText[venueName] !== undefined ? venueText[venueName] : venueName} in {venueCityState} agrees to pay the above named artists <Text style={styles.documentField}> ${invoice.price} </Text> and said payment to be paid upon completion of this performance.
                                        </Text>
                                    </View>
                                </Page>
                            </Document>
                        </PDFViewer>
                    </>
                );
                return invoiceDataIndiv;
            });
        } else {
            tempData = (<span>No invoices available</span>);
            // setData(tempData);
        }
        setData(tempData);
    }, [month, invoices, venue, year])
    
    return(data);
}

export function SubjectList(props) {    
    const { month, year, venue, venueID } = props;

    const [events, setEvents] = useState({});
    const [bookings, setBookings] = useState([]);
    const [data, setData] = useState(<></>);

    // get list of events when month or venueID changes
    useEffect(() => {
        firebaseDb.child('database/events').orderByChild('venue_month_year').equalTo(venueID + "__" + month + "__" + year).on('value', (snapshot) => {  
            setEvents((snapshot.val() !== undefined) ? snapshot.val() : {});
        });
    }, [month, year, venueID])

    // format events into bookings for the pdf when events changes
    useEffect(() => {
        // options for customizing date format
        const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        let tempBookings = [];

        if (events !== null && Object.keys(events).length !== 0) {
            tempBookings = Object.keys(events).map((key) => {
                const start = new Date(events[key].start);
                const end = new Date(events[key].end);
                const dateStr = start.toLocaleDateString(undefined, dateOptions);
        
                return {
                    day: start.getDate(),
                    stage: events[key].stage,
                    // formatting  |  05:00 PM to 07:00 PM  --->  05:00 to 07:00
                    startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(" ")[0].replace(/AM|PM/g, "").trim(),
                    // NOTE: hardcoded in the .00
                    price: events[key].price + ".00",
                    dateStr: dateStr
                };
            });
            // filter out entries with no stage name
            tempBookings = tempBookings.filter(tempBooking => tempBooking["stage"] !== undefined);
        }
        
        setBookings(tempBookings);
    }, [events])

    // sets new data for pdf rendering when bookings change
    useEffect(() => {
        let tempData = <></>;
        const fileName = (venue.name + " Subect Line List " + month + ", " + year);

        if (bookings !== null && Object.keys(bookings).length !== 0) {
            tempData = (
                <>
                    <PDFViewer style={styles.pdfViewer}>
                        <Document title={fileName}>
                            <Page style={styles.page}>
                                <View style={styles.heading}>
                                    <Text style={styles.bookingTitle}>{venue.name} Live Music</Text>
                                    <Text style={styles.bookingTitle}>Email Subject Line List</Text>
                                    <Text style={styles.bookingTitle}>by Date</Text>
                                    <Text style={styles.bookingTitle}>{month} {year}</Text> 
                                </View>
                                <View style={{ textAlign: 'center'}}>
                                    <Text style={styles.bookingTitle}>{'\n'}Artist Confirmations Information{'\n'}</Text>
                                </View>
                                {/* Table containing infromation on pdf names and email subject lines for invoices*/}
                                <View style={styles.table}>
                                    {/* Column headers */}
                                    <View style={[styles.subjectRow, styles.tableHeading]}>
                                        <Text style={styles.subjectArtist}>Artist</Text>
                                        <Text style={styles.artistInfo}>PDF File Name & Email Subject Line</Text>
                                    </View>
                                    {/* Display sorted bookings by time and day */}
                                    {bookings.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((booking, i) => (
                                        <View key={i} style={styles.subjectRow} wrap={false}>
                                            <Text style={styles.subjectArtist}>{booking.day}-{booking.stage}</Text>
                                            <Text textBreakStrategy="simple" style={styles.artistInfo}>
                                                {(venue.name === "Renaissance-Exchange") ? (<Text>Exchange</Text> ) : (<Text>venue.name</Text>)}-Artist Confirmation-{booking.dateStr}&nbsp;{(booking.startTime === "05:00") ? (<Text>#1</Text> ) : (<Text>#2</Text>)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                <View style={{ textAlign: 'center'}}>
                                    <Text style={styles.bookingTitle}>{'\n'}Invoices Information{'\n'}</Text>
                                </View>
                                {/* Table containing infromation on pdf names and email subject lines for confirmations*/}
                                <View style={styles.table}>
                                    {/* Column headers */}
                                    <View style={[styles.subjectRow, styles.tableHeading]}>
                                        {/* <Text style={styles.day}></Text> */}
                                        <Text style={styles.subjectArtist}>Artist</Text>
                                        <Text style={styles.artistInfo}>PDF File Name & Email Subject Line</Text>
                                    </View>
                                    {/* Display sorted bookings by time and day */}
                                    {bookings.sort((a, b) => a.day - b.day || a.startTime.substring(0, 2) - b.startTime.substring(0, 2)).map((booking, i) => (
                                        <View key={i} style={styles.subjectRow} wrap={false}>
                                            <Text style={styles.subjectArtist}>{booking.day}-{booking.stage}</Text>
                                            <Text textBreakStrategy="simple" style={styles.artistInfo}>
                                                {(venue.name === "Renaissance-Exchange") ? (<Text>Exchange</Text> ) : (<Text>venue.name</Text>)}&nbsp;Booking Invoice-{booking.dateStr}&nbsp;{(booking.startTime === "05:00") ? (<Text>#1</Text> ) : (<Text>#2</Text>)}
                                                {'\n'}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </Page>
                        </Document>
                    </PDFViewer>
                </>
            );
        } else {
            tempData = (<span>No subject lines available</span>);
        }
        setData(tempData);
    }, [month, bookings, venue.name, year])

    return(data);
}