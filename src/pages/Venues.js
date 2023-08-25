import React, { useState, useEffect } from 'react';  
import firebaseDb from "../firebase-config";  
import AddEditVenue from './AddEditVenue';
import { Link } from 'react-router-dom'

const Venues= () => {  
  
    var [currentId, setCurrentId] = useState('');  
    var [VenueObjects, setVenueObjects] = useState({})
    const [showCal, setCal] = useState(false);

    useEffect(() => {  
        firebaseDb.child('database/venues').on('value', snapshot => {  
            if (snapshot.val() != null) {  
                setVenueObjects({  
                    ...snapshot.val()  
                });  
            }  else{
               setVenueObjects({});
            }
        })  
    }, [])  
  
  
    const addOrEdit = (obj) => {  
        if (currentId === '')  
            firebaseDb.child('database/venues').push(  
                obj,  
                err => {  
                    if (err)  
                        console.log(err)  
                    else  
                        setCurrentId('')  
                })  
        else  
            firebaseDb.child(`database/venues/${currentId}`).set(  
                obj,  
                err => {  
                    if (err)  
                        console.log(err)  
                    else  
                        setCurrentId('')  
                })  
    }  
  
    const onDelete = id => {  
        if (window.confirm('Are you sure to delete this record?')) {  
            firebaseDb.child(`database/venues/${id}`).remove(  
                err => {  
                    if (err)  
                        console.log(err)  
                    else  
                        setCurrentId('')  
                })  
        }  
    }  
  
    return (  
        <div className="content"> 
            <div className="card">   
            <div className="card-body pb-0">  
                <div className="card">  
                    <div className="card-header main-search dash-search">  
                        <h3>  
                            Venue Information Details  
                    </h3>  
                    </div>  
                </div>  
                <div className="row">  
                    <div className="col-12 col-md-12">  
                        <div className="card">  
                            <div className="card-header">Venues</div>  
                            <div className="card-body position-relative">  
                                <div className="table-responsive cnstr-record product-tbl">  
                                    <table className="table table-bordered heading-hvr">  
                                        <thead>  
                                            <tr>  
                                                <th className="active">Name</th>  
                                                <th>Email</th>
                                                <th>Address Line 1</th>
                                                <th>Address Line 2</th>
                                                <th>City</th>
                                                <th>State</th>
                                                <th>ZIP Code</th>        
                                                <th width="60"> </th>  
                                                <th width="60"> </th>  
                                            </tr>  
                                        </thead>  
                                        <tbody>  
                                            {  
                                                Object.keys(VenueObjects).map((key) => (  
                                                    <tr key={key}>  
                                                        <td>{VenueObjects[key].name}</td>  
                                                        <td>{VenueObjects[key].email}</td>
                                                        <td>{VenueObjects[key].address["street1"]}</td>
                                                        <td>{VenueObjects[key].address["street2"]}</td>
                                                        <td>{VenueObjects[key].address["city"]}</td>
                                                        <td>{VenueObjects[key].address["state"]}</td>
                                                        <td>{VenueObjects[key].address["zip"]}</td>     

                                                        <td>
                                                            <Link to={`${key}`}>
                                                                <button type="button" className="btn btn-primary">Calendar</button>
                                                            </Link>
                                                        </td>
                                                        {/* <td> <button type="button" className="btn btn-primary"  
                                                            onClick={() => { }}>Go</button></td>   */}
  
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
                <div className="card-header">Add / Update Venue</div>  
                <AddEditVenue {...({ currentId, VenueObjects, addOrEdit })}></AddEditVenue>
            </div>  
        </div>  
        </div>
    );  
}  
  
export default Venues; 