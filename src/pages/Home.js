import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import backgroundImage from '../assets/background.jpg'; // Adjust the path as needed


const Home = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [gapiLoaded, setGapiLoaded] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [xlsxFile, setXlsxFile] = useState(null);
    const [invoicesZip, setInvoicesZip] = useState(null);
    const [confirmationsZip, setConfirmationsZip] = useState(null);
    const [xlsxFileName, setXlsxFileName] = useState("Choose Excel File for Emailing the Client Confirmations");
const [invoicesZipName, setInvoicesZipName] = useState("Choose the Invoices Zip File for the Month");
const [confirmationsZipName, setConfirmationsZipName] = useState("Choose the Confirmations Zip File for the Month");


    // Placeholder: Replace with your actual client ID from the Google Developer Console
    const CLIENT_ID = '939526187420-7a8ta7e1edm7hl7hms08ss3vm1j5esjg.apps.googleusercontent.com';
    const DISCOVERY_DOCS = [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
    ];
    const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

    useEffect(() => {
        // Dynamically load the Google API script and set its onload callback
        const script = document.createElement('script');
        script.src = "https://apis.google.com/js/api.js";
        script.onload = handleClientLoad;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleClientLoad = () => {
        window.gapi.load('client:auth2', initClient);
    };


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
    
    const handleInvoicesZipChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected Invoices file:", file.name);  // Debugging line
        setInvoicesZip(file);
        setInvoicesZipName(file.name);

        document.querySelector("label[for='invoicesZipInput']").classList.add("file-selected");

    };
    
    const handleConfirmationsZipChange = (event) => {
        const file = event.target.files[0];
        console.log("Selected Confirmations file:", file.name);  // Debugging line
        setConfirmationsZip(file);
        setConfirmationsZipName(file.name);

    document.querySelector("label[for='confirmationsZipInput']").classList.add("file-selected");

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



const uploadFileToDrive = async (file, accessToken, folderId) => {
    let totalFiles = 0; // Define totalFiles
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
      const aggregatedProgress = (uploadedFiles + progress) / totalFiles * 100;
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
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, ""); // Remove the extension
    const query = `name contains '${nameWithoutExtension}' and '${folderId}' in parents`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    const result = await response.json();
    return result.files.length > 0;
};



const handleDedicatedUpload = async () => {
    const accessToken = window.gapi.auth.getToken().access_token;
    let uploadedFiles = 0;

    // Update the progress bar
    const updateProgress = (totalFiles) => {
        const aggregatedProgress = (uploadedFiles / totalFiles) * 100;
        setUploadProgress(aggregatedProgress);
    };

// Folder name for .xlsx files
const xlsxFolderName = `ExcelFiles-${new Date().toLocaleString('default', { month: 'long' })}-${new Date().getFullYear()}`;
const xlsxFolderId = await getFolderId(xlsxFolderName, accessToken);

    // Create and get folder ID for confirmations
    const confirmationsFolderName = `Confirmations-${new Date().toLocaleString('default', { month: 'long' })}-${new Date().getFullYear()}`;
    const confirmationsFolderId = await getFolderId(confirmationsFolderName, accessToken);

    // Create and get folder ID for invoices
    const invoicesFolderName = `Invoices-${new Date().toLocaleString('default', { month: 'long' })}-${new Date().getFullYear()}`;
    const invoicesFolderId = await getFolderId(invoicesFolderName, accessToken);

    let totalFiles = 0;
    if (invoicesZip) {
        const invoiceFiles = await unzipAndExtractFiles(invoicesZip);
        totalFiles += invoiceFiles.length;
    }
    if (confirmationsZip) {
        const confirmationFiles = await unzipAndExtractFiles(confirmationsZip);
        totalFiles += confirmationFiles.length;
    }

    // Upload logic for each file type
    if (xlsxFile) {
        const xlsxExists = await checkFileExists(xlsxFile.name, xlsxFolderId, accessToken);
        if (!xlsxExists) {
            await convertAndUpload(xlsxFile, accessToken, xlsxFolderId); // Pass the folder ID here
            uploadedFiles++;
            updateProgress(totalFiles);
        } else {
            alert('Excel file already exists in Drive.');
        }
    }

    if (invoicesZip) {
        const invoiceFiles = await unzipAndExtractFiles(invoicesZip);
        for (let file of invoiceFiles) {
            // Check if invoice file already exists
            const fileExists = await checkFileExists(file.name, invoicesFolderId, accessToken);
            if (!fileExists) {
                await uploadFileToDrive(file, accessToken, invoicesFolderId);
                uploadedFiles++;
                updateProgress(totalFiles);
            } else {
                alert(`Invoice file "${file.name}" already exists in Drive.`);
            }
        }
    }

    if (confirmationsZip) {
        const confirmationFiles = await unzipAndExtractFiles(confirmationsZip);
        for (let file of confirmationFiles) {
            // Check if confirmation file already exists
            const fileExists = await checkFileExists(file.name, confirmationsFolderId, accessToken);
            if (!fileExists) {
                await uploadFileToDrive(file, accessToken, confirmationsFolderId);
                uploadedFiles++;
                updateProgress(totalFiles);
            } else {
                alert(`Confirmation file "${file.name}" already exists in Drive.`);
            }
        }
    }
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
            <h1>Welcome to the Music Matters Booking System </h1>
            <p>-R11.2.23</p>

            {gapiLoaded ? (
                !isAuth ? (
                    <div style={{ paddingTop: '200px'}}>
                        <h4>Upload Files to Google Drive</h4>
                        <button className="button" onClick={handleAuthClick}>Sign in with Google</button>
                    </div>
                ) : (
                    <div className="inputs-container" style={{ paddingTop: '150px'}}>
                        <div className="input-wrapper">
                            <input type="file" id="xlsxFileInput" className="custom-file-input" accept=".xlsx" onChange={handleXlsxFileChange} />
                            <label htmlFor="xlsxFileInput" className="custom-file-label">{xlsxFileName}</label>
                        </div>
                        <div className="input-wrapper">
                            <input type="file" id="invoicesZipInput" className="custom-file-input" accept=".zip" onChange={handleInvoicesZipChange} />
                            <label htmlFor="invoicesZipInput" className="custom-file-label">{invoicesZipName}</label>
                        </div>
                        <div className="input-wrapper">
                            <input type="file" id="confirmationsZipInput" className="custom-file-input" accept=".zip" onChange={handleConfirmationsZipChange} />
                            <label htmlFor="confirmationsZipInput" className="custom-file-label">{confirmationsZipName}</label>
                        </div>
                        <div className="button-group">
                            <button className="button" onClick={handleDedicatedUpload}>Upload to Drive</button>
                            <button className="button" onClick={handleSignOutClick}>Sign Out</button>
                        </div>
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
