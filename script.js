let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const pages = document.querySelectorAll(".page");
const links = document.querySelectorAll("nav a");
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.onclick = () => navMenu.classList.toggle("show");

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    navMenu.classList.remove("show");

    links.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    pages.forEach((p) => p.classList.remove("active"));
    document.querySelector(link.getAttribute("href")).classList.add("active");
  });
});

const taskForm = document.getElementById("taskForm");
const tasksList = document.getElementById("tasksList");

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const dueDate = document.getElementById("dueDate").value;
  const priority = document.getElementById("priority").value;
  const category = document.getElementById("category").value;

  if (!title || !dueDate) return;

  tasks.push({
    id: Date.now(),
    title,
    dueDate,
    priority,
    category,
    completed: false,
  });

  saveTasks();
  taskForm.reset();
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  renderDashboard();
}

function renderTasks() {
  tasksList.innerHTML = "";

  tasks.forEach((t) => {
    tasksList.innerHTML += `
      <div class="card">
        <b>${t.title}</b> - ${t.dueDate}<br><br>
       priority: ${t.priority} <br><br>
       category: ${t.category || "General"}<br><br>
        <button class="complete-btn" data-complete="${t.id}">
          ${t.completed ? "Undo" : "Complete"}
        </button>
        <button class="delete-btn" data-delete="${t.id}">Delete</button>
      </div>
    `;
  });
}

tasksList.addEventListener("click", (e) => {
  if (e.target.dataset.complete) {
    toggleTask(Number(e.target.dataset.complete));
  }
  if (e.target.dataset.delete) {
    deleteTask(Number(e.target.dataset.delete));
  }
});

function toggleTask(id) {
  const t = tasks.find((task) => task.id === id);
  if (!t) return;
  t.completed = !t.completed;
  saveTasks();
}

function deleteTask(id) {
  if (!confirm("Delete task?")) return;
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
}

function renderDashboard() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;

  document.getElementById("dashboard").innerHTML = `
    <div class="card">Total Tasks: ${total}</div>
    <div class="card">Completed: ${done}</div>
    <div class="card">Progress: ${total ? Math.round((done / total) * 100) : 0}%</div>
  `;
}

const habitForm = document.getElementById("habitForm");
const habitsList = document.getElementById("habitsList");

habitForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("habitName").value;
  const goal = Number(document.getElementById("goal").value);

  if (!name || !goal) return;

  habits.push({
    id: Date.now(),
    name,
    goal,
    progress: [false, false, false, false, false, false, false],
  });

  localStorage.setItem("habits", JSON.stringify(habits));
  renderHabits();
  habitForm.reset();
});

function renderHabits() {
  habitsList.innerHTML = "";

  habits.forEach((h) => {
    const count = h.progress.filter((p) => p).length;

    habitsList.innerHTML += `
      <div class="card">
        <b>${h.name}</b> (${count}/${h.goal})<br>
        ${h.progress
          .map(
            (p, i) => `
          <input type="checkbox" 
            data-habit="${h.id}" 
            data-day="${i}" 
            ${p ? "checked" : ""}>
        `,
          )
          .join("")}
      </div>
    `;
  });
}

habitsList.addEventListener("click", (e) => {
  if (!e.target.dataset.habit) return;

  const id = Number(e.target.dataset.habit);
  const index = Number(e.target.dataset.day);

  const habit = habits.find((h) => h.id === id);
  if (!habit) return;

  habit.progress[index] = !habit.progress[index];
  localStorage.setItem("habits", JSON.stringify(habits));
  renderHabits();
});

const searchInput = document.getElementById("search");
const resourcesList = document.getElementById("resourcesList");
let resources = [];

fetch("resources.json")
  .then((r) => r.json())
  .then((data) => {
    resources = data;
    renderResources(data);
  })
  .catch(() => {
    resourcesList.innerHTML = "<p>Failed to load resources</p>";
  });

function renderResources(list) {
  resourcesList.innerHTML = "";

  list.forEach((r) => {
    resourcesList.innerHTML += `
      <div class="card">
        <b>${r.title}</b><br>
        ${r.category}<br>
        <a href="${r.link}" target="_blank">Open</a>
      </div>
    `;
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  renderResources(resources.filter((r) => r.title.toLowerCase().includes(q)));
});

const themeToggle = document.getElementById("themeToggle");

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark"));
};

if (localStorage.getItem("theme") === "true") {
  document.body.classList.add("dark");
}

const resetData = document.getElementById("resetData");

resetData.onclick = () => {
  if (!confirm("Reset everything?")) return;
  localStorage.clear();
  location.reload();
};

renderTasks();
renderHabits();
renderDashboard();