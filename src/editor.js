const $ = id => document.getElementById(id);
const img = $("img");

const base = {
    src: "",
    brightness: 0,
    contrast: 0,
    saturation: 100,
    grayscale: 0,
    invert: 0,
    sepia: 0,
    hue: 0,
    blur: 0,
    zoom: 0.8,
    rotate: 0,
    flipX: 1,
    flipY: 1
};

let state = { ...base };
let history = [];
let index = -1;
let cropper = null;

const adjustmentKeys = [
    "brightness",
    "contrast",
    "saturation",
    "grayscale",
    "sepia",
    "invert",
    "hue",
    "blur"
];

function filters() {
    return `
    brightness(${100 + state.brightness}%)
    contrast(${100 + state.contrast}%)
    saturate(${state.saturation}%)
    grayscale(${state.grayscale}%)
    invert(${state.invert}%)
    sepia(${state.sepia}%)
    hue-rotate(${state.hue}deg)
    blur(${state.blur}px)
  `;
}

function render() {
    const hasImage = Boolean(state.src);

    img.style.display = hasImage ? "block" : "none";
    $("empty").style.display = hasImage ? "none" : "block";

    if (hasImage && img.src !== state.src) {
        img.src = state.src;
    }

    img.style.filter = filters();
    if (img.naturalWidth) {
        img.style.width = `${img.naturalWidth * state.zoom}px`;
    }

    img.style.transform = `
        rotate(${state.rotate}deg)
        scaleX(${state.flipX})
        scaleY(${state.flipY})
    `;

    $("zoomText").textContent = Math.round(state.zoom * 100) + "%";

    adjustmentKeys.forEach(key => {
        $(key).value = state[key];
        $(key + "Val").textContent = state[key];
    });

    $("undo").disabled = index <= 0;
    $("redo").disabled = index >= history.length - 1;
}

function save() {
    history = history.slice(0, index + 1);
    history.push(structuredClone(state));
    index = history.length - 1;
    render();
}

function commit(changes) {
    state = { ...state, ...changes };
    save();
}

function fitImageToCanvas() {
    if (!state.src || !img.naturalWidth || !img.naturalHeight) return;

    const canvas = document.querySelector(".canvas-area");
    const availableWidth = canvas.clientWidth - 80;
    const availableHeight = canvas.clientHeight - 80;

    const widthRatio = availableWidth / img.naturalWidth;
    const heightRatio = availableHeight / img.naturalHeight;

    state.zoom = Math.min(widthRatio, heightRatio, 1);
}

function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;

    $("fileName").textContent = file.name;

    const reader = new FileReader();

    reader.onload = () => {
        state = { ...base, src: reader.result };
        history = [];
        index = -1;

        img.onload = () => {
            fitImageToCanvas();
            save();
        };

        img.src = state.src;
    };

    reader.readAsDataURL(file);
}

function exitCrop(draw = true) {
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    $("cropActions").classList.add("d-none");
    $("cropBtn").disabled = false;
    $("cropBtn").textContent = "Enter Crop Mode";

    if (draw) render();
}

$("upload").addEventListener("change", event => {
    handleImageFile(event.target.files[0]);
});

const dropZone = $("dropZone");

dropZone.addEventListener("dragover", event => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", event => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    handleImageFile(event.dataTransfer.files[0]);
});

$("undo").addEventListener("click", () => {
    if (index <= 0) return;

    index--;
    state = structuredClone(history[index]);
    exitCrop(false);
    render();
});

$("redo").addEventListener("click", () => {
    if (index >= history.length - 1) return;

    index++;
    state = structuredClone(history[index]);
    exitCrop(false);
    render();
});

$("zoomIn").addEventListener("click", () => {
    commit({ zoom: Math.min(4, Number((state.zoom + 0.1).toFixed(2))) });
});

$("zoomOut").addEventListener("click", () => {
    commit({ zoom: Math.max(0.1, Number((state.zoom - 0.1).toFixed(2))) });
});

$("rotL").addEventListener("click", () => {
    commit({ rotate: state.rotate - 90 });
});

