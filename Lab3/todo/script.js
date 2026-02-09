const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// Enter to add, Esc to clear
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
  if (e.key === "Escape") taskInput.value = "";
});

function addTask() {
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  const li = document.createElement("li");
  li.className = "task";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", () => completeTask(li, checkbox.checked));

  const span = document.createElement("span");
  span.textContent = taskText;

  // small meta (time) - looks nice, no complexity
  const meta = document.createElement("span");
  meta.className = "task-meta";
  meta.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteTask(li));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(meta);
  li.appendChild(deleteBtn);

  taskList.prepend(li); // newest on top
  taskInput.value = "";
  taskInput.focus();
}

function completeTask(li, isDone) {
  li.classList.toggle("done", isDone);
}

function deleteTask(taskElement) {
  taskElement.classList.add("removing");
  taskElement.addEventListener("animationend", () => taskElement.remove(), { once: true });
}