//Elements
const $ = id => document.getElementById(id)
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
    zoom: .8,
    rotate: 0,
    flipX: 1,
    flipY: 1
};

let state = { ...base }, history = [], index = -1, cropper = null;

//Functions
function fitImageToCanvas() {
    if (!state.src || !img.naturalWidth || !img.naturalHeight) return;

    const canvas = document.querySelector(".canvas-area");
    const availableWidth = canvas.clientWidth - 80;
    const availableHeight = canvas.clientHeight - 80;

    const widthRatio = availableWidth / img.naturalWidth;
    const heightRatio = availableHeight / img.naturalHeight;

    state.zoom = Math.min(widthRatio, heightRatio, 1);
}

function filters() {
    return `brightness(${100 + state.brightness}%) 
            contrast(${100 + state.contrast}%) 
            saturate(${state.saturation}%) 
            grayscale(${state.grayscale}%) 
            invert(${state.invert}%) 
            sepia(${state.sepia}%) 
            hue-rotate(${state.hue}deg)`;
}

function render() {
  const has = !!state.src;

  img.style.display = has ? "block" : "none";
  $("empty").style.display = has ? "none" : "block";

  if (has && img.src !== state.src) {
    img.src = state.src;
  }

  img.style.filter = filters();
  img.style.transform =
    `scale(${state.zoom}) rotate(${state.rotate}deg) scaleX(${state.flipX}) scaleY(${state.flipY})`;

  $("zoomText").textContent = Math.round(state.zoom * 100) + "%";

  ["brightness", "contrast", "saturation"].forEach(k => {
    $(k).value = state[k];
    $(k + "Val").textContent = state[k];
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

function commit(p) {
    state = { ...state, ...p };
    save();
}

function exitCrop(draw = true) {
    if (cropper) {
        cropper.destroy();
        cropper = null
    }
    $("cropActions").classList.add("d-none");
    $("cropBtn").disabled = false;
    $("cropBtn").textContent = "Enter Crop Mode";
    if (draw) render();
}

//Features
//Upload Image
$("upload").onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
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
};

//Undo & Redo
$("undo").onclick = () => {
    if (index > 0) {
        index--; state = structuredClone(history[index]);
        exitCrop(false);
        render();
    }
};

$("redo").onclick = () => {
    if (index < history.length - 1) {
        index++; state = structuredClone(history[index]);
        exitCrop(false);
        render();
    }
};

//Zoom in & Zoom out
$("zoomIn").onclick = () => {
  commit({ zoom: Math.min(4, +(state.zoom + .1).toFixed(2)) });
};

$("zoomOut").onclick = () => {
  commit({ zoom: Math.max(.1, +(state.zoom - .1).toFixed(2)) });
};

//Rotate Left & Rotate Right
$("rotL").onclick = () =>
    commit({ rotate: state.rotate - 90 });
$("rotR").onclick = () =>
    commit({ rotate: state.rotate + 90 });

//Flip Horizontal & Vertical
$("flipX").onclick = () =>
    commit({ flipX: state.flipX * -1 });
$("flipY").onclick = () =>
    commit({ flipY: state.flipY * -1 });

//Crop Logic using Cropper.js
$("cropBtn").onclick = () => {
    if (!state.src) return;
    $("cropActions").classList.remove("d-none");
    $("cropBtn").disabled = true;
    $("cropBtn").textContent = "Crop Mode Active";
    img.style.transform = "none";
    cropper = new Cropper(img, {
        viewMode: 1,
        autoCropArea: .85,
        background: false,
        responsive: true
    });
};

$("cancelCrop").onclick = () => exitCrop();

$("applyCrop").onclick = () => {
    if (!cropper) return;
    const src = cropper
        .getCroppedCanvas({ imageSmoothingQuality: "high" })
        .toDataURL("image/png");
    exitCrop(false);
    commit({ src, rotate: 0, flipX: 1, flipY: 1, zoom: .8 });
};

//Presets
document.querySelectorAll("[data-preset]").forEach(b => b.onclick = () => {
    const p = {
        bw: { grayscale: 100, invert: 0, sepia: 0, hue: 0, saturation: 100, contrast: 10, brightness: 0 },
        invert: { grayscale: 0, invert: 100, sepia: 0, hue: 0, saturation: 100, contrast: 0, brightness: 0 },
        dramatic: { grayscale: 0, invert: 0, sepia: 0, hue: -8, saturation: 150, contrast: 34, brightness: -8 },
        retro: { grayscale: 0, invert: 0, sepia: 55, hue: -16, saturation: 125, contrast: -5, brightness: 8 }
    };
    commit(p[b.dataset.preset]);
});

//Adjustments
["brightness", "contrast", "saturation"].forEach(k => {
    $(k).oninput = e => {
        state[k] = +e.target.value;
        $(k + "Val").textContent = state[k];
        render();
    };
    $(k).onchange = save;
});

//Reset the Image
$("reset").onclick = () => state.src && commit({ ...base, src: state.src });

//Export the Image
$("export").onclick = () => {
    if (!state.src) return;
    exitCrop(false);

    const source = new Image();
    source.onload = () => {
        const c = document.createElement("canvas")
        const x = c.getContext("2d");
        const a = ((state.rotate % 360) + 360) % 360, swap = a === 90 || a === 270;

        c.width = swap ? source.height : source.width;
        c.height = swap ? source.width : source.height;
        x.filter = filters();
        x.translate(c.width / 2, c.height / 2);
        x.rotate(state.rotate * Math.PI / 180);
        x.scale(state.flipX, state.flipY);
        x.drawImage(source, -source.width / 2, -source.height / 2);

        const link = document.createElement("a");
        link.download = "edited-image.png";
        link.href = c.toDataURL("image/png");
        link.click();
        render();
    };
    source.src = state.src;
};
save();