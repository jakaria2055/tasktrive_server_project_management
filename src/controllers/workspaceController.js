import  prisma  from "../db.js";


//GET ALL WORKSPACE FOR USER
export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: userId } },
      },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });
    res.json({ workspaces });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

//ADD MEMBER TO WORKSPACE
export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { email, role, workspaceId, message } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!workspaceId || role) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(404).json({ message: "Invalid Role!" });
    }

    //FETCH WORKSPACE
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace Not found!" });
    }

    //CHECK CREATOR HAS ADMIN ROLE
    if (
      !workspace.members.find(
        (member) => member.userId === userId && member.role === "ADMIN",
      )
    ) {
      return res.status(401).json({ message: "You do not have admin access!" });
    }

    //CHECK IF USER IS ALREADY A MEMBER
    const existingMember = workspace.members.find(
      (member) => member.userId === userId,
    );

    if (existingMember) {
      return res.status(400).json({ message: "User is already a member!" });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    return res
      .status(201)
      .json({ member, message: "Member Added Successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
