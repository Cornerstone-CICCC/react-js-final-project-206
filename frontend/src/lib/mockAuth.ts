export type MockUserRecord = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  partnerId?: string | null;
  password?: string; // 데모용(실제론 저장하면 안 됨)
};

const USERS_KEY = "mock_users_v1";

function readUsers(): MockUserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MockUserRecord[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: MockUserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function isEmailTaken(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return readUsers().some((u) => (u.email ?? "").toLowerCase() === normalized);
}

export function createMockUser(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): MockUserRecord {
  const email = input.email.trim().toLowerCase();

  if (isEmailTaken(email)) {
    // 백엔드의 409 Conflict 같은 느낌으로 던짐
    const err = new Error("This email address is already registered.");
    // @ts-expect-error
    err.status = 409;
    throw err;
  }

  const user: MockUserRecord = {
    id: "mock_" + Math.random().toString(36).slice(2),
    email,
    firstName: input.firstName?.trim(),
    lastName: input.lastName?.trim(),
    partnerId: null,
    password: input.password, // 데모용
  };

  const users = readUsers();
  users.push(user);
  writeUsers(users);

  return user;
}

export function loginMockUser(input: { email: string; password: string }): MockUserRecord {
  const email = input.email.trim().toLowerCase();
  const users = readUsers();
  const found = users.find((u) => (u.email ?? "").toLowerCase() === email);

  if (!found || (found.password ?? "") !== input.password) {
    const err = new Error("Invalid email or password.");
    // @ts-expect-error
    err.status = 401;
    throw err;
  }

  return found;
}
