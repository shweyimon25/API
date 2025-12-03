import prisma from "../client";

const permissionSeeder = async () => {
  console.log("Permissions seeding ...");

  const permissions = [
    // Roles
    {
      name: "role:list",
      description: "Show all roles",
    },
    {
      name: "role:read",
      description: "Show role details",
    },
    {
      name: "role:create",
      description: "Create new role",
    },
    {
      name: "role:update",
      description: "Update a role",
    },
    {
      name: "role:delete",
      description: "Delete a role",
    },
    // Permissions
    {
      name: "permission:list",
      description: "List all permissions",
    },
    {
      name: "permission:read",
      description: "View permission details",
    },
    {
      name: "permission:create",
      description: "Create new permission",
    },
    {
      name: "permission:update",
      description: "Update a permission",
    },
    {
      name: "permission:delete",
      description: "Delete a permission",
    },
    // Users
    {
      name: "user:list",
      description: "List all users",
    },
    {
      name: "user:read",
      description: "View user details",
    },
    {
      name: "user:create",
      description: "Create new user",
    },
    {
      name: "user:update",
      description: "Update user information",
    },
    {
      name: "user:delete",
      description: "Delete a user",
    },
    // Member Types
    {
      name: "member-type:list",
      description: "List all member types",
    },
    {
      name: "member-type:read",
      description: "View member type details",
    },
    {
      name: "member-type:create",
      description: "Create new member type",
    },
    {
      name: "member-type:update",
      description: "Update member type",
    },
    {
      name: "member-type:delete",
      description: "Delete a member type",
    },
    // Member Plans
    {
      name: "member-plan:list",
      description: "List all member plans",
    },
    {
      name: "member-plan:read",
      description: "View member plan details",
    },
    {
      name: "member-plan:create",
      description: "Create new member plan",
    },
    {
      name: "member-plan:update",
      description: "Update member plan",
    },
    {
      name: "member-plan:delete",
      description: "Delete a member plan",
    },
    // Pros
    {
      name: "pro:list",
      description: "List all pros",
    },
    {
      name: "pro:read",
      description: "View pro details",
    },
    {
      name: "pro:create",
      description: "Create new pro",
    },
    {
      name: "pro:update",
      description: "Update pro information",
    },
    {
      name: "pro:delete",
      description: "Delete a pro",
    },
    // Cons
    {
      name: "con:list",
      description: "List all cons",
    },
    {
      name: "con:read",
      description: "View con details",
    },
    {
      name: "con:create",
      description: "Create new con",
    },
    {
      name: "con:update",
      description: "Update con information",
    },
    {
      name: "con:delete",
      description: "Delete a con",
    },
    // Members
    {
      name: "member:list",
      description: "List all members",
    },
    {
      name: "member:read",
      description: "View member details",
    },
    {
      name: "member:create",
      description: "Create new member",
    },
    {
      name: "member:update",
      description: "Update member information",
    },
    {
      name: "member:delete",
      description: "Delete a member",
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {
        description: permission.description,
      },
      create: {
        name: permission.name,
        description: permission.description,
      },
    });
  }

  console.log("Permissions seeded successfully");
};

export default permissionSeeder;
