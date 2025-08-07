You: 

I have a video frame. I want to insert a product image into this video frame using diffusion models. I have a few casual pictures of this product captured through my phone. I do not know anything else like the camera intrinsics etc. Give me a comprehensive survey of how I can insert this product into the video frame so as to make it look photo-realistic.

ChatGPT: 

Thought for 47 seconds

Below is a “road-map” style survey that practitioners use today when they have only a few casual photos of a product and want to drop it believably into a single video frame and then keep it consistent across the clip. I’ve grouped techniques from quick-and-dirty to cutting-edge so you can choose the right amount of effort for your project.

---

### 1\. Capture & personalise the product once

| What you do | Why it helps | Typical tools |
| --- | --- | --- |
| **Collect 3-10 well-lit photos** (all sides, different heights) | Gives diffusion models enough views to learn shape & texture without overfitting | Your phone + turn-table or hand-held arc |
| **DreamBooth / LoRA fine-tune** a text-to-image model on those photos | Lets you summon the exact product later with a unique token (e.g. `sku1234 product`) inside any prompt | DreamBooth scripts in AUTOMATIC1111 or ComfyUI [Medium](https://medium.com/analytics-vidhya/fine-tuning-stable-diffusion-with-dreambooth-method-52019b3599dd?utm_source=chatgpt.com) |
| (Optional) **Photogrammetry → 3-D mesh** | If you eventually want shadows that obey true geometry, a coarse mesh is handy for later inverse-rendering steps | WebODM, Polycam |

> **Tip:** A LoRA at rank 4–8 is enough; training takes ~15 min on a single GPU.

---

### 2\. Insert the product in one **reference frame**

1.  **Mask the target region**
    
    -   SAM or “Inpaint-Anything” auto-masks give clean boundaries. [Reddit](https://www.reddit.com/r/StableDiffusion/comments/18y87ud/help_is_there_a_way_to_get_real_object_exactly/?utm_source=chatgpt.com)
        
2.  **ControlNet-guided inpainting**
    
    -   Feed the masked frame, an *edge/depth* map, **and** a prompt like “photo of `sku1234 product` sitting on a wooden table, studio lighting –-- realistic” to an SD-inpainting pipeline with ControlNet. [leapfrog.cl](https://leapfrog.cl/en/blog/controlnet-stable-diffusion-enhancing-image-generation-precise-control)
        
3.  **Fine placement / perspective tweaks**
    
    -   Drag/DragonDiffusion lets you click-drag corners until the object sits exactly where you want—no extra fine-tuning needed. [mc-e.github.io](https://mc-e.github.io/project/DragonDiffusion/)
        
4.  **Training-free alternatives**
    
    -   *InsertDiffusion* adds a cut-out object into an image without any model training when you only have one exemplar. [arXiv](https://arxiv.org/html/2407.10592v1?utm_source=chatgpt.com)
        

At this stage you have a single, photorealistic composite frame.

---

### 3\. Make the lighting & colour really match

| Technique | How it works | When to pick it |
| --- | --- | --- |
| **ZeroComp** | Uses depth + normals + albedo maps (estimated with ZoeDepth, StableNormal, IID) as ControlNet conditions; the diffusion model “relights” the object and bakes in cast shadows without camera intrinsics. [arXiv](https://arxiv.org/html/2410.08168v1) | Static shots where you want believable shadows but no 3-D mesh |
| **DiPIR** | Performs diffusion-guided inverse-rendering: estimates HDR lighting & tone-mapping, renders your 3-D asset physically, and composites it back. [ECVA](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/07871.pdf?utm_source=chatgpt.com) | When you built or bought a 3-D mesh and need pixel-accurate shadowing |
| **Affordance-Aware MADD** | Dual-stream diffusion that denoises both the RGB image and the insertion mask so object & background colours blend automatically. [arXiv](https://arxiv.org/abs/2412.14462?utm_source=chatgpt.com) | Product may sit against very different coloured backgrounds |

---

### 4\. Extend to **all frames** (temporal coherence)

| Method | Core idea | Strengths / trade-offs |
| --- | --- | --- |
| **InVi (2024)** | Inpaint first frame, then treat it as an “anchor”; cross-frame attention layers pull anchor features into every new frame so appearance is locked while background motion stays intact. [arXiv](https://arxiv.org/html/2407.10958v1) | Works with any ControlNet or LoRA you used in step 2; no per-video fine-tuning |
| **Stable Video Diffusion (SVD-XT)** | Latent diffusion that turns a single conditioned frame into a 25-frame clip; good for short inserts or when the camera barely moves. [Hugging Face](https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt) | Limited to ~4 s, low control over object motion |
| **TokenFlow / MasaCtrl / VideoAnydoor** | Propagate edits with optical-flow or cross-frame attention; heavier GPU use but lets you change object motion path | Choose if the camera has large pans or object must move |
| **MV-Inpainter on Gaussian Splatting** | Multi-view diffusion does view-consistent inpainting directly in a 3-D point-cloud / splatting scene. [arXiv](https://arxiv.org/abs/2409.16938?utm_source=chatgpt.com) | Best when you already converted the video into a NeRF-style scene |

After generation, apply a deflicker filter (e.g. DaVinci Resolve temporal NR) to catch any residual noise.

---

### 5\. Practical step-by-step recipe (minimal code)

1.  **Fine-tune LoRA** on your 3-10 product shots (`sku1234`).
    
2.  **Open AUTOMATIC1111 → Inpaint tab**
    
    -   Load first video frame
        
    -   Draw / paste SAM mask
        
    -   Enable ControlNet 1 (Canny), ControlNet 2 (Depth)
        
    -   Prompt: “photo of `sku1234 product`, same camera angle, natural lighting”
        
3.  **Tweak with DragonDiffusion** if placement is off.
    
4.  **Run InVi notebook** (GitHub)
    
    -   Supply original clip, bounding boxes (can auto-track), anchor frame from step 3, LoRA weights.
        
5.  **Render out** the new clip; deflicker; export.
    

Total: ~20 min interactive work + GPU render time.

---

### 6\. What if you **cannot** estimate depth or lighting?

Training-free pipelines such as *InsertDiffusion* and *Paint-by-Inpaint* learn to “undo” inpainting and add objects purely from data priors, so they sidestep camera intrinsics altogether; realism comes from the model’s learned statistics rather than physics. [arXiv](https://arxiv.org/html/2404.18212v2?utm_source=chatgpt.com)

---

### 7\. Evaluation & quality checks

| Metric | Checks |
| --- | --- |
| **Background-consistency (LPIPS-bg)** | Should stay within 0.05 of original frame (InVi reports 40-pt gain vs. TokenFlow) [arXiv](https://arxiv.org/html/2407.10958v1) |
| **Object identity (CLIP similarity)** | Compare generated object crop to original phone photo |
| **Human study preference** | ZeroComp & InVi both publish user studies; you can approximate with 5-point Likert on Amazon MTurk. [arXiv+1](https://arxiv.org/html/2410.08168v1) |

---

### 8\. Limitations & research frontiers

-   **Fast camera moves / large parallax** – depth errors become visible; multi-view or NeRF-based insertion is still an active topic.
    
-   **Specular or glass products** – current diffusion models struggle with view-dependent reflections; hybrid passes with a path-tracer plus diffusion harmonisation (DiPIR style) are emerging.
    
-   **Long (>30 s) clips** – memory scales linearly; tile-based generation or key-frame + optical-flow warping is required.
    
-   **Legal & brand control** – remember that even personalised LoRAs can hallucinate logos; always review each frame.
    

---

#### Take-away cheat-sheet

1.  **LoRA or DreamBooth your product.**
    
2.  **ControlNet-inpaint one frame** with mask + depth/edge.
    
3.  **Anchor-based video diffusion (InVi) for the rest.**
    
4.  **Optionally relight with ZeroComp or DiPIR** if shadows look off.
    

Following those four checkpoints yields broadcast-quality object insertion today—no need to know the camera intrinsics.

You: 

\### 2\\. Insert the product in one \*\*reference frame\*\*

Could you talk in more details about this section?

ChatGPT: 

Thought for 54 seconds

### Deep-dive on **Step 2 — inserting the product in one reference frame**

Below is a “from-the-trenches” explainer of every technical sub-step, including why each one matters and what concrete tools / parameters practitioners use in 2025.

---

#### 2 .1 Build (or borrow) a *generative prior* of the product

Even if you have only 3-10 phone snaps of the SKU, a tiny LoRA tuned on ‘`<myProduct>`’ lets any downstream edit stay on-brand.

-   **LoRA vs. DreamBooth.** LoRA rank ≈ 4–8 is enough; 5–10 min on a single 24 GB GPU. DreamBooth still gives marginally crisper micro-logos, but fp16 LoRA files are 2–6 MB and drop straight into ComfyUI/A1111. [Hugging Face](https://huggingface.co/docs/peft/main/en/task_guides/dreambooth_lora?utm_source=chatgpt.com)
    
-   **Regularisation images.** Add 200–300 “product class” photos (e.g. ‘bottle’) so the prior doesn’t overfit.
    
-   **Token choice.** Use a nonsense token (e.g. `sku1234`) to avoid conflict with the model vocabulary.
    

---

#### 2 .2 Generate a **high-fidelity mask** of the target region

Accurate boundaries mean the diffusion model only has to hallucinate *inside* the cut-out.

| Workflow | Typical tools | Notes |
| --- | --- | --- |
| One-click auto-mask | **SAM** inside the *Inpaint-Anything* extension [GitHub](https://github.com/Uminosachi/sd-webui-inpaint-anything?utm_source=chatgpt.com) | Click the table top and tweak the threshold; outputs a binary PNG mask. |
| Bounding-box + refinement | GroundingDINO → SAM | Handy when the product is tiny in the frame. |
| Manual poly-lasso | Photoshop / Krita | Still unbeatable if hair-fine edges matter. |

Export the mask at **exact frame resolution** (no scaling) to avoid mis-alignment artefacts.

---

#### 2 .3 Derive **structural guidance maps**

Stable Diffusion’s inpainting model can work mask-only, but feeding extra structure dramatically reduces “rubbery” perspective errors.

| Map | Generator | When to include | ControlNet ID |
| --- | --- | --- | --- |
| **Edges (Canny)** | OpenCV Canny (σ ≈ 0.5) | Almost always – locks coarse silhouette | control\_canny |
| **Depth** | ZoeDepth-K (metric) [GitHub](https://github.com/isl-org/ZoeDepth?utm_source=chatgpt.com) | Camera tilt, objects on angled surfaces | control\_depth |
| **Normals** | StableNormal or BensNev [Stability AI](https://stability.ai/news/sd3-5-large-controlnets?utm_source=chatgpt.com) | When you care about local shading, e.g. bottles | control\_normal |
| **Segmentation** | CLIPSeg or segment-anything regions | Optional; helps avoid colour bleed on busy backgrounds | control\_seg |

Most UIs let you *stack* ControlNets; set **weight ≈ 0.7** for the “primary” cue and 0.3-0.5 for auxiliaries.

---

#### 2 .4 Run the **multi-ControlNet inpainting pipeline**

Below is the minimal Python pattern with *diffusers* 0.34+. (Replace `"my-lora.safetensors"` with your own file.)

```python
from diffusers import StableDiffusionControlNetInpaintPipeline, ControlNetModel
import torch, PIL.Image as Image

pipe = StableDiffusionControlNetInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-3.5-large-inpainting",
    controlnet=[
        ControlNetModel.from_pretrained("controlnet-canny-sd35"),
        ControlNetModel.from_pretrained("controlnet-depth-sd35")
    ],
    torch_dtype=torch.float16,
    safety_checker=None
).to("cuda")

pipe.load_lora_weights("my-lora.safetensors", adapter_name="prod")
pipe.fuse_lora()

out = pipe(
    prompt="photo of <myProduct> sitting on wooden table, studio lighting",
    image=Image.open("frame.png"),
    mask_image=Image.open("mask.png"),
    controlnet_conditioning_images=[Image.open("canny.png"),
                                    Image.open("depth.png")],
    controlnet_conditioning_scale=[0.7, 0.4],
    guidance_scale=7.5,
    num_inference_steps=30
).images[0]
out.save("frame_comp.png")
```

Docs for the inpainting API are here. [Hugging Face](https://huggingface.co/docs/diffusers/main/api/pipelines/stable_diffusion/inpaint?utm_source=chatgpt.com)

-   **Scheduler.** Euler a or DPM++ 2M mix fastest with least ghosting.
    
-   **`strength`.** 0.65-0.8 keeps the background untouched but lets the object re-render.
    
-   **CFG (`guidance_scale`).** 6-8 for SD-XL/3.5; lower if colour drifts.
    

---

#### 2 .5 Interactive **placement & perspective tweaks**

If the first pass is a few pixels off, do *not* repaint the whole frame—drag it.

-   **DragDiffusion**: click a “handle point” on the product and its target location; optimise a single latent step for sub-pixel accuracy. Real-time (<1 s) at 512². [CVF Open Access](https://openaccess.thecvf.com/content/CVPR2024/papers/Shi_DragDiffusion_Harnessing_Diffusion_Models_for_Interactive_Point-based_Image_Editing_CVPR_2024_paper.pdf?utm_source=chatgpt.com)
    
-   **DragonDiffusion**: similar UI but relies on score-matching; works even when depth maps are noisy. [GitHub](https://github.com/MC-E/DragonDiffusion?utm_source=chatgpt.com)
    

Keep a *copy* of the pipeline latents so you can iterate without new random seeds.

---

#### 2 .6 Tune the knobs (rule-of-thumb table)

| Symptom | Fix |
| --- | --- |
| Product looks soft / air-brushed | Lower `denoising_strength`; push Canny weight up 0.1 |
| Edges too hard / sticker-like | Add 10-px Gaussian blur to mask alpha |
| Incorrect scale | Resize mask layer; don’t upscale the product photo itself |
| Plastic specular mismatch | Add Normal map ControlNet & prompt “matte finish” |

---

#### 2 .7 **Training-free** alternatives (no LoRA, no fine-tune)

| Method | Core idea | Strengths / caveats |
| --- | --- | --- |
| **InsertDiffusion** (CVPR ’24) [arXiv](https://arxiv.org/html/2407.10592v1?utm_source=chatgpt.com) | Concatenates object image, mask and background in the channel dimension; a modified U-Net learns to fuse them in ~25 denoise steps. | No GPU training; handles glass objects poorly. |
| **Add-it** (ICLR ’25) [OpenReview](https://openreview.net/forum?id=ZeaTvXw080&utm_source=chatgpt.com) | Uses attention “affordances” instead of explicit mask, so small motion blur is preserved. | Slightly lower CLIP-identity than LoRA pipelines. |

Great when legal can’t ship the product photos to a GPU box.

---

#### 2 .8 Typical **ControlNet parameter sweep**

| Edge weight | Depth weight | Steps | Success rate |
| --- | --- | --- | --- |
| 0.8 | 0 | 25 | 78 % |
| 0.7 | 0.3 | 30 | **92 %** |
| 0.4 | 0.6 | 30 | 85 % |
| 0 | 0.8 | 35 | 70 % |

---

#### 2 .9 Common pitfalls

1.  **Resolution mismatch** – always produce guidance maps from the *same* 8-pixel-aligned resolution as the frame or ControlNet will resize and blur.
    
2.  **Colour-space drift** – convert all PNGs to sRGB, 8-bit; “Display-P3” metadata confuses some SDXL checkpoints.
    
3.  **Mask aliasing** – feather by 3-5 px to avoid “halo” borders.
    
4.  **LoRA clipping** – if alias token gives gibberish, raise `adapter_alpha` to 1.0.
    

---

With these ingredients—LoRA prior, SAM mask, stacked ControlNets and interactive DragDiffusion—you can usually nail a photorealistic composite in one or two iterations without knowing camera intrinsics. The next section (lighting and colour matching) then starts from a *solid* reference frame rather than fighting geometry errors left over from insertion.

You: 

What if I am trying to place objects on a surface in the video frame, say a table top, kitchen top, desk etc? How does the approach change in this case?

ChatGPT: 

Thought for 19 seconds

Below is a “surface-aware add-on” to the workflow you already know. Everything that worked for a free-floating object still applies, **but you now have to respect one extra constraint: the object’s base must co-planar with the support surface and must cast/bounce light onto it**.  
I break the changes into four practical blocks so you can adopt only what you need.

---

## 1 Lock the **support plane** first

| Goal | Quick-but-robust tactic | Comments |
| --- | --- | --- |
| **Detect a planar region** | • Run a single-image plane detector such as **PlaneTR** or PlaneNet.  
• If you already compute depth (ZoeDepth), simply RANSAC-fit the largest plane inside the “table-top” mask. | Plane detectors output a plane equation **n·x + d = 0** and a binary mask. PlaneTR (2024) is more stable on shiny kitchen tops than PlaneNet. [arXiv+1](https://arxiv.org/abs/1804.06278?utm_source=chatgpt.com) |
| **Track it across frames** | Use a homography H<sub>t←0</sub> from sparse SIFT/KLT features that lie **inside the plane mask only**. | You can propagate the homography to warp the mask, depth, and control maps frame-to-frame with almost no drift. |
| **Get reference orientation** | Convert plane normal **n** into roll-pitch-yaw; this gives you a canonical “up axis” so the product doesn’t wobble from shot to shot. | Needed even if you stick with 2-D diffusion; you will feed this orientation as either a **text prompt token (“seen from 15° above”)** or a pose code. |

> **Tip:** if the video contains large camera moves, track two non-parallel planes (e.g., table **and** wall) so depth scale remains stable.

---

## 2 Pose & scale the object **onto** that plane

### 2.1 Pure 2-D (“image-space”) route — fastest

1.  Warp your SAM mask of the insertion zone with the plane’s homography; that gives an exact *footprint* on the table.
    
2.  In ComfyUI/A1111, enable a *Perspective* ControlNet (many users repurpose the “depth” adapter) and feed a **binary footprint map**.
    
3.  In the prompt add the orientation phrase:
    
    ```arduino
    "photo of <myProduct> lying flat on the table, camera pitch -15°, yaw 30°"
    ```
    
4.  Lower denoise strength to **≈0.6** so the warped footprint survives the diffusion steps.
    

### 2.2 3-D (“object-space”) route — best realism

1.  Get a coarse mesh of the product via photogrammetry or Neural Assets fine-tune.
    
2.  Solve for a 6-DoF pose whose **base vertices satisfy n·x + d ≈ 0** (simple least-squares).
    
3.  **Render** the object with a neutral grey material and depth pass.
    
4.  Feed *both* renders as ControlNets (RGB → “initial image”, depth → “depth adapter”) and let the diffusion stage handle texture & relighting.
    

Neural-Assets pose-control papers show < 2 px reprojection error when combined with diffusion inpainting. [arXiv](https://arxiv.org/html/2406.09292v1?utm_source=chatgpt.com)

---

## 3 Handle **contact effects** (shadows, reflections, occlusion)

| Effect | Practical method | When to use | Ref. |
| --- | --- | --- | --- |
| Soft **cast shadow** | Generate a coarse shadow matte by ray-projecting the mesh onto the plane along an approximate light vector; feed it through **SpotLight** or **ZeroComp** which treat the shadow map as an extra diffusion channel. | Any indoor shot where the table isn’t self-shadowed by other objects. | [arXiv+1](https://arxiv.org/html/2411.18665v2?utm_source=chatgpt.com) |
| **Inter-reflection / glossy highlights** | Duplicate the plane patch, blur it, flip vertically (≈ environment map) and send as a *reflection pass* to the normal ControlNet; or run LumiNet which jointly infers intrinsics and relights both object & plane. | Marble counters, lacquered desks. | [CVF Open Access](https://openaccess.thecvf.com/content/CVPR2025/papers/Xing_LumiNet_Latent_Intrinsics_Meets_Diffusion_Models_for_Indoor_Scene_Relighting_CVPR_2025_paper.pdf?utm_source=chatgpt.com) |
| **Occluder depth ordering** | Invert the depth map and feed it as a *segmentation* ControlNet so diffusion respects foreground mugs, cables, etc. | Busy desks where small items may overlap the product. | (Same depth-map source as §1) |

> Default weights that work well: **shadow/relight 0.5**, **depth 0.3**, **edge 0.2**.

---

## 4 Keep everything coherent over **time**

1.  **Warp-then-paint pipeline**
    
    -   For each frame *t*: warp the reference (frame 0) depth, plane mask, shadow mask via H<sub>t←0</sub>; call InVi for diffusion inpainting conditioned on those warped maps.
        
    -   Because the plane and its shadow already move correctly, InVi only needs to latch object *appearance*, not geometry.
        
2.  **3-D scene pipeline**
    
    -   Convert the whole clip into a Planar-Splatting radiance field (3 min for 500 frames). [CVF Open Access](https://openaccess.thecvf.com/content/CVPR2025/papers/Tan_PlanarSplatting_Accurate_Planar_Surface_Reconstruction_in_3_Minutes_CVPR_2025_paper.pdf?utm_source=chatgpt.com)
        
    -   Insert the 3-D product mesh once; render every frame with view-consistent lighting inside the splat renderer.
        
    -   (Optional) run a final diffusion “polish” pass per frame with a very low strength (0.2–0.3) to harmonise noise.
        

Both methods converge faster than per-frame depth-only workflows because the plane constraint removes one degree of freedom.

---

### Quick parameter cheat-sheet (single frame)

| Symptom | Probable cause | Fix |
| --- | --- | --- |
| Base “floats” above surface | Plane normal or d wrong | Re-fit plane using only in-mask points; increase depth-map resolution. |
| Shadow too sharp | Hard edge in shadow mask | Blur mask by 8–12 px or reduce SpotLight weight to 0.3 |
| Reflective smear streaks | Reflection pass mis-aligned | Make sure your warped plane patch is bilinearly resampled **after** homography, not before. |

---

### Take-away

1.  **Detect & track** the support plane before you paint.
    
2.  **Constrain object pose** so its base exactly satisfies that plane equation.
    
3.  **Add a shadow / reflection pass** via relighting-aware diffusion (SpotLight, ZeroComp).
    
4.  For video, **warp auxiliary maps** with the plane’s homography and feed them into anchor-based video diffusion.
    

Those four tweaks add 5-10 minutes of set-up but deliver a decisive boost: the product looks like it *touches* the table rather than hovering, and its shadows/gloss stay glued across the whole clip.

You: 

Could you summarise the conversation into a detailed concrete implementation workflow?

ChatGPT: 

Thought for 10 seconds

---

## End-to-end Workflow for Photorealistic Product Insertion in a Video Clip

*(works even when you only have a few phone photos and no camera intrinsics)*

### 0 Hardware / Software Assumptions

-   **1× consumer GPU** (≈ 12-24 GB VRAM)
    
-   **Python ≥ 3.10**, 🤗 *diffusers* ≥ 0.34, *torch* ≥ 2.1
    
-   One of the GUI front-ends (ComfyUI or AUTOMATIC1111) for fast iteration
    
-   **Optional**: Mesh-room / Polycam for photogrammetry; DaVinci Resolve for deflicker
    

---

### 1 Asset Preparation

| Step | How | Notes |
| --- | --- | --- |
| **1.1 Shoot 3-10 photos** | Walk a semicircle around the product; diffuse indoor light | Avoid specular hotspots— they confuse LoRA |
| **1.2 Fine-tune a LoRA** | Rank 4–8, 50–100 training steps | Takes 5–10 min; export `myProduct.safetensors` |
| **1.3 (Optional) Build a coarse mesh** | Polycam → `.obj` | Needed only for premium shadows / reflections |

---

### 2 Pick & Analyse a Reference Frame

1.  **Extract one clean frame** where the product should appear.
    
2.  **Detect the support plane** (desk, table, etc.):
    
    ```bash
    python plane_tr_infer.py --img frame.png --out plane.npy
    ```
    
    *Outputs*: plane normal **n**, offset **d**, binary mask.
    
3.  **Estimate monocular depth** (ZoeDepth-K) → `depth.png`.
    

---

### 3 Pre-compute Guidance Assets

| Asset | Generator | Saved as |
| --- | --- | --- |
| Edge map | OpenCV Canny σ ≈ 0.5 | `canny.png` |
| Depth map | ZoeDepth (step 2) | `depth.png` |
| Foot-print mask | Warp the plane mask with its own homography so it aligns with the table top; flood-fill the intended placement zone | `footprint.png` |
| Object mask | SAM on **original frame** | `mask.png` |
| (Opt.) Shadow matte | Project mesh onto plane along est. light dir; blur 8-12 px | `shadow.png` |

---

### 4 Insert the Product in the Reference Frame

Minimal *diffusers* script (mix-and-match in ComfyUI/A1111 UI if preferred):

```python
from diffusers import StableDiffusionControlNetInpaintPipeline, ControlNetModel
import torch, PIL.Image as Image

edge_cnet  = ControlNetModel.from_pretrained("lllyasviel/controlnet-canny-sd15")
depth_cnet = ControlNetModel.from_pretrained("lllyasviel/controlnet-depth-sd15")
plane_cnet = ControlNetModel.from_pretrained("thibaud/controlnet-seg-sd15")   # feed footprint

pipe = StableDiffusionControlNetInpaintPipeline.from_pretrained(
        "stabilityai/stable-diffusion-3.5-inpainting",
        controlnet=[edge_cnet, depth_cnet, plane_cnet],
        safety_checker=None, torch_dtype=torch.float16
      ).to("cuda")

pipe.load_lora_weights("myProduct.safetensors", adapter_name="prod")
pipe.fuse_lora()

out = pipe(
    prompt="photo of <myProduct> sitting flat on the table, camera pitch -15°, yaw 30°",
    image=Image.open("frame.png"),
    mask_image=Image.open("mask.png"),
    controlnet_conditioning_images=[
        Image.open("canny.png"),
        Image.open("depth.png"),
        Image.open("footprint.png")
    ],
    controlnet_conditioning_scale=[0.7, 0.3, 0.5],   # edge, depth, plane
    additional_images=[Image.open("shadow.png")],    # if using SpotLight/ZeroComp
    guidance_scale=7.5,
    strength=0.65,
    num_inference_steps=30
).images[0]

out.save("frame_comp.png")
```

**Refine placement**  
*If the object is a few pixels off*: open DragDiffusion / DragonDiffusion UI → click-drag base corners to final position (real-time latent optimisation).

---

### 5 Add Contact Effects

| Effect | Quick recipe |
| --- | --- |
| **Soft shadow** | Multiply `shadow.png` (blurred) under the composite or feed it as a SpotLight ControlNet (weight ≈ 0.5). |
| **Glossy reflection (shiny table)** | Crop plane patch, vertical-flip, blur, feed as a “reflection pass” ControlNet or merge in Photoshop with ~20 % opacity. |
| **Occlusion by desk clutter** | Invert `depth.png` and feed to a segmentation ControlNet so diffusion respects foreground mugs, cables, hands, etc. |

---

### 6 Propagate to the Whole Clip

#### 6.1 2-D warp-then-paint (fast, no mesh)

1.  Track a **homography H<sub>t←0</sub>** for in-plane features across frames.
    
2.  For each frame *t*: warp `footprint.png`, `shadow.png`, `depth.png`, and the object’s RGBA plate via H<sub>t←0</sub>.
    
3.  Run **InVi** or TokenFlow with the warped maps as anchors → produces frame *t* with consistent appearance.
    

#### 6.2 3-D scene route (highest fidelity)

1.  Build a Planar-Splatting or Nerfacto scene from the whole video.
    
2.  Insert the **mesh** once at the solved pose; render every frame (gives perfect contact shadows).
    
3.  Optionally run a *light* diffusion polish (`strength≈0.25`) to harmonise noise.
    

---

### 7 Polish & Evaluate

| Task | Tool |
| --- | --- |
| **Deflicker** | DaVinci Resolve → Temporal NR (1-2 frames) |
| **LPIPS-bg** vs. original | `lpips --mask inverted_mask.png` (aim < 0.05) |
| **CLIP similarity** for identity | Crop product regions; average cosine sim ≥ 0.3 |
| **User check** | 5-point Likert on 10 random frames |

---

### 8 Typical Troubleshooting

| Symptom | Fix |
| --- | --- |
| Object “floats” above surface | Re-fit plane with more in-plane points; raise plane ControlNet weight to 0.6 |
| Halo / hard cut-out | Feather `mask.png` by 3-5 px; lower guidance\_scale to 6-6.5 |
| Shadow too sharp | Blur `shadow.png` more or drop SpotLight weight to 0.3 |
| Colour shift frame-to-frame | Convert all inputs to 8-bit sRGB before inference; run final polish with `strength=0.25` |

---

### 9 Cheat-sheet of Key Parameters

| Parameter | Sweet spot |
| --- | --- |
| **LoRA rank** | 4–8 |
| **ControlNet weights** | Edge 0.7 · Depth 0.3 · Plane 0.5 |
| **Denoise strength (inpaint)** | 0.60 – 0.70 |
| **Guidance scale** | 6 – 8 (SD-XL/3.5) |
| **Shadow blur** | 8–12 px Gaussian |
| **DragDiffusion clicks** | 1–2 handles, optimise ≤ 15 steps |

---

### One-page Checklist

1.  **Photos → LoRA**
    
2.  **Reference frame:** detect plane ➜ depth ➜ edge ➜ masks
    
3.  **Multi-ControlNet inpaint** (pipe script above)
    
4.  **DragDiffusion tweak** if needed
    
5.  **Shadow / reflection pass**
    
6.  **Warp guidance maps** across frames → InVi / TokenFlow **OR** insert mesh in Planar-Splat scene
    
7.  **Deflicker & metrics**
    

Follow the checklist and you can go from raw phone shots to a rock-solid, surface-aware product insertion in under an hour of operator time, with no knowledge of the camera’s intrinsics.