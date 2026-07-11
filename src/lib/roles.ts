export const ROLES = [
  "super_admin",
  "school_admin",
  "teacher",
  "parent",
  "student",
  "accountant",
  "librarian",
] as const;

export type AppRole = (typeof ROLES)[number];

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  school_admin: "School Admin",
  teacher: "Teacher",
  parent: "Parent",
  student: "Student",
  accountant: "Accountant",
  librarian: "Librarian",
};

export const ROLE_DASHBOARD: Record<AppRole, string> = {
  super_admin: "/dashboard/super-admin",
  school_admin: "/dashboard/school-admin",
  teacher: "/dashboard/teacher",
  parent: "/dashboard/parent",
  student: "/dashboard/student",
  accountant: "/dashboard/accountant",
  librarian: "/dashboard/librarian",
};

// Priority when a user holds multiple roles — most privileged first.
export const ROLE_PRIORITY: AppRole[] = [
  "super_admin",
  "school_admin",
  "teacher",
  "accountant",
  "librarian",
  "parent",
  "student",
];

export function pickPrimaryRole(roles: AppRole[]): AppRole | null {
  for (const r of ROLE_PRIORITY) if (roles.includes(r)) return r;
  return null;
}
