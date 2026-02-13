const DEMO_ACCOUNTS = {
  DemoFree: { username: "DemoFree", password: "123", plan: "free" },
  DemoPlus: { username: "DemoPlus", password: "123", plan: "plus" },
  DemoPrem: { username: "DemoPrem", password: "123", plan: "premium" },
};

function signup(username, password, plan) {
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (users[username]) {
    return { success: false, message: "Username already exists" };
  }

  const newUser = {
    username,
    password,
    plan,
    createdAt: new Date().toISOString(),
  };

  users[username] = newUser;
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  return { success: true };
}

function signin(username, password) {
  if (
    DEMO_ACCOUNTS[username] &&
    DEMO_ACCOUNTS[username].password === password
  ) {
    const demoUser = {
      ...DEMO_ACCOUNTS[username],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("currentUser", JSON.stringify(demoUser));
    return { success: true };
  }

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const user = users[username];

  if (!user) {
    return { success: false, message: "Username not found" };
  }

  if (user.password !== password) {
    return { success: false, message: "Incorrect password" };
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  return { success: true };
}

function getCurrentUser() {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
}

function logout() {
  localStorage.removeItem("currentUser");
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}
