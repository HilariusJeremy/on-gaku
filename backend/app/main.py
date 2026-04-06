from fastapi import FastAPI, File, UploadFile, HTTPException
from .omr import parse_musicxml
import os, argparse
from oemer.ete import extract

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/annotate")
async def annotate(file: UploadFile = File(...)):
    if file.content_type not in ["image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="Only PNG and JPEG supported.")
    print(file.filename)
    print(file.content_type)
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
    extract(args)
    basename = os.path.splitext(fname)[0]
    xmlpath = os.path.join(UPLOAD_DIR, f"{basename}.musicxml")
    result = parse_musicxml(xmlpath)
    result['img_url'] = f"/uploads/{fname}"
    return result
