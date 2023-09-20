import React, { useState, useEffect } from 'react';  
import firebaseDb from "../firebase-config";  
import { FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import AddEditClient from './AddEditClient';  
import * as XLSX from "xlsx";



const Clients= () => {  
  
    var [currentId, setCurrentId] = useState('');  
    var [ClientObj, setClientObj] = useState({})  

    useEffect(() => {  
        firebaseDb.child('database/clients').on('value', snapshot => {  
            if (snapshot.val() != null) {  
                setClientObj({  
                    ...snapshot.val()  
                });  
            }  else{
               setClientObj({});
            }
        })  
    }, [])  

    const addOrEdit = (obj) => {  
        if (currentId === '')  
            firebaseDb.child('database/clients').push(  
                obj,  
                err => {  
                    if (err)  
                        console.log(err)  
                    else  
                        setCurrentId('')  
                })  
        else  
            firebaseDb.child(`database/clients/${currentId}`).set(  
                obj,  
                err => {  
                    if (err)  
                        console.log(err)  
                    else  
                        setCurrentId('')  
                })  
    }  
  
    const onDelete = id => {  
        if (window.confirm('Are you sure to delete this client?')) {  
            firebaseDb.child(`database/clients/${id}`).remove(  
                err => {  
                    if (err)  
                        console.log(err)  
                    else  
                        setCurrentId('')  
                })  
        }  
    }  

    // search for artists
    const[query, setQuery] = useState('')
    const changeHandler = (event) => {
        setQuery(event.target.value)
    }

    const sortClients = (a, b) => {
        if (ClientObj[a].stage.toLowerCase() < ClientObj[b].stage.toLowerCase()) return -1;
        if (ClientObj[a].stage.toLowerCase() > ClientObj[b].stage.toLowerCase()) return 1;
        return 0;
    }
    
    const filteredArtists = Object.keys(ClientObj).filter(key => {
        return ClientObj[key].stage.toLowerCase().includes(query.toLowerCase()) || ClientObj[key].email.toLowerCase().includes(query.toLowerCase())
    }).sort(sortClients);


    //----------------------------  Added on 8/30/22 -----------------------------//
  
    const [EventsObj, setEventsObj] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);  // Default to current month
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());  // Default to current year
    

    useEffect(() => {  
        firebaseDb.child('database/events').on('value', snapshot => {  
            if (snapshot.val() != null) {  
                setEventsObj({  
                    ...snapshot.val()  
                });  
            }  else {
               setEventsObj({});
            }
        });  
    }, []);

    function renderMonthYearDropdowns() {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
    
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 10 }, (_, index) => currentYear - index); // Last 10 years
    
        return (
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" style={{ width: '100%' }}> 
                {/* Dropdowns */}
                <Stack direction="row" spacing={2} alignItems="center">
                    {/* Month Selector */}
                    <FormControl variant="filled" sx={{ m: 1, minWidth: 135 }}>
                        <InputLabel id="client-month-select-label">Month</InputLabel>
                        <Select
                            labelId="client-month-select-label"
                            id="client-month-select"
                            value={selectedMonth}
                            label="Month"
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                        >
                            {months.map((month, index) => 
                                <MenuItem key={month} value={index + 1}>{month}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                
                    {/* Year Selector */}
                    <FormControl variant="filled" sx={{ m: 1, minWidth: 90 }}>
                        <InputLabel id="client-year-select-label">Year</InputLabel>
                        <Select
                            labelId="client-year-select-label"
                            id="client-year-select"
                            value={selectedYear}
                            label="Year"
                            onChange={e => setSelectedYear(Number(e.target.value))}
                        >
                            {years.map(year => 
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Stack>

                <Stack direction="column" spacing={0.5} style={{ flex: 1 }}>
                    <button  onClick={downloadAsGoogleSheet}>Download as Google Sheet</button>
                    <button  onClick={downloadAsExcel}>Download as Excel Spreadsheet</button>
                </Stack>
                
                
            </Stack>
        );
    }

    function getExcelFileName() {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
    
        return `${months[selectedMonth - 1]}${selectedYear}Events.xlsx`;
    }

    const downloadAsExcel = () => {
        // Adjust month since JavaScript months are 0-indexed (0 for January, 1 for February, etc.)
        const adjustedMonth = parseInt(selectedMonth) - 1; 
        const startDate = new Date(selectedYear, adjustedMonth, 1).toISOString();
        const nextMonthFirstDate = new Date(selectedYear, adjustedMonth + 1, 1);
        const endDate = new Date(nextMonthFirstDate - 1).toISOString(); // One millisecond before the next month starts
        const filename = getExcelFileName();
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
    
        // Filter events within the range
        const filteredEvents = Object.values(EventsObj).filter(event => 
            event.start >= startDate && event.start <= endDate
        );
        
        if (filteredEvents.length === 0) {
            alert("No data available for the selected month.");
            return;
        }
        
        // Convert filtered data to worksheet
        const ws = XLSX.utils.json_to_sheet(filteredEvents);
        
        // Create a workbook
        const wb = XLSX.utils.book_new();
        
        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, `${months[selectedMonth - 1]}Events`);
        
        // Write the workbook and trigger the download
        XLSX.writeFile(wb, filename);
    }

      const downloadAsGoogleSheet = () => {
        // Fetch the data from Firebase
        const data = Object.values(ClientObj);
    
        // Convert the data to the Google Sheets format
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'ClientDetails.ods');
    };

    //----------------------------------------------------------------------------//

    return (  
        <div className="content">  
            <div className="card-body pb-0">  
                <div className="card">  
                    <div className="card-header main-search dash-search">  
                        <h3>  
                            Client Information Details 
                        </h3>  
                    </div>  
                </div>  
                <div className="row">  
                    <AddEditClient {...({ currentId, ClientObj, addOrEdit })}></AddEditClient>
                    <div className="col-12 col-md-12">  
                        <div className="card">  
                            <div className="card-header">Client Search</div>
                                <br/>  
                                <input type="text" value={query} placeholder="search for clients..." onChange={changeHandler} style={{ margin: "0px 10px"}}/>
                                {/* <button id="searchButton" className="btn btn-info">Search</button> */}
                                <br/>  
                        </div>  
                    </div> 
                    <div className="col-12 col-md-12">  
                        <div className="card">  
                            <div className="card-header">Client Management</div>  
                        
                            {renderMonthYearDropdowns()}
                            

                            <div className="card-body position-relative">  
                                <div className="table-responsive cnstr-record product-tbl">  
                                    <table className="table table-bordered heading-hvr">  
                                        <thead>  
                                            <tr>  
                                                <th className="active">Stage Name</th>  
                                                <th>Performers</th>  
                                                <th>Email</th>
                                                <th>Split Check?</th>
                                                <th>Bio</th>  
                                                <th width="60"> </th>  
                                                <th width="60"> </th>  
                                            </tr>  
                                        </thead>  
                                        <tbody>  
                                            {  
                                                // Object.keys(ClientObj).map((key) => (  
                                                filteredArtists.map((key) => (  
                                                    <tr key={key}>  
                                                        <td>{ClientObj[key].stage}</td> 
                                                        <td>{ClientObj[key].performers ? ClientObj[key].performers.join(", ") : ""}</td>   
                                                        <td>{ClientObj[key].email}</td>
                                                        <td>{ClientObj[key].splitCheck ? "Yes" : "No"}</td>
                                                        <td>{ClientObj[key].bio}</td>
  
                                                        <td className="case-record">  
                                                            <button type="button" className="btn btn-info"  
                                                                onClick={() => { setCurrentId(key) }}>Edit</button>  
  
                                                        </td>  
                                                        <td> <button type="button" className="btn btn-danger"  
                                                            onClick={() => { onDelete(key) }}>Delete</button></td>  
                                                    </tr>  
                                                ))  
                                            }  
                                        </tbody>  
                                    </table>  
                                </div>  
                            </div>  
                        </div>  
                    </div>  
                </div>  
            </div>  
        </div>  
    );  
}  


  
export default Clients; 