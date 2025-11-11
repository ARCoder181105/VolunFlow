export const getAccessToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  return null;
};

export const setAccessToken = (token: string, expiresIn: number) => {
  const expires = new Date(Date.now() + expiresIn * 1000).toUTCString();
  document.cookie = `accessToken=${token}; expires=${expires}; path=/; secure; samesite=strict`;
};

export const removeAccessToken = () => {
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};