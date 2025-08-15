<div align="center"><img src="./src/assets/icon.png" alt="Logo" width="80" height="80"></div>

# 🏍️ Motorcycle Helmet Detection (YOLOv8)

[![Live Demo - Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-brightgreen?style=for-the-badge)](https://helmet-detection-xi.vercel.app/)
[![Hugging Face Space](https://img.shields.io/badge/Hugging%20Face-Space-orange?style=for-the-badge&logo=huggingface)](https://tdcdpd-helmet-detection.hf.space)

## 📌 Overview
A **computer vision web app** that detects whether motorcycle riders are wearing helmets using **YOLOv8** object detection.

The system is trained on a public dataset from Roboflow and can process user-uploaded images, returning results with bounding boxes for **With Helmet** and **Without Helmet**.

---

## 🚀 Live Links
- **Frontend (React + Vercel)** → [helmet-detection.vercel.app](https://helmet-detection-xi.vercel.app/)  
- **Backend (Hugging Face Space)** → [tdcdpd-helmet-detection.hf.space](https://tdcdpd-helmet-detection.hf.space)

---

## 🖼️ Screenshots

### Upload & Detect

![Upload Demo](./src/assets/demo-input.png)

### Detection Output

![Detection Demo](./src/assets/demo-output.png)

---

## 🛠️ Tech Stack
**Model & Training**
- [YOLOv8](https://github.com/ultralytics/ultralytics) nano (Ultralytics)
- [Roboflow](https://roboflow.com/) for dataset preparation
- Google Colab for training

**Frontend**
- React (Vite)
- [@gradio/client](https://www.npmjs.com/package/@gradio/client) to connect to Hugging Face Space
- Vercel for hosting

**Backend**
- Hugging Face Spaces
- Gradio for serving YOLO model predictions

---

## ⚙️ How It Works
1. **Upload an image** of a motorcycle rider from the React frontend.
2. The image is sent to the Hugging Face Space running the YOLOv8 model.
3. The model predicts bounding boxes for **With Helmet** and **Without Helmet**.
4. The annotated image is returned to the frontend and displayed.

---

## 📂 Project Structure

```sh
frontend/      # React UI code
  src/
    App.jsx    # Main UI logic
    App.css    # Styling

backend/       # Hugging Face Space files
  app.py       # Gradio app
  best.pt      # Trained YOLOv8 model
  requirements.txt
```

## 🚀 Development

### Prerequisites

If you have installed nodejs, proceed to install npm:
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

_To run the front end:_

1. Clone the repo
   ```sh
   git clone https://github.com/thajucp123/helmet-detection.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Run Development Server
   ```sh
   npm run dev
   ```


### Front End

#### Made using React + Vite.

We use the API end point of `predict/` from our HF space to input the image and get the result of prediction.

```python
try {
    const app = await client(SPACE_URL);
    const res = await app.predict("/predict", [file]);
    let outputData = res.data[0];
    ..
    ..
```

The received output is then displayed in an image tag.

```html
<div style={styles.col}>
              <h3 style={styles.h3}>Output</h3>
              {resultURL ? (
                <img src={resultURL} alt="output" style={styles.img} />
              ) : (
                <div style={styles.placeholder}>No result yet</div>
              )}
            </div>
```

### Back End

#### The model is trained using Google Colab and then deployed to a Hugging Face space with Gradio sdk

To train the model we used a Roboflow dataset with following configuration.

```bash
from roboflow import Roboflow
# 👉 Fill these if using Roboflow (Recommended)
ROBOFLOW_API_KEY = "YOUR_API_KEY_HERE"   # Your API key
ROBOFLOW_WORKSPACE = "lavanya-f4fhr"        # Workspace name
ROBOFLOW_PROJECT = "bike-helmet-detection-6pxyk"      # Project name
ROBOFLOW_VERSION = 1                        # Dataset version

USE_ROBOFLOW = len(ROBOFLOW_API_KEY) > 0 and len(ROBOFLOW_WORKSPACE) > 0 and len(ROBOFLOW_PROJECT) > 0
print("Using Roboflow:", USE_ROBOFLOW)
```

### For 🤗 Hugging Face Space

#### After completing the training, we download the model weight `best.pt` and create the following files for Gradio app:

- `app.py`
- `requirements.txt`
- a configuration `Readme.MD`

`app.py`:

```python
import gradio as gr
from ultralytics import YOLO
import cv2
import numpy as np
import os

# ✅ Path to your trained weights (make sure best.pt is in the Space files)
MODEL_PATH = "best.pt"
model = YOLO(MODEL_PATH)

def predict_image(img):
    try:
        # Ensure numpy uint8 RGB format
        img = np.array(img).astype(np.uint8)

        # Run YOLO inference
        res = model.predict(source=img, save=False, conf=0.5, imgsz=640)

        # Get first result and render
        r = res[0]
        im = r.plot()  # BGR from OpenCV
        im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)  # Convert to RGB for Gradio
        
        return im
    except Exception as e:
        print(f"Error during prediction: {e}")
        return np.zeros((640, 640, 3), dtype=np.uint8)

# ✅ Create Gradio interface
demo = gr.Interface(
    fn=predict_image,
    inputs=gr.Image(type="numpy", label="Upload motorcycle image"),
    outputs=gr.Image(type="numpy", label="Detections"),
    title="Motorcycle Helmet Detection (YOLOv8)",
    description="Detects helmets and no-helmets on motorcyclists using YOLOv8."
)

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.environ.get("PORT", 7860)), share=True)
```

### Here's the Hugging Face space for this project: [Space](https://tdcdpd-helmet-detection.hf.space)

`requirements.tx:`

```sh
gradio>=5.42.0
ultralytics>=8.2.0
opencv-python-headless
numpy
```


## ✏️ Note

>⚠️ This is a demonstration model with low epochs for testing purposes only. It may produce inaccurate predictions on unseen data. For production, retraining with a larger, diverse dataset and proper evaluation is recommended.
>
## 📬 Contact

**Author: Thaju**

📧 Email: thajucp123@gmail.com <br/>
💼 LinkedIn: linkedin.com/in/thaju-fakrudheen/ <br/>
🤗 Hugging Face: https://huggingface.co/spaces/tdcdpd/ <br/>