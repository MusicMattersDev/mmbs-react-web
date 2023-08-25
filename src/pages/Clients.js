import React, { useState, useEffect } from 'react';  
import firebaseDb from "../firebase-config";  
import AddEditClient from './AddEditClient';  

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
    const filteredArtists = Object.keys(ClientObj).filter(key => {
        return ClientObj[key].stage.toLowerCase().includes(query.toLowerCase()) || ClientObj[key].email.toLowerCase().includes(query.toLowerCase())
    })
  
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