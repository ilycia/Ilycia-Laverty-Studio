const STUDIO_STORAGE_KEY = "ilycia-process-studio-v1";

const paper = document.querySelector("#studio-paper");
const drawingInput = document.querySelector("#drawing-input");
const addNoteButton = document.querySelector("#add-note");
const removeSelectedButton = document.querySelector("#remove-selected");
const togglePublicButton = document.querySelector("#toggle-public");
const exportButton = document.querySelector("#export-board");
const colourPalette = document.querySelector("#studio-colour-palette");
const colourButtons = document.querySelectorAll(".studio-colour");
const contextMenu = document.querySelector("#studio-context-menu");
const bringToFrontButton = document.querySelector("#bring-to-front");
const sendToBackButton = document.querySelector("#send-to-back");
const status = document.querySelector("#studio-status");
const hint = document.querySelector("#studio-paper-hint");

let board = loadBoard();
let selectedId = null;
let saveTimer;

const COLOURS = {
    ink: "#2F343A",
    brown: "#5A4A3E",
    bluegrey: "#57737D",
    moss: "#414838",
    clay: "#A86A58",
    paper: "#E9DDC8"
};

const DRAWING_FILTERS = {
    ink: "none",
    brown: "sepia(27%) saturate(628%) hue-rotate(341deg) brightness(84%) contrast(87%)",
    bluegrey: "invert(43%) sepia(14%) saturate(1372%) hue-rotate(158deg) brightness(91%) contrast(86%)",
    moss: "sepia(24%) saturate(718%) hue-rotate(31deg) brightness(75%) contrast(88%)",
    clay: "sepia(37%) saturate(775%) hue-rotate(331deg) brightness(94%) contrast(85%)",
    paper: "sepia(31%) saturate(440%) hue-rotate(3deg) brightness(101%) contrast(87%)"
};

renderBoard();

drawingInput.addEventListener("change", addDrawing);
addNoteButton.addEventListener("click", addNote);
removeSelectedButton.addEventListener("click", removeSelected);
togglePublicButton.addEventListener("click", togglePublic);
exportButton.addEventListener("click", exportBoard);
bringToFrontButton.addEventListener("click", () => moveLayer("front"));
sendToBackButton.addEventListener("click", () => moveLayer("back"));
colourButtons.forEach((button) => {
    button.addEventListener("click", () => applyColour(button.dataset.colour));
});

function loadBoard() {
    try {
        return JSON.parse(localStorage.getItem(STUDIO_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveBoard() {
    clearTimeout(saveTimer);
    status.textContent = "Saving…";
    saveTimer = window.setTimeout(() => {
        localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(board));
        status.textContent = "Saved on this browser.";
    }, 350);
}

function renderBoard() {
    paper.querySelectorAll(".studio-item").forEach((item) => item.remove());
    hint.hidden = board.length > 0;
    removeSelectedButton.disabled = selectedId === null;
    updatePublicButton();
    updateColourPalette();
    board.forEach(renderItem);
}

function addDrawing(event) {
    const [file] = event.target.files;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        board.push({
            id: crypto.randomUUID(),
            type: "drawing",
            source: reader.result,
            x: 110 + board.length * 24,
            y: 130 + board.length * 24,
            width: 460,
            colour: "ink",
            public: false
        });
        saveBoard();
        hint.hidden = true;
        renderItem(board.at(-1));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
}

function addNote() {
    board.push({
        id: crypto.randomUUID(),
        type: "note",
        text: "A new thought…",
        x: 110 + board.length * 24,
            y: 130 + board.length * 24,
            width: 260,
            colour: "ink",
            public: false
    });
    saveBoard();
    hint.hidden = true;
    renderItem(board.at(-1));
}

function renderItem(item) {
    const element = document.createElement("article");
    element.className = `studio-item studio-item--${item.type}`;
    element.style.left = `${item.x}px`;
    element.style.top = `${item.y}px`;
    element.style.width = `${item.width}px`;
    element.style.zIndex = item.layer ?? board.indexOf(item) + 1;
    element.dataset.id = item.id;
    element.classList.toggle("is-selected", item.id === selectedId);

    const colour = item.colour || "ink";

    if (item.type === "drawing") {
        const image = document.createElement("img");
        image.src = item.source;
        image.alt = "Process drawing";
        image.draggable = false;
        image.style.filter = DRAWING_FILTERS[colour];
        element.append(image);
    } else {
        const note = document.createElement("div");
        note.className = "studio-note";
        note.style.color = COLOURS[colour];

        const noteText = document.createElement("div");
        noteText.className = "studio-note-text";
        noteText.contentEditable = "true";
        noteText.textContent = item.text;
        noteText.setAttribute("aria-label", "Editable process note");
        noteText.addEventListener("input", () => {
            item.text = noteText.textContent;
            saveBoard();
        });
        note.append(noteText);
        element.append(note);
    }

    element.addEventListener("click", (event) => {
        if (event.target.closest(".studio-note-text")) return;
        selectItem(element, item);
    });

    element.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        selectItem(element, item);
        showContextMenu(event.clientX, event.clientY);
    });

    if (item.id === selectedId) addResizeHandle(element, item);

    enableDrag(element, item);
    paper.append(element);
}

function enableDrag(element, item) {
    element.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".studio-note-text")) return;
        if (event.target.closest(".studio-resize")) return;
        selectItem(element, item);
        const startX = event.clientX;
        const startY = event.clientY;
        const originalX = item.x;
        const originalY = item.y;
        let moved = false;
        element.setPointerCapture(event.pointerId);

        element.addEventListener("pointermove", move);
        element.addEventListener("pointerup", finish, { once: true });

        function move(moveEvent) {
            moved = true;
            item.x = Math.max(0, originalX + moveEvent.clientX - startX);
            item.y = Math.max(0, originalY + moveEvent.clientY - startY);
            element.style.left = `${item.x}px`;
            element.style.top = `${item.y}px`;
        }

        function finish() {
            element.removeEventListener("pointermove", move);
            if (moved) saveBoard();
        }
    });
}

