import { useState } from "react";
import { client } from "https://esm.sh/@gradio/client";
import './App.css';

const SPACE_URL = import.meta.env.VITE_SPACE_URL;

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [resultURL, setResultURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr("");
    setResultURL("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const predict = async () => {
  if (!file) { setErr("Upload an image first."); return; }
  setLoading(true);
  setErr("");
  setResultURL("");

  try {
    const app = await client(SPACE_URL);
    const res = await app.predict("/predict", [file]);

    let outputData = res.data[0];

    // Case 1: Base64 string
    if (typeof outputData === "string" && outputData.startsWith("data:image")) {
      setResultURL(outputData);
    }
    // Case 2: Raw base64 without prefix
    else if (typeof outputData === "string") {
      setResultURL(`data:image/png;base64,${outputData}`);
    }
    // Case 3: Blob
    else if (outputData instanceof Blob) {
      const url = URL.createObjectURL(outputData);
      setResultURL(url);
    }
    // Case 4: Object with .url property (common in HF Spaces)
    else if (outputData && outputData.url) {
      setResultURL(outputData.url);
    }
    else {
      throw new Error("Unknown output format from API");
    }
  } catch (e) {
    console.error(e);
    setErr("Prediction failed. Check Space URL or try a smaller image.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Motorcycle Helmet Detection</h1>
        <p style={styles.sub}>YOLOv8 • Custom model (HF Space)</p>

        <label style={styles.uploader}>
          <input type="file" accept="image/*" onChange={onSelect} style={{ display: "none" }} />
          <span>Click to upload an image</span>
        </label>

        {preview && (
          <div style={styles.row}>
            <div style={styles.col}>
              <h3 style={styles.h3}>Input</h3>
              <img src={preview} alt="input" style={styles.img} />
            </div>
            <div style={styles.col}>
              <h3 style={styles.h3}>Output</h3>
              {resultURL ? (
                <img src={resultURL} alt="output" style={styles.img} />
              ) : (
                <div style={styles.placeholder}>No result yet</div>
              )}
            </div>
          </div>
        )}

        <button 
  onClick={predict} 
  disabled={!file || loading} 
  style={{ ...styles.btn, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
>
  {loading && (
    <span className="spinner"></span>
  )}
  {loading ? "Detecting…" : "Run Detection"}
</button>


        {err && <div style={styles.err}>{err}</div>}

        <div style={styles.footer}>
          <span>Space: {SPACE_URL}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1220" },
  card: { width: "min(900px, 92vw)", background: "#10182b", borderRadius: 16, padding: 24, color: "#eaf0ff", boxShadow: "0 8px 30px rgba(0,0,0,0.3)", display: "flex",
    flexDirection: "column",
    alignItems: "center" },
  title: { margin: 0, fontSize: 28, fontWeight: 700 },
  sub: { marginTop: 6, opacity: 0.8 },
  uploader: { marginTop: 16, display: "inline-block", padding: "12px 16px", border: "1px dashed #5f77ff", borderRadius: 10, cursor: "pointer", color: "#cdd6ff" },
  row: { marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  col: { background: "#0d1424", borderRadius: 12, padding: 12, border: "1px solid #1b2440" },
  h3: { margin: "4px 0 10px 0", fontWeight: 600, fontSize: 16 },
  img: { width: "100%", borderRadius: 8, border: "1px solid #1b2440" },
  placeholder: { height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#7f8bb3", border: "1px dashed #26345d", borderRadius: 8 },
  btn: { marginTop: 16, background: "#5f77ff", color: "#fff", border: "none", padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 600 },
  err: { marginTop: 12, color: "#ff7b7b" },
  footer: { marginTop: 14, opacity: 0.7, fontSize: 12 },
  spinner: {
  width: 16,
  height: 16,
  border: "2px solid rgba(255,255,255,0.4)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
}
};
