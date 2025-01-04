from deepface import DeepFace
import cv2
import matplotlib.pyplot as plt
import sys
import json
import os
from dotenv import load_dotenv
load_dotenv()
tf_log_level = os.getenv('TF_CPP_MIN_LOG_LEVEL', '2')  # Default to '2' if not found
cuda_visible_devices = os.getenv('CUDA_VISIBLE_DEVICES', '-1')  # Default to '-1' if not found

# Set the environment variables
os.environ['TF_CPP_MIN_LOG_LEVEL'] = tf_log_level
os.environ["CUDA_VISIBLE_DEVICES"] = cuda_visible_devices

if len(sys.argv) < 3:
    error_message = json.dumps({"error": "Image paths are missing!"})
    print(error_message)
    sys.stdout.flush()
    sys.exit(1)

image_path_1 = sys.argv[1]
image_path_2 = sys.argv[2]

# plt.imshow(image_path_1[:,:,::-1])
# plt.show()

# plt.imshow(image_path_2[:,:,::-1])
# plt.show()


# Perform face verification using DeepFace
try:
    result = DeepFace.verify(image_path_2, image_path_1, enforce_detection=False)
    output = {"verified": result["verified"]}
    print(json.dumps(output))
    sys.stdout.flush()
except Exception as e:
    error_output = {"error": str(e)}
    print(json.dumps(error_output))
    sys.stdout.flush()
    sys.exit(1)
# Check if the faces are verified
# if result["verified"]:
#     print("The faces are verified to be of the same person.")
# else:
#     print("The faces are not verified to be of the same person.")
