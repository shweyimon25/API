import prisma from "../client";

const permissionSeeder = async () => {
  console.log("Permissions seeding ...");

  const permissions = [
    // User
    {
      name: "user:list",
      description: "Show all users",
    },
    {
      name: "user:read",
      description: "Show user details",
    },
    {
      name: "user:create",
      description: "Create new user",
    },
    {
      name: "user:update",
      description: "Update a user",
    },
    {
      name: "user:delete",
      description: "Delete a user",
    },

    // Role 
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

    // Permission
    {
      name: "permission:list",
      description: "Show all permissions",
    },
    {
      name: "permission:read",
      description: "Show permission details",
    },

    // Member 
    {
      name: "member:list",
      description: "Show all members",
    },
    {
      name: "member:read",
      description: "Show member details",
    },
    {
      name: "member:create",
      description: "Create new member",
    },
    {
      name: "member:update",
      description: "Update a member",
    },
    {
      name: "member:delete",
      description: "Delete a member",
    },

    // Member Request
    {
      name: "member-request:list",
      description: "Show all member requests",
    },
    {
      name: "member-request:read",
      description: "Show member request details",
    },
    {
      name: "member-request:update",
      description: "Update a member request",
    },

    // Member Type
    {
      name: "member-type:list",
      description: "Show all member types",
    },
    {
      name: "member-type:read",
      description: "Show member type details",
    },
    {
      name: "member-type:create",
      description: "Create new member type",
    },
    {
      name: "member-type:update",
      description: "Update a member type",
    },
    {
      name: "member-type:delete",
      description: "Delete a member type",
    },

    // Pro 
    {
      name: "pro:list",
      description: "Show all pro",
    },
    {
      name: "pro:read",
      description: "Read a pro",
    },
    {
      name: "pro:create",
      description: "Create new pro",
    },
    {
      name: "pro:update",
      description: "Update a pro",
    },
    {
      name: "pro:delete",
      description: "Delete a pro",
    },

    // Con 
    {
      name: "con:list",
      description: "Show all con",
    },
    {
      name: "con:read",
      description: "Read a con",
    },
    {
      name: "con:create",
      description: "Create new con",
    },
    {
      name: "con:update",
      description: "Update a con",
    },
    {
      name: "con:delete",
      description: "Delete a con",
    },

    // Bad Habit
    {
      name: "bad-habit:list",
      description: "Show all bad habits",
    },
    {
      name: "bad-habit:read",
      description: "Read a bad habit",
    },
    {
      name: "bad-habit:create",
      description: "Create new bad habit",
    },
    {
      name: "bad-habit:update",
      description: "Update a bad habit",
    },
    {
      name: "bad-habit:delete",
      description: "Delete a bad habit",
    },

    // Bank Information 
    {
      name: "bank-information:list",
      description: "Show all bank informations",
    },
    {
      name: "bank-information:read",
      description: "Show bank information details",
    },
    {
      name: "bank-information:create",
      description: "Create new bank information",
    },
    {
      name: "bank-information:update",
      description: "Update a bank information",
    },
    {
      name: "bank-information:delete",
      description: "Delete a bank information",
    },

    // Body Attention Area  
    {
      name: "body-attention_area:list",
      description: "Show all body attention areas",
    },
    {
      name: "body-attention_area:read",
      description: "Show body attention area details",
    },
    {
      name: "body-attention_area:create",
      description: "Create new body attention area",
    },
    {
      name: "body-attention_area:update",
      description: "Update a body attention area",
    },
    {
      name: "body-attention_area:delete",
      description: "Delete a body attention area",
    },

    // Body Goal 
    {
      name: "body-goal:list",
      description: "Show all body goals",
    },
    {
      name: "body-goal:read",
      description: "Show body goal details",
    },
    {
      name: "body-goal:create",
      description: "Create new body goal",
    },
    {
      name: "body-goal:update",
      description: "Update a body goal",
    },
    {
      name: "body-goal:delete",
      description: "Delete a body goal",
    },

    // Category 
    {
      name: "category:list",
      description: "Show all categories",
    },
    {
      name: "category:read",
      description: "Show category details",
    },
    {
      name: "category:create",
      description: "Create new category",
    },
    {
      name: "category:update",
      description: "Update a category",
    },
    {
      name: "category:delete",
      description: "Delete a category",
    },

    // Diet Type 
    {
      name: "diet-type:list",
      description: "Show all diet types",
    },
    {
      name: "diet-type:read",
      description: "Show diet type details",
    },
    {
      name: "diet-type:create",
      description: "Create new diet type",
    },
    {
      name: "diet-type:update",
      description: "Update a diet type",
    },
    {
      name: "diet-type:delete",
      description: "Delete a diet type",
    },

    // Meal Type 
    {
      name: "meal-type:list",
      description: "Show all meal types",
    },
    {
      name: "meal-type:read",
      description: "Show meal type details",
    },
    {
      name: "meal-type:create",
      description: "Create new meal type",
    },
    {
      name: "meal-type:update",
      description: "Update a meal type",
    },
    {
      name: "meal-type:delete",
      description: "Delete a meal type",
    },

    // Member 
    {
      name: "member:list",
      description: "Show all members",
    },
    {
      name: "member:read",
      description: "Show member details",
    },

    // Physical Limitaiton 
    {
      name: "physical-limitation:list",
      description: "Show all physical limitations",
    },
    {
      name: "physical-limitation:read",
      description: "Show physical limitation details",
    },
    {
      name: "physical-limitation:create",
      description: "Create new physical limitation",
    },
    {
      name: "physical-limitation:update",
      description: "Update a physical limitation",
    },
    {
      name: "physical-limitation:delete",
      description: "Delete a physical limitation",
    },

    // Place 
    {
      name: "place:list",
      description: "Show all places",
    },
    {
      name: "place:read",
      description: "Show place details",
    },
    {
      name: "place:create",
      description: "Create new place",
    },
    {
      name: "place:update",
      description: "Update a place",
    },
    {
      name: "place:delete",
      description: "Delete a place",
    },

    // Post 
    {
      name: "post:list",
      description: "Show all posts",
    },
    {
      name: "post:read",
      description: "Show post details",
    },

    // Proficient Level 
    {
      name: "proficient-level:list",
      description: "Show all proficient levels",
    },
    {
      name: "proficient-level:read",
      description: "Show proficient level details",
    },
    {
      name: "proficient-level:create",
      description: "Create new proficient level",
    },
    {
      name: "proficient-level:update",
      description: "Update a proficient level",
    },
    {
      name: "proficient-level:delete",
      description: "Delete a proficient level",
    },

    // Shop Level 
    {
      name: "shop-level:list",
      description: "Show all shop levels",
    },
    {
      name: "shop-level:read",
      description: "Show shop level details",
    },
    {
      name: "shop-level:create",
      description: "Create new shop level",
    },
    {
      name: "shop-level:update",
      description: "Update a shop level",
    },
    {
      name: "shop-level:delete",
      description: "Delete a shop level",
    },

    // Tag 
    {
      name: "tag:list",
      description: "Show all tags",
    },
    {
      name: "tag:read",
      description: "Show tag details",
    },
    {
      name: "tag:create",
      description: "Create new tag",
    },
    {
      name: "tag:update",
      description: "Update a tag",
    },
    {
      name: "tag:delete",
      description: "Delete a tag",
    },

    // Water Tracker 
    {
      name: "water-tracker:list",
      description: "Show all water trackers",
    },
    {
      name: "water-tracker:read",
      description: "Show water tracker details",
    },
    {
      name: "water-tracker:create",
      description: "Create new water tracker",
    },
    {
      name: "water-tracker:update",
      description: "Update a water tracker",
    },
    {
      name: "water-tracker:delete",
      description: "Delete a water tracker",
    },

    // Workout 
    {
      name: "workout:list",
      description: "Show all workouts",
    },
    {
      name: "workout:read",
      description: "Show workout details",
    },
    {
      name: "workout:create",
      description: "Create new workout",
    },
    {
      name: "workout:update",
      description: "Update a workout",
    },
    {
      name: "workout:delete",
      description: "Delete a workout",
    },

    // Payment 
    {
      name: "payment:list",
      description: "Show all payments",
    },
    {
      name: "payment:read",
      description: "Show payment details",
    },
    {
      name: "payment:update",
      description: "Update a payment",
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