function enableResize(element, item, resize) {
    resize.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const startX = event.clientX;
        const originalWidth = item.width;
        resize.setPointerCapture(event.pointerId);

        resize.addEventListener("pointermove", move);
        resize.addEventListener("pointerup", finish, { once: true });

        function move(moveEvent) {
            item.width = Math.max(130, originalWidth + moveEvent.clientX - startX);
            element.style.width = `${item.width}px`;
        }

        function finish() {
            resize.removeEventListener("pointermove", move);
            saveBoard();
            selectedId = null;
            element.classList.remove("is-selected");
            resize.remove();
            removeSelectedButton.disabled = true;
            updateColourPalette();
        }
    });
}

function addResizeHandle(element, item) {
    const resize = document.createElement("button");
    resize.className = "studio-resize";
    resize.type = "button";
    resize.setAttribute("aria-label", "Resize selected item");
    element.append(resize);
    enableResize(element, item, resize);
}

function selectItem(element, item) {
    selectedId = item.id;
    paper.querySelectorAll(".studio-item").forEach((item) => {
        item.classList.toggle("is-selected", item.dataset.id === selectedId);
    });
    paper.querySelectorAll(".studio-resize").forEach((handle) => handle.remove());
    addResizeHandle(element, item);
    removeSelectedButton.disabled = false;
    updatePublicButton();
    updateColourPalette();
}

function updatePublicButton() {
    const selected = board.find((item) => item.id === selectedId);
    togglePublicButton.disabled = !selected;
    togglePublicButton.textContent = selected?.public
        ? "Hide from Process page"
        : "Show on Process page";
}

function togglePublic() {
    const selected = board.find((item) => item.id === selectedId);
    if (!selected) return;
    selected.public = !selected.public;
    saveBoard();
    updatePublicButton();
    status.textContent = selected.public
        ? "Included in your local Process preview."
        : "Removed from your local Process preview.";
}

function updateColourPalette() {
    const selected = board.find((item) => item.id === selectedId);
    const selectedColour = selected?.colour || "ink";
    colourPalette.hidden = !selected;
    colourButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.colour === selectedColour));
    });
}

function applyColour(colour) {
    const selected = board.find((item) => item.id === selectedId);
    if (!selected) return;
    selected.colour = colour;
    saveBoard();
    const element = paper.querySelector(`[data-id="${selected.id}"]`);
    if (selected.type === "drawing") {
        element.querySelector("img").style.filter = DRAWING_FILTERS[colour];
    } else {
        element.querySelector(".studio-note").style.color = COLOURS[colour];
    }
    updateColourPalette();
}

function removeSelected() {
    if (!selectedId) return;
    paper.querySelector(`[data-id="${selectedId}"]`)?.remove();
    board = board.filter((item) => item.id !== selectedId);
    selectedId = null;
    saveBoard();
    hint.hidden = board.length > 0;
    removeSelectedButton.disabled = true;
    updatePublicButton();
    updateColourPalette();
}

function showContextMenu(x, y) {
    contextMenu.hidden = false;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
}

function hideContextMenu() {
    contextMenu.hidden = true;
}

function moveLayer(direction) {
    const selected = board.find((item) => item.id === selectedId);
    if (!selected) return;

    const remaining = board.filter((item) => item.id !== selectedId);
    board = direction === "front"
        ? [...remaining, selected]
        : [selected, ...remaining];

    board.forEach((item, index) => {
        item.layer = index + 1;
    });

    saveBoard();
    status.textContent = direction === "front"
        ? "Brought to front."
        : "Sent to back.";
    hideContextMenu();
    renderBoard();
}

function exportBoard() {
    const file = new Blob([JSON.stringify(board, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "ilycia-process-board.json";
    link.click();
    URL.revokeObjectURL(link.href);
    status.textContent = "A board copy was downloaded.";
}

document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("#studio-context-menu")) hideContextMenu();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideContextMenu();
});
