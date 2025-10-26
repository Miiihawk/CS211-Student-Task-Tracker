let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const form = document.getElementById("task-form");
const table = document.getElementById("task-table");

// Filter controls
const filterSelect = document.getElementById("filter-due");
const sortSelect = document.getElementById("sort-due");
const clearFiltersBtn = document.getElementById("clear-filters");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const task = {
    assignment: document.getElementById("assignment").value,
    dueDate: document.getElementById("dueDate").value,
    class: document.getElementById("class").value,
    type: document.getElementById("type").value,
    done: false,
  };

  tasks.push(task);
  saveTasks();
  renderTable();
  form.reset();
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function parseDateOnly(str) {
  if (!str) return null;
  const d = new Date(str);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function renderTable() {
  table.innerHTML = "";

  let displayTasks = tasks.map((t, i) => ({ ...t, _idx: i }));

  // Apply filter
  const filter = filterSelect ? filterSelect.value : "all";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filter === "overdue") {
    displayTasks = displayTasks.filter((item) => {
      const d = parseDateOnly(item.dueDate);
      return d && d < today;
    });
  } else if (filter === "today") {
    displayTasks = displayTasks.filter((item) => {
      const d = parseDateOnly(item.dueDate);
      return isSameDay(d, today);
    });
  } else if (filter === "upcoming") {
    displayTasks = displayTasks.filter((item) => {
      const d = parseDateOnly(item.dueDate);
      return d && d > today;
    });
  }

  // Apply sort
  const sort = sortSelect ? sortSelect.value : "none";
  if (sort === "asc") {
    displayTasks.sort((a, b) => {
      const da = parseDateOnly(a.dueDate) || new Date(8640000000000000); // far future
      const db = parseDateOnly(b.dueDate) || new Date(8640000000000000);
      return da - db;
    });
  } else if (sort === "desc") {
    displayTasks.sort((a, b) => {
      const da = parseDateOnly(a.dueDate) || new Date(-8640000000000000); // far past
      const db = parseDateOnly(b.dueDate) || new Date(-8640000000000000);
      return db - da;
    });
  }

  // Render table rows
  displayTasks.forEach((task) => {
    const row = document.createElement("tr");
    row.className = task.done ? "completed" : "";

    row.innerHTML = `
      <td>${task.assignment}</td>
      <td>${task.dueDate || ""}</td>
      <td>
        <input type="checkbox" ${
          task.done ? "checked" : ""
        } onchange="toggleDone(${task._idx})" />
        ${task.done ? "Done" : "Pending"}
      </td>
      <td>${task.class}</td>
      <td>${task.type}</td>
      <td>
        <button type="button" class="btn btn-edit" onclick="editTask(${
          task._idx
        })">Edit</button>
        <button type="button" class="btn btn-delete" onclick="deleteTask(${
          task._idx
        })">Delete</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function toggleDone(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTable();
}

function editTask(index) {
  const task = tasks[index];
  document.getElementById("assignment").value = task.assignment;
  document.getElementById("dueDate").value = task.dueDate;
  document.getElementById("class").value = task.class;
  document.getElementById("type").value = task.type;

  tasks.splice(index, 1);
  saveTasks();
  renderTable();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTable();
}

// Wire controls
if (filterSelect) filterSelect.addEventListener("change", renderTable);
if (sortSelect) sortSelect.addEventListener("change", renderTable);
if (clearFiltersBtn)
  clearFiltersBtn.addEventListener("click", () => {
    if (filterSelect) filterSelect.value = "all";
    if (sortSelect) sortSelect.value = "none";
    renderTable();
  });

renderTable();
