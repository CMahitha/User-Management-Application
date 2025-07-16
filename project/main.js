let currentUser = null;
let currentOTP = null;
let resetEmail = null;

// Backend API configuration
const API_BASE_URL = "http://localhost:8080/api";

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  checkAuthStatus();
});

function initializeApp() {
  // Initialize default admin if not exists (for demo purposes)
  const users = getUsers();
  const adminExists = users.some((user) => user.role === "admin");

  if (!adminExists) {
    const defaultAdmin = {
      name: "System Administrator",
      email: "admin@system.com",
      mobile: "9999999999",
      dob: "1990-01-01",
      securityQuestion: "pet",
      securityAnswer: "admin",
      userId: "admin",
      password: "admin123",
      role: "admin",
      status: "approved",
      verified: true,
      createdAt: new Date().toISOString(),
    };

    users.push(defaultAdmin);
    localStorage.setItem("users", JSON.stringify(users));
  }
}

function setupEventListeners() {
  // Signup form
  document
    .getElementById("signupForm")
    .addEventListener("submit", handleSignup);

  // Login forms
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document
    .getElementById("adminLoginForm")
    .addEventListener("submit", handleAdminLogin);

  // Forgot password forms
  document
    .getElementById("forgotPasswordForm")
    .addEventListener("submit", handleForgotPassword);
  document
    .getElementById("otpForm")
    .addEventListener("submit", handleOTPVerification);
  document
    .getElementById("resetPasswordForm")
    .addEventListener("submit", handlePasswordReset);
}

function checkAuthStatus() {
  const loggedInUser = localStorage.getItem("currentUser");
  const token = localStorage.getItem("authToken");

  if (loggedInUser && token) {
    currentUser = JSON.parse(loggedInUser);
    updateNavigation(currentUser.role);

    if (currentUser.role === "ADMIN") {
      showPage("adminDashboard");
    } else {
      showPage("userDashboard");
    }
  } else {
    updateNavigation(null);
    showPage("home");
  }
}

function updateNavigation(userRole) {
  const navbarRight = document.getElementById("navbarRight");
  const isAdmin = userRole === "ADMIN";

  if (userRole) {
    // User is logged in
    navbarRight.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user me-1"></i>${currentUser.name}
                </a>
                <ul class="dropdown-menu">
                    ${
                      isAdmin
                        ? '<li><a class="dropdown-item" href="#" onclick="showPage(\'adminDashboard\')"><i class="fas fa-users-cog me-2"></i>Admin Dashboard</a></li>'
                        : '<li><a class="dropdown-item" href="#" onclick="showPage(\'userDashboard\')"><i class="fas fa-user me-2"></i>Dashboard</a></li>'
                    }
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
            </li>
        `;
  } else {
    // User is not logged in
    navbarRight.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showPage('signup')">
                    <i class="fas fa-user-plus me-1"></i>Signup
                </a>
            </li>
           
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showPage('adminLogin')">
                    <i class="fas fa-shield-alt me-1"></i>Admin/User Login
                </a>
            </li>
        `;
  }
}

