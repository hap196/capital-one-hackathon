import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import boxen from "boxen";

let tasks = [];
let plants = [];

// function to add a delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// function to create a typing effect for text
async function typeEffect(text, characterArt) {
  const lines = text.split("\n");
  const longestLineLength = Math.max(...lines.map((line) => line.length));
  const paddedText = lines
    .map((line) => line.padEnd(longestLineLength))
    .join("\n");

  const boxContent = boxen(paddedText, {
    padding: 1,
    margin: 1,
    borderStyle: "round",
  });
  const combined = characterArt
    .split("\n")
    .map((line, i) => {
      const boxLine = boxContent.split("\n")[i] || "";
      return line + "  " + (boxLine || "");
    })
    .join("\n");

  for (const char of combined) {
    process.stdout.write(char);
    await sleep(1); // adjust delay as needed
  }
  console.log("");
}

// function to load character art from a file
async function loadCharacterArt(filename) {
  const filePath = path.resolve(
    "/Users/haileypan/Documents/GitHub/capital-one-hackathon",
    filename
  );
  return fs.promises.readFile(filePath, "utf8");
}

// function to load plant art from a file
async function loadPlantArt(plantName) {
  const filePath = path.resolve(
    "/Users/haileypan/Documents/GitHub/capital-one-hackathon",
    `${plantName}.txt`
  );
  return fs.promises.readFile(filePath, "utf8");
}

// main menu function
async function mainMenu() {
  console.clear();
  const characterA = await loadCharacterArt("characterA.txt");
  const characterB = await loadCharacterArt("characterB.txt");

  await typeEffect(
    chalk.blue("hi! welcome to taskgarden. to get started, write 'start'"),
    characterA
  );

  const { start } = await inquirer.prompt([
    {
      type: "input",
      name: "start",
      message: "type 'start' to begin:",
      validate: (input) =>
        input.toLowerCase() === "start" ? true : "please type 'start' to begin",
    },
  ]);

  await typeEffect("let’s choose your personal assistant.", characterA);

  console.log(chalk.green(characterA));
  console.log(chalk.blue(characterB));

  const { character } = await inquirer.prompt([
    {
      type: "list",
      name: "character",
      message: "",
      choices: ["girl", "boy"],
    },
  ]);

  const selectedCharacter = character === "girl" ? characterA : characterB;

  const { assistantName } = await inquirer.prompt([
    {
      type: "input",
      name: "assistantName",
      message: "let’s name your assistant! type any name:",
    },
  ]);

  const { userName } = await inquirer.prompt([
    {
      type: "input",
      name: "userName",
      message: "what’s your name? type any name:",
    },
  ]);

  console.log("");
  await typeEffect(
    chalk.green(
      `hi ${userName}, i’m ${assistantName}, your personal assistant. i help you manage your tasks and grow your garden!`
    ),
    selectedCharacter
  );
  console.log("");
  await showGuide(selectedCharacter);
}

// function to show the guide
async function showGuide(characterArt) {
  const options = [
    "→ add a task",
    "→ edit an existing task",
    "→ delete a task",
    "→ check off a task",
    "→ show all tasks",
    "→ show garden",
  ];

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "here’s a guide on what functions you can perform:",
      choices: options,
    },
  ]);

  console.log("");
  switch (action) {
    case "→ add a task":
      await addTask(characterArt);
      break;
    case "→ edit an existing task":
      await editTask(characterArt);
      break;
    case "→ delete a task":
      await deleteTask(characterArt);
      break;
    case "→ check off a task":
      await checkOffTask(characterArt);
      break;
    case "→ show all tasks":
      await showTasks(characterArt);
      break;
    case "→ show garden":
      await showGarden(characterArt);
      break;
  }

  console.log("");
  await showGuide(characterArt);
}

// function to add a task
async function addTask(characterArt) {
  const { task } = await inquirer.prompt([
    {
      type: "input",
      name: "task",
      message: "enter the task you want to add:",
    },
  ]);

  const { time } = await inquirer.prompt([
    {
      type: "input",
      name: "time",
      message: "enter the time you want to do the task (e.g., 14:00):",
    },
  ]);

  tasks.push({ id: tasks.length + 1, task, time, done: false });
  await typeEffect(chalk.green("task added successfully!"), characterArt);
  console.log("");
}

// function to edit a task
async function editTask(characterArt) {
  if (tasks.length === 0) {
    await typeEffect(chalk.red("no tasks to edit."), characterArt);
    return;
  }

  const { id } = await selectTask("edit");

  const { newTask } = await inquirer.prompt([
    {
      type: "input",
      name: "newTask",
      message: "enter the new task:",
    },
  ]);

  const { newTime } = await inquirer.prompt([
    {
      type: "input",
      name: "newTime",
      message: "enter the new time for the task (e.g., 14:00):",
    },
  ]);

  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].task = newTask;
    tasks[taskIndex].time = newTime;
    await typeEffect(chalk.green("task edited successfully!"), characterArt);
  } else {
    await typeEffect(chalk.red("task not found."), characterArt);
  }
  console.log("");
}

// function to delete a task
async function deleteTask(characterArt) {
  if (tasks.length === 0) {
    await typeEffect(chalk.red("no tasks to delete."), characterArt);
    return;
  }

  const { id } = await selectTask("delete");
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    await typeEffect(chalk.green("task deleted successfully!"), characterArt);
  } else {
    await typeEffect(chalk.red("task not found."), characterArt);
  }
  console.log("");
}

// function to check off a task
async function checkOffTask(characterArt) {
  if (tasks.length === 0) {
    await typeEffect(chalk.red("no tasks to check off."), characterArt);
    return;
  }

  const { id } = await selectTask("check off");
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].done = true;
    await typeEffect(
      chalk.green("nice job! let’s add a new plant to your collection."),
      characterArt
    );

    await addPlant(characterArt);
  } else {
    await typeEffect(chalk.red("task not found."), characterArt);
  }
  console.log("");
}

// function to show all tasks
async function showTasks(characterArt) {
  if (tasks.length === 0) {
    await typeEffect(chalk.red("no tasks to show."), characterArt);
    return;
  }

  console.log(chalk.blue("here are all your tasks:"));
  tasks.forEach((task) => {
    console.log(
      `${task.id}. ${task.task} at ${task.time} - ${task.done ? "done" : "pending"}`
    );
  });
  console.log("");
}

// function to show the garden
async function showGarden(characterArt) {
  if (plants.length === 0) {
    await typeEffect(chalk.red("no plants in your garden."), characterArt);
    return;
  }

  console.log(chalk.blue("here are all your plants:"));
  for (const plant of plants) {
    const plantArt = await loadPlantArt(plant);
    console.log(chalk.green(plantArt));
  }
  console.log("");
}

// function to select a task based on action
async function selectTask(action) {
  const { id } = await inquirer.prompt([
    {
      type: "list",
      name: "id",
      message: `enter the id of the task you would like to ${action}:`,
      choices: tasks.map((task) => ({
        name: `${task.id}. ${task.task}`,
        value: task.id,
      })),
    },
  ]);

  return { id };
}

// function to add a plant
async function addPlant(characterArt) {
  const plantOptions = ["cactus", "tulips", "sunflower", "daisy", "sapling"];
  const { plant } = await inquirer.prompt([
    {
      type: "list",
      name: "plant",
      message: "choose a plant to add:",
      choices: plantOptions,
    },
  ]);

  plants.push(plant);
  const plantArt = await loadPlantArt(plant);
  await typeEffect(chalk.green("plant added successfully!"), plantArt);
  console.log("");
}

// start the main menu
mainMenu();
