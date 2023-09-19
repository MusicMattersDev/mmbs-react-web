import React, { useState, useEffect } from 'react';  
import firebaseDb from "../firebase-config";  
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


    const downloadAsExcel = () => {
        const startOfOctober = new Date("2023-10-01T00:00").toISOString();
        const endOfOctober = new Date("2023-10-31T23:59").toISOString();
    
        // Filter events within the range
        const filteredEvents = Object.values(EventsObj).filter(event => 
            event.start >= startOfOctober && event.start <= endOfOctober
        );
        
        // Convert filtered data to worksheet
        const ws = XLSX.utils.json_to_sheet(filteredEvents);
        
        // Create a workbook
        const wb = XLSX.utils.book_new();
        
        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "OctoberEvents");
        
        // Write the workbook and trigger the download
        XLSX.writeFile(wb, "OctoberEventsDetails.xlsx");
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
                        
                        <button onClick={downloadAsGoogleSheet}>Download as Google Sheet</button>
                        <button onClick={downloadAsExcel}>Download as Excel Spreadsheet</button>

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