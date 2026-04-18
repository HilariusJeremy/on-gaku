FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download oemer model weights
RUN OEMER_PATH=$(python -c "import oemer; import os; print(os.path.dirname(oemer.__file__))") && \
    mkdir -p $OEMER_PATH/checkpoints/unet_big $OEMER_PATH/checkpoints/seg_net && \
    curl -L -o $OEMER_PATH/checkpoints/unet_big/model.onnx https://github.com/BreezeWhite/oemer/releases/download/checkpoints/1st_model.onnx && \
    curl -L -o $OEMER_PATH/checkpoints/unet_big/weights.h5 https://github.com/BreezeWhite/oemer/releases/download/checkpoints/1st_weights.h5 && \
    curl -L -o $OEMER_PATH/checkpoints/seg_net/model.onnx https://github.com/BreezeWhite/oemer/releases/download/checkpoints/2nd_model.onnx && \
    curl -L -o $OEMER_PATH/checkpoints/seg_net/weights.h5 https://github.com/BreezeWhite/oemer/releases/download/checkpoints/2nd_weights.h5

COPY . .

RUN mkdir -p uploads

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]