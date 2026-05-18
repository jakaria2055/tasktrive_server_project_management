import { Inngest, step } from "inngest";
import prisma from "../db.js";
import sendEmail from "../config/nodemailer.js";

// Create a client
export const inngest = new Inngest({
  id: "project-management",
});

// CREATE USER
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses[0]?.email_address,
        name: `${data?.first_name || ""} ${data?.last_name || ""}`,
        image: data?.image_url,
      },
    });
  },
);

// DELETE USER
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  },
);

// UPDATE USER
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data?.email_addresses[0]?.email_address,
        name: `${data?.first_name || ""} ${data?.last_name || ""}`,
        image: data?.image_url,
      },
    });
  },
);

// INNGEST FUNCTION TO SAVE WORKSPACE DATA IN DATABASE
const syncWorkspaceCreation = inngest.createFunction(
  {
    id: "sync-workspace-from-clerk",
    triggers: [{ event: "clerk/organization.created" }],
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url,
      },
    });

    //ADMIN CREATION
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      },
    });
  },
);

//INNGEST FUNCTION TO UPDATE WORKSPACE DATA IN DATABASE
const syncWorkspaceUpdation = inngest.createFunction(
  {
    id: "update-workspace-from-clerk",
    triggers: [{ event: "clerk/organization.updated" }],
  },

  async ({ event }) => {
    const { data } = event;

    await prisma.workspace.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      },
    });
  },
);

//INNGEST FUNCTION TO DELETE WORKSPACE DATA IN DATABASE
const syncWorkspaceDeletion = inngest.createFunction(
  {
    id: "delete-workspace-with-clerk",
    triggers: [{ event: "clerk/organization.deleted" }],
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
      where: {
        id: data.id,
      },
    });
  },
);

//INNGEST FUNCTION TO ADD MEMBER WORKSPACE DATA
const syncWorkspaceMemberCreation = inngest.createFunction(
  {
    id: "create-workspace-member",
    triggers: [{ event: "clerk/organizationMembership.created" }],
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data.userId,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      },
    });
  },
);





//INNGEST FUNCTION TO ADD MEMBER WORKSPACE DATA
// const syncWorkspaceMemberCreation = inngest.createFunction(
//   {
//     id: "create-workspace-member",  // 👈 fixed id
//     triggers: [{ event: "clerk/organizationMembership.created" }],  // 👈 fixed event
//     retries: 3,
//   },
//   async ({ event, step }) => {
//     const { data } = event;
//     const userId = data.public_user_data.user_id;
//     const workspaceId = data.organization.id;
//     const role = String(data.role).toUpperCase().replace("ORG:", "");  // 👈 fixes "ORG:MEMBER" → "MEMBER"

//     // Wait for user to exist in DB (race condition fix)
//     await step.run("wait-for-user-in-db", async () => {
//       for (let i = 0; i < 15; i++) {
//         const user = await prisma.user.findUnique({ where: { id: userId } });
//         if (user) return;
//         await new Promise((res) => setTimeout(res, 2000));
//       }
//       throw new Error(`User ${userId} not found in DB after 30s`);
//     });

//     await step.run("create-workspace-member", async () => {
//       const existing = await prisma.workspaceMember.findFirst({
//         where: { userId, workspaceId },
//       });
//       if (existing) return;

//       await prisma.workspaceMember.create({
//         data: { userId, workspaceId, role },
//       });
//       console.log("WORKSPACE MEMBER CREATED:", userId, workspaceId, role);
//     });
//   },
// );



//INNGEST TO SEND EMAIL ON TASK CREATION
const sendTaskAssignmentEmail = inngest.createFunction(
  {
    id: "send-task-assignment-mail",
    triggers: [{ event: "app/task.assigned" }],
  },
  async ({ event, step }) => {
    const { taskId, origin } = event.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, project: true },
    });

    await sendEmail({
      to: task.assignee.email,
      subject: `New Task Assignment in ${task.project.name}`,
      body: `<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; border-radius: 8px; color: #333;">
  <h2 style="color: #2c3e50; margin-bottom: 10px;">
    Hi ${task.assignee.name}, 👋
  </h2>

  <p style="font-size: 16px; margin: 8px 0;">
    You've been assigned a new task:
  </p>

  <p style="font-size: 18px; font-weight: bold; color: #1a73e8; margin: 8px 0;">
    ${task.title}
  </p>

  <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; margin: 12px 0;">
    <p style="margin: 6px 0;">
      <strong>Description:</strong> ${task.description}
    </p>
    <p style="margin: 6px 0;">
      <strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}
    </p>
  </div>

  <a href="${origin}" 
     style="display: inline-block; background-color: #1a73e8; color: #fff; text-decoration: none; 
            padding: 10px 16px; border-radius: 6px; font-weight: bold; margin-top: 10px;">
    View Task
  </a>

  <p style="margin-top: 16px; font-size: 14px; color: #555;">
    Please make sure to review and complete it before the due date.
  </p>
</div>`,
    });

    if (
      new Date(task.due_date).toLocaleDateString() !== new Date().toDateString()
    ) {
      await step.sleepUntil("wait-for-the-due-date", new Date(task.due_date));

      await step.run("check-if-task-is-completed", async () => {
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true, project: true },
        });

        if (!task) return;

        if (task.status !== "DONE") {
          await step.run("send-task-reminder-mail", async () => {
            await sendEmail({
              to: task.assignee.email,
              subject: `Remainder for ${task.project.name}`,
              body: `
              <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 24px; border-radius: 10px; color: #333;">
  
  <!-- Greeting -->
  <h2 style="color: #2c3e50; margin-bottom: 12px; font-size: 22px;">
    Hi ${task.assignee.name}, 👋
  </h2>

  <!-- Project + Task -->
  <p style="font-size: 16px; margin: 6px 0; color: #555;">
    You have a pending task in:
  </p>
  <p style="font-size: 18px; font-weight: bold; color: #1a73e8; margin: 6px 0;">
    ${task.project.name}
  </p>
  <p style="font-size: 18px; font-weight: bold; color: #1a73e8; margin: 6px 0;">
    ${task.title}
  </p>

  <!-- Task Details Card -->
  <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 14px; border-radius: 8px; margin: 14px 0;">
    <p style="margin: 8px 0; font-size: 15px; color: #444;">
      <strong>Description:</strong> ${task.description}
    </p>
    <p style="margin: 8px 0; font-size: 15px; color: #444;">
      <strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}
    </p>
  </div>

  <!-- CTA Button -->
  <a href="${origin}" 
     style="display: inline-block; background-color: #1a73e8; color: #fff; text-decoration: none; 
            padding: 12px 20px; border-radius: 6px; font-weight: bold; margin-top: 12px; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
    View Task
  </a>

  <!-- Footer Note -->
  <p style="margin-top: 18px; font-size: 14px; color: #666; line-height: 1.5;">
    ⏰ Please make sure to review and complete it before the due date.
  </p>
</div>

              `,
            });
          });
        }
      });
    }
  },
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
  sendTaskAssignmentEmail,
];
