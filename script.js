const documentText = document.getElementById("documentText");
const positionInput = document.getElementById("position");
const textInput = document.getElementById("textInput");
const replaceInput = document.getElementById("replaceText");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const message = document.getElementById("message");

let text = "";
const undoStack = [];
const redoStack = [];
const history = [];

function showMessage(msg, type = "") {
  message.textContent = msg;
  message.className = "message " + type;
}

function updateScreen() {
  documentText.value = text;
  document.getElementById("charCount").textContent = `${text.length} characters`;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById("wordCount").textContent = `${words} words`;
  undoBtn.disabled = undoStack.length === 0;
  redoBtn.disabled = redoStack.length === 0;
  historyCount.textContent = history.length;
  historyList.innerHTML = "";
  if (history.length === 0) {
    historyList.innerHTML = '<li class="empty">No actions yet.</li>';
  } else {
    history.slice().reverse().forEach((entry, index) => {
      const item = document.createElement("li");
      item.innerHTML = `<span class="index">${String(history.length - index).padStart(2, "0")}</span>`;
      item.append(document.createTextNode(entry));
      historyList.appendChild(item);
    });
  }
}

function performEdit(description, newText) {
  undoStack.push(text);       // Save current state on undo stack
  text = newText;
  redoStack.length = 0;       // A new edit clears redo history
  history.push(description);
  updateScreen();
  showMessage(description, "success");
}

document.getElementById("insertBtn").addEventListener("click", () => {
  const position = Number(positionInput.value);
  const value = textInput.value;
  if (!Number.isInteger(position) || position < 0 || position > text.length) {
    showMessage(`Position must be between 0 and ${text.length}.`, "error"); return;
  }
  if (!value) { showMessage("Enter some text to insert.", "error"); return; }
  performEdit(`Inserted "${value}" at position ${position}`, text.slice(0, position) + value + text.slice(position));
  textInput.value = "";
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  const position = Number(positionInput.value);
  const value = textInput.value;
  if (!Number.isInteger(position) || position < 0 || position >= text.length) {
    showMessage(`Position must be between 0 and ${Math.max(0, text.length - 1)}.`, "error"); return;
  }
  const amount = value ? Number(value) : 1;
  if (!Number.isInteger(amount) || amount < 1 || position + amount > text.length) {
    showMessage("For Delete, enter a valid character count in the Text field (leave blank for 1).", "error"); return;
  }
  const removed = text.slice(position, position + amount);
  performEdit(`Deleted "${removed}" from position ${position}`, text.slice(0, position) + text.slice(position + amount));
  textInput.value = "";
});

document.getElementById("replaceBtn").addEventListener("click", () => {
  const position = Number(positionInput.value);
  const oldValue = textInput.value;
  const newValue = replaceInput.value;
  if (!Number.isInteger(position) || position < 0 || !oldValue || position + oldValue.length > text.length) {
    showMessage("Enter the starting position and the exact text to replace in the Text field.", "error"); return;
  }
  if (text.slice(position, position + oldValue.length) !== oldValue) {
    showMessage("The text at that position does not match the Text field.", "error"); return;
  }
  if (!newValue) { showMessage("Enter the replacement text.", "error"); return; }
  performEdit(`Replaced "${oldValue}" with "${newValue}" at position ${position}`,
    text.slice(0, position) + newValue + text.slice(position + oldValue.length));
  textInput.value = "";
  replaceInput.value = "";
});

undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

function undo() {
  if (!undoStack.length) return;
  redoStack.push(text);       // Save current state on redo stack
  text = undoStack.pop();
  history.push("Undo performed");
  updateScreen();
  showMessage("Last change undone.", "success");
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(text);       // Save current state on undo stack
  text = redoStack.pop();
  history.push("Redo performed");
  updateScreen();
  showMessage("Change restored.", "success");
}

document.getElementById("clearBtn").addEventListener("click", () => {
  if (!text) { showMessage("The document is already empty."); return; }
  performEdit("Cleared the document", "");
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === "z") { event.preventDefault(); undo(); }
  if (event.ctrlKey && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); }
});

updateScreen();
