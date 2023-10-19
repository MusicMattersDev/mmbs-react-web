import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import mmlogo from '../assets/icon-transparent.png';

const Home = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [gapiLoaded, setGapiLoaded] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [xlsxFile, setXlsxFile] = useState(null);
    const [invoicesZip, setInvoicesZip] = useState(null);
    const [confirmationsZip, setConfirmationsZip] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

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
        setXlsxFile(event.target.files[0]);
    };

    const handleInvoicesZipChange = (event) => {
        setInvoicesZip(event.target.files[0]);
    };

    const handleConfirmationsZipChange = (event) => {
        setConfirmationsZip(event.target.files[0]);
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

  const uploadFileToDrive = async (file, accessToken, uploadedFiles, totalFiles) => {
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify({
        'name': file.name,
        'mimeType': file.type
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

let lastUpdate = Date.now();


const handleDedicatedUpload = async () => {
  const accessToken = window.gapi.auth.getToken().access_token;
  let totalFiles = 0;
  let uploadedFiles = 0;

  const updateProgress = () => {
    const now = Date.now();
    if (now - lastUpdate > 200) {  // Only update the state every 200ms
        const aggregatedProgress = (uploadedFiles / totalFiles) * 100;
        setUploadProgress(aggregatedProgress);
        lastUpdate = now;
    }
};

  if (xlsxFile) {
      totalFiles++;
  }

  if (invoicesZip) {
      const invoiceFiles = await unzipAndExtractFiles(invoicesZip);
      totalFiles += invoiceFiles.length;
  }

  if (confirmationsZip) {
      const confirmationFiles = await unzipAndExtractFiles(confirmationsZip);
      totalFiles += confirmationFiles.length;
  }

  if (xlsxFile) {
      await convertAndUpload(xlsxFile);  // Use convertAndUpload for .xlsx files
      uploadedFiles++;
      updateProgress();
  }

  if (invoicesZip) {
      const invoiceFiles = await unzipAndExtractFiles(invoicesZip);
      for (let file of invoiceFiles) {
          await uploadFileToDrive(file, accessToken);
          uploadedFiles++;
          updateProgress();
      }
  }

  if (confirmationsZip) {
      const confirmationFiles = await unzipAndExtractFiles(confirmationsZip);
      for (let file of confirmationFiles) {
          await uploadFileToDrive(file, accessToken);
          uploadedFiles++;
          updateProgress();
      }
  }
};

    const convertAndUpload = async (file) => {
        // Conversion and upload logic...
        const accessToken = window.gapi.auth.getToken().access_token;

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify({
            'name': file.name,
            'mimeType': 'application/vnd.google-apps.spreadsheet'
        })], { type: 'application/json' }));
        form.append('file', file);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            },
            body: form,
            onUploadProgress: (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    setUploadProgress(progress);
                }
            },
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
      <div className='home'>
          <center>
              <h1>Welcome to Music Matters Booking System</h1>
              <p>-R10.8.23</p>
              <img src={mmlogo} width="200" height="200" alt="Music Matters Logo" />

              {gapiLoaded ? (
                  !isAuth ? (
                      <div>
                      <p></p>
                      <p></p>
                      <h4>Upload Files to Google Drive</h4>
                          <button onClick={handleAuthClick}>Sign in with Google</button>
                      </div>
                  ) : (
                      <div>
                          <input type="file" accept=".xlsx" onChange={handleXlsxFileChange} />
                          <label>.XLSX File</label>
                          <br/>
                          <input type="file" accept=".zip" onChange={handleInvoicesZipChange} />
                          <label>Invoices</label>
                          <br/>
                          <input type="file" accept=".zip" onChange={handleConfirmationsZipChange} />
                          <label>Confirmations</label>
                          <br/>
                          <button onClick={handleDedicatedUpload}>Upload to Drive</button>
                          <button onClick={handleSignOutClick}>Sign Out</button>
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
    height: '10px',  // Making it half as large
    transition: 'width 0.5s ease-in-out'
}}>
    <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
</div>
      </div>
  );
};

export default Home;
