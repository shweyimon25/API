import swaggerJsdoc, { Options } from "swagger-jsdoc";

type CrudResource = {
  name: string;
  title: string;
  description: string;
  allowCreate?: boolean;
  allowUpdate?: boolean;
  allowDelete?: boolean;
  updateMethod?: "put" | "post";
};

type ListParameter = {
  name: string;
  in: "query";
  description?: string;
  required?: boolean;
  schema: object;
};

const listParametersByResource: Record<string, ListParameter[]> = {
  users: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name/email/username",
      schema: { type: "string" },
    },
    {
      name: "roleId",
      in: "query",
      description: "Filter by role id",
      schema: { type: "integer" },
    },
  ],
  roles: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by role name",
      schema: { type: "string" },
    },
  ],
  "member-plans": [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "memberTypeId",
      in: "query",
      description: "Filter by member type id",
      schema: { type: "integer" },
    },
    {
      name: "search",
      in: "query",
      description: "Search by plan name",
      schema: { type: "string" },
    },
  ],
  members: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "memberTypeId",
      in: "query",
      description: "Filter by member type id",
      schema: { type: "integer" },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name/email/phone/code",
      schema: { type: "string" },
    },
  ],
  pros: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name",
      schema: { type: "string" },
    },
  ],
  cons: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name",
      schema: { type: "string" },
    },
  ],
  "shop-levels": [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name",
      schema: { type: "string" },
    },
  ],
  shops: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "shopLevelId",
      in: "query",
      description: "Filter by shop level id",
      schema: { type: "integer" },
    },
    {
      name: "memberId",
      in: "query",
      description: "Filter by member id",
      schema: { type: "integer" },
    },
    {
      name: "search",
      in: "query",
      description: "Search by shop name or member name",
      schema: { type: "string" },
    },
  ],
  tags: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name",
      schema: { type: "string" },
    },
  ],
  workouts: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by workout name",
      schema: { type: "string" },
    },
    {
      name: "categoryId",
      in: "query",
      description: "Filter by category id",
      schema: { type: "integer" },
    },
    {
      name: "bodyGoalId",
      in: "query",
      description: "Filter by body goal id",
      schema: { type: "integer" },
    },
    {
      name: "placeId",
      in: "query",
      description: "Filter by place id",
      schema: { type: "integer" },
    },
    {
      name: "memberPlanId",
      in: "query",
      description: "Filter by member plan id",
      schema: { type: "integer" },
    },
  ],
  "bank-informations": [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "paymentTypes",
      in: "query",
      description: "Filter by payment type",
      schema: { type: "string", enum: ["BANK_ACCOUNT", "E_WALLET"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by account holder/number/phone",
      schema: { type: "string" },
    },
  ],
  "body-goals": [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name",
      schema: { type: "string" },
    },
  ],
  places: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name",
      schema: { type: "string" },
    },
  ],
  "proficient-levels": [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name",
      schema: { type: "string" },
    },
  ],
  categories: [
    {
      name: "status",
      in: "query",
      description: "Filter by status",
      schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
    },
    {
      name: "search",
      in: "query",
      description: "Search by name",
      schema: { type: "string" },
    },
  ],
};

