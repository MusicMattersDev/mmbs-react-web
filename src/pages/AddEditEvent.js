import React, { useState, useEffect } from 'react';
import firebaseDb from "../firebase-config";  
import { Autocomplete, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
         FormControlLabel, FormLabel, InputAdornment, Radio, RadioGroup, Stack, TextField } from "@mui/material";
import { AttachMoney } from '@mui/icons-material';


export default function FormDialog(props) {
    
    const { open, setOpen, formType, event } = props;

    // formType should either be Add or Edit
    const title = `${formType} Event`;
    // event properties
    const [stage, setStage] = useState(event.stage);
    const [date, setDate] = useState(event.date);
    const tempMonth = (date !== undefined) ? new Date(event.date.replace(/-/g, '/')).toLocaleString('default', { month: 'long' }) : "";
    const tempYear = (date !== undefined) ? new Date(event.date.replace(/-/g, '/')).getFullYear() : "";
    // tempDay = Monday, Tuesday, etc.
    const tempDay = (date !== undefined) ? new Date(event.date.replace(/-/g, '/')).toLocaleString('default', { weekday: 'long' }) : "";
    // dayOfWeek - Monday is 1
    const dayOfWeek = (date !== undefined) ? new Date(event.date).getDay()+1 : "";
    const [weekDay, setWeekDay] = useState(new Date(event.date).getDay()+1);
    // event constants
    const [month, setMonth] = useState(tempMonth);
    const [year, setYear] = useState(tempYear);
    const [startTime, setStartTime] = useState(event.startTime);
    const [endTime, setEndTime] = useState(event.endTime);
    const [price, setPrice] = useState(event.price);
    const [performers, setPerformers] = useState(event.performers);
    const [email, setEmail] = useState(event.email);
    // used for holding an object of the clients for autocomplete
    const [clients, setClients] = useState({});
    const [clientsList, setClientsList] = useState();
    // logic for whether or not custom time or price fields are shown
    const [isTimeCustom, setIsTimeCustom] = React.useState(false);
    const [isPriceCustom, setIsPriceCustom] = React.useState(false);
    const [isFirstSpotTaken, setIsFirstSpotTaken] = React.useState(false);
    // default booking times based on days variables
    const d = new Date();
    let day = d.getDay();
    // const [day, setDay] = useState('');


    // get list of clients on render
    useEffect(() => {
        firebaseDb.child('database/clients').on('value', snapshot => {  
            if (snapshot.val() != null) {  
                setClients(snapshot.val());
            }
        })
    }, [])
    // format for autocomplete options
    useEffect(() => {
        let tempClientsList = [];
        tempClientsList = Object.keys(clients).map((key) => {
            return {
                label: clients[key].stage,
                emailLabel: clients[key].email,
                labelPerformer: clients[key].performers ? clients[key].performers.join(", ") : "",
                id: key
            };
        });
        setClientsList(tempClientsList);
    }, [clients])

    // runs when open, formType, and/or event changes
    useEffect(() => {
        // determine day of the week
        setWeekDay(dayOfWeek);

        // change defaults based on weekday
        const defaultValues = (() => {
            if (weekDay === 1 || weekDay === 2 || weekDay === 3 || weekDay === 4){
                return {
                    stage: "",
                    email: "NO_EMAIL_FOR_ARTIST",
                    performers: "",
                    time: "17:00-19:00",
                    startTime: "17:00",
                    endTime: "19:00",
                    price: 175
                };
            }
            else if(weekDay === 5){
                return {
                    stage: "",
                    email: "NO_EMAIL_FOR_ARTIST",
                    performers: "",
                    time: "17:00-19:30",
                    startTime: "17:00",
                    endTime: "19:30",
                    price: 185
                };
            }
            else{ // Saturday - Sunday
                return {
                    stage: "",
                    email: "NO_EMAIL_FOR_ARTIST",
                    performers: "",
                    time: "17:00-19:30",
                    startTime: "17:00",
                    endTime: "19:30",
                    price: 185
                };
            }
          })();

        // const defaultValues = tempDefaultValues;
        // if stage is not undefined, set to stage, else set to default value
        setStage((event.stage !== undefined) ? event.stage : defaultValues["stage"]);
        setEmail((event.email !== undefined) ? event.email : defaultValues["email"]);
        setPerformers((event.performers !== undefined) ? event.performers : defaultValues["performers"]);
        setDate(event.date);
        // formatting  |  YYYY-MM-DD  ---> YYYY/MM/DD  | then get month name and year of date
        const tempMonth = (event.date !== undefined) ? new Date(event.date.replace(/-/g, '/')).toLocaleString('default', { month: 'long' }) : "";
        const tempYear = (event.date !== undefined) ? new Date(event.date.replace(/-/g, '/')).getFullYear() : "";
        setMonth(tempMonth);
        setYear(tempYear);

        // if startTime and endTime are not undefined
        if (event.startTime !== undefined && event.endTime !== undefined) {
            setStartTime(event.startTime);
            setEndTime(event.endTime);
            const tempTime = event.startTime + "-" + event.endTime;
            // if time isn't a default option, isTimeCustom = true
            setIsTimeCustom((tempTime !== "17:00-19:00" && tempTime !== "19:00-21:00" && tempTime !== "17:00-19:30" && tempTime !== "19:30-22:00" && tempTime !== "17:00-19:30") ? true : false);
        // if they are undefined, set to default values
        } else {
            setStartTime(defaultValues["startTime"]);
            setEndTime(defaultValues["endTime"]);
            setIsTimeCustom(false);
        }
        // if price is not undefined
        if (event.price !== undefined) {
            const tempPrice = event.price;
            setPrice(tempPrice);
            // if price isn't a default option, isPriceCustom = true
            setIsPriceCustom((tempPrice !== 175 && tempPrice !== 350 && tempPrice !== 185 && tempPrice !== 380) ? true : false);
        // if price is undefined set to default value
        } else {
            setPrice(defaultValues["price"]);
            setIsPriceCustom(false);
        }
    }, [open, formType, event, weekDay])


    // set startTime and endTime. show / hide custom fields depending on selected option
    const handleTimeChange = (event) => {
        if (event.target.value !== "custom") {
            setIsTimeCustom(false)
            const [tempStart, tempEnd] = event.target.value.split("-");
            setStartTime(tempStart);
            setEndTime(tempEnd);
        } else {
            setIsTimeCustom(true);
            setStartTime(undefined);
            setEndTime(undefined);
        }
    };
    // set price. show / hide custom field depending on selected option
    const handlePriceChange = (event) => {
        if (event.target.value !== "custom") {
            setIsPriceCustom(false);
            setPrice(parseInt(event.target.value));
        } else {
            setIsPriceCustom(true);
            setPrice(undefined);
        }
    };
    // run on opening and closing add/edit form
    // Uncomment if you need a button to open the form
    // const handleClickOpen = () => { setOpen(true); };
    const handleClose = () => { setOpen(false); };

    // runs when submit button is clicked
    const submitEvent = () => {
        let clientID = ""
        // Get clientID associated with stage name
        Object.keys(clientsList).map((key) => {
            if (clientsList[key].label === stage) { clientID = clientsList[key].id };
            return clientID;
        })
        // create newEvent object that will be pushed to the database
        const newEvent = {
            stage: stage,
            email: email,
            performers: performers,
            date: date,
            startTime: startTime,
            endTime: endTime,
            price: price,
            clientID: clientID,
            venue: event.venue,
            start: (date + "T" + startTime),
            end: (date + "T" + endTime),
            month: month,
            year: year,
            // used because for some reason firebase won't let you query by multiple fields, so I made a field that combines multiple other fields
            venue_month_year: (event.venue + "__" + month + "__" + year)
        };
        // if the user is editing, replace the old event with the new event
        if (formType === "Edit") {
            firebaseDb.child('database/events/' + event.eventID).set(newEvent);
        // if the user is adding, add the new event to the database
        } else {
            firebaseDb.child('database/events').push(newEvent);
        }
        // close form
        setOpen(false);
    };
    // runs when delete button is clicked
    const deleteEvent = () => {
        // remove event
        firebaseDb.child('database/events/' + event.eventID).remove();
        // close form
        setOpen(false);
    }

    const currentClient = clientsList?.find(client => client.label === stage);

    return (
        <>
            {/* Uncomment if you need a button to open the form */}
            {/* <Button variant="outlined" onClick={handleClickOpen}>
                Open Add/Edit Venue Form
            </Button> */}

<Dialog open={open} onClose={handleClose}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ width: 500 }}>
                        {/* Client Input */}
                        
                        {(clientsList !== undefined && clientsList.length !== 0) && <Autocomplete
                            id="client"
                            options={clientsList.sort((a, b) => a.label - b.label)}
                            value={currentClient}
                            EmailVal={email}
                            onChange={(event, newValue) => {

                                // artist entered
                                if (newValue) {
                                    const { label, emailLabel, labelPerformer } = newValue;
                                    // determine if likely group
                                    if (label) {
                                        setStage(label);

                                        // Check for group and adjust price
                                        if(JSON.stringify(newValue.label).includes("&") || JSON.stringify(newValue.label).includes("Band") || JSON.stringify(newValue.label).includes("Duo") || JSON.stringify(newValue.label).includes("The ")){
                                            if(dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4){
                                                setPrice(350);
                                            }
                                            else{
                                                setPrice(380);
                                            }
                                       }
                                    }

                                    if (emailLabel) {
                                        setEmail(emailLabel);
                                    }

                                    if (labelPerformer) {
                                        setPerformers(labelPerformer)
                                    }
                                    // TODO: determine if earlier time slot taken already
                                } else {
                                    if (formType === "Add" ){
                                    setStage("");
                                    setEmail("NO_EMAIL_FOR_ARTIST");
                                    setPerformers("");
                                    }
                                }
                            }}
                            isOptionEqualToValue={(option, value) => option}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin="dense"
                                    label="Artist"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                    required
                                    // onChange={(event) => { setStage(event.target.value) }}
                                    // inputProps={{
                                    //     name: "stage" // make sure to set the name attribute
                                    // }}
                                    onChange={(event) => {
                                        if (event.target.name === "stage") {
                                          setStage(event.target.value);
                                        } else if (event.target.name === "email") {
                                          setEmail(event.target.value);
                                        }
                                      }}
                                        
                                />
                            )}
                        />}
                        {/* Date Input */}
                        <TextField 
                            margin="dense"
                            id="date"
                            label="Date"
                            type="date"
                            value={date}
                            required
                            fullWidth
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                            onChange={(event) => { setDate(event.target.value) }}
                        />
                        {/* Time Input */}
                        <FormControl required>
                            <FormLabel id="time-radio-buttons-group-label">Time</FormLabel>
                            {/* Preset Times */}
                            <RadioGroup
                                aria-labelledby="time-radio-buttons-group-label"
                                value={isTimeCustom ? "custom" : (startTime + "-" + endTime)}
                                name="time-radio-buttons-group"
                                onChange={handleTimeChange}
                            >

                                {/* first artist of the night */}
                                {(() => {
                                    switch (dayOfWeek) {
                                        // Monday - Thursdays are one time
                                        case 1:
                                        case 2:
                                        case 3:
                                        case 4:
                                            return <FormControlLabel value="17:00-19:00" control={<Radio />} label="5:00 PM - 7:00 PM" />;
                                        // Friday start time
                                        case 5:
                                            return <FormControlLabel value="17:00-19:30" control={<Radio />} label="5:00 PM - 7:30 PM" />;
                                        // Saturday - Sunday start time
                                        case 6:
                                        case 7:
                                            return <FormControlLabel value="17:00-19:30" control={<Radio />} label="5:00 PM - 7:30 PM" />;
                                        default:
                                            return <p>This is not a day of the week</p>;
                                        }
                                })()}

                                {/* second artist of the night */}
                                {(() => {
                                    switch (dayOfWeek) {
                                        // Monday - Thursdays are one time
                                        case 1:
                                        case 2:
                                        case 3:
                                        case 4:
                                            return <FormControlLabel value="19:00-21:00" control={<Radio />} label="7:00 PM - 9:00 PM" />;
                                        // Friday - Sundays are one time
                                        case 5:
                                        case 6:
                                        case 7:
                                            return <FormControlLabel value="19:30-22:00" control={<Radio />} label="7:30 PM - 10:00 PM" />;
                                        default:
                                            return <p>This is not a day of the week</p>;
                                        }
                                })()}

                                {/* display all times */}
                                {/* Monday - Thursday
                                <FormControlLabel value="17:00-19:00" control={<Radio />} label="5:00 PM - 7:00 PM" />
                                <FormControlLabel value="19:00-21:00" control={<Radio />} label="7:00 PM - 9:00 PM" />
                                Friday
                                <FormControlLabel value="17:00-19:30" control={<Radio />} label="5:00 PM - 7:30 PM" />
                                <FormControlLabel value="19:30-22:00" control={<Radio />} label="7:30 PM - 10:00 PM" />
                                Saturday - Sunday
                                <FormControlLabel value="17:30-19:30" control={<Radio />} label="5:30 PM - 7:30 PM" />
                                <FormControlLabel value="19:30-22:00" control={<Radio />} label="7:30 PM - 10:00 PM" /> */}

                                <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                            </RadioGroup>
                            {/* Custom Time Input */}
                            {isTimeCustom && <Stack spacing={2} sx={{ width: 500 }} direction="row" >
                                <tab></tab>
                                <TextField 
                                    margin="none"
                                    id="start-time"
                                    label="Start Time"
                                    value={startTime}
                                    type="time"
                                    variant="standard"
                                    InputLabelProps={{ shrink: true }}
                                    onChange={event => { setStartTime(event.target.value) }}
                                />
                                <TextField
                                    margin="none"
                                    id="end-time"
                                    label="End Time"
                                    value={endTime}
                                    type="time"
                                    variant="standard"
                                    InputLabelProps={{ shrink: true }}
                                    onChange={(event) => { setEndTime(event.target.value) }}    
                                />
                            </Stack>}
                        </FormControl>
                        {/* Price Input */}
                        <FormControl required>
                            <FormLabel id="price-radio-buttons-group-label">Price</FormLabel>
                            {/* Preset Prices */}
                            <RadioGroup
                                aria-labelledby="price-radio-buttons-group-label"
                                value={isPriceCustom ? "custom" : price}
                                name="price-radio-buttons-group"
                                onChange={handlePriceChange}
                            >
                                {/* prices based on day for individual*/}
                                {(() => {
                                    switch (dayOfWeek) {
                                        case 1:
                                        case 2:
                                        case 3:
                                        case 4:
                                            return <FormControlLabel value="175" type="number" control={<Radio />} label="$175" />;
                                        case 5:
                                        case 6:
                                        case 7:
                                            return <FormControlLabel value="185" type="number" control={<Radio />} label="$185" />;
                                        default:
                                            return <p>This is not a day of the week</p>;
                                        }
                                })()}

                                {/* prices based on day for group*/}
                                {(() => {
                                    switch (dayOfWeek) {
                                        case 1:
                                        case 2:
                                        case 3:
                                        case 4:
                                            return <FormControlLabel value="350" type="number" control={<Radio />} label="$350" />;
                                        case 5:
                                        case 6:
                                        case 7:
                                            return <FormControlLabel value="380" type="number" control={<Radio />} label="$380" />;;
                                        default:
                                            return <p>This is not a day of the week</p>;
                                        }
                                })()}

                                {/* display all prices */}
                                {/* <FormControlLabel value="175" type="number" control={<Radio />} label="$175" />
                                <FormControlLabel value="185" type="number" control={<Radio />} label="$185" />
                                <FormControlLabel value="350" type="number" control={<Radio />} label="$350" />
                                <FormControlLabel value="380" type="number" control={<Radio />} label="$380" /> */}

                                <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                            </RadioGroup>
                            {/* Custom Price Input */}
                            {isPriceCustom && <Stack spacing={2} sx={{ width: 500 }} direction="row" >
                                <tab></tab>
                                <TextField
                                    margin="dense"
                                    id="custom-price"
                                    value={price}
                                    label="Price"
                                    fullWidth
                                    variant="standard"
                                    onChange={(event) => { setPrice(parseFloat(event.target.value)) }}
                                    type="number"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                            <AttachMoney />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Stack>}
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    {/* Buttons */}
                    {formType === "Edit" && <Button color="error" onClick={deleteEvent}>Delete</Button>}
                    <div style={{flex: '1 0 0'}} />
                    <Button onClick={submitEvent}>Submit</Button>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}