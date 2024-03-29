import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import backgroundImage from '../assets/background.jpg'; // Adjust the path as needed


const Home = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [gapiLoaded, setGapiLoaded] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    //CONFIRMATIONS
    const [xlsxFile, setXlsxFile] = useState(null);
    const [confirmationsZip, setConfirmationsZip] = useState(null);
    const [xlsxFileName, setXlsxFileName] = useState("Choose Excel File for Emailing the Client Confirmations");
    const [confirmationsZipName, setConfirmationsZipName] = useState("Choose the Confirmations Zip File for the Month");


    // CALENDAR
    const [xlsxCalendarFile, setXlsxCalFile] = useState(null);
    const [pdfCalendarFile, setPdfFile] = useState(null);
    const [calendarxlsxFileName, setCalxlsxFileName] = useState("Choose Excel File for Emailing the Calendar");
    const [pdfCalendarName, setCalendarPDFName] = useState("Choose the Calendar pdf File for the Month");
    

    // BOOKING LIST
    const [xlsxBookingList, setXlsxBLFile] = useState(null);
    const [pdfBookingListFile, setBLpdfFile] = useState(null);
    const [bookingListxlsxFileName, setBLxlsxFileName] = useState("Choose Excel File for Emailing the Booking List");
    const [pdfBookingList, setBLPDFName] = useState("Choose the Booking List pdf File for the Month");


    const [isUploading, setIsUploading] = useState(false); // New state variable to track upload status

    // Placeholder: Replace with your actual client ID from the Google Developer Console
    const CLIENT_ID = '939526187420-7a8ta7e1edm7hl7hms08ss3vm1j5esjg.apps.googleusercontent.com';
    
    const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

    useEffect(() => {
        const DISCOVERY_DOCS = [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
        ];

        const initClient = () => {
            window.gapi.client.init({
                discoveryDocs: DISCOVERY_DOCS,
                clientId: CLIENT_ID,
                scope: SCOPES
            }).then(() => {
                setIsAuth(window.gapi.auth2.getAuthInstance().isSignedIn.get());
                window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
                setGapiLoaded(true);
            }).catch(error => {
                console.error("Error initializing Google API client:", error);
            });
        };


        const handleClientLoad = () => {
            window.gapi.load('client:auth2', initClient);
        };
        // Dynamically load the Google API script
        const script = document.createElement('script');
        script.src = "https://apis.google.com/js/api.js";
        
        // Set the onload event handler
        script.onload = () => {
            handleClientLoad();
        };
    
        document.body.appendChild(script);
    
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const openGmail = () => {
        window.open('https://gmail.com', '_blank');
    };

    const updateSigninStatus = (isSignedIn) => {
        setIsAuth(isSignedIn);
    };

    const handleAuthClick = () => {
        if (window.gapi && window.gapi.auth2) {
            window.gapi.auth2.getAuthInstance().signIn();
        } else {
            console.error("Google API client is not initialized yet.");
        }
    };

    const handleSignOutClick = () => {
        window.gapi.auth2.getAuthInstance().signOut();
    };

    const handleXlsxFileChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected XLSX file:", file.name); 
        setXlsxFile(file);
        setXlsxFileName(file.name);
    
        // Add orange outline to the button
        document.querySelector("label[for='xlsxFileInput']").classList.add("file-selected");
    };
   
    
    const handleConfirmationsZipChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected Confirmations file:", file.name);  // Debugging line
        setConfirmationsZip(file);
        setConfirmationsZipName(file.name);

    document.querySelector("label[for='confirmationsZipInput']").classList.add("file-selected");

    };

    const handleXlsxBookingListFileChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected Booking List XLSX file:", file.name);
        setXlsxBLFile(file);
        setBLxlsxFileName(file.name);

    document.querySelector("label[for='BLxlsxFileInput']}").classList.add("file-selected");
    };

    const handleBookingListPDFChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected Booking List PDF file:", file.name);
        setBLpdfFile(file);
        setBLPDFName(file.name);

    document.querySelector("label[for='BLPDFFileInput']}").classList.add("file-selected");
    };

    const handleXlsxCalendarFileChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected Calendar XLSX file:", file.name);
        setXlsxCalFile(file);
        setCalxlsxFileName(file.name);

    document.querySelector("label[for='CalxlsxFileInput']}").classList.add("file-selected");
    };

    const handleCalendarPDFChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected Calendar PDF file:", file.name);
        setPdfFile(file);
        setCalendarPDFName(file.name);

    document.querySelector("label[for='CalPDFFileInput']}").classList.add("file-selected");
    };
    
    const unzipAndExtractFiles = async (zipFile) => {
      const jszip = new JSZip();
      const fileData = await zipFile.arrayBuffer();
      const zip = await jszip.loadAsync(fileData);
      const extractedFiles = [];
  
      for (const [fileName, file] of Object.entries(zip.files)) {
          if (!file.dir) {
              const blob = await file.async('blob');
              const newFile = new File([blob], fileName, {
                  type: "application/pdf", // Assuming all files in the zip are PDFs. Adjust if needed.
              });
              extractedFiles.push(newFile);
          }
      }
  
      return extractedFiles;
  };