const exampleDataByResource: Record<string, { create: any; update: any }> = {
  users: {
    create: {
      name: "John Doe",
      email: "john.doe@example.com",
      username: "johndoe",
      password: "password123",
      passwordConfirm: "password123",
      roleId: 1,
      status: "ACTIVE",
    },
    update: {
      name: "John Doe Updated",
      email: "john.updated@example.com",
      username: "johndoe_updated",
      status: "ACTIVE",
    },
  },
  roles: {
    create: {
      name: "Editor",
      permissions: [1, 2, 3],
      status: "ACTIVE",
    },
    update: {
      name: "Editor Updated",
      permissions: [1, 2, 3, 4],
      status: "ACTIVE",
    },
  },
  "member-plans": {
    create: {
      name: "Premium Plan",
      memberTypeId: 1,
      price: 50000,
      duration: 3,
      isVideoGroup: true,
      proIds: [1, 2],
      conIds: [1],
      status: "ACTIVE",
    },
    update: {
      name: "Premium Plan Updated",
      price: 60000,
      duration: 6,
      status: "ACTIVE",
    },
  },
  members: {
    create: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "09123456789",
      password: "password123",
      passwordConfirm: "password123",
      memberTypeId: 1,
      address: "123 Main Street",
      bio: "Fitness enthusiast",
      status: "ACTIVE",
    },
    update: {
      name: "Jane Smith Updated",
      email: "jane.updated@example.com",
      status: "ACTIVE",
    },
  },
  pros: {
    create: {
      name: "24/7 Access",
      status: "ACTIVE",
    },
    update: {
      name: "24/7 Access Updated",
      status: "ACTIVE",
    },
  },
  cons: {
    create: {
      name: "Limited Locations",
      status: "ACTIVE",
    },
    update: {
      name: "Limited Locations Updated",
      status: "ACTIVE",
    },
  },
  "shop-levels": {
    create: {
      name: "Gold Level",
      price: 100000,
      duration: 12,
      description: "Premium shop level with extended features",
      status: "ACTIVE",
    },
    update: {
      name: "Gold Level Updated",
      price: 120000,
      description: "Updated premium shop level",
      status: "ACTIVE",
    },
  },
  shops: {
    create: {
      name: "Fitness Shop",
      image: "https://example.com/shop-image.jpg",
      memberId: 1,
      shopLevelId: 1,
      status: "ACTIVE",
    },
    update: {
      name: "Fitness Shop Updated",
      status: "ACTIVE",
    },
  },
  tags: {
    create: {
      name: "Fitness",
      status: "ACTIVE",
    },
    update: {
      name: "Fitness Updated",
      status: "ACTIVE",
    },
  },
  posts: {
    create: {
      tagId: 1,
      contact: '{"phone": "+1234567890", "email": "contact@example.com"}',
      privencyType: "PUBLIC",
    },
    update: {
      privencyType: "PRIVATE",
      contact: '{"phone": "+1234567890"}',
    },
  },
  workouts: {
    create: {
      name: "Morning Cardio",
      video: "https://example.com/video.mp4",
      thumbnail: "https://example.com/thumbnail.jpg",
      gender: "BOTH",
      categoryId: 1,
      bodyGoalId: 1,
      proficientLevelId: 1,
      placeId: 1,
      memberPlanId: 1,
      workoutDay: "MONDAY",
      videoDuration: 1800,
      sets: 3,
      reps: 12,
      status: "ACTIVE",
    },
    update: {
      name: "Morning Cardio Updated",
      sets: 4,
      reps: 15,
      status: "ACTIVE",
    },
  },
  "bank-informations": {
    create: {
      bankAccountHolder: "John Doe",
      bankAccountNumber: "1234567890",
      phone: "09123456789",
      paymentTypes: "BANK_ACCOUNT",
      coverPhoto: "https://example.com/cover.jpg",
      status: "ACTIVE",
    },
    update: {
      bankAccountHolder: "John Doe Updated",
      phone: "09123456790",
      status: "ACTIVE",
    },
  },
  "body-goals": {
    create: {
      name: "Weight Loss",
      status: "ACTIVE",
    },
    update: {
      name: "Weight Loss Updated",
      status: "ACTIVE",
    },
  },
  places: {
    create: {
      name: "Gym",
      status: "ACTIVE",
    },
    update: {
      name: "Gym Updated",
      status: "ACTIVE",
    },
  },
  "proficient-levels": {
    create: {
      name: "Beginner",
      status: "ACTIVE",
    },
    update: {
      name: "Beginner Updated",
      status: "ACTIVE",
    },
  },
  categories: {
    create: {
      name: "Cardio",
      status: "ACTIVE",
    },
    update: {
      name: "Cardio Updated",
      status: "ACTIVE",
    },
  },
};

