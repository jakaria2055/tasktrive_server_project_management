import prisma from "../db.js";
import { inngest } from "../inngest/index.js";

//CREATE TASK
export const createTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      due_date,
    } = req.body;

    const origin = req.get("origin");

    //CHECK WHETHER USER HAS ADMIN ROLE
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    } else if (project.team_lead !== userId) {
      return res.status(403).json({ message: "User don't have ADMIN access!" });
    } else if (
      assigneeId &&
      !project.members.find((member) => member.user.id === assigneeId)
    ) {
      return res
        .status(403)
        .json({ message: "assignee is not a member of the project/workspace" });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority,
        assigneeId,
        type,
        status,
        due_date: new Date(due_date),
      },
    });

    const taskWithAssignee = await prisma.task.findUnique({
      where: { id: task.id },
      include: { assignee: true },
    });

    await inngest.send({
      name: "app/task.assigned",
      data: {
        taskId: task.id,
        origin,
      },
    });

    return res
      .status(201)
      .json({ task: taskWithAssignee, message: "Task Created Successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

//UPDATE TASK
export const updateTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    const { userId } = await req.auth();

    //CHECK WHETHER USER HAS ADMIN ROLE
    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    } else if (project.team_lead !== userId) {
      return res.status(403).json({ message: "User don't have ADMIN access!" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res
      .status(201)
      .json({ task: updatedTask, message: "Task Updated Successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

//DELETE TASK
export const deleteTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { tasksIds } = req.body;

    const tasks = await prisma.task.findMany({
      where: { id: { in: tasksIds } },
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task not found!" });
    }

    const project = await prisma.project.findUnique({
      where: { id: tasks[0].projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found!" });
    } else if (project.team_lead !== userId) {
      return res.status(403).json({ message: "User don't have Admin access!" });
    }

    await prisma.task.deleteMany({
      where: { id: { in: tasksIds } },
    });

    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