$("rotR").addEventListener("click", () => {
    commit({ rotate: state.rotate + 90 });
});

$("flipX").addEventListener("click", () => {
    commit({ flipX: state.flipX * -1 });
});

$("flipY").addEventListener("click", () => {
    commit({ flipY: state.flipY * -1 });
});

$("cropBtn").addEventListener("click", () => {
  if (!state.src) return;

  $("cropActions").classList.remove("d-none");
  $("cropBtn").disabled = true;
  $("cropBtn").textContent = "Crop Mode Active";

  if (img.naturalWidth) {
    img.style.width = `${img.naturalWidth * state.zoom}px`;
  }

  cropper = new Cropper(img, {
    viewMode: 1,
    autoCropArea: 0.85,
    background: false,
    responsive: true
  });
});


$("cancelCrop").addEventListener("click", () => {
    exitCrop();
});

$("applyCrop").addEventListener("click", () => {
    if (!cropper) return;

    const croppedCanvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high"
    });

    const croppedImage = croppedCanvas.toDataURL("image/png");

    exitCrop(false);

    commit({
        src: croppedImage,
        rotate: 0,
        flipX: 1,
        flipY: 1,
        zoom: 0.8
    });
});

document.querySelectorAll("[data-preset]").forEach(button => {
    button.addEventListener("click", () => {
        const presets = {
            bw: {
                grayscale: 100,
                invert: 0,
                sepia: 0,
                hue: 0,
                saturation: 100,
                contrast: 10,
                brightness: 0,
                blur: 0
            },
            invert: {
                grayscale: 0,
                invert: 100,
                sepia: 0,
                hue: 0,
                saturation: 100,
                contrast: 0,
                brightness: 0,
                blur: 0
            },
            dramatic: {
                grayscale: 0,
                invert: 0,
                sepia: 0,
                hue: -8,
                saturation: 150,
                contrast: 34,
                brightness: -8,
                blur: 0
            },
            retro: {
                grayscale: 0,
                invert: 0,
                sepia: 55,
                hue: -16,
                saturation: 125,
                contrast: -5,
                brightness: 8,
                blur: 0
            },
            cinematic: {
                grayscale: 0,
                invert: 0,
                sepia: 12,
                hue: -6,
                saturation: 115,
                contrast: 28,
                brightness: -12,
                blur: 0
            },
            cool: {
                grayscale: 0,
                invert: 0,
                sepia: 0,
                hue: 18,
                saturation: 118,
                contrast: 12,
                brightness: 2,
                blur: 0
            },
            warm: {
                grayscale: 0,
                invert: 0,
                sepia: 25,
                hue: -10,
                saturation: 120,
                contrast: 8,
                brightness: 6,
                blur: 0
            },
            fade: {
                grayscale: 8,
                invert: 0,
                sepia: 8,
                hue: 0,
                saturation: 82,
                contrast: -18,
                brightness: 12,
                blur: 0
            }
        };

        commit(presets[button.dataset.preset]);
    });
});

adjustmentKeys.forEach(key => {
    $(key).addEventListener("input", event => {
        state[key] = Number(event.target.value);
        $(key + "Val").textContent = state[key];
        render();
    });

    $(key).addEventListener("change", save);
});

$("reset").addEventListener("click", () => {
    if (!state.src) return;
    commit({ ...base, src: state.src });
});

$("export").addEventListener("click", () => {
    if (!state.src) return;

    exitCrop(false);

    const source = new Image();

    source.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const angle = ((state.rotate % 360) + 360) % 360;
        const shouldSwapSize = angle === 90 || angle === 270;

        canvas.width = shouldSwapSize ? source.height : source.width;
        canvas.height = shouldSwapSize ? source.width : source.height;

        context.filter = filters();
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((state.rotate * Math.PI) / 180);
        context.scale(state.flipX, state.flipY);
        context.drawImage(source, -source.width / 2, -source.height / 2);

        const link = document.createElement("a");
        link.download = "edited-image.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

        render();
    };

    source.src = state.src;
});

window.addEventListener("resize", () => {
    if (!state.src) return;
    render();
});

save();
