// Global variables
let selectedFile = null;
let documentProcessed = false;

// API endpoints (replace with your actual endpoints)
const UPLOAD_API = "/upload";
const CHAT_API = "/chat";

// DOM elements
const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const submitBtn = document.getElementById("submitBtn");
const uploadStatus = document.getElementById("uploadStatus");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatLoading = document.getElementById("chatLoading");

// File upload handling
uploadZone.addEventListener("click", () => fileInput.click());

uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("dragover");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("dragover");
});

uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelect(files[0]);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0]);
  }
});

function handleFileSelect(file) {
  selectedFile = file;
  fileName.textContent = `📄 ${file.name}`;
  fileSize.textContent = `Size: ${formatFileSize(file.size)}`;
  fileInfo.style.display = "block";
  submitBtn.disabled = false;
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Document upload
submitBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";
    showStatus("Uploading and processing document...", "info");

    const response = await fetch(UPLOAD_API, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      documentProcessed = true;
      chatInput.disabled = false;
      sendBtn.disabled = false;
      showStatus(
        "Document processed successfully! You can now ask questions.",
        "success"
      );
      addMessage(
        "Document uploaded and processed successfully! What would you like to know about it?",
        "assistant"
      );
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    showStatus("Error processing document. Please try again.", "error");
    console.error("Upload error:", error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Upload & Process Document";
  }
});

// Chat functionality
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message || !documentProcessed) return;

  // Add user message
  addMessage(message, "user");
  chatInput.value = "";

  // Show loading
  chatLoading.classList.add("show");
  sendBtn.disabled = true;
  chatInput.disabled = true;

  try {
    const response = await fetch(CHAT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      addMessage(
        result.answer ||
          result.response ||
          "Sorry, I could not process your question.",
        "assistant"
      );
    } else {
      throw new Error("Chat request failed");
    }
  } catch (error) {
    addMessage(
      "Sorry, there was an error processing your question. Please try again.",
      "assistant"
    );
    console.error("Chat error:", error);
  } finally {
    chatLoading.classList.remove("show");
    sendBtn.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }
}

function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  messageDiv.innerHTML = marked.parse(text);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showStatus(message, type) {
  uploadStatus.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
  setTimeout(() => {
    uploadStatus.innerHTML = "";
  }, 5000);
}

// Auto-resize chat input
chatInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 100) + "px";
});