// Function to create a new folder
const createFolder = async (folderName, accessToken) => {
    const metadata = {
        'name': folderName,
        'mimeType': 'application/vnd.google-apps.folder'
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
    });

    const folder = await response.json();
    return folder.id;
};

// Function to check if folder exists and return its ID
const getFolderId = async (folderName, accessToken) => {
    const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder'`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    const result = await response.json();
    if (result.files.length > 0) {
        return result.files[0].id; // Return the ID of the existing folder
    } else {
        return await createFolder(folderName, accessToken); // Create a new folder and return its ID
    }
};

const uploadFileToDrive = async (file, accessToken, folderId, totalFiles) => {
    let uploadedFiles = 0; // Define uploadedFiles
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify({
        'name': file.name,
        'mimeType': file.type,
        'parents': [folderId] // Add the folder ID here
    })], { type: 'application/json' }));
    form.append('file', file);

    const responseText = await fetchWithProgress('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
        body: form,
    }, (progress) => {
      // Calculate the aggregated progress
      const aggregatedProgress = (uploadedFiles + progress / totalFiles) * 100;
      setUploadProgress(aggregatedProgress);
  });

    const data = JSON.parse(responseText);
    if (data && data.id) {
        setUploadProgress(100); // Mark as complete
        return data.id;
    } else {
        throw new Error('Error uploading the file to Google Drive.');
    }
};

const checkFileExists = async (fileName, folderId, accessToken) => {
    try {
        const baseFileName = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
        const safeFileName = encodeURIComponent(baseFileName);

        // Check if a file with a similar name exists
        const query = `name contains '${safeFileName}' and '${folderId}' in parents`;

        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });

        if (!response.ok) {
            throw new Error(`Error in Google Drive API: ${response.statusText}`);
        }

        const result = await response.json();
        return result.files.length > 0;
    } catch (error) {
        console.error("Error checking if file exists in Google Drive:", error);
        return false;
    }
};


