import React, {useState, useEffect } from 'react';
// import Stack from '@mui/material/Stack';
// import CircularProgress from '@mui/material/CircularProgress';
import Papa from "papaparse";

// Allowed extensions for input file
const allowedExtensions = ["csv"];

async function send_data(dict) {
    
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dict)
  };
  const response = await fetch('http://localhost:8090/handle', requestOptions);
  console.log("sent");
  const data = await response.json();
  console.log(data);
}


const App = () => {
  
  // This state will store the parsed data
  const [data, setData] = useState([]);
  
  // It state will contain the error when
  // correct file extension is not used
  const [error, setError] = useState("");
  
  // It will store the file uploaded by the user
  const [file, setFile] = useState("");

  // This function will be called when
  // the file input changes
  const handleFileChange = (e) => {
    setError("");
    
    // Check if user has entered the file
    if (e.target.files.length) {
      const inputFile = e.target.files[0];
      
      // Check the file extensions, if it not
      // included in the allowed extensions
      // we show the error
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }

      // If input type is correct set the state
      setFile(inputFile);
    }
  };

  
  const handleParse = () => {
    
    // If user clicks the parse button without
    // a file we show a error
    if (!file) return setError("Enter a valid file");

    // Initialize a reader which allows user
    // to read any file or blob.
    const reader = new FileReader();
    
    // Event listener on reader when the file
    // loads, we parse it and set the data.
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      // const finaljson = {"image_id":[],}

      const columns = Object.values(parsedData[1]);
      console.log(parsedData);
      const img_id = [];
      const img_url = [];

      for (let i = 0; i < parsedData.length; i++) {
        img_id.push(parsedData[i].image_id)
        img_url.push(parsedData[i].image_url)
      }
      var dict = {};
      dict["Item_ids"] = img_id;
      dict["Images"] = img_url;
      dict["Is_csv"] = true;

      console.log(dict);
      send_data(dict);
      

      setData(columns);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <label htmlFor="csvInput" style={{ display: "block" }}>
        Enter CSV File
      </label>
      <input
        onChange={handleFileChange}
        id="csvInput"
        name="file"
        type="File"
      />
      <div>
        <button onClick={handleParse}>Parse</button>
      </div>
      <div style={{ marginTop: "3rem" }}>
        {error ? error : data.map((col,
        idx) => <div key={idx}>{col}</div>)}
      </div>
    </div>
  );
};

export default App;
