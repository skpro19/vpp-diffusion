# Backend

This directory contains the backend components for the VPP Diffusion project.

## Directory Structure

```
backend/
├── bash/                    # Bash scripts for automation
│   ├── run_inpaint.sh      # Run inpainting pipeline
│   ├── setup_env.sh        # Setup development environment
│   ├── clean_cache.sh      # Clean Hugging Face cache
│   └── test_setup.sh       # Run test setup
├── scripts/                 # Python scripts
│   ├── inpaint.py          # Main inpainting pipeline
│   ├── test_setup.py       # Test environment setup
│   └── create_test_images.py # Create test images
├── images/                  # Input/output images
├── requirements.txt         # Python dependencies
├── .venv/                  # Python virtual environment
├── .hf_cache/              # Hugging Face model cache
└── README.md               # This file
```

## Quick Start

### 1. Setup Environment
```bash
./bash/setup_env.sh
```

### 2. Run Inpainting
```bash
./bash/run_inpaint.sh
```

### 3. Test Setup
```bash
./bash/test_setup.sh
```

### 4. Clean Cache (if needed)
```bash
./bash/clean_cache.sh
```

## Manual Commands

### Activate Virtual Environment
```bash
source .venv/bin/activate
```

### Run Inpainting with Custom Parameters
```bash
export HF_HOME=./.hf_cache
python scripts/inpaint.py --prompt "your custom prompt" --output "custom_output.png"
```

### Install Dependencies
```bash
TMPDIR=./pip-cache pip install -r requirements.txt
```

## Environment Variables

- `HF_HOME`: Points to `./.hf_cache` for Hugging Face model cache
- `TMPDIR`: Points to `./pip-cache` for pip cache during installation

## Cache Management

The Hugging Face cache is stored in `.hf_cache/` and contains downloaded models. Use `./bash/clean_cache.sh` to free up disk space if needed.

## Scripts

### Python Scripts (`scripts/`)
- `inpaint.py`: Main inpainting pipeline using Stable Diffusion 2
- `test_setup.py`: Test environment and dependencies
- `create_test_images.py`: Generate test images for development

### Bash Scripts (`bash/`)
- `run_inpaint.sh`: Automated inpainting pipeline runner
- `setup_env.sh`: Environment setup automation
- `clean_cache.sh`: Cache cleanup utility
- `test_setup.sh`: Test environment runner
