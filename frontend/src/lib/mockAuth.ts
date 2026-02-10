// src/lib/mockAuth.ts

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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isEmailTaken(email: string): boolean {
  const normalized = normalizeEmail(email);
  return readUsers().some((u) => normalizeEmail(u.email ?? "") === normalized);
}

/** ✅ 회원가입(mock) */
export function createMockUser(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): MockUserRecord {
  const email = normalizeEmail(input.email);

  if (isEmailTaken(email)) {
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

/** ✅ 로그인(mock) */
export function loginMockUser(input: { email: string; password: string }): MockUserRecord {
  const email = normalizeEmail(input.email);
  const users = readUsers();
  const found = users.find((u) => normalizeEmail(u.email ?? "") === email);

  if (!found || (found.password ?? "") !== input.password) {
    const err = new Error("Invalid email or password.");
    // @ts-expect-error
    err.status = 401;
    throw err;
  }

  return found;
}

/** ✅ 유저 조회 (Profile에서 사용) */
export function getMockUserByEmail(email: string): MockUserRecord | null {
  const normalized = normalizeEmail(email);
  const users = readUsers();
  return users.find((u) => normalizeEmail(u.email ?? "") === normalized) ?? null;
}

/** ✅ 비밀번호 검증 (Profile에서 current password 체크용) */
export function verifyMockPassword(email: string, currentPassword: string) {
  const user = getMockUserByEmail(email);
  if (!user) return { ok: false as const, reason: "USER_NOT_FOUND" as const };

  if ((user.password ?? "") !== currentPassword) {
    return { ok: false as const, reason: "WRONG_PASSWORD" as const };
  }

  return { ok: true as const };
}

/** ✅ 비밀번호 업데이트 (Profile에서 저장용) */
export function updateMockPassword(email: string, newPassword: string) {
  const normalized = normalizeEmail(email);
  const users = readUsers();
  const idx = users.findIndex((u) => normalizeEmail(u.email ?? "") === normalized);

  if (idx === -1) return { ok: false as const, reason: "USER_NOT_FOUND" as const };

  users[idx] = { ...users[idx], password: newPassword };
  writeUsers(users);

  return { ok: true as const };
}

/**
 * ✅ 유저 정보 업데이트 (필요할 때 사용)
 * - 과제 요구사항 변경으로 profile에서 이름/이메일 수정 막는다고 했으니
 *   지금 당장 안 써도 됨. 나중에 "백엔드 붙이기 전 mock 업데이트"에 유용.
 */
export function updateMockUser(
  email: string,
  patch: Partial<Omit<MockUserRecord, "id" | "email">>
) {
  const normalized = normalizeEmail(email);
  const users = readUsers();
  const idx = users.findIndex((u) => normalizeEmail(u.email ?? "") === normalized);

  if (idx === -1) return { ok: false as const, reason: "USER_NOT_FOUND" as const };

  users[idx] = { ...users[idx], ...patch };
  writeUsers(users);

  return { ok: true as const, user: users[idx] };
}
