/**
 * Generates YC-Fitness-API Postman collection with Get All, Get All (Paginated), and filter params.
 * Run: node postman/generate-collection.js
 */
const fs = require("fs");
const path = require("path");

const baseUrl = "{{baseUrl}}";
const adminAuth = [{ key: "Authorization", value: "Bearer {{adminToken}}", type: "text" }];
const memberAuth = [{ key: "Authorization", value: "Bearer {{memberToken}}", type: "text" }];

function request(name, method, path, auth = null, query = [], body = null) {
  const pathStr = path.startsWith("http") ? path.replace(baseUrl, "").replace(/^\//, "") : path.replace(/^\//, "");
  const pathSegments = pathStr.split("/").filter(Boolean);
  const queryList = Array.isArray(query) ? query.filter((q) => q && (q.key || q.value !== undefined)) : [];
  const rawUrl = baseUrl + "/" + pathStr + (queryList.length ? "?" + queryList.map((q) => (q.key || "") + "=" + (q.value !== undefined ? encodeURIComponent(String(q.value)) : "")).join("&") : "");
  const urlObj = {
    raw: rawUrl,
    host: ["{{baseUrl}}"],
    path: pathSegments,
    query: queryList.map((q) => ({ key: q.key || q, value: q.value !== undefined ? String(q.value) : "", description: q.description || "" }))
  };
  if (urlObj.query.length === 0) delete urlObj.query;
  const r = { name, request: { method, header: [], url: urlObj } };
  if (auth) r.request.header = auth;
  if (body) r.request.body = body;
  return r;
}

function queryParams(params) {
  return Object.entries(params).map(([k, v]) => ({ key: k, value: v ?? "", description: "" }));
}

/** Build form-data body with optional file fields (for image/file uploads). */
function formdataBody(textFields, fileKeys = []) {
  const formdata = [
    ...Object.entries(textFields || {}).map(([k, v]) => ({ key: k, value: String(v ?? ""), type: "text", description: "" })),
    ...(Array.isArray(fileKeys) ? fileKeys : [fileKeys]).map((k) => ({ key: typeof k === "string" ? k : k.key, type: "file", src: [], description: typeof k === "string" ? "Select image/file" : (k.description || "") }))
  ];
  return { mode: "formdata", formdata };
}

const collection = {
  info: { name: "YC-Fitness-API", _postman_id: "yc-fitness-api-001", schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  variable: [
    { key: "baseUrl", value: "http://localhost:3000/api" },
    { key: "adminToken", value: "" },
    { key: "memberToken", value: "" }
  ],
  item: [
    {
      name: "Admin v1",
      item: [
        {
          name: "Auth",
          item: [
            request("Sign In", "POST", "admin/v1/auth/sign-in", null, [], { mode: "raw", raw: '{"username":"admin","password":"password"}', options: { raw: { language: "json" } } })
          ]
        },
        {
          name: "Users",
          item: [
            request("Get All", "GET", "admin/v1/users", adminAuth, queryParams({ name: "", email: "", username: "", status: "", roleId: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/users", adminAuth, queryParams({ page: "1", perPage: "10", name: "", email: "", username: "", status: "", roleId: "" })),
            request("Get Common All", "GET", "admin/v1/users/common", adminAuth, queryParams({ name: "", email: "", username: "", status: "", roleId: "" })),
            request("Get One", "GET", "admin/v1/users/1", adminAuth),
            request("Create", "POST", "admin/v1/users", adminAuth, [], { mode: "raw", raw: '{"name":"User","username":"user1","email":"user@example.com","password":"password","roleIds":[1]}', options: { raw: { language: "json" } } }),
            request("Update", "POST", "admin/v1/users/1", adminAuth, [], { mode: "raw", raw: '{"name":"User Updated","roleIds":[1]}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/users/1", adminAuth)
          ]
        },
        {
          name: "Tags",
          item: [
            request("Get All", "GET", "admin/v1/tags", adminAuth, queryParams({ name: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/tags", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/tags/common", adminAuth, queryParams({ name: "", status: "" })),
            request("Get One", "GET", "admin/v1/tags/1", adminAuth),
            request("Create", "POST", "admin/v1/tags", adminAuth, [], { mode: "raw", raw: '{"name":"Tag","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/tags/1", adminAuth, [], { mode: "raw", raw: '{"name":"Tag Updated","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/tags/1", adminAuth)
          ]
        },
        {
          name: "Roles",
          item: [
            request("Get All", "GET", "admin/v1/roles", adminAuth, queryParams({ name: "", description: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/roles", adminAuth, queryParams({ page: "1", perPage: "10", name: "", description: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/roles/common", adminAuth, queryParams({ name: "", description: "", status: "" })),
            request("Get One", "GET", "admin/v1/roles/1", adminAuth),
            request("Create", "POST", "admin/v1/roles", adminAuth, [], { mode: "raw", raw: '{"name":"Role","description":"","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/roles/1", adminAuth, [], { mode: "raw", raw: '{"name":"Role Updated","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/roles/1", adminAuth)
          ]
        },
        {
          name: "Permissions",
          item: [
            request("Get All", "GET", "admin/v1/permissions", adminAuth, queryParams({ name: "", description: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/permissions", adminAuth, queryParams({ page: "1", perPage: "10", name: "", description: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/permissions/common", adminAuth, queryParams({ name: "", description: "", status: "" })),
            request("Get One", "GET", "admin/v1/permissions/1", adminAuth)
          ]
        },
        {
          name: "Members",
          item: [
            request("Get All", "GET", "admin/v1/members", adminAuth, queryParams({ name: "", code: "", email: "", phone: "", memberTypeId: "", gender: "", minAge: "", maxAge: "", minYearOfExp: "", maxYearOfExp: "", address: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/members", adminAuth, queryParams({ page: "1", perPage: "10", name: "", code: "", email: "", phone: "", memberTypeId: "", gender: "", minAge: "", maxAge: "", minYearOfExp: "", maxYearOfExp: "", address: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/members/common", adminAuth, queryParams({ name: "", code: "", email: "", phone: "", memberTypeId: "", status: "" })),
            request("Get One", "GET", "admin/v1/members/1", adminAuth),
            request("Create", "POST", "admin/v1/members", adminAuth, [], { mode: "raw", raw: '{"name":"Member","email":"m@example.com","phone":"09xxx","memberTypeId":1,"password":"password"}', options: { raw: { language: "json" } } }),
            request("Update", "POST", "admin/v1/members/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/members/1", adminAuth)
          ]
        },
        {
          name: "Member Types",
          item: [
            request("Get All", "GET", "admin/v1/member-types", adminAuth, queryParams({ name: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/member-types", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/member-types/common", adminAuth, queryParams({ name: "", status: "" })),
            request("Get One", "GET", "admin/v1/member-types/1", adminAuth)
          ]
        },
        {
          name: "Member Plans",
          item: [
            request("Get All", "GET", "admin/v1/member-plans", adminAuth, queryParams({ name: "", memberTypeId: "", minPrice: "", maxPrice: "", duration: "", isVideoGroup: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/member-plans", adminAuth, queryParams({ page: "1", perPage: "10", name: "", memberTypeId: "", minPrice: "", maxPrice: "", duration: "", isVideoGroup: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/member-plans/common", adminAuth, queryParams({ name: "", memberTypeId: "", status: "" })),
            request("Get One", "GET", "admin/v1/member-plans/1", adminAuth),
            request("Create", "POST", "admin/v1/member-plans", adminAuth, [], { mode: "raw", raw: '{"name":"Plan","memberTypeId":1,"price":100,"duration":30,"status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "POST", "admin/v1/member-plans/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/member-plans/1", adminAuth)
          ]
        },
        {
          name: "Pros",
          item: [
            request("Get All", "GET", "admin/v1/pros", adminAuth, queryParams({ name: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/pros", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/pros/common", adminAuth, queryParams({ name: "", status: "" })),
            request("Get One", "GET", "admin/v1/pros/1", adminAuth),
            request("Create", "POST", "admin/v1/pros", adminAuth, [], { mode: "raw", raw: '{"name":"Pro","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/pros/1", adminAuth, [], { mode: "raw", raw: '{"name":"Pro Updated","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/pros/1", adminAuth)
          ]
        },
        {
          name: "Cons",
          item: [
            request("Get All", "GET", "admin/v1/cons", adminAuth, queryParams({ name: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/cons", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/cons/common", adminAuth, queryParams({ name: "", status: "" })),
            request("Get One", "GET", "admin/v1/cons/1", adminAuth),
            request("Create", "POST", "admin/v1/cons", adminAuth, [], { mode: "raw", raw: '{"name":"Con","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/cons/1", adminAuth, [], { mode: "raw", raw: '{"name":"Con Updated","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/cons/1", adminAuth)
          ]
        },
        {
          name: "Shop Levels",
          item: [
            request("Get All", "GET", "admin/v1/shop-levels", adminAuth, queryParams({ name: "", minPrice: "", maxPrice: "", duration: "", postLimit: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/shop-levels", adminAuth, queryParams({ page: "1", perPage: "10", name: "", minPrice: "", maxPrice: "", duration: "", postLimit: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/shop-levels/common", adminAuth, queryParams({ name: "", minPrice: "", maxPrice: "", duration: "", postLimit: "", status: "" })),
            request("Get One", "GET", "admin/v1/shop-levels/1", adminAuth),
            request("Create", "POST", "admin/v1/shop-levels", adminAuth, [], { mode: "raw", raw: '{"name":"Level","price":100,"duration":30,"postLimit":10,"status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/shop-levels/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/shop-levels/1", adminAuth)
          ]
        },
        {
          name: "Bank Informations",
          item: [
            request("Get All", "GET", "admin/v1/bank-informations", adminAuth, queryParams({ bankAccountHolder: "", bankAccountNumber: "", phone: "", paymentTypes: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/bank-informations", adminAuth, queryParams({ page: "1", perPage: "10", bankAccountHolder: "", bankAccountNumber: "", phone: "", paymentTypes: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/bank-informations/common", adminAuth, queryParams({ bankAccountHolder: "", paymentTypes: "", status: "" })),
            request("Get One", "GET", "admin/v1/bank-informations/1", adminAuth),
            request("Create", "POST", "admin/v1/bank-informations", adminAuth, [], formdataBody({ bankAccountHolder: "Name", bankAccountNumber: "123", phone: "09xxx", paymentTypes: "KBZ", status: "ACTIVE" }, ["coverPhoto"])),
            request("Update", "POST", "admin/v1/bank-informations/1", adminAuth, [], formdataBody({}, ["coverPhoto"])),
            request("Delete", "DELETE", "admin/v1/bank-informations/1", adminAuth)
          ]
        },
        {
          name: "Physical Limitations",
          item: [
            request("Get All", "GET", "admin/v1/physical-limitations", adminAuth, queryParams({ status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/physical-limitations", adminAuth, queryParams({ page: "1", perPage: "10", status: "" })),
            request("Get Common All", "GET", "admin/v1/physical-limitations/common", adminAuth, queryParams({ status: "" })),
            request("Get One", "GET", "admin/v1/physical-limitations/1", adminAuth),
            request("Create", "POST", "admin/v1/physical-limitations", adminAuth, [], formdataBody({ name: "Limit", status: "ACTIVE" }, ["photo"])),
            request("Delete", "DELETE", "admin/v1/physical-limitations/1", adminAuth)
          ]
        },
        {
          name: "Places",
          item: [
            request("Get All", "GET", "admin/v1/places", adminAuth, queryParams({ name: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/places", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/places/common", adminAuth, queryParams({ name: "", status: "" })),
            request("Get One", "GET", "admin/v1/places/1", adminAuth),
            request("Create", "POST", "admin/v1/places", adminAuth, [], { mode: "raw", raw: '{"name":"Place","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/places/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/places/1", adminAuth)
          ]
        },
        {
          name: "Diet Types",
          item: [
            request("Get All", "GET", "admin/v1/diet-types", adminAuth, queryParams({ status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/diet-types", adminAuth, queryParams({ page: "1", perPage: "10", status: "" })),
            request("Get Common All", "GET", "admin/v1/diet-types/common", adminAuth, queryParams({ status: "" })),
            request("Get One", "GET", "admin/v1/diet-types/1", adminAuth),
            request("Create", "POST", "admin/v1/diet-types", adminAuth, [], formdataBody({ name: "Diet", status: "ACTIVE" }, ["photo"])),
            request("Update", "POST", "admin/v1/diet-types/1", adminAuth, [], formdataBody({}, ["photo"])),
            request("Delete", "DELETE", "admin/v1/diet-types/1", adminAuth)
          ]
        },
        {
          name: "Body Attention Areas",
          item: [
            request("Get All", "GET", "admin/v1/body-attention-areas", adminAuth, queryParams({ status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/body-attention-areas", adminAuth, queryParams({ page: "1", perPage: "10", status: "" })),
            request("Get Common All", "GET", "admin/v1/body-attention-areas/common", adminAuth, queryParams({ status: "" })),
            request("Get One", "GET", "admin/v1/body-attention-areas/1", adminAuth),
            request("Create", "POST", "admin/v1/body-attention-areas", adminAuth, [], { mode: "raw", raw: '{"name":"Area","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/body-attention-areas/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/body-attention-areas/1", adminAuth)
          ]
        },
        {
          name: "Meal Types",
          item: [
            request("Get All", "GET", "admin/v1/meal-types", adminAuth, queryParams({ status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/meal-types", adminAuth, queryParams({ page: "1", perPage: "10", status: "" })),
            request("Get Common All", "GET", "admin/v1/meal-types/common", adminAuth, queryParams({ status: "" })),
            request("Get One", "GET", "admin/v1/meal-types/1", adminAuth),
            request("Create", "POST", "admin/v1/meal-types", adminAuth, [], { mode: "raw", raw: '{"name":"MealType","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/meal-types/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/meal-types/1", adminAuth)
          ]
        },
        {
          name: "Meals",
          item: [
            request("Get All", "GET", "admin/v1/meals", adminAuth, queryParams({ name: "", status: "", mealTypeId: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/meals", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "", mealTypeId: "" })),
            request("Get Common All", "GET", "admin/v1/meals/common", adminAuth, queryParams({ name: "", status: "", mealTypeId: "" })),
            request("Get One", "GET", "admin/v1/meals/1", adminAuth),
            request("Create", "POST", "admin/v1/meals", adminAuth, [], { mode: "raw", raw: '{"name":"Meal","mealTypeId":1,"status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/meals/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/meals/1", adminAuth)
          ]
        },
        {
          name: "Bad Habits",
          item: [
            request("Get All", "GET", "admin/v1/bad-habits", adminAuth, queryParams({ name: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/bad-habits", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/bad-habits/common", adminAuth, queryParams({ name: "", status: "" })),
            request("Get One", "GET", "admin/v1/bad-habits/1", adminAuth),
            request("Create", "POST", "admin/v1/bad-habits", adminAuth, [], formdataBody({ name: "Habit", status: "ACTIVE" }, ["photo"])),
            request("Update", "POST", "admin/v1/bad-habits/1", adminAuth, [], formdataBody({}, ["photo"])),
            request("Delete", "DELETE", "admin/v1/bad-habits/1", adminAuth)
          ]
        },
        {
          name: "Body Goals",
          item: [
            request("Get All", "GET", "admin/v1/body-goals", adminAuth, queryParams({ name: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/body-goals", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/body-goals/common", adminAuth, queryParams({ name: "", status: "" })),
            request("Get One", "GET", "admin/v1/body-goals/1", adminAuth),
            request("Create", "POST", "admin/v1/body-goals", adminAuth, [], { mode: "raw", raw: '{"name":"Goal","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/body-goals/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/body-goals/1", adminAuth)
          ]
        },
        {
          name: "Proficient Levels",
          item: [
            request("Get All", "GET", "admin/v1/proficient-levels", adminAuth, queryParams({ name: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/proficient-levels", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/proficient-levels/common", adminAuth, queryParams({ name: "", status: "" })),
            request("Get One", "GET", "admin/v1/proficient-levels/1", adminAuth),
            request("Create", "POST", "admin/v1/proficient-levels", adminAuth, [], { mode: "raw", raw: '{"name":"Level","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/proficient-levels/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/proficient-levels/1", adminAuth)
          ]
        },
        {
          name: "Water Trackers",
          item: [
            request("Get All", "GET", "admin/v1/water-trackers", adminAuth, queryParams({ memberId: "", date: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/water-trackers", adminAuth, queryParams({ page: "1", perPage: "10", memberId: "", date: "" })),
            request("Get One", "GET", "admin/v1/water-trackers/1", adminAuth),
            request("Create", "POST", "admin/v1/water-trackers", adminAuth, [], { mode: "raw", raw: '{"memberId":1,"date":"2025-01-30","amount":2000}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/water-trackers/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/water-trackers/1", adminAuth)
          ]
        },
        {
          name: "Categories",
          item: [
            request("Get All", "GET", "admin/v1/categories", adminAuth, queryParams({ name: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/categories", adminAuth, queryParams({ page: "1", perPage: "10", name: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/categories/common", adminAuth, queryParams({ name: "", status: "" })),
            request("Get One", "GET", "admin/v1/categories/1", adminAuth),
            request("Create", "POST", "admin/v1/categories", adminAuth, [], { mode: "raw", raw: '{"name":"Category","status":"ACTIVE"}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "admin/v1/categories/1", adminAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "admin/v1/categories/1", adminAuth)
          ]
        },
        {
          name: "Posts",
          item: [
            request("Get All", "GET", "admin/v1/posts", adminAuth, queryParams({ content: "", tagId: "", privencyType: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/posts", adminAuth, queryParams({ page: "1", perPage: "10", content: "", tagId: "", privencyType: "" })),
            request("Get One", "GET", "admin/v1/posts/1", adminAuth)
          ]
        },
        {
          name: "Shops",
          item: [
            request("Get All", "GET", "admin/v1/shops", adminAuth, queryParams({ name: "", shopLevelId: "", status: "", fromDate: "", toDate: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/shops", adminAuth, queryParams({ page: "1", perPage: "10", name: "", shopLevelId: "", status: "", fromDate: "", toDate: "" })),
            request("Get Common All", "GET", "admin/v1/shops/common", adminAuth, queryParams({ name: "", shopLevelId: "", status: "" })),
            request("Get One", "GET", "admin/v1/shops/1", adminAuth)
          ]
        },
        {
          name: "Workouts",
          item: [
            request("Get All", "GET", "admin/v1/workouts", adminAuth, queryParams({ name: "", gender: "", categoryId: "", bodyGoalId: "", placeId: "", memberPlanId: "", workoutDay: "", sets: "", reps: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/workouts", adminAuth, queryParams({ page: "1", perPage: "10", name: "", gender: "", categoryId: "", bodyGoalId: "", placeId: "", memberPlanId: "", workoutDay: "", sets: "", reps: "", status: "" })),
            request("Get Common All", "GET", "admin/v1/workouts/common", adminAuth, queryParams({ name: "", gender: "", categoryId: "", bodyGoalId: "", placeId: "", memberPlanId: "", workoutDay: "", sets: "", reps: "", status: "" })),
            request("Get One", "GET", "admin/v1/workouts/1", adminAuth),
            request("Create", "POST", "admin/v1/workouts", adminAuth, [], formdataBody({ name: "Workout", gender: "MALE", categoryId: "1", bodyGoalId: "1", placeId: "1", memberPlanId: "1", status: "ACTIVE" }, ["video", "thumbnail"])),
            request("Update", "POST", "admin/v1/workouts/1", adminAuth, [], formdataBody({}, ["video", "thumbnail"])),
            request("Delete", "DELETE", "admin/v1/workouts/1", adminAuth)
          ]
        },
        {
          name: "Payments",
          item: [
            request("Get All", "GET", "admin/v1/payments", adminAuth, queryParams({ status: "", memberId: "", memberPlanId: "", memberTypeId: "", minAmount: "", maxAmount: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/payments", adminAuth, queryParams({ page: "1", perPage: "10", status: "", memberId: "", memberPlanId: "", memberTypeId: "", minAmount: "", maxAmount: "" })),
            request("Get One", "GET", "admin/v1/payments/1", adminAuth),
            request("Update", "PUT", "admin/v1/payments/1", adminAuth, [], { mode: "raw", raw: '{"status":"COMPLETED"}', options: { raw: { language: "json" } } })
          ]
        },
        {
          name: "Member Requests",
          item: [
            request("Get All", "GET", "admin/v1/member-requests", adminAuth, queryParams({ name: "", code: "", phone: "", email: "", memberTypeId: "", memberPlanId: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/member-requests", adminAuth, queryParams({ page: "1", perPage: "10", name: "", code: "", phone: "", email: "", memberTypeId: "", memberPlanId: "", status: "" })),
            request("Get One", "GET", "admin/v1/member-requests/1", adminAuth),
            request("Update", "POST", "admin/v1/member-requests/1", adminAuth, [], { mode: "raw", raw: '{"status":"APPROVED"}', options: { raw: { language: "json" } } })
          ]
        },
        {
          name: "Shop Level Requests",
          item: [
            request("Get All", "GET", "admin/v1/shop-level-requests", adminAuth, queryParams({ memberName: "", memberEmail: "", memberCode: "", shopLevelId: "", status: "" })),
            request("Get All (Paginated)", "GET", "admin/v1/shop-level-requests", adminAuth, queryParams({ page: "1", perPage: "10", memberName: "", memberEmail: "", memberCode: "", shopLevelId: "", status: "" })),
            request("Get One", "GET", "admin/v1/shop-level-requests/1", adminAuth),
            request("Update", "POST", "admin/v1/shop-level-requests/1", adminAuth, [], { mode: "raw", raw: '{"status":"APPROVED"}', options: { raw: { language: "json" } } })
          ]
        }
      ]
    },
    {
      name: "Member v1",
      item: [
        {
          name: "Auth",
          item: [
            request("Sign In", "POST", "member/v1/auth/sign-in", null, [], { mode: "raw", raw: '{"email":"member@example.com","password":"password"}', options: { raw: { language: "json" } } }),
            request("Request OTP", "POST", "member/v1/auth/request-otp", null, [], { mode: "raw", raw: '{"email":"member@example.com"}', options: { raw: { language: "json" } } }),
            request("Verify OTP", "POST", "member/v1/auth/verify-otp", null, [], { mode: "raw", raw: '{"email":"member@example.com","otp":"123456"}', options: { raw: { language: "json" } } }),
            request("Sign Up", "POST", "member/v1/auth/sign-up", null, [], { mode: "raw", raw: '{"name":"Member","email":"m@example.com","phone":"09xxx","memberTypeId":1,"password":"password","otp":"123456"}', options: { raw: { language: "json" } } }),
            request("Forgot Password - Request OTP", "POST", "member/v1/auth/forgot-password/request-otp", null, [], { mode: "raw", raw: '{"email":"member@example.com"}', options: { raw: { language: "json" } } }),
            request("Forgot Password - Verify OTP", "POST", "member/v1/auth/forgot-password/verify-otp", null, [], { mode: "raw", raw: '{"email":"member@example.com","otp":"123456"}', options: { raw: { language: "json" } } }),
            request("Forgot Password - Reset Password", "POST", "member/v1/auth/forgot-password/reset-password", null, [], { mode: "raw", raw: '{"email":"member@example.com","otp":"123456","newPassword":"newpass"}', options: { raw: { language: "json" } } })
          ]
        },
        {
          name: "Profile",
          item: [
            request("Get Profile", "GET", "member/v1/profile/", memberAuth),
            request("Update Profile", "POST", "member/v1/profile/update", memberAuth, [], { mode: "raw", raw: '{"name":"Member"}', options: { raw: { language: "json" } } }),
            request("Change Password", "POST", "member/v1/profile/change-password", memberAuth, [], { mode: "raw", raw: '{"currentPassword":"old","newPassword":"new"}', options: { raw: { language: "json" } } }),
            request("Body Measurements", "POST", "member/v1/profile/body-measurements", memberAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } })
          ]
        },
        {
          name: "Tags",
          item: [
            request("Get All", "GET", "member/v1/tags", memberAuth, queryParams({ name: "" })),
            request("Get All (Paginated)", "GET", "member/v1/tags", memberAuth, queryParams({ page: "1", perPage: "10", name: "" })),
            request("Get One", "GET", "member/v1/tags/1", memberAuth)
          ]
        },
        {
          name: "Posts",
          item: [
            request("Get All", "GET", "member/v1/posts", memberAuth, queryParams({ content: "", tagId: "", fromDate: "", toDate: "" })),
            request("Get All (Paginated)", "GET", "member/v1/posts", memberAuth, queryParams({ page: "1", perPage: "10", content: "", tagId: "", fromDate: "", toDate: "" })),
            request("Get One", "GET", "member/v1/posts/1", memberAuth),
            request("Create", "POST", "member/v1/posts", memberAuth, [], formdataBody({ content: "Post content", tagId: "1", privencyType: "PUBLIC" }, ["media"])),
            request("Update", "POST", "member/v1/posts/1", memberAuth, [], formdataBody({ content: "Updated" }, ["media"])),
            request("Delete", "DELETE", "member/v1/posts/1", memberAuth)
          ]
        },
        {
          name: "Shops",
          item: [
            request("Get All", "GET", "member/v1/shops", memberAuth, queryParams({ name: "", shopLevelId: "", fromDate: "", toDate: "" })),
            request("Get All (Paginated)", "GET", "member/v1/shops", memberAuth, queryParams({ page: "1", perPage: "10", name: "", shopLevelId: "", fromDate: "", toDate: "" })),
            request("Get One", "GET", "member/v1/shops/1", memberAuth),
            request("Create", "POST", "member/v1/shops", memberAuth, [], formdataBody({ name: "Shop" }, ["logo"])),
            request("Update", "POST", "member/v1/shops/1", memberAuth, [], formdataBody({ name: "Shop Updated" }, ["logo"])),
            request("Delete", "DELETE", "member/v1/shops/1", memberAuth)
          ]
        },
        {
          name: "Shop Posts",
          item: [
            request("Get All", "GET", "member/v1/shop-posts", memberAuth, queryParams({ caption: "", shopId: "", fromDate: "", toDate: "" })),
            request("Get All (Paginated)", "GET", "member/v1/shop-posts", memberAuth, queryParams({ page: "1", perPage: "10", caption: "", shopId: "", fromDate: "", toDate: "" })),
            request("Get One", "GET", "member/v1/shop-posts/1", memberAuth),
            request("Create", "POST", "member/v1/shop-posts", memberAuth, [], { mode: "raw", raw: '{"caption":"Post","shopId":1}', options: { raw: { language: "json" } } }),
            request("Update", "POST", "member/v1/shop-posts/1", memberAuth, [], { mode: "raw", raw: '{"caption":"Updated"}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "member/v1/shop-posts/1", memberAuth)
          ]
        },
        {
          name: "Shop Post Comments",
          item: [
            request("Get All", "GET", "member/v1/shop-post-comments", memberAuth, queryParams({ shopPostId: "1" })),
            request("Get One", "GET", "member/v1/shop-post-comments/1", memberAuth),
            request("Create", "POST", "member/v1/shop-post-comments", memberAuth, [], { mode: "raw", raw: '{"content":"Comment","shopPostId":1}', options: { raw: { language: "json" } } }),
            request("Update", "POST", "member/v1/shop-post-comments/1", memberAuth, [], { mode: "raw", raw: '{"content":"Updated"}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "member/v1/shop-post-comments/1", memberAuth)
          ]
        },
        {
          name: "Shop Ratings",
          item: [
            request("Get All", "GET", "member/v1/shop-ratings", memberAuth, queryParams({ shopId: "1" })),
            request("Get All (Paginated)", "GET", "member/v1/shop-ratings", memberAuth, queryParams({ page: "1", perPage: "10", shopId: "1" })),
            request("Create", "POST", "member/v1/shop-ratings", memberAuth, [], { mode: "raw", raw: '{"shopId":1,"rating":5,"comment":""}', options: { raw: { language: "json" } } }),
            request("Update", "PUT", "member/v1/shop-ratings/1", memberAuth, [], { mode: "raw", raw: '{"rating":4,"comment":""}', options: { raw: { language: "json" } } }),
            request("Delete", "DELETE", "member/v1/shop-ratings/1", memberAuth)
          ]
        },
        {
          name: "Workouts",
          item: [
            request("Get All", "GET", "member/v1/workouts", memberAuth, queryParams({ name: "", gender: "", categoryId: "", bodyGoalId: "", placeId: "", memberPlanId: "", workoutDay: "", sets: "", reps: "", fromDate: "", toDate: "" })),
            request("Get All (Paginated)", "GET", "member/v1/workouts", memberAuth, queryParams({ page: "1", perPage: "10", name: "", gender: "", categoryId: "", bodyGoalId: "", placeId: "", memberPlanId: "", workoutDay: "", sets: "", reps: "", fromDate: "", toDate: "" })),
            request("Get Common All", "GET", "member/v1/workouts/common", memberAuth, queryParams({ name: "", gender: "", categoryId: "", bodyGoalId: "", placeId: "", memberPlanId: "", workoutDay: "", sets: "", reps: "" })),
            request("Get One", "GET", "member/v1/workouts/1", memberAuth)
          ]
        },
        {
          name: "Member Types",
          item: [request("Get All", "GET", "member/v1/member-types", memberAuth)]
        },
        {
          name: "Member Plans",
          item: [
            request("Get All", "GET", "member/v1/member-plans", memberAuth, queryParams({ search: "", duration: "", memberTypeId: "" })),
            request("Get One", "GET", "member/v1/member-plans/1", memberAuth)
          ]
        },
        {
          name: "Bank Informations",
          item: [
            request("Get All", "GET", "member/v1/bank-informations", memberAuth, queryParams({ paymentTypes: "", search: "" })),
            request("Get One", "GET", "member/v1/bank-informations/1", memberAuth)
          ]
        },
        {
          name: "Shop Levels",
          item: [
            request("Get All", "GET", "member/v1/shop-levels", memberAuth, queryParams({ name: "", minPrice: "", maxPrice: "", duration: "", postLimit: "", status: "" })),
            request("Get All (Paginated)", "GET", "member/v1/shop-levels", memberAuth, queryParams({ page: "1", perPage: "10", name: "", minPrice: "", maxPrice: "", duration: "", postLimit: "", status: "" })),
            request("Get Common All", "GET", "member/v1/shop-levels/common", memberAuth, queryParams({ name: "", minPrice: "", maxPrice: "", duration: "", postLimit: "", status: "" })),
            request("Get One", "GET", "member/v1/shop-levels/1", memberAuth)
          ]
        },
        {
          name: "Member Request",
          item: [
            request("Trainer Member Request", "POST", "member/v1/member-request/trainer-member", memberAuth, [], formdataBody({ memberPlanId: "1" }, ["photos", "certificates"])),
            request("Gym Member Request", "POST", "member/v1/member-request/gym-member", memberAuth, [], { mode: "raw", raw: '{}', options: { raw: { language: "json" } } })
          ]
        },
        {
          name: "Payment",
          item: [request("Create", "POST", "member/v1/payment", memberAuth, [], formdataBody({ memberPlanId: "1", bankInformationId: "1", amount: "10000" }, ["attachment"]))]
        }
      ]
    }
  ]
};

fs.writeFileSync(path.join(__dirname, "YC-Fitness-API.postman_collection.json"), JSON.stringify(collection, null, 2));
console.log("Generated postman/YC-Fitness-API.postman_collection.json");