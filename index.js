// Importing necessary functions from utils // DONE
import { getTasks, createNewTask, patchTask, deleteTask } from './utils/taskFunctions.js';
import { initialData } from './initialData.js';

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true');
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM // DONE
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  filterDiv: document.getElementById('filterDiv'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  modalWindow: document.getElementById('new-task-modal-window'),
};

let activeBoard = "";

// Extracts unique board names from tasks // DONE
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM // DONE
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM // DONE
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); // Fix comparison operator // DONE

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add('tasks-container'); // Add a class to tasks container
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { // Fix comparison operator // DONE
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal // DONE
      taskElement.addEventListener('click', () => { // Fix event listener // DONE
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class // DONE
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title;
  taskElement.setAttribute('data-task-id', task.id);

  tasksContainer.appendChild(taskElement);
}

// Setting up all Event Listeners
function setupEventListeners() {
  // Cancel editing task event listener // DONE
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener // DONE
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  // Clicking outside the modal to close it // DONE
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  // Show sidebar event listener // DONE
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener // DONE
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener // DONE
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block';
  });

  // Add new task form submission event listener // DONE
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
}

// Toggles tasks modal // DONE
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';
}


//Functions that must be completed
function addTask(event) {
  event.preventDefault();
  //Assign user input to the task object // DONE
  const task = {
    id: Date.now(), // unique id for the task
    title: document.getElementById('title-input').value,
    description: document.getElementById('desc-input').value,
    status: document.getElementById('select-status').value,
    board: activeBoard // associate the task with the current active board
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

// Create function for toggleSidebar // DONE
function toggleSidebar(show) {
  const sideBar = document.getElementById('side-bar-div');
  const showSideBarBtn = document.getElementById('show-side-bar-btn');
  const hideSideBarBtn = document.getElementById('hide-side-bar-btn');

  if (show) {
    sideBar.style.display = 'block';
    showSideBarBtn.style.display = 'none';
    hideSideBarBtn.style.display = 'flex';
    localStorage.setItem('showSideBar', 'true');
  } else {
    sideBar.style.display = 'none';
    showSideBarBtn.style.display = 'block';
    hideSideBarBtn.style.display = 'none';
    localStorage.setItem('showSideBar', 'false');
  }
}

// Create function for toggleTheme // DONE
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLightTheme = document.body.classList.contains('light-theme');
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}

function openEditTaskModal(task) {
  const editTaskForm = document.getElementById('edit-task-form');
  // Get button elements from the task modal // DONE
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;
  // Call saveTaskChanges upon click of Save Changes button // DONE
  document.getElementById('save-task-changes-btn').onclick = () => saveTaskChanges(task.id);
  // Delete task using a helper function and close the task modal // DONE
  document.getElementById('delete-task-btn').onclick = () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  };

  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  // Get new user inputs // DONE
  // Create an object with the updated task details // DONE
  const updatedTask = {
    title: document.getElementById('edit-task-title-input').value,
    description: document.getElementById('edit-task-desc-input').value,
    status: document.getElementById('edit-select-status').value,
    board: activeBoard
  };
  // Update task using a hlper function // DONE
  patchTask(taskId, updatedTask);
  // Close the modal and refresh the UI to reflect the changes // DONE
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

document.addEventListener('DOMContentLoaded', function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  if (isLightTheme) {
    document.body.classList.add('light-theme');
  }
  fetchAndDisplayBoardsAndTasks();
}
