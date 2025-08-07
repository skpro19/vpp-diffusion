#!/usr/bin/env python3
"""
Test script to verify our setup and basic imports.
"""

import torch
import diffusers
import transformers
import PIL
import numpy as np
import cv2

def test_imports():
    """Test that all required packages can be imported."""
    print("Testing imports...")
    
    # Test PyTorch
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA device: {torch.cuda.get_device_name()}")
        print(f"CUDA memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    
    # Test other packages
    print(f"Diffusers version: {diffusers.__version__}")
    print(f"Transformers version: {transformers.__version__}")
    print(f"PIL version: {PIL.__version__}")
    print(f"OpenCV version: {cv2.__version__}")
    
    print("All imports successful!")

def test_gpu():
    """Test GPU functionality."""
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"Using GPU: {torch.cuda.get_device_name()}")
        
        # Test basic tensor operations
        x = torch.randn(2, 3, 512, 512).to(device)
        y = torch.randn(2, 3, 512, 512).to(device)
        z = x + y
        print(f"GPU tensor operation successful: {z.shape}")
    else:
        print("CUDA not available, using CPU")
        device = torch.device("cpu")
    
    return device

if __name__ == "__main__":
    test_imports()
    device = test_gpu()
    print(f"Setup test completed successfully!")
