import React, { useState, useEffect } from 'react';
    
const AddEditVenue= (props) => {  
    const initialFieldValues = {  
        name: '',  
        email: '',
        address: {
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: '' 
        }
    }  
    
    var [values, setValues] = useState(initialFieldValues)  

    useEffect(() => {  
        if (props.currentId === '')  
            setValues({ ...initialFieldValues })  
        else  
            setValues({  
                ...props.VenueObjects[props.currentId]  
            })  
    }, [props.currentId, props.VenueObjects])  
    
    // const handleInputChange = e => {  
    //     var { name, value } = e.target;  
    //     setValues({  
    //         ...values,  
    //         [name]: value
    //     })  
    // }

    const handleInputChange = e => {
        const { name, value } = e.target;
        if (name === 'street1' || name === 'street2' || name === 'city' || name === 'state' || name === 'zip') {
          setValues(prevVenue => ({
            ...prevVenue,
            address: {
              ...prevVenue.address,
              [name]: value
            }
          }));
        } else {
          setValues(prevVenue => ({
            ...prevVenue,
            [name]: value
          }));
        }
      };
    
    const handleFormSubmit = e => {  
        e.preventDefault()  
        props.addOrEdit(values);  
    }  
    
    return (  
        <form autoComplete="off" onSubmit={handleFormSubmit}>  
            <div className="col-12 col-md-12">  
                <div className="card">  
                    <div className="card-header" >  
                        <input value={props.currentId === "" ? "Add Venue Info" : "Update Venue Info"} />  
                    </div>  
                    
                    <div className="card-body">  
                        <div className="center-form">  
                            <div className="row">  
                                <div className="col-12 col-md-6">  
                                    <div className="form-group">  
                                        <label className="col-form-label">Name<span  
                                            className="mandatoryFieldColor">*</span></label>  
                                        <input value={values.name}  
                                            onChange={handleInputChange} type="text" className="form-control" name="name"  
                                        />  
                                    </div>  
                                </div>  
                                <div className="col-12 col-md-6">  
                                    <div className="form-group">  
                                        <label className="col-form-label">Email<span  
                                            className="mandatoryFieldColor">*</span></label>  
                                        <input value={values.email} onChange={handleInputChange} type="text" className="form-control" name="email"  
                                        />  
                                    </div>  
                                </div>  

                                <div className="col-12 col-md-6">  
                                    <div className="form-group">  
                                        <label className="col-form-label">Address Line 1<span  
                                            className="mandatoryFieldColor">*</span></label>  
                                        <input value={values.address.street1} onChange={handleInputChange} type="text" className="form-control" name="street1"  
                                        />  
                                    </div>  
                                </div>  

                                <div className="col-12 col-md-6">  
                                    <div className="form-group">  
                                        <label className="col-form-label">Address Line 2<span  
                                            className="mandatoryFieldColor"></span></label>  
                                        <input value={values.address.street2} onChange={handleInputChange} type="text" className="form-control" name="street2"  
                                        />  
                                    </div>  
                                </div> 

                                <div className="col-12 col-md-6">  
                                    <div className="form-group">  
                                        <label className="col-form-label">City<span  
                                            className="mandatoryFieldColor">*</span></label>  
                                        <input value={values.address.city} onChange={handleInputChange} type="text" className="form-control" name="city"  
                                        />  
                                    </div>  
                                </div>

                                <div className="col-12 col-md-6">  
                                    <div className="form-group">  
                                        <label className="col-form-label">State<span  
                                            className="mandatoryFieldColor">*</span></label>  
                                        <input value={values.address.state} onChange={handleInputChange} type="text" className="form-control" name="state"  
                                        />  
                                    </div>  
                                </div> 

                                <div className="col-12 col-md-6">  
                                    <div className="form-group">  
                                        <label className="col-form-label">ZIP Code<span  
                                            className="mandatoryFieldColor">*</span></label>  
                                        <input value={values.address.zip} onChange={handleInputChange} type="text" className="form-control" name="zip"  
                                        />  
                                    </div>  
                                </div> 

                                <div className="col-12 col-md-12">  
                                    <div className="btn-group mb-3 mt-2 cmn-btn-grp">  
                                        <input type="submit" value={props.currentId === "" ? "Save" : "Update"} className="btn btn-success btn-block" />  
                                    </div>  
                                </div>  
                            </div>  
                        </div>  
                    </div>  
                </div>  
            </div>  
        </form>  
    );  
}  
    
export default AddEditVenue; 