const adminCrudResources: CrudResource[] = [
  { name: "users", title: "Users", description: "Manage system users", updateMethod: "put", allowDelete: true },
  { name: "roles", title: "Roles", description: "Manage role definitions", updateMethod: "put", allowDelete: true },
  { name: "permissions", title: "Permissions", description: "Manage permissions", allowCreate: false, allowUpdate: false, allowDelete: false },
  { name: "member-types", title: "Member Types", description: "Manage member type definitions", allowCreate: false, allowUpdate: false, allowDelete: false },
  { name: "member-plans", title: "Member Plans", description: "Manage subscription plans", updateMethod: "post", allowDelete: true },
  { name: "members", title: "Members", description: "Manage member accounts", updateMethod: "post", allowDelete: true },
  { name: "pros", title: "Pros", description: "Manage advantages", updateMethod: "put", allowDelete: true },
  { name: "cons", title: "Cons", description: "Manage disadvantages", updateMethod: "put", allowDelete: true },
  { name: "shop-levels", title: "Shop Levels", description: "Manage shop levels", updateMethod: "put", allowDelete: true },
  { name: "shops", title: "Shops", description: "Manage shops", updateMethod: "put", allowDelete: true },
  { name: "tags", title: "Tags", description: "Manage tags", updateMethod: "put", allowDelete: true },
  { name: "posts", title: "Posts", description: "Manage posts", updateMethod: "post", allowDelete: true },
  { name: "workouts", title: "Workouts", description: "Manage workouts", updateMethod: "post", allowDelete: true },
  {
    name: "bank-informations",
    title: "Bank Informations",
    description: "Manage bank account information",
    updateMethod: "post",
    allowDelete: true,
  },
  { name: "body-goals", title: "Body Goals", description: "Manage body goals", updateMethod: "put", allowDelete: true },
  { name: "places", title: "Places", description: "Manage places", updateMethod: "put", allowDelete: true },
  {
    name: "proficient-levels",
    title: "Proficient Levels",
    description: "Manage proficient levels",
    updateMethod: "put",
    allowDelete: true,
  },
  { name: "categories", title: "Categories", description: "Manage categories", updateMethod: "put", allowDelete: true },
];

const createCrudPaths = (
  resources: CrudResource[],
  basePath: string,
  tagPrefix: string
) =>
  resources.reduce<Record<string, object>>((paths, resource) => {
    const tag = `${tagPrefix} - ${resource.title}`;
    const collectionPath = `${basePath}/${resource.name}`;
    const singlePath = `${collectionPath}/{id}`;
    const secured = [{ bearerAuth: [] as string[] }];

    const allowCreate = resource.allowCreate !== false;
    const allowUpdate = resource.allowUpdate !== false && resource.updateMethod;
    const allowDelete = resource.allowDelete !== false;

    paths[collectionPath] = {
      get: {
        tags: [tag],
        summary: `List ${resource.title}`,
        description: resource.description,
        security: secured,
        ...(listParametersByResource[resource.name]
          ? { parameters: listParametersByResource[resource.name] }
          : {}),
        responses: {
          200: { description: "Retrieved successfully" },
          401: { description: "Unauthorized" },
        },
      },
      ...(allowCreate
        ? {
            post: {
              tags: [tag],
              summary: `Create ${resource.title}`,
              description: resource.description,
              security: secured,
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: true,
                    },
                    ...(exampleDataByResource[resource.name]?.create
                      ? {
                          example: exampleDataByResource[resource.name].create,
                        }
                      : {}),
                  },
                },
              },
              responses: {
                201: { description: "Created successfully" },
                400: { description: "Validation failed" },
                401: { description: "Unauthorized" },
              },
            },
          }
        : {}),
    };

    paths[singlePath] = {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      get: {
        tags: [tag],
        summary: `Get ${resource.title} by id`,
        description: resource.description,
        security: secured,
        responses: {
          200: { description: "Retrieved successfully" },
          401: { description: "Unauthorized" },
          404: { description: "Not found" },
        },
      },
      ...(allowUpdate
        ? {
            [allowUpdate]: {
              tags: [tag],
              summary: `Update ${resource.title} by id`,
              description: resource.description,
              security: secured,
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: true,
                    },
                    ...(exampleDataByResource[resource.name]?.update
                      ? {
                          example: exampleDataByResource[resource.name].update,
                        }
                      : {}),
                  },
                },
              },
              responses: {
                200: { description: "Updated successfully" },
                400: { description: "Validation failed" },
                401: { description: "Unauthorized" },
                404: { description: "Not found" },
              },
            },
          }
        : {}),
      ...(allowDelete
        ? {
            delete: {
              tags: [tag],
              summary: `Delete ${resource.title} by id`,
              description: resource.description,
              security: secured,
              responses: {
                200: { description: "Deleted successfully" },
                401: { description: "Unauthorized" },
                404: { description: "Not found" },
              },
            },
          }
        : {}),
    };

    return paths;
  }, {});

