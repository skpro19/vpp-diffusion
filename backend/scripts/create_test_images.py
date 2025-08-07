#!/usr/bin/env python3
"""
Create test images for the inpainting pipeline.
"""

import numpy as np
from PIL import Image, ImageDraw
import os

def create_test_frame():
    """Create a simple test frame with a table surface."""
    # Create a 512x512 image with a wooden table texture
    width, height = 512, 512
    
    # Create a base image with wood-like color
    frame = Image.new('RGB', (width, height), color=(139, 69, 19))  # Brown wood color
    
    # Add some texture by drawing lines
    draw = ImageDraw.Draw(frame)
    
    # Draw horizontal wood grain lines
    for y in range(0, height, 20):
        color = (160, 82, 45) if y % 40 == 0 else (139, 69, 19)
        draw.line([(0, y), (width, y)], fill=color, width=2)
    
    # Add some variation
    for i in range(10):
        x = np.random.randint(0, width)
        y = np.random.randint(0, height)
        color = (160, 82, 45)
        draw.ellipse([x-5, y-5, x+5, y+5], fill=color)
    
    return frame

def create_test_mask():
    """Create a simple mask for the test frame."""
    width, height = 512, 512
    
    # Create a black background
    mask = Image.new('L', (width, height), color=0)
    draw = ImageDraw.Draw(mask)
    
    # Draw a white circle in the center (this is where the object will be inserted)
    center_x, center_y = width // 2, height // 2
    radius = 80
    
    # Draw a circular mask
    draw.ellipse([
        center_x - radius, 
        center_y - radius, 
        center_x + radius, 
        center_y + radius
    ], fill=255)
    
    return mask

def main():
    """Create test images."""
    # Ensure images directory exists
    os.makedirs("images", exist_ok=True)
    
    # Create test frame
    print("Creating test frame...")
    frame = create_test_frame()
    frame.save("images/frame.png")
    print("Saved frame.png")
    
    # Create test mask
    print("Creating test mask...")
    mask = create_test_mask()
    mask.save("images/mask.png")
    print("Saved mask.png")
    
    print("Test images created successfully!")
    print("You can now run: python inpaint.py")

if __name__ == "__main__":
    main()
