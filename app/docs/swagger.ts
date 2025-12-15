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

const adminMediaPaths = {
  "/api/admin/v1/media/upload": {
    post: {
      tags: ["Admin - Media"],
      summary: "Upload media",
      description: "Upload a media file.",
      security: [{ bearerAuth: [] as string[] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: { type: "string", format: "binary" },
              },
              required: ["file"],
            },
          },
        },
      },
      responses: {
        201: { description: "Uploaded successfully" },
        400: { description: "Upload failed" },
        401: { description: "Unauthorized" },
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
              ],
            },
          },
        },
      },
      responses: {
        201: { description: "Account created successfully" },
        400: { description: "Validation failed" },
        409: { description: "Account already exists" },
      },
    },
  },
};

const tags = [
  { name: "Admin - Auth", description: "Admin authentication" },
  { name: "Admin - Media", description: "Admin media upload" },
  ...adminCrudResources.map((resource) => ({
    name: `Admin - ${resource.title}`,
    description: resource.description,
  })),
  { name: "Member - Auth", description: "Member authentication" },
];

const paths = {
  ...adminAuthPaths,
  ...createCrudPaths(adminCrudResources, "/api/admin/v1", "Admin"),
  ...adminMediaPaths,
  ...memberAuthPaths,
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

