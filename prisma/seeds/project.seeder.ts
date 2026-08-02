import bcrypt from "bcrypt";
import {
  Permission,
  ProjectStage,
  ProjectStatus,
  Rag,
  Status,
} from "@prisma/client";
import prisma from "../client";
import { formatProjectCode } from "../../app/helpers/project-code";

const ensurePmUser = async () => {
  const pmRole = await prisma.role.findFirst({
    where: { permission: Permission.PROJECT_MANAGEMENT },
  });

  if (!pmRole) {
    throw new Error("PM role not found. Seed roles first.");
  }

  const pmUser = await prisma.user.upsert({
    where: { email: "pm@ayabank.com" },
    update: {
      name: "Project Manager",
      employeeId: "PM0001",
      status: Status.ACTIVE,
      roleId: pmRole.id,
    },
    create: {
      name: "Project Manager",
      email: "pm@ayabank.com",
      employeeId: "PM0001",
      password: bcrypt.hashSync("@dminP@55", 10),
      status: Status.ACTIVE,
      roleId: pmRole.id,
    },
  });

  return pmUser;
};

const projectSeeder = async () => {
  console.log("Projects seeding ...");

  const pmUser = await ensurePmUser();

  const projects = [
    {
      code: formatProjectCode(1),
      name: "Core Banking Upgrade",
      department: "IT",
      projectPhase: "Phase 1",
      objectives: "Modernize core banking platform",
      keyResults: "Go-live of upgraded modules",
      achievements: "Discovery workshops completed",
      nextPlans: "Finalize vendor SOW",
      remark: "Priority initiative for FY",
      keyProjects: "CBS, Channels",
      rag: Rag.AMBER,
      risk: "Vendor delay",
      strategicAlignment: "Digital Transformation",
      currentStatus: "Discovery completed",
      status: ProjectStatus.OPEN,
      stage: ProjectStage.INITIATION,
      totalPercentage: 0,
      ownerIds: [pmUser.id],
    },
    {
      code: formatProjectCode(2),
      name: "Mobile Banking Enhancement",
      department: "Digital Banking",
      projectPhase: "Build",
      objectives: "Improve mobile UX and performance",
      keyResults: "App store rating above 4.5",
      achievements: "UX redesign approved",
      nextPlans: "Release sprint 4",
      remark: "Customer experience focus",
      keyProjects: "AYA Pay, Mobile App",
      rag: Rag.GREEN,
      risk: "Low",
      strategicAlignment: "Customer Experience",
      currentStatus: "Sprint 3 in progress",
      status: ProjectStatus.ON_TRACK,
      stage: ProjectStage.EXECUTION_AND_IMPLEMENTATION,
      totalPercentage: 0,
      ownerIds: [pmUser.id],
    },
    {
      code: formatProjectCode(3),
      name: "Data Warehouse Migration",
      department: "Data & Analytics",
      projectPhase: "Migration",
      objectives: "Migrate reporting warehouse to cloud",
      keyResults: "All critical reports cut over",
      achievements: "Source mapping completed",
      nextPlans: "ETL validation cycle 2",
      remark: "Dependent on source system freezes",
      keyProjects: "DWH, BI Suite",
      rag: Rag.RED,
      risk: "Data quality gaps",
      strategicAlignment: "Data Platform",
      currentStatus: "ETL validation ongoing",
      status: ProjectStatus.DELAYED,
      stage: ProjectStage.PLANNING,
      totalPercentage: 0,
      ownerIds: [pmUser.id],
    },
    {
      code: formatProjectCode(4),
      name: "AML Screening Enhancement",
      department: "Compliance",
      projectPhase: "Design",
      objectives: "Strengthen real-time AML screening",
      keyResults: "False positive rate below 5%",
      achievements: "Rule catalog drafted",
      nextPlans: "UAT with compliance ops",
      remark: "Regulatory priority",
      keyProjects: "AML Engine",
      rag: Rag.AMBER,
      risk: "MEDIUM",
      strategicAlignment: "Risk & Compliance",
      currentStatus: "Design review scheduled",
      status: ProjectStatus.INDICATION_OF_DELAY,
      stage: ProjectStage.PLANNING,
      totalPercentage: 0,
      ownerIds: [pmUser.id],
    },
    {
      code: formatProjectCode(5),
      name: "Branch Queue Management",
      department: "Retail Banking",
      projectPhase: "Pilot",
      objectives: "Reduce average branch wait time",
      keyResults: "Wait time under 10 minutes",
      achievements: "Pilot live in 3 branches",
      nextPlans: "Expand to Yangon region",
      remark: "Positive customer feedback",
      keyProjects: "Queue Kiosk, SMS Alert",
      rag: Rag.GREEN,
      risk: "ON TRACK",
      strategicAlignment: "Service Excellence",
      currentStatus: "Pilot monitoring",
      status: ProjectStatus.ON_TRACK,
      stage: ProjectStage.EXECUTION_AND_IMPLEMENTATION,
      totalPercentage: 0,
      ownerIds: [pmUser.id],
    },
    {
      code: formatProjectCode(6),
      name: "Card Tokenization",
      department: "Cards & Payments",
      projectPhase: "Implementation",
      objectives: "Enable network tokenization for cards",
      keyResults: "Token provisioning live for Visa",
      achievements: "Scheme certification passed",
      nextPlans: "Production cutover",
      remark: "Security dependency cleared",
      keyProjects: "Token Service, Issuer Host",
      rag: Rag.GREEN,
      risk: "LOW",
      strategicAlignment: "Payments Modernization",
      currentStatus: "Ready for go-live",
      status: ProjectStatus.COMPLETED,
      stage: ProjectStage.CLOSING_AND_DONE,
      totalPercentage: 100,
      ownerIds: [pmUser.id],
    },
    {
      code: formatProjectCode(7),
      name: "HR Self-Service Portal",
      department: "Human Resources",
      projectPhase: "Stabilization",
      objectives: "Digitize leave and claims requests",
      keyResults: "90% employee adoption",
      achievements: "Nationwide rollout completed",
      nextPlans: "Hypercare support window",
      remark: "Closed after hypercare",
      keyProjects: "HRIS Portal",
      rag: Rag.GREEN,
      risk: "-",
      strategicAlignment: "People Operations",
      currentStatus: "Closed",
      status: ProjectStatus.CLOSE,
      stage: ProjectStage.POST_IMPLEMENTATION,
      totalPercentage: 100,
      ownerIds: [pmUser.id],
    },
    {
      code: formatProjectCode(8),
      name: "Cybersecurity SOC Expansion",
      department: "Information Security",
      projectPhase: "Initiation",
      objectives: "Expand 24x7 SOC coverage",
      keyResults: "MTTD under 15 minutes",
      achievements: "Vendor shortlist prepared",
      nextPlans: "RFP evaluation",
      remark: "Budget confirmation pending",
      keyProjects: "SIEM, SOAR",
      rag: Rag.AMBER,
      risk: "HIGH",
      strategicAlignment: "Cyber Resilience",
      currentStatus: "Vendor evaluation",
      status: ProjectStatus.OPEN,
      stage: ProjectStage.INITIATION,
      totalPercentage: 0,
      ownerIds: [pmUser.id],
    },
    {
      code: formatProjectCode(9),
      name: "Loan Origination Redesign",
      department: "Credit",
      projectPhase: "Build",
      objectives: "Shorten retail loan turnaround time",
      keyResults: "TAT reduced by 40%",
      achievements: "Workflow prototype demoed",
      nextPlans: "Integrate credit bureau APIs",
      remark: "Integration partner delayed",
      keyProjects: "LOS, Credit Scoring",
      rag: Rag.RED,
      risk: "CRITICAL",
      strategicAlignment: "Credit Growth",
      currentStatus: "Blocked on bureau API",
      status: ProjectStatus.DELAYED,
      stage: ProjectStage.EXECUTION_AND_IMPLEMENTATION,
      totalPercentage: 0,
      ownerIds: [pmUser.id],
    },
    {
      code: formatProjectCode(10),
      name: "Open API Gateway",
      department: "IT Architecture",
      projectPhase: "Platform",
      objectives: "Launch secure partner API gateway",
      keyResults: "First 5 partners onboarded",
      achievements: "Gateway PoC completed",
      nextPlans: "Security penetration test",
      remark: "Architecture board approved",
      keyProjects: "API Gateway, Developer Portal",
      rag: Rag.AMBER,
      risk: "Indication of delay",
      strategicAlignment: "Open Banking",
      currentStatus: "Security review in progress",
      status: ProjectStatus.INDICATION_OF_DELAY,
      stage: ProjectStage.PLANNING,
      totalPercentage: 0,
      ownerIds: [pmUser.id],
    },
  ];

  for (const projectData of projects) {
    const { ownerIds, ...data } = projectData;

    const project = await prisma.project.upsert({
      where: { code: data.code },
      update: {
        name: data.name,
        department: data.department,
        projectPhase: data.projectPhase,
        objectives: data.objectives,
        keyResults: data.keyResults,
        achievements: data.achievements,
        nextPlans: data.nextPlans,
        remark: data.remark,
        keyProjects: data.keyProjects,
        rag: data.rag,
        risk: data.risk,
        strategicAlignment: data.strategicAlignment,
        currentStatus: data.currentStatus,
        status: data.status,
        stage: data.stage,
        totalPercentage: data.totalPercentage,
      },
      create: data,
    });

    await prisma.projectOwner.deleteMany({
      where: { projectId: project.id },
    });

    await prisma.projectOwner.createMany({
      data: ownerIds.map((userId) => ({
        userId,
        projectId: project.id,
      })),
    });
  }

  console.log(`Projects seeded successfully (${projects.length})`);
};

export default projectSeeder;
