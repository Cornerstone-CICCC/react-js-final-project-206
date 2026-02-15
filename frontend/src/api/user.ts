import { BASE_URL } from '.';

export interface IUser {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SignupUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  currPassword?: string;
  newPassword?: string;
}

export interface AuthResultType {
  message: string;
  user: IUser;
}

export const signup = async (signupInfo: SignupUser): Promise<AuthResultType | null> => {
  try {
    const res = await fetch(`${BASE_URL}/users/signup`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(signupInfo),
    });

    const data: AuthResultType = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const login = async (loginInfo: Login): Promise<AuthResultType | null> => {
  try {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(loginInfo),
    });

    if (!res.ok) return null;

    const data: AuthResultType = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const checkAuth = async (): Promise<IUser | null> => {
  try {
    const res = await fetch(`${BASE_URL}/users/check-auth`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data: IUser = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateProfile = async (
  updateInfo: UpdateProfileData,
): Promise<AuthResultType | null> => {
  try {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(updateInfo),
    });

    if (!res.ok) return null;

    const data: AuthResultType = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const logout = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/users/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) return false;
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const deleteAccount = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/users/delete`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
