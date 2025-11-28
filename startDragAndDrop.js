const startDragAndDrop = ({ dropTarget, onImageDropped, onError }) => {
    if (!dropTarget) {
        throw new Error("startDragAndDrop requires a dropTarget element");
    }

    if (typeof onImageDropped !== "function") {
        throw new Error("startDragAndDrop requires an onImageDropped callback");
    }

    const safeError = (message) => {
        if (typeof onError === "function") {
            onError(message);
        } else {
            console.warn(message);
        }
    };

    let dragDepth = 0;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    Object.assign(fileInput.style, {
        opacity: "0",
        width: "0",
        height: "0",
        border: "0",
        margin: "0",
        padding: "0",
        pointerEvents: "none"
    });
    dropTarget.appendChild(fileInput);

    const updateFileInputDisplay = () => {
        fileInput.style.display = dragDepth > 0 ? "none" : "";
    };
    updateFileInputDisplay();

    const handleFileSelection = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            safeError("No file selected");
            return;
        }
        if (!selectedFile.type.startsWith("image/")) {
            safeError("Please choose an image file");
            return;
        }
        onImageDropped(selectedFile);
    };

    const handleClick = () => {
        fileInput.value = "";
        fileInput.click();
    };

    const addHighlight = () => dropTarget.classList.add("drag-over");
    const removeHighlight = () => dropTarget.classList.remove("drag-over");

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth += 1;
        addHighlight();
        updateFileInputDisplay();
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!event.dataTransfer) {
            return;
        }
        event.dataTransfer.dropEffect = "copy";
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) {
            removeHighlight();
        }
        updateFileInputDisplay();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth = 0;
        removeHighlight();
        updateFileInputDisplay();

        const file = event.dataTransfer?.files?.[0];
        if (!file) {
            safeError("No file detected in drop event");
            return;
        }

        if (!file.type.startsWith("image/")) {
            safeError("Please drop an image file");
            return;
        }

        onImageDropped(file);
    };

    const events = [
        ["dragenter", handleDragEnter],
        ["dragover", handleDragOver],
        ["dragleave", handleDragLeave],
        ["drop", handleDrop]
    ];

    events.forEach(([name, handler]) => dropTarget.addEventListener(name, handler));
    dropTarget.addEventListener("click", handleClick);
    fileInput.addEventListener("change", handleFileSelection);

    return () => {
        events.forEach(([name, handler]) => dropTarget.removeEventListener(name, handler));
        dropTarget.removeEventListener("click", handleClick);
        fileInput.removeEventListener("change", handleFileSelection);
        fileInput.remove();
    };
};

export { startDragAndDrop };