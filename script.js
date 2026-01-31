// Data Lists
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let resources = [];


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

    pages.forEach((p) => {
      p.classList.remove("active");
      if (p.id === "dashboard") {
        p.innerHTML = "";
      }
    });

    const targetPage = document.querySelector(link.getAttribute("href"));
    targetPage.classList.add("active");

    if (targetPage.id === "dashboard") {
      renderDashboard();
    }
  });
});

// Tasks
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
  const filterStatus = document.getElementById("filterStatus")?.value || "all";
  const filterPriority = document.getElementById("filterPriority")?.value || "all";
  const sortBy = document.getElementById("sortBy")?.value || "date";
  const sortOrder = document.getElementById("sortOrder")?.value || "asc";

  let filteredTasks = tasks.filter((t) => {
    if (filterStatus === "pending" && t.completed) return false;
    if (filterStatus === "completed" && !t.completed) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  filteredTasks.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "date") {
      comparison = new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortBy === "priority") {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === "title") {
      comparison = a.title.localeCompare(b.title);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  tasksList.innerHTML = "";

  if (filteredTasks.length === 0) {
    tasksList.innerHTML = "<p class='no-tasks'>No tasks found</p>";
    return;
  }

  filteredTasks.forEach((t) => {
    tasksList.innerHTML += `
      <div class="card ${t.completed ? "completed" : ""}">
        <b>${t.title}</b> - ${t.dueDate}<br><br>
        Priority: ${t.priority} <br><br>
        Category: ${t.category || "General"}<br><br>
        <button class="complete-btn" data-complete="${t.id}">
          <i class="fas fa-check"></i> ${t.completed ? "Undo" : "Complete"}
        </button>
        <button class="delete-btn" data-delete="${t.id}"><i class="fas fa-trash"></i></button>
      </div>
    `;
  });
}

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

// Tasks: Event Listeners
document.getElementById("filterStatus")?.addEventListener("change", renderTasks);
document.getElementById("filterPriority")?.addEventListener("change", renderTasks);
document.getElementById("sortBy")?.addEventListener("change", renderTasks);
document.getElementById("sortOrder")?.addEventListener("change", renderTasks);

tasksList.addEventListener("click", (e) => {
  if (e.target.dataset.complete) {
    toggleTask(Number(e.target.dataset.complete));
  }
  if (e.target.dataset.delete) {
    deleteTask(Number(e.target.dataset.delete));
  }
});

// Dashboard
function renderDashboard() {
  const dashboard = document.getElementById("dashboard");

  if (!dashboard.classList.contains("active")) {
    return;
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const today = new Date().toISOString().split("T")[0];
  const twoDaysLater = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const dueSoon = tasks.filter(
    (t) => !t.completed && t.dueDate >= today && t.dueDate <= twoDaysLater
  ).length;

  const todayIndex = new Date().getDay();
  let todayHabitsCompleted = 0;
  habits.forEach((h) => {
    if (h.progress[todayIndex]) todayHabitsCompleted++;
  });

  dashboard.innerHTML = `
    <!-- Quick Add Task -->
    <div class="card quick-add">
      <h3>Quick Add Task</h3>
      <form id="quickTaskForm">
        <input type="text" id="quickTitle" placeholder="Task Title" required />
        <input type="date" id="quickDueDate" required />
        <button type="submit"><i class="fas fa-plus"></i></button>
      </form>
    </div>

    <!-- Progress Bar -->
    <div class="card progress-card">
      <h3>Progress</h3>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <p>${done}/${total} Tasks Completed</p>
    </div>

    <!-- Stats -->
    <div class="card">
    <h3>Tasks Due Soon:</h3>
     <h5>${dueSoon}</h5>
     </div>
    <div class="card">
    <h3>Completed Tasks:</h3>
     <h5>${done}</h5>
     </div>

    <!-- Today's Habits -->
    <div class="card">
      <h3>Today</h3>
      <p>Habits Streak: <h5>${todayHabitsCompleted}/${habits.length}</h5></p>
    </div>
  `;

  const quickTaskForm = document.getElementById("quickTaskForm");
  quickTaskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("quickTitle").value;
    const dueDate = document.getElementById("quickDueDate").value;

    if (!title || !dueDate) return;

    tasks.push({
      id: Date.now(),
      title,
      dueDate,
      priority: "Medium",
      category: "",
      completed: false,
    });

    saveTasks();
    quickTaskForm.reset();
  });
}

// Habits
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
        <b>${h.name}</b> (${count}/${h.goal})
        <div class="habit-checkboxes">
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
      </div>
    `;
  });
}
console.log(habits);


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

// Resources
const searchInput = document.getElementById("search");
const resourcesList = document.getElementById("resourcesList");

function populateCategoryFilter(data) {
  const categories = [...new Set(data.map((r) => r.category))];
  const filterCategory = document.getElementById("filterCategory");
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });
}

function renderResources(list) {
  const searchTerm = searchInput.value.toLowerCase();
  const categoryFilter = document.getElementById("filterCategory").value;

  const filteredResources = list.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      categoryFilter === "all" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  resourcesList.innerHTML = "";

  if (filteredResources.length === 0) {
    resourcesList.innerHTML = "<p class='no-resources'>No resources found</p>";
    return;
  }

  filteredResources.forEach((r) => {
    resourcesList.innerHTML += `
      <div class="card">
        <b>${r.title}</b><br>
        ${r.category}<br>
        <a href="${r.link}" target="_blank" style="text-decoration: none;">Open</a>
      </div>
    `;
  });
}

// Resources: Fetch and Filter
fetch("resources.json")
  .then((r) => r.json())
  .then((data) => {
    resources = data;
    populateCategoryFilter(data);
    renderResources(data);
  })
  .catch(() => {
    resourcesList.innerHTML = "<p>Failed to load resources</p>";
  });

searchInput.addEventListener("input", () => {
  renderResources(resources);
});

document.getElementById("filterCategory").addEventListener("change", () => {
  renderResources(resources);
});

// Theme and Settings
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

//  Render
renderTasks();
renderHabits();
renderDashboard();