const handleDedicatedUpload = async () => {
    setIsUploading(true);
    const accessToken = window.gapi.auth.getToken().access_token;

    // Folder names including year
    const currentYear = new Date().getFullYear();
    const xlsxFolderName = `ExcelFiles-${new Date().toLocaleString('default', { month: 'long' })}-${currentYear}`;
    const confirmationsFolderName = `Confirmations-${new Date().toLocaleString('default', { month: 'long' })}-${currentYear}`;

    const xlsxBLFolderName = `BookingListExcelFiles-${new Date().toLocaleString('default', { month: 'long' })}-${currentYear}`;
    const bookingListFolderName = `BookingList-${new Date().toLocaleString('default', { month: 'long' })}-${currentYear}`;

    const xlsxCalFolderName = `CalendarExcelFiles-${new Date().toLocaleString('default', { month: 'long' })}-${currentYear}`;
    const calendarFolderName = `ExhangeBookingCalendar-${new Date().toLocaleString('default', { month: 'long' })}-${currentYear}`;

    // Get folder IDs
    const xlsxFolderId = await getFolderId(xlsxFolderName, accessToken);
    const confirmationsFolderId = await getFolderId(confirmationsFolderName, accessToken);

    const xlsxBLFolderId = await getFolderId(xlsxBLFolderName, accessToken);
    const bookingListFolderId = await getFolderId(bookingListFolderName, accessToken);

    const xlsxCalFolderId = await getFolderId(xlsxCalFolderName, accessToken);
    const calendarFolderId = await getFolderId(calendarFolderName, accessToken);

    // Check for duplicates first
    let duplicateFound = false;
    let totalFiles = 0; // Initialize totalFiles

    if ((xlsxFile && await checkFileExists(xlsxFile.name, xlsxFolderId, accessToken)) || (xlsxCalendarFile && await checkFileExists(xlsxCalendarFile.name, xlsxCalFolderId, accessToken)) ||  (xlsxBookingList && await checkFileExists(xlsxBookingList.name, xlsxBLFolderId, accessToken))) {
        alert('Excel file already exists in Drive.');
        duplicateFound = true;
    }

    const confirmationFiles = confirmationsZip ? await unzipAndExtractFiles(confirmationsZip) : [];
    totalFiles += confirmationFiles.length; // Add confirmation files count to totalFiles

    if (!duplicateFound) {
        if (xlsxFile) {
            totalFiles++; // Add xlsxFile to totalFiles count
            await convertAndUpload(xlsxFile, accessToken, xlsxFolderId);
        }
        if (xlsxCalendarFile) {
            totalFiles++; // Add xlsxFile to totalFiles count
            await convertAndUpload(xlsxCalendarFile, accessToken, xlsxCalFolderId);
        }
        if (xlsxBookingList) {
            totalFiles++; // Add xlsxFile to totalFiles count
            await convertAndUpload(xlsxBookingList, accessToken, xlsxBLFolderId);
        }
        if (pdfBookingList) {
            totalFiles++; 
            await  uploadFileToDrive(pdfBookingListFile, accessToken, bookingListFolderId);
        }

       if (pdfCalendarFile) {
            totalFiles++; 
            await  uploadFileToDrive(pdfCalendarFile, accessToken, calendarFolderId);
        }


        for (let file of confirmationFiles) {
            if (await checkFileExists(file.name, confirmationsFolderId, accessToken)) {
                alert(`Confirmation file "${file.name}" already exists in Drive.`);
                duplicateFound = true;
                break; // Stop the upload process
            }
        }

        if (!duplicateFound) {
            let uploadedFiles = 0; // Initialize uploadedFiles

            // Upload xlsxFile if it exists and is not a duplicate
            if (xlsxFile) {
                uploadedFiles++;
                setUploadProgress((uploadedFiles / totalFiles) * 100);
            }

            if (xlsxCalendarFile) {
                uploadedFiles++;
                setUploadProgress((uploadedFiles / totalFiles) * 100);
            }

            if (xlsxBookingList) {
                uploadedFiles++;
                setUploadProgress((uploadedFiles / totalFiles) * 100);
            }

           if (pdfBookingList) {
                uploadedFiles++;
                setUploadProgress((uploadedFiles / totalFiles) * 100);
           }

           if (pdfCalendarFile) {
                uploadedFiles++;
                setUploadProgress((uploadedFiles / totalFiles) * 100);
           }

            // Upload confirmation files if they exist and are not duplicates
            for (let file of confirmationFiles) {
                await uploadFileToDrive(file, accessToken, confirmationsFolderId);
                uploadedFiles++;
                setUploadProgress((uploadedFiles / totalFiles) * 100);
            }


            alert('Upload Complete. Confirmations are now ready to be sent out!');
        } else {
            alert("Upload Canceled: Duplicate file found.");
        }
    } else {
        alert("Upload Canceled: Duplicate file found.");
    }

    setIsUploading(false); // End uploading
};



