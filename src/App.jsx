import { useState } from "react";
import { client } from "https://esm.sh/@gradio/client";
import "./App.css";
import logoImage from "./assets/icon.png";

const SPACE_URL = import.meta.env.VITE_SPACE_URL || "your-space-url-here";

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [uploadLabel, setUploadLabel] = useState("Click to upload an image");
  const [detectionSummary, setDetectionSummary] = useState("");

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setResultUrl("");
    setErr("");
    setUploadLabel(f.name.length > 16 ? `${f.name.substring(0, 16)}...` : f.name); //setting the label to the file name only up to 6 character length
  };

  const predict = async () => {
    if (!file) {
      setErr("Please upload an image first.");
      return;
    }
    setLoading(true);
    setErr("");

    try {
      const app = await client(SPACE_URL);
      const res = await app.predict("/predict", [file]);
    
      // ✅ First output: annotated image
      let outputData = res.data[0];
      let url = "";
    
      if (typeof outputData === "string" && outputData.startsWith("data:image")) {
        url = outputData;
      } else if (typeof outputData === "string") {
        url = `data:image/png;base64,${outputData}`;
      } else if (outputData instanceof Blob) {
        url = URL.createObjectURL(outputData);
      } else if (outputData && outputData.url) {
        url = outputData.url;
      } else {
        throw new Error("Unknown output format from API");
      }
    
      setResultUrl(url);
    
      // ✅ Second output: detection JSON (summary + detections)
      const detectionInfo = res.data[1];
      console.log(detectionInfo);
      if (detectionInfo && detectionInfo.summary) {
        setDetectionSummary(detectionInfo.summary);
      } else {
        setDetectionSummary("No detections found.");
      }
    
    } catch (e) {
      console.error("Prediction error:", e);
      setErr("Prediction failed. Try again or try with a smaller image.");
    } finally {
      setLoading(false);
    }
  };

  // for the reset button
  const handleReset = () => {
    setFile(null);
    setResultUrl("");
    setDetectionSummary("");
    setErr("");
    setPreviewUrl("");
  };
  

  return (
    <div className="page">
      <div className="card">
      <div align="center" className="logo">
      <img src={logoImage} alt="Logo" width="80" height="80"/>
      </div>

        {/* Header */}
        <div className="header">
          <h1 className="header-title">Motorcycle Helmet Detection</h1>
          <p className="header-sub">Powered by YOLOv8 • Custom model</p>
        </div>

        {/* Main */}
        <div className="content">
          {/* Upload */}
          <div className="upload-center">
            <label className="file-upload">
              <input type="file" accept="image/*" className="hidden" onChange={onSelect} />
              <div className="upload-inner">
                {/* Upload Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="icon-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="upload-title">{uploadLabel}</span>
                <p className="upload-sub">JPG, PNG accepted</p>
              </div>
            </label>
          </div>

          {/* Preview + Result */}
          {previewUrl && (
            <>
              <div className="grid-two mb-24">
                {/* Input */}
                <div className="section-box">
                  <h3 className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon small blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Input Image
                  </h3>
                  <div className="img-wrap">
                    <img src={previewUrl} alt="Preview" className="img" />
                  </div>
                </div>

                {/* Output */}
                <div className="section-box">
                  <h3 className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon small green" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Detection Results
                  </h3>
                  <div className={"img-wrap"}>
                    {resultUrl ? (
                      <img src={resultUrl} alt="Detection result" className="img" />
                    ) : (
                      <p className="placeholder-text">{loading ? "Running the model...Please wait..." : "No result yet, Run the model"}</p>
                    )}
                  </div>
                </div>
              </div>

              {detectionSummary && (
  <div className="detection-summary">
    <p>Detected {detectionSummary}</p>
  </div>
)}

          {/* Loading Indicator (separate) */}
          {loading && (
            <div className="loading">
                <span>Processing image...</span>
            </div>
          )}

              {/* Action Button */}
              <div className="center">
              {(previewUrl && resultUrl) && (
  <button 
    onClick={handleReset} 
    className="reset-btn reset-glow-effect"
  >
    Reset
  </button>
)}

                <button className="primary-btn glow-effect" onClick={predict} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner spinner--button" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <span>Run Helmet Detection</span>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Error */}
          {err && <div className="error">{err}</div>}

        </div>

        {/* Footer */}
        <div className="footer">
          <p> 
          <li>
          <a href={SPACE_URL} target="_blank" rel="noopener noreferrer" className="space-url">Hugging Face Space</a> 
          </li>
          </p>
          <p> 
          <li>
          <a href="https://github.com/thajucp123/helmet-detection.git" target="_blank" rel="noopener noreferrer" className="space-url">Github Repo</a> 
          </li>
          </p>
        </div>
      </div>
    </div>
  );
}
