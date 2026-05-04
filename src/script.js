const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const upload = document.getElementById('upload');
const downloadBtn = document.getElementById('download');
const placeholder = document.getElementById('placeholder');

let originalImage = new Image();

// Handle Image Upload
upload.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

// Draw image to canvas when loaded
originalImage.onload = () => {
    placeholder.style.display = 'none';
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.filter = 'none';
    ctx.drawImage(originalImage, 0, 0);
};

// Apply CSS filters to Canvas
function applyFilter(filterString) {
    ctx.filter = filterString;
    ctx.drawImage(originalImage, 0, 0);
}

// Reset Image
function resetImage() {
    ctx.filter = 'none';
    ctx.drawImage(originalImage, 0, 0);
}

// Download the result
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL();
    link.click();
});