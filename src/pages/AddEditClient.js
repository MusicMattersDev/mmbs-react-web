import React, { useState, useEffect } from 'react';
    
const AddEditClient= (props) => {  
    const initialFieldValues = {  
        stage: '',
        performers: [''], // This array has one empty string, resulting in one input box
        email: '',
        splitCheck: false,
        bio: ''
      }

    var [values, setValues] = useState(initialFieldValues)

    useEffect(() => {  
        if (props.currentId === '')  
            setValues({ ...initialFieldValues })
        else  
            setValues({  
                ...props.ClientObj[props.currentId]  
            })
        if (props.ClientObj[props.currentId] && !props.ClientObj[props.currentId]["performers"]) { props.ClientObj[props.currentId]["performers"] = initialFieldValues["performers"]; }
    }, [props.currentId, props.ClientObj])  
    
    const handleInputChange = e => {  
        var { name, value } = e.target;  
        setValues({  
            ...values,  
            [name]: value  
        })
    }
    const handlePerformerChange = (index, e) => {
        const newPerformers = values.performers.slice();
        newPerformers[index] = e.target.value;
        setValues({
          ...values,
          performers: newPerformers
        });
      };
    
    const handleFormSubmit = e => {  
        e.preventDefault()  
        props.addOrEdit(values);  
    }  

    const addPerformer = e => {
        e.preventDefault()
        setValues({
          ...values,
          performers: [...values.performers, ""]
        })
      }
      
    const handleFieldChange = e => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;
        setValues({
            ...values,
            // converting the string to boolean values
            [name]: newValue === "true" ? true : false
        });
    };
    
      
    return (  
        <form autoComplete="off" onSubmit={handleFormSubmit}>  
            <div className="col-12 col-md-12">  
                <div className="card">  
                    <div className="card-header" >  
                        <input value={props.currentId === "" ? "Add Client Info" : "Update Client Info"} />  
                    </div>  
                    
                    <div className="card-body">  
                        <div className="center-form">  
                            <div className="row">  

                                <div className="col-12 col-md-6">  
                                    <div className="form-group">  
                                        <label className="col-form-label">Stage Name<span  
                                            className="mandatoryFieldColor">*</span></label>  
                                        <input value={values.stage}  
                                            onChange={handleInputChange} type="text" className="form-control" name="stage"  
                                        />  
                                    </div>  
                                </div>
                                
                                <div className="col-12 col-md-6">
        <div className="form-group">
          <label className="col-form-label">Performers<span className="mandatoryFieldColor">*&nbsp;</span></label>
          {values.performers.map((performer, index) => (
            <input
            key={index}
            type="text"
            className="form-control"
            placeholder="Input performer name"
            value={performer}
            onChange={(e) => handlePerformerChange(index, e)}
          />
          ))}
          <button type="button" onClick={addPerformer}>&nbsp;Add Performer&nbsp;</button>
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
                                    <div className="form-group">Split Check?<span className="mandatoryFieldColor">*&nbsp;</span>&nbsp;&nbsp;&nbsp;
                                    <input
                                        name="splitCheck"
                                        value={true}
                                        checked={values.splitCheck === true}
                                        onChange={handleFieldChange}
                                        type="radio"
                                    />
                                    <label className="col-form-label">&nbsp;Yes&nbsp;&nbsp;</label>

                                    <input
                                        name="splitCheck"
                                        value={false}
                                        checked={values.splitCheck === false}
                                        onChange={handleFieldChange}
                                        type="radio"
                                    />
                                    <label className="col-form-label">&nbsp;No&nbsp;&nbsp;</label>

                                    </div>  
                                </div> 

                                <div className="col-12 col-md-6">  
                                    <div className="form-group">  
                                        <label className="col-form-label">Bio</label>  
                                        <textarea value={values.bio} onChange={handleInputChange} className="form-control" name="bio"  
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
    
export default AddEditClient; 