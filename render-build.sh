#!/usr/bin/env bash
# Install dependencies for OpenCV and TensorFlow
apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6

# Install Python dependencies
pip install -r requirements.txt
