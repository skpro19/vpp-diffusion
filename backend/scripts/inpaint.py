#!/usr/bin/env python3
"""
Basic inpainting pipeline for product insertion.
Takes frame.png + mask.png + text prompt as input and generates output.
"""

import torch
from diffusers import StableDiffusionInpaintPipeline
from PIL import Image
import argparse
import os
import glob

def setup_cache():
    """Setup HF_HOME to point to our cache directory."""
    cache_dir = os.path.join(os.getcwd(), '.hf_cache')
    os.environ['HF_HOME'] = cache_dir
    print(f"Cache directory: {cache_dir}")
    return cache_dir

def check_cache_status(model_id, cache_dir):
    """Check if model is cached and return status."""
    # Convert model_id to cache path format
    model_name = model_id.replace('/', '--')
    model_cache_path = os.path.join(cache_dir, 'models--' + model_name)
    
    print(f"Looking for model in: {model_cache_path}")
    
    if os.path.exists(model_cache_path):
        # Check for model files
        blobs_dir = os.path.join(model_cache_path, 'blobs')
        if os.path.exists(blobs_dir):
            # Count files and get total size
            files = glob.glob(os.path.join(blobs_dir, '*'))
            if files:
                total_size = sum(os.path.getsize(f) for f in files)
                print(f"Found {len(files)} files in cache")
                return True, len(files), total_size
    
    print(f"Model not found in cache directory")
    return False, 0, 0

def load_images(frame_path, mask_path):
    """Load the frame and mask images."""
    if not os.path.exists(frame_path):
        raise FileNotFoundError(f"Frame image not found: {frame_path}")
    if not os.path.exists(mask_path):
        raise FileNotFoundError(f"Mask image not found: {mask_path}")
    
    frame = Image.open(frame_path).convert("RGB")
    mask = Image.open(mask_path).convert("L")  # Convert to grayscale
    
    print(f"Loaded frame: {frame.size}")
    print(f"Loaded mask: {mask.size}")
    
    return frame, mask

def setup_pipeline(device):
    """Setup the inpainting pipeline."""
    print("Loading inpainting model...")
    
    # Use a newer model that supports .safetensors
    model_id = "stabilityai/stable-diffusion-2-inpainting"
    
    # Check cache status
    cache_dir = os.environ.get('HF_HOME', '')
    is_cached, file_count, total_size = check_cache_status(model_id, cache_dir)
    
    if is_cached:
        print(f"✅ Model found in cache ({file_count} files, {total_size / 1e9:.1f} GB)")
        print("Loading from cache...")
    else:
        print("⚠️  Model not found in cache")
        print("Downloading from Hugging Face Hub...")
    
    # Explicitly set the cache directory and use safetensors
    pipe = StableDiffusionInpaintPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        safety_checker=None,
        cache_dir=cache_dir,
        use_safetensors=True,  # Prioritize .safetensors
        local_files_only=is_cached  # Only use local files if cached
    ).to(device)
    
    print(f"Model loaded successfully on {device}")
    return pipe

def run_inpainting(pipe, frame, mask, prompt, output_path="output.png"):
    """Run the inpainting process."""
    print(f"Running inpainting with prompt: '{prompt}'")
    
    # Generate the inpainted image
    result = pipe(
        prompt=prompt,
        image=frame,
        mask_image=mask,
        guidance_scale=7.5,
        num_inference_steps=30,
        strength=0.75
    ).images[0]
    
    # Save the result
    result.save(output_path)
    print(f"Inpainting completed! Result saved to: {output_path}")
    
    return result

def main():
    parser = argparse.ArgumentParser(description="Basic inpainting pipeline")
    parser.add_argument("--frame", default="images/frame.png", help="Path to frame image")
    parser.add_argument("--mask", default="images/mask.png", help="Path to mask image")
    parser.add_argument("--prompt", default="teddy bear", 
                       help="Text prompt for inpainting")
    parser.add_argument("--output", default="images/output.png", help="Output image path")
    
    args = parser.parse_args()
    
    # Setup cache
    cache_dir = setup_cache()
    
    # Setup device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Load images
    frame, mask = load_images(args.frame, args.mask)
    
    # Setup pipeline
    pipe = setup_pipeline(device)
    
    # Run inpainting
    result = run_inpainting(pipe, frame, mask, args.prompt, args.output)
    
    print("Pipeline completed successfully!")

if __name__ == "__main__":
    main()
