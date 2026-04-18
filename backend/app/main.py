from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import pymupdf, numpy as np

from .omr import (build_clef_map, extract_key_from_oemer, parse_musicxml, extract_measure_bboxes, link_noteheads_to_measures, 
                  extract_notes_from_oemer, render_annotated_image)
import os, argparse
from oemer.ete import extract, clear_data
from oemer import layers
import cv2


app = FastAPI()

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
last_result = None
last_img = None
last_filename = None

def process_image(fdst_path, basename):
    clear_data()
    
    args = argparse.Namespace(
        img_path=fdst_path, output_path=UPLOAD_DIR, use_tf=False, save_cache=True, without_deskew=True)
    extract(args)
    print(f"Processing: {fdst_path}")
    print(f"PKL would be: {os.path.splitext(fdst_path)[0]}.pkl")
    xmlpath = os.path.join(UPLOAD_DIR, f"{basename}.musicxml")
    result = {"key": extract_key_from_oemer()}

    dewarped = layers.get_layer('original_image')
    
    staffs = layers.get_layer('staffs')
    unit_staff_size = staffs.tolist()[0][0].unit_size

    barlines = layers.get_layer('barlines').tolist()
    num_groups = staffs.tolist()[0][-1].group + 1
    bbox_coords = extract_measure_bboxes(num_groups, staffs, barlines, dewarped.shape[1])
    result['measures'] = [{'number': i+1} for i in range(len(bbox_coords))]
    
    for measure, bbox in zip(result['measures'], bbox_coords):
        x1, y1, x2, y2 = bbox
        measure['bbox'] = {'x1': int(x1), 'y1': int(y1), 'x2': int(x2), 'y2': int(y2)}

    clefs = layers.get_layer('clefs')
    clef_map = build_clef_map(layers.get_layer('clefs'))
    notes = extract_notes_from_oemer(layers.get_layer('notes'), clef_map)
    result = link_noteheads_to_measures(result, notes, clef_map, unit_staff_size, dewarped.shape[0])
    result['measures'] = [m for m in result['measures'] if len(m.get('notes', [])) > 0]
    
    dewarped_path = os.path.join(UPLOAD_DIR, f"{basename}_dewarped.png")
    cv2.imwrite(dewarped_path, dewarped)
    result['img_url'] = f"/uploads/{basename}_dewarped.png"
    
    return result, dewarped


@app.post("/annotate")
async def annotate(file: UploadFile = File(...)):
    global last_result, last_img, last_filename
    if file.content_type not in ["image/png", "image/jpeg", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Only PNG, JPEG, and PDF supported.")
    
    fname = file.filename
    basename = os.path.splitext(fname)[0]
    fdst_path = os.path.join(UPLOAD_DIR, fname)
    contents = await file.read()
    with open(fdst_path, 'wb') as fdst:
            fdst.write(contents)

    if file.content_type == "application/pdf":
        doc = pymupdf.open(fdst_path)
        all_results = []
        for page_index, page in enumerate(doc): # iterate over pdf pages
            pix = page.get_pixmap(matrix=pymupdf.Matrix(2.5,2.5))
            np_array = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n) # convert to numpy array
            page_basename = f"{basename}_page{page_index}"
            page_path = os.path.join(UPLOAD_DIR, f"{page_basename}.png")
            cv2.imwrite(page_path, np_array)
            result, dewarped = process_image(page_path, page_basename)

            all_results.append(result)
        last_result = all_results
        last_img = dewarped
        last_filename = page_basename
        return all_results

    else:
        result, dewarped = process_image(fdst_path, basename)
        last_result = [result]
        last_img = dewarped
        last_filename = basename
        return [result]


@app.get("/export")
async def export():
    if last_result is None or last_img is None:
        raise HTTPException(status_code=400, detail="No annotation to export. Run /annotate first.")
    staffs = layers.get_layer('staffs')
    unit_staff_size = staffs.tolist()[0][0].unit_size
    annotated = render_annotated_image(last_result[-1], last_img.copy(), unit_staff_size)
    export_path = os.path.join(UPLOAD_DIR, 'annotated.png')
    cv2.imwrite(export_path, annotated)
    return FileResponse(export_path, media_type='image/png', filename=f'{last_filename}_annotated.png')
    

