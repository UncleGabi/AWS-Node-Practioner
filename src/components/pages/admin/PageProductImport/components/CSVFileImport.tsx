import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);

    if (!file) {
      throw new Error("The given file is not found");
    }

    const username = "UncleGabi";
    const password = import.meta.env.VITE_PASSWORD;
    const authorizationToken = btoa(`${username}:${password}`);
    console.log("authorizationToken ", authorizationToken);

    // Get the presigned URL
    const response = await axios({
      method: "GET",
      url,
      // headers: {
      //   Authorization: `Basic ${authorizationToken}`,
      // },
      params: {
        name: encodeURIComponent(file.name),
      },
    });
    console.log("File to upload: ", file ? file.name : "No file");
    console.log("Uploading to: ", response.data);
    const result = await fetch(response.data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "text/csv",
      },
      body: file,
    });
    console.log("file", file);

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    console.log("Result: ", result);
    console.log(result.body);
    setFile(undefined);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