const adminAuthPaths = {
  "/api/admin/v1/auth/sign-in": {
    post: {
      tags: ["Admin - Auth"],
      summary: "Admin sign in",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                emailOrUsername: { type: "string" },
                password: { type: "string", format: "password" },
              },
              example: {
                emailOrUsername: "admin@admin.com",
                password: "admin",
              },
              required: ["emailOrUsername", "password"],
            },
          },
        },
      },
      responses: {
        200: { description: "Authenticated successfully" },
        400: { description: "Validation failed" },
        401: { description: "Invalid credentials" },
      },
    },
  },
};

const memberAuthPaths = {
  "/api/member/v1/auth/sign-in": {
    post: {
      tags: ["Member - Auth"],
      summary: "Member sign in",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                loginProviderType: { type: "string", enum: ["EMAIL", "PHONE"] },
                loginProviderValue: { type: "string" },
                password: { type: "string", format: "password" },
              },
              required: ["loginProviderType", "loginProviderValue", "password"],
            },
            examples: {
              emailLogin: {
                summary: "Sign in with email",
                value: {
                  loginProviderType: "EMAIL",
                  loginProviderValue: "member@example.com",
                  password: "Password123!",
                },
              },
              phoneLogin: {
                summary: "Sign in with phone",
                value: {
                  loginProviderType: "PHONE",
                  loginProviderValue: "09123456789",
                  password: "Password123!",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Authenticated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "User sign in successfully" },
                  data: {
                    type: "object",
                    properties: {
                      user: { type: "object" },
                      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation failed" },
        401: { description: "Invalid credentials" },
      },
    },
  },
  "/api/member/v1/auth/sign-up": {
    post: {
      tags: ["Member - Auth"],
      summary: "Member sign up",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                loginProviderType: { type: "string", enum: ["EMAIL", "PHONE"] },
                loginProviderValue: { type: "string" },
                name: { type: "string" },
                address: { type: "string" },
                password: { type: "string", format: "password" },
                passwordConfirm: { type: "string", format: "password" },
              },
              required: [
                "loginProviderType",
                "loginProviderValue",
                "name",
                "password",
                "passwordConfirm",
                "address",
              ],
            },
            examples: {
              emailSignup: {
                summary: "Sign up with email",
                value: {
                  loginProviderType: "EMAIL",
                  loginProviderValue: "newmember@example.com",
                  name: "John Doe",
                  address: "123 Main Street, Yangon",
                  password: "Password123!",
                  passwordConfirm: "Password123!",
                },
              },
              phoneSignup: {
                summary: "Sign up with phone",
                value: {
                  loginProviderType: "PHONE",
                  loginProviderValue: "09123456789",
                  name: "Jane Smith",
                  address: "456 Oak Avenue, Mandalay",
                  password: "Password123!",
                  passwordConfirm: "Password123!",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Account created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "User sign up successfully" },
                  data: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 1 },
                          name: { type: "string", example: "John Doe" },
                          email: { type: "string", example: "newmember@example.com" },
                          phone: { type: "string", example: null },
                          code: { type: "string", example: "YCABC123" },
                          status: { type: "string", example: "ACTIVE" },
                        },
                      },
                      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation failed" },
        409: { description: "Account already exists" },
      },
    },
  },
};

