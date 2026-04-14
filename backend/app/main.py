from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .omr import (parse_musicxml, extract_measure_bboxes, link_noteheads_to_measures, 
                  extract_notes_from_oemer, render_annotated_image)
import os, argparse
from oemer.ete import extract
from oemer import layers
import cv2


app = FastAPI()
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

@app.post("/annotate")
async def annotate(file: UploadFile = File(...)):
    global last_result, last_img, last_filename
    if file.content_type not in ["image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="Only PNG and JPEG supported.")
    fname = file.filename
    fdst_path = os.path.join(UPLOAD_DIR, fname)
    contents = await file.read()
    with open(fdst_path, 'wb') as fdst:
        fdst.write(contents)
    args = argparse.Namespace(img_path=fdst_path, 
                                output_path=UPLOAD_DIR, 
                                use_tf=False, 
                                save_cache=True,
                                without_deskew=False)
    try:
        extract(args)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OMR processing failed: {str(e)}")

    basename = os.path.splitext(fname)[0]
    xmlpath = os.path.join(UPLOAD_DIR, f"{basename}.musicxml")
    result = parse_musicxml(xmlpath)

    dewarped = layers.get_layer('original_image')
    staffs = layers.get_layer('staffs')
    barlines = layers.get_layer('barlines').tolist()
    num_groups = staffs.tolist()[0][-1].group + 1

    bbox_coords = extract_measure_bboxes(num_groups, staffs, barlines, dewarped.shape[1])
    
    # attach bboxes to measures
    for measure, bbox in zip(result['measures'], bbox_coords):
        x1, y1, x2, y2 = bbox
        measure['bbox'] = {'x1': int(x1), 'y1': int(y1), 'x2': int(x2), 'y2': int(y2)}

    # Link notes with its bounding box
    notes_layer = layers.get_layer('notes')
    notes = extract_notes_from_oemer(notes_layer)
    result = link_noteheads_to_measures(result, notes)
    
    dewarped_path = os.path.join(UPLOAD_DIR, f"{basename}_dewarped.png")
    cv2.imwrite(dewarped_path, dewarped)

    result['img_url'] = f"/uploads/{basename}_dewarped.png"
    last_result = result
    last_img = dewarped
    last_filename = basename

    return result


@app.get("/export")
async def export():
    if last_result is None or last_img is None:
        raise HTTPException(status_code=400, detail="No annotation to export. Run /annotate first.")
    annotated = render_annotated_image(last_result, last_img.copy())
    export_path = os.path.join(UPLOAD_DIR, 'annotated.png')
    cv2.imwrite(export_path, annotated)
    return FileResponse(export_path, media_type='image/png', filename=f'{last_filename}_annotated.png')
    

