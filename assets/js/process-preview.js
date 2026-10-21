/* Local preview of items selected in the private Process Studio.
   This intentionally reads only this browser's saved Studio board.
   A later approved publish will create the visitor-facing snapshot. */

const PROCESS_STUDIO_STORAGE_KEY = "ilycia-process-studio-v1";
const processSheet = document.querySelector(".process-page .a1-sheet");

if (processSheet) {
    try {
        const board = JSON.parse(localStorage.getItem(PROCESS_STUDIO_STORAGE_KEY)) || [];
        board.filter((item) => item.public).forEach(addProcessPreviewItem);
    } catch {
        // A missing or incomplete local board simply leaves the public page unchanged.
    }
}

function addProcessPreviewItem(item) {
    const piece = document.createElement("article");
    piece.className = `process-preview-piece process-preview-piece--${item.type}`;
    piece.style.left = `${item.x}px`;
    piece.style.top = `${item.y}px`;
    piece.style.width = `${item.width}px`;
    piece.style.zIndex = item.layer || 1;

    if (item.type === "drawing") {
        const image = document.createElement("img");
        image.src = item.source;
        image.alt = "Selected process drawing";
        image.style.filter = previewFilter(item.colour);
        piece.append(image);
    } else {
        const note = document.createElement("p");
        note.textContent = item.text;
        note.style.color = previewColour(item.colour);
        piece.append(note);
    }

    processSheet.append(piece);
}

function previewColour(colour) {
    return {
        ink: "#2F343A",
        brown: "#5A4A3E",
        bluegrey: "#57737D",
        moss: "#414838",
        clay: "#A86A58",
        paper: "#E9DDC8"
    }[colour] || "#2F343A";
}

function previewFilter(colour) {
    return {
        ink: "none",
        brown: "sepia(27%) saturate(628%) hue-rotate(341deg) brightness(84%) contrast(87%)",
        bluegrey: "invert(43%) sepia(14%) saturate(1372%) hue-rotate(158deg) brightness(91%) contrast(86%)",
        moss: "sepia(24%) saturate(718%) hue-rotate(31deg) brightness(75%) contrast(88%)",
        clay: "sepia(37%) saturate(775%) hue-rotate(331deg) brightness(94%) contrast(85%)",
        paper: "sepia(31%) saturate(440%) hue-rotate(3deg) brightness(101%) contrast(87%)"
    }[colour] || "none";
}