function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => (page.style.display = "none"));

  // Show requested page
  const targetPage =
    document.getElementById(pageId + "Page") || document.getElementById(pageId);
  if (targetPage) {
    targetPage.style.display = "block";
    targetPage.classList.add("fade-in");

    // Load page-specific data
    if (pageId === "userDashboard") {
      loadUserDashboard();
    } else if (pageId === "adminDashboard") {
      loadAdminDashboard();
    }
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    mobileNumber: document.getElementById("mobile").value,
    dob: document.getElementById("dob").value,
    password: document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value,
    roles: "USER", // Default role for signup
  };

  // Validate form
  if (!validateSignupForm(formData)) {
    return;
  }

  try {
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = "Registering...";
    submitButton.disabled = true;

    // Format date for backend (DD-MM-YYYY)
    const dobFormatted = formatDateForBackend(formData.dob);

    // Prepare request body
    const requestBody = {
      email: formData.email,
      password: formData.password,
      roles: formData.roles,
      name: formData.name,
      dob: dobFormatted,
      mobileNumber: formData.mobileNumber,
    };

    // Make API call
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(
        "Registration successful! Please login to continue.",
        "success"
      );
      document.getElementById("signupForm").reset();
      // Redirect to login page
      showPage("adminLogin");
    } else {
      showAlert(
        data.message || "Registration failed. Please try again.",
        "danger"
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    showAlert(
      "Network error. Please check your connection and try again.",
      "danger"
    );
  } finally {
    // Reset button state
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginUserId").value;
  const password = document.getElementById("loginPassword").value;
  const selectedRole = document.getElementById("loginRole").value;

  try {
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = "Logging in...";
    submitButton.disabled = true;

    // Make API call
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();
    console.log({ data });

    if (response.ok) {
      // Check if the user's role matches the selected role
      if (
        (selectedRole === "user" && data.role === "USER") ||
        (selectedRole === "admin" && data.role === "ADMIN")
      ) {
        // Login successful
        currentUser = data.user;
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("authToken", data.token);
        updateNavigation(data.user.role);

        if (data.user.role === "ADMIN") {
          showPage("adminDashboard");
        } else {
          showPage("userDashboard");
        }

        showAlert(`Welcome back, ${data.user.name}!`, "success");
        document.getElementById("loginForm").reset();
      } else {
        showAlert("Invalid role selected for this account!", "danger");
      }
    } else {
      showAlert(data.message || "Invalid credentials!", "danger");
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert(
      "Network error. Please check your connection and try again.",
      "danger"
    );
  } finally {
    // Reset button state
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

async function approveUser(userId) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    showAlert("Unauthorized! Please log in as admin.", "danger");
    logout();
    return;
  }

  try {
    // Call backend API to approve user
    const response = await fetch(
      `http://localhost:8080/api/auth/users/${userId}/approved`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (response.ok) {
      showAlert("User approved successfully!", "success");
      loadAdminDashboard(); // refresh the UI
    } else {
      showAlert(result.message || "Failed to approve user.", "danger");
    }
  } catch (error) {
    console.error("Approval error:", error);
    showAlert(
      "Something went wrong while approving. Try again later.",
      "danger"
    );
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();

  const email = document.getElementById("adminUserId").value;
  const password = document.getElementById("adminPassword").value;

  try {
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = "Logging in...";
    submitButton.disabled = true;

    // Make API call
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();
    console.log({ adminLogin: data });

    if (response.ok) {
      // Check if the user has admin role
      if (data.user.role === "ADMIN") {
        // Admin login successful
        currentUser = data.user;
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("authToken", data.token);
        updateNavigation("ADMIN");
        showPage("adminDashboard");
        showAlert(`Welcome, Admin ${data.user.name}!`, "success");
        document.getElementById("adminLoginForm").reset();
      } else {
        // updateNavigation("USER");
        currentUser = data.user;
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("authToken", data.token);
        updateNavigation(data.user.role);

        showPage("userDashboard");
        showAlert(`Welcome, User ${data.user.name}!`, "success");
        // showAlert("Access denied! Admin privileges required.", "danger");
      }
    } else {
      showAlert(data.message || "Invalid admin credentials!", "danger");
    }
  } catch (error) {
    console.error("Admin login error:", error);
    showAlert(
      "Network error. Please check your connection and try again.",
      "danger"
    );
  } finally {
    // Reset button state
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

function formatDateForBackend(dateString) {
  // Convert YYYY-MM-DD to DD-MM-YYYY
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function validateSignupForm(data) {
  if (data.password !== data.confirmPassword) {
    showAlert("Passwords do not match!", "danger");
    return false;
  }

  if (data.password.length < 6) {
    showAlert("Password must be at least 6 characters long!", "danger");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showAlert("Please enter a valid email address!", "danger");
    return false;
  }

  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(data.mobileNumber)) {
    showAlert("Please enter a valid 10-digit mobile number!", "danger");
    return false;
  }

  return true;
}

function handleForgotPassword(event) {
  event.preventDefault();

  const email = document.getElementById("resetEmail").value;
  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    showAlert("No account found with this email address!", "danger");
    return;
  }

  // Generate OTP
  currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
  resetEmail = email;

  // Simulate sending OTP
  alert(`OTP sent to ${email}. For demo purposes, your OTP is: ${currentOTP}`);

  // Show OTP step
  document.getElementById("emailStep").style.display = "none";
  document.getElementById("otpStep").style.display = "block";
}

function handleOTPVerification(event) {
  event.preventDefault();

  const enteredOTP = document.getElementById("otp").value;

  if (enteredOTP !== currentOTP) {
    showAlert("Invalid OTP!", "danger");
    return;
  }

  // Show password reset step
  document.getElementById("otpStep").style.display = "none";
  document.getElementById("resetStep").style.display = "block";
  showAlert("OTP verified! Please enter your new password.", "success");
}

function handlePasswordReset(event) {
  event.preventDefault();

  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;

  if (newPassword !== confirmPassword) {
    showAlert("Passwords do not match!", "danger");
    return;
  }

  if (newPassword.length < 6) {
    showAlert("Password must be at least 6 characters long!", "danger");
    return;
  }

  // Update password (this would need to be implemented in your backend)
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.email === resetEmail);
  if (userIndex !== -1) {
    users[userIndex].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));

    showAlert(
      "Password reset successful! You can now login with your new password.",
      "success"
    );

    // Reset form and show login page
    resetForgotPasswordForm();
    showPage("login");
  }
}

function resetForgotPasswordForm() {
  document.getElementById("emailStep").style.display = "block";
  document.getElementById("otpStep").style.display = "none";
  document.getElementById("resetStep").style.display = "none";
  document.getElementById("forgotPasswordForm").reset();
  document.getElementById("otpForm").reset();
  document.getElementById("resetPasswordForm").reset();
  currentOTP = null;
  resetEmail = null;
}

async function loadUserDashboard() {
  if (!currentUser) return;

  const token = localStorage.getItem("authToken");
  if (!token) {
    showAlert("Authentication required. Please login again.", "danger");
    logout();
    return;
  }

  try {
    // Show loading state
    const userInfoDiv = document.getElementById("userInfo");
    userInfoDiv.innerHTML =
      '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading user data...</div>';

    // Make API call to get user data
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();

      // Update current user data
      currentUser = userData;
      localStorage.setItem("currentUser", JSON.stringify(userData));

      // Display user information
      userInfoDiv.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="user-info-row">
                    <strong>Name:</strong> ${userData.name}
                </div>
                <div class="user-info-row">
                    <strong>Email:</strong> ${userData.email}
                </div>
                <div class="user-info-row">
                    <strong>Mobile:</strong> ${userData.mobileNumber || "N/A"}
                </div>
                <div class="user-info-row">
                    <strong>Date of Birth:</strong> ${
                      userData.dob ? formatDateForDisplay(userData.dob) : "N/A"
                    }
                </div>
            </div>
            <div class="col-md-6">
                <div class="user-info-row">
                    <strong>User ID:</strong> ${userData.id}
                </div>
                <div class="user-info-row">
                    <strong>Role:</strong>
                    <span class="status-${userData.role.toLowerCase()}">${
        userData.role
      }</span>
                </div>
                <div class="user-info-row">
                    <strong>Account Status:</strong>
                    <span class="status-active">ACTIVE</span>
                </div>
                <div class="user-info-row">
                    <strong>Member Since:</strong> ${
                      userData.createdAt
                        ? new Date(userData.createdAt).toLocaleDateString()
                        : "N/A"
                    }
                </div>
            </div>
        </div>
      `;
    } else {
      throw new Error("Failed to fetch user data");
    }
  } catch (error) {
    console.error("Error loading user dashboard:", error);
    showAlert(
      "Failed to load user data. Please try refreshing the page.",
      "danger"
    );

    // Fallback to stored user data
    const userInfoDiv = document.getElementById("userInfo");
    userInfoDiv.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="user-info-row">
                    <strong>Name:</strong> ${currentUser.name}
                </div>
                <div class="user-info-row">
                    <strong>Email:</strong> ${currentUser.email}
                </div>
                <div class="user-info-row">
                    <strong>Mobile:</strong> ${
                      currentUser.mobileNumber || "N/A"
                    }
                </div>
                <div class="user-info-row">
                    <strong>Date of Birth:</strong> ${
                      currentUser.dob
                        ? formatDateForDisplay(currentUser.dob)
                        : "N/A"
                    }
                </div>
            </div>
            <div class="col-md-6">
                <div class="user-info-row">
                    <strong>User ID:</strong> ${
                      currentUser.id || currentUser.email
                    }
                </div>
                <div class="user-info-row">
                    <strong>Role:</strong>
                    <span class="status-${currentUser.role.toLowerCase()}">${
      currentUser.role
    }</span>
                </div>
                <div class="user-info-row">
                    <strong>Account Status:</strong>
                    <span class="status-active">ACTIVE</span>
                </div>
                <div class="user-info-row">
                    <strong>Member Since:</strong> ${
                      currentUser.createdAt
                        ? new Date(currentUser.createdAt).toLocaleDateString()
                        : "N/A"
                    }
                </div>
            </div>
        </div>
    `;
  }
}

function formatDateForDisplay(dateString) {
  // Handle both DD-MM-YYYY and YYYY-MM-DD formats
  let date;
  if (dateString.includes("-")) {
    const parts = dateString.split("-");
    if (parts[0].length === 4) {
      // YYYY-MM-DD format
      date = new Date(dateString);
    } else {
      // DD-MM-YYYY format
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  } else {
    date = new Date(dateString);
  }

  return date.toLocaleDateString();
}

async function loadAdminDashboard() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    showAlert("Authentication required. Please login again.", "danger");
    logout();
    return;
  }

  try {
    // Show loading state
    const tableBody = document.getElementById("usersTableBody");
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>';

    // Make API call to get users data
    const response = await fetch(`${API_BASE_URL}/auth/admin`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // console.log({ userData: await response.json() });

    if (response.ok) {
      const responseData = await response.json();
      const users = responseData.data || [];

      tableBody.innerHTML = users
        .map(
          (user) => `
      <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.id}</td>
          <td>
            <span class="badge ${
              user.approvedStatus ? "bg-success" : "bg-secondary"
            }">
              ${user.approvedStatus ? "Approved" : "Pending"}
            </span>
          </td>
          <td>
            <button
              class="btn btn-success btn-sm"
              onclick="approveUser(${user.id})"
              ${user.approvedStatus ? "disabled" : ""}
            >
              <i class="fas fa-check"></i> Approve
            </button>
          </td>
      </tr>
    `
        )
        .join("");

      if (users.length === 0) {
        tableBody.innerHTML =
          '<tr><td colspan="5" class="text-center">No users found.</td></tr>';
      }
    } else {
      throw new Error("Failed to fetch users data");
    }
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    showAlert(
      "Failed to load users data. Please try refreshing the page.",
      "danger"
    );

    // Fallback to empty state
    const tableBody = document.getElementById("usersTableBody");
    tableBody.innerHTML =
      '<tr><td colspan="5" class="text-center text-danger">Error loading users. Please refresh the page.</td></tr>';
  }
}

function viewUser(userId) {
  // Get user data from current loaded users or make API call
  showAlert(`Viewing user with ID: ${userId}`, "info");
  // Implement view user functionality
}

function editUser(userId) {
  // Implement edit user functionality
  showAlert(`Editing user with ID: ${userId}`, "info");
  // You can implement a modal or redirect to edit form
}

function deleteUserById(userId) {
  if (
    confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    )
  ) {
    // Implement delete user API call
    showAlert(`Deleting user with ID: ${userId}`, "warning");
    // You would make an API call to delete the user here
    // After successful deletion, reload the admin dashboard
    // loadAdminDashboard();
  }
}

// Legacy functions for backward compatibility
// function approveUser(userId) {
//   const users = getUsers();
//   const userIndex = users.findIndex((user) => user.userId === userId);
//   if (userIndex !== -1) {
//     users[userIndex].status = "approved";
//     localStorage.setItem("users", JSON.stringify(users));
//     loadAdminDashboard();
//     showAlert("User approved successfully!", "success");
//   }
// }

function archiveUser(userId) {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.userId === userId);
  if (userIndex !== -1) {
    users[userIndex].status = "archived";
    localStorage.setItem("users", JSON.stringify(users));
    loadAdminDashboard();
    showAlert("User archived successfully!", "warning");
  }
}

function deleteUser(userId) {
  if (
    confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    )
  ) {
    const users = getUsers();
    const filteredUsers = users.filter((user) => user.userId !== userId);
    localStorage.setItem("users", JSON.stringify(filteredUsers));
    loadAdminDashboard();
    showAlert("User deleted successfully!", "success");
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  localStorage.removeItem("authToken");
  updateNavigation(null);
  showPage("home");
  showAlert("Logged out successfully!", "info");
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function showAlert(message, type) {
  // Remove existing alerts
  const existingAlert = document.querySelector(".alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create new alert
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  // Insert at the top of the container
  const container = document.querySelector(".container");
  container.insertBefore(alert, container.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 5000);
}

// Make functions globally available
window.showPage = showPage;
window.logout = logout;
window.approveUser = approveUser;
window.archiveUser = archiveUser;
window.deleteUser = deleteUser;
window.viewUser = viewUser;
window.editUser = editUser;
window.deleteUserById = deleteUserById;
