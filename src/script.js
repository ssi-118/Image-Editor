let cropper;
const image = document.getElementById('imageDisplay');
const fileInput = document.getElementById('fileInput');
const filterSelect = document.getElementById('filterSelect');
const cropBtn = document.getElementById('cropBtn');
const saveCropBtn = document.getElementById('saveCropBtn');
const downloadBtn = document.getElementById('downloadBtn');

// 1. Handle File Upload
fileInput.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        image.src = event.target.result;
        if (cropper) cropper.destroy(); // Reset cropper if new image uploaded
    };
    reader.readAsDataURL(e.target.files[0]);
});

// 2. Apply Filters (CSS based)
filterSelect.addEventListener('change', (e) => {
    image.style.filter = e.target.value;
});

// 3. Toggle Cropping Mode
cropBtn.addEventListener('click', () => {
    cropper = new Cropper(image, {
        aspectRatio: NaN, // Freeform crop
        viewMode: 1,
    });
    cropBtn.style.display = 'none';
    saveCropBtn.style.display = 'block';
});

// 4. Confirm Crop
saveCropBtn.addEventListener('click', () => {
    const croppedCanvas = cropper.getCroppedCanvas();
    image.src = croppedCanvas.toDataURL(); // Update image source with cropped version
    cropper.destroy();
    saveCropBtn.style.display = 'none';
    cropBtn.style.display = 'block';
});

// 5. Download Final Asset
downloadBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match current image
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Apply the selected filter to the canvas context
    ctx.filter = getComputedStyle(image).filter;
    ctx.drawImage(image, 0, 0);
    
    const link = document.createElement('a');
    link.download = 'pixelflow-export.png';
    link.href = canvas.toDataURL();
    link.click();
});