const memberProfilePaths = {
  "/api/member/v1/profile": {
    get: {
      tags: ["Member - Profile"],
      summary: "Get member profile",
      description: "Retrieve the authenticated member's profile information",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Profile retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Profile fetched successfully" },
                  data: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      name: { type: "string", example: "John Doe" },
                      email: { type: "string", example: "john.doe@example.com" },
                      phone: { type: "string", example: "09123456789" },
                      profile: {
                        type: "object",
                        properties: {
                          address: { type: "string", example: "123 Main Street, Yangon" },
                          bio: { type: "string", example: "Fitness enthusiast and gym lover" },
                          gender: { type: "string", enum: ["MALE", "FEMALE", "BOTH"], example: "MALE" },
                          profilePhoto: { type: "string", example: "https://example.com/profile.jpg" },
                          coverPhoto: { type: "string", example: "https://example.com/cover.jpg" },
                        },
                      },
                      memberType: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 1 },
                          name: { type: "string", example: "Premium" },
                        },
                      },
                      language: { type: "string", enum: ["ENG", "MM"], example: "ENG" },
                      theme: { type: "string", enum: ["DARK", "PINK", "LIGHT"], example: "LIGHT" },
                      createdAt: { type: "string", format: "date-time" },
                      updatedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        404: { description: "Profile not found" },
      },
    },
  },
  "/api/member/v1/profile/update": {
    post: {
      tags: ["Member - Profile"],
      summary: "Update member profile",
      description: "Update the authenticated member's profile information",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "John Doe Updated" },
                bio: { type: "string", example: "Updated bio: Fitness enthusiast and gym lover" },
                gender: { type: "string", enum: ["MALE", "FEMALE", "BOTH"], example: "MALE" },
                address: { type: "string", example: "456 Updated Street, Yangon" },
                language: { type: "string", enum: ["ENG", "MM"], example: "ENG" },
                theme: { type: "string", enum: ["DARK", "PINK", "LIGHT"], example: "DARK" },
              },
            },
            example: {
              name: "John Doe Updated",
              bio: "Updated bio: Fitness enthusiast and gym lover",
              gender: "MALE",
              address: "456 Updated Street, Yangon",
              language: "ENG",
              theme: "DARK",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Profile updated successfully" },
                  data: { type: "object" },
                },
              },
            },
          },
        },
        400: { description: "Validation failed" },
        401: { description: "Unauthorized" },
        404: { description: "Profile not found" },
      },
    },
  },
  "/api/member/v1/profile/change-password": {
    post: {
      tags: ["Member - Profile"],
      summary: "Change member password",
      description: "Change the authenticated member's password",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["oldPassword", "newPassword", "confirmNewPassword"],
              properties: {
                oldPassword: {
                  type: "string",
                  format: "password",
                  example: "OldPassword123!",
                  description: "Current password",
                },
                newPassword: {
                  type: "string",
                  format: "password",
                  example: "NewPassword123!",
                  description: "New password (min 8 chars, must include uppercase, lowercase, number, and special character)",
                },
                confirmNewPassword: {
                  type: "string",
                  format: "password",
                  example: "NewPassword123!",
                  description: "Confirm new password (must match newPassword)",
                },
              },
            },
            example: {
              oldPassword: "OldPassword123!",
              newPassword: "NewPassword123!",
              confirmNewPassword: "NewPassword123!",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password changed successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Password changed successfully" },
                  data: { type: "object" },
                },
              },
            },
          },
        },
        400: { description: "Validation failed (old password incorrect or passwords don't match)" },
        401: { description: "Unauthorized" },
        404: { description: "Member not found" },
      },
    },
  },
};

const tags = [
  { name: "Admin - Auth", description: "Admin authentication" },
  ...adminCrudResources.map((resource) => ({
    name: `Admin - ${resource.title}`,
    description: resource.description,
  })),
  { name: "Member - Auth", description: "Member authentication" },
  { name: "Member - Profile", description: "Member profile management" },
];

const paths = {
  ...adminAuthPaths,
  ...createCrudPaths(adminCrudResources, "/api/admin/v1", "Admin"),
  ...memberAuthPaths,
  ...memberProfilePaths,
};

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "YC Fitness API",
    version: "1.0.0",
    description: "API documentation for admin and member endpoints.",
  },
  servers: [
    { url: "/", description: "Current server" },
    { url: "/api", description: "API base path" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  tags,
  paths,
};

const options: Options = {
  definition: swaggerDefinition,
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

