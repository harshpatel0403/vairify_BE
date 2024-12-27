from deepface import DeepFace
import cv2
import matplotlib.pyplot as plt
import sys
import json

# Paths to the two images you want to compare
image_path_1 = sys.argv[1]
image_path_2 = sys.argv[2]

# plt.imshow(image_path_1[:,:,::-1])
# plt.show()

# plt.imshow(image_path_2[:,:,::-1])
# plt.show()


# Perform face verification using DeepFace
result = DeepFace.verify(image_path_2, image_path_1)

print(result['verified'])
sys.stdout.flush()
# Check if the faces are verified
# if result["verified"]:
#     print("The faces are verified to be of the same person.")
# else:
#     print("The faces are not verified to be of the same person.")
