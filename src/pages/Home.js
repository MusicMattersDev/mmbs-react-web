import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import mmlogo from '../assets/icon-transparent.png'
import { Button } from "@mui/material";
import * as XLSX from "xlsx";

export default function Home() {

  let navigate = useNavigate();
    useEffect(() => {
      let authToken = sessionStorage.getItem('Auth Token')

      if (authToken) {
          navigate('/home')
      }

      if (!authToken) {
          navigate('/')
      }
  }, [])

  // function to easily create email template in default mail app. 

  const [emails, setEmails] = useState([]);
        const [currentIndex, setCurrentIndex] = useState(0);
      
        const handleFileUpload = (e) => {
          const file = e.target.files[0];
      
          const reader = new FileReader();
          reader.onload = (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const data = XLSX.utils.sheet_to_json(worksheet);
            const emailList = data.map(row => row.Email); // Assuming "Email" is the column header
      
            setEmails(emailList);
          };
          reader.readAsBinaryString(file);
        };

    const sendEmail = () => {
        if (currentIndex < emails.length) {
            const toEmail = emails[currentIndex];
            const subject = encodeURIComponent("Invoice and Confirmations from Music Matters Bookings");
            const body = encodeURIComponent("This email contains important booking documents from Mike Moody");
            window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
      
            setCurrentIndex(currentIndex + 1);
          } else {
            alert("All emails have been sent / You need to upload the client addresses for the month.");
          }
        };


  return (
    <div className='content'>
      <div className='home'>
        <center>
          <h1>Welcome to Music Matters Booking System!</h1>
          <img src={ mmlogo } width="200" height="200"/>
        </center>
      </div>


      <div style={{ width: '100%' }}>
        <center>
        <p>
          ----------------------------------------------------------------------------------------------------------------
        </p>
        <h5>End of Month Email Creator</h5>
        <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
        <p>
          "Choose the excel file with client email addresses"
        </p>
                      <div>
                      <Button variant="contained" onClick={sendEmail}>Email</Button>
                      </div>
      </center>     
            </div>
    </div>





  )
}

