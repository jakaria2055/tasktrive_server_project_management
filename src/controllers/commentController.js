import prisma from "../db.js";

//CREATE COMMENT
export const addComment = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { content, taskId } = req.body;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found!" });
    }

    const member = project.members.find((member) => member.userId === userId);

    if (!member) {
      res
        .status(404)
        .json({ message: "You are not a member of this project!" });
    }

    const comment = await prisma.comment.create({
      data: { taskId, content, userId },
      include: { user: true },
    });

    res.status(201).json({ comment, message: "Comment Created Successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

//GET COMMENT
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: true },
    });

    res.status(200).json({ comments, message: "Comment fetch successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
