// Scrum Master's Notes
//================================
// Reminder: Ensure this feature (Task Filtering & Sorting)
// Meets the acceptance criteria in the sprint backlog (Refer to the document provided).

//Remind Devs to update commit messages with
// detailed descriptions (e.g., "Added sorting logic for tasks by due date")
// to improve traceability as discussed in the Sprint Retrospective.


// Coordinate with QA/Tester (Engalla) to confirm that
// filtering and sorting functions display accurate results
// and persist correctly via localStorage.

// If any other issues are experienced(Lost access to the repository, commits not reflecting changes, etc.)
// Contact the SM (Andam) immediately for resolution.


// ======== Select DOM Elements ========
const taskForm = document.getElementById("task-form");
const taskTable = document.getElementById("task-table");
const filterSelect = document.getElementById("filter-due");
const sortSelect = document.getElementById("sort-due");
const clearFiltersBtn = document.getElementById("clear-filters");

// ======== Task Storage (Local) ========
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// ======== Helper Functions ========

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Format date (YYYY-MM-DD to readable)
function formatDate(dateStr) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Determine status (overdue / today / upcoming)
function getStatus(dueDate) {
  const today = new Date();
  const date = new Date(dueDate);
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date < today) return "Overdue";
  if (date.getTime() === today.getTime()) return "Today";
  return "Upcoming";
}

// ======== Render Tasks ========
function renderTasks() {
  taskTable.innerHTML = "";

  let filtered = [...tasks];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter
  if (filterSelect.value === "overdue") {
    filtered = filtered.filter((t) => new Date(t.dueDate) < today);
  } else if (filterSelect.value === "today") {
    filtered = filtered.filter(
      (t) => new Date(t.dueDate).toDateString() === today.toDateString()
    );
  } else if (filterSelect.value === "upcoming") {
    filtered = filtered.filter((t) => new Date(t.dueDate) > today);
  }

  // Sort
  if (sortSelect.value === "asc") {
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sortSelect.value === "desc") {
    filtered.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }

  // Render rows
  filtered.forEach((task, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.assignment}</td>
      <td>${formatDate(task.dueDate)}</td>
      <td>${task.completed ? "✅ Done" : getStatus(task.dueDate)}</td>
      <td>${task.className || "-"}</td>
      <td>${task.type}</td>
      <td>
        <button class="complete-btn" data-index="${index}">${
      task.completed ? "Undo" : "Done"
    }</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    taskTable.appendChild(row);
  });
}

// ======== Add Task ========
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const assignment = document.getElementById("assignment").value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const className = document.getElementById("class").value.trim();
  const type = document.getElementById("type").value;

  if (!assignment || !dueDate) {
    alert("Please fill in required fields!");
    return;
  }

  const newTask = {
    assignment,
    dueDate,
    className,
    type,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskForm.reset();
});

// ======== Task Actions (Delete / Complete) ========
taskTable.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    if (confirm("Delete this task?")) {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }
  }

  if (e.target.classList.contains("complete-btn")) {
    const index = e.target.dataset.index;
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  }
});

// ======== Filters ========
filterSelect.addEventListener("change", renderTasks);
sortSelect.addEventListener("change", renderTasks);

clearFiltersBtn.addEventListener("click", () => {
  filterSelect.value = "all";
  sortSelect.value = "none";
  renderTasks();
});

// ======== Initial Render ========
renderTasks();