const convertAndUpload = async (file, accessToken, folderId) => {
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify({
        'name': file.name,
        'mimeType': 'application/vnd.google-apps.spreadsheet',
        'parents': [folderId] // Specify the folder ID here
    })], { type: 'application/json' }));
    form.append('file', file);

    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            },
            body: form,

        });

    };



    const fetchWithProgress = (url, options, onProgress) => {
      return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(options.method || 'GET', url);
          
          for (let header in options.headers) {
              xhr.setRequestHeader(header, options.headers[header]);
          }
  
          xhr.onload = e => resolve(e.target.responseText);
          xhr.onerror = reject;
          
          if (xhr.upload && onProgress) {
              xhr.upload.onprogress = (event) => {
                  if (event.lengthComputable) {
                      const progress = event.loaded / event.total;
                      console.log("Progress Callback:", progress);  // Debugging statement
                      onProgress(progress);
                  }
              };
          }
  
          xhr.send(options.body);
      });
  };


 
  return (
    
    <div className='home'style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '100vh' // Adjust the height as needed
        }}>

        <center style={{ paddingTop: '100px'}}>
            <h1>Welcome to the Music Matters Booking System</h1>

            {gapiLoaded ? (
                !isAuth ? (
                    <div style={{ paddingTop: '200px'}}>
                        <button className="button" onClick={handleAuthClick}>Sign in with Google</button>
                    </div>
                ) : (
                    <div className="inputs-container" style={{ paddingTop: '150px'}}>
                    <h5>Upload Files for Sending Confirmation Emails</h5>

                        <div style={{ paddingTop: '25px'}} className="input-wrapper">
                            <input type="file" id="xlsxFileInput" className="custom-file-input" accept=".xlsx" onChange={handleXlsxFileChange} />
                            <label htmlFor="xlsxFileInput" className="custom-file-label">{xlsxFileName}</label>
                        </div>
                       
                        <div className="input-wrapper">
                            <input type="file" id="confirmationsZipInput" className="custom-file-input" accept=".zip" onChange={handleConfirmationsZipChange} />
                            <label htmlFor="confirmationsZipInput" className="custom-file-label">{confirmationsZipName}</label>
                        </div>

                        <div style={{ paddingTop: '25px'}} className="input-wrapper">
                            <input type="file" id="BLxlsxFileInput" className="custom-file-input" accept=".xlsx" onChange={handleXlsxBookingListFileChange} />
                            <label htmlFor="BLxlsxFileInput" className="custom-file-label">{bookingListxlsxFileName}</label>
                        </div>
                       
                        <div className="input-wrapper">
                            <input type="file" id="BLPDFFileInput" className="custom-file-input" accept=".pdf" onChange={handleBookingListPDFChange} />
                            <label htmlFor="BLPDFFileInput" className="custom-file-label">{pdfBookingList}</label>
                        </div>

                        <div style={{ paddingTop: '25px'}} className="input-wrapper">
                            <input type="file" id="CalxlsxFileInput" className="custom-file-input" accept=".xlsx" onChange={handleXlsxCalendarFileChange} />
                            <label htmlFor="CalxlsxFileInput" className="custom-file-label">{calendarxlsxFileName}</label>
                        </div>
                       
                        <div className="input-wrapper">
                            <input type="file" id="CalPDFFileInput" className="custom-file-input" accept=".pdf" onChange={handleCalendarPDFChange} />
                            <label htmlFor="CalPDFFileInput" className="custom-file-label">{pdfCalendarName}</label>
                        </div>
                        <div className="button-group">
                            <button className="button" onClick={handleDedicatedUpload}>Upload to Drive</button>
                            <button className="button" onClick={handleSignOutClick}>Sign Out</button>
                            <button className="button" onClick={openGmail}>Open Gmail</button>

                            </div>
                            {isUploading && <p style={{ marginTop: '20px' }}>Upload in Progress...</p>} {/* Display message when uploading */}
                        </div>
                )
            ) : (
                <p>Loading...</p>
            )}
        </center>
        <div className="progress-bar" style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '10px',
            transition: 'width 0.5s ease-in-out'
        }}>
            <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
        </div>
    </div>
);
    };

export default Home;
