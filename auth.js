import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-out',
  once: true
});

// MongoDB connection and auth handling
let currentUser = null;

// Modal handling
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const profileBtn = document.getElementById('profileBtn');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const showHistoryBtn = document.getElementById('showHistory');
const logoutBtn = document.getElementById('logoutBtn');
const closeButtons = document.querySelectorAll('.close-modal');
const closeProfileBtn = document.querySelector('#profileModal .close-modal');
const demoBtn = document.getElementById('demoBtn');
const demoModal = document.getElementById('demoModal');

// Show modals
loginBtn?.addEventListener('click', () => {
  loginModal.classList.add('active');
});

demoBtn?.addEventListener('click', () => {
  demoModal.classList.add('active');
});

showRegisterBtn?.addEventListener('click', () => {
  loginModal.classList.remove('active');
  setTimeout(() => {
    registerModal.classList.add('active');
  }, 100);
});

showLoginBtn?.addEventListener('click', () => {
  registerModal.classList.remove('active');
  setTimeout(() => {
    loginModal.classList.add('active');
  }, 100);
});


// Ensure the Profile Button Opens the Modal
if (profileBtn) {
  profileBtn.addEventListener('click', () => {
    if (profileModal) {
      profileModal.classList.add('active'); // Show profile modal
    } else {
      console.error("Profile modal element not found!");
    }
  });
}

// Close Profile Modal When Clicking Close Button
if (closeProfileBtn) {
  closeProfileBtn.addEventListener('click', () => {
    if (profileModal) {
      profileModal.classList.add('hidden'); // Hide profile modal
    }
  });
}

showHistoryBtn?.addEventListener('click', () => {
  historyModal.classList.add('active');
  profileModal.classList.remove('active');
});

// Close modals
closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    loginModal.classList.remove('active');
    registerModal.classList.remove('active');
    profileModal.classList.remove('active');
    demoModal.classList.remove('active');
    // historyModal.classList.remove('active');
    if(historyModal) {
      historyModal.classList.remove('active');
      profileModal.classList.add('active');
    }
  });
});

document.querySelectorAll('.close-modal').forEach(button => {
  button.addEventListener('click', () => {
    loginModal?.classList.remove('active');
    registerModal?.classList.remove('active');
    profileModal?.classList.remove('active');
    demoModal?.classList.remove('active');
    // historyModal?.classList.remove('active');
    if(historyModal) {
      historyModal?.classList.remove('active');
      profileModal?.classList.add('active');
    }
  });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === loginModal || e.target === registerModal || e.target === profileModal) {
    loginModal.classList.remove('active');
    registerModal.classList.remove('active');
    profileModal.classList.remove('active');
    historyModal.classList.remove('active');
  } else if (e.target === historyModal) {
    historyModal.classList.remove('active');
    profileModal.classList.add('active');
  } else if (e.target === demoModal) {
    demoModal.classList.remove('active');
  }
});

// Form handling with loading states and feedback
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function showLoading(form) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>';
}

function hideLoading(form, originalText) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = false;
  button.innerHTML = originalText;
}

function showFeedback(form, message, isError = false) {
  const feedbackDiv = form.querySelector('.form-feedback');
  feedbackDiv.textContent = message;
  feedbackDiv.className = `form-feedback mt-4 text-center ${isError ? 'text-red-600' : 'text-green-600'}`;
}

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading(loginForm);
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      // showFeedback(loginForm, 'Login successful! Redirecting...');
      setTimeout(() => {
        loginModal.classList.remove('active');
        updateUIForLoggedInUser();
      }, 100);
    } else {
      const error = await response.json();
      showFeedback(loginForm, error.message || 'Login failed. Please check your credentials.', true);
    }
  } catch (error) {
    showFeedback(loginForm, 'An error occurred during login.', true);
  } finally {
    hideLoading(loginForm, 'Login');
  }
});

registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading(registerForm);
  
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      // showFeedback(registerForm, 'Registration successful! Redirecting...');
      setTimeout(() => {
        registerModal.classList.remove('active');
        updateUIForLoggedInUser();
      }, 1500);
    } else {
      const error = await response.json();
      showFeedback(registerForm, error.message || 'Registration failed. Please try again.', true);
    }
  } catch (error) {
    showFeedback(registerForm, 'An error occurred during registration.', true);
  } finally {
    hideLoading(registerForm, 'Register');
  }
});

function updateUIForLoggedInUser() {
  if (currentUser) {
    loginBtn.classList.add('hidden');
    profileBtn.classList.remove('hidden');

    // Update profile modal
    // profileName.textContent = currentUser.name;
    // profileEmail.textContent = currentUser.email;
    document.getElementById("profileName").textContent = currentUser.name;
    document.getElementById("profileEmail").textContent = currentUser.email;
  }
}

logoutBtn?.addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      currentUser = null;
      profileModal.classList.remove('active');
      loginBtn.classList.remove('hidden');
      profileBtn.classList.add('hidden');
      profileName.textContent = "";
      profileEmail.textContent = "";

      // alert('Logged out successfully!');
    }
  } catch (error) {
    console.error('Logout failed:', error);
  } 
});

showHistoryBtn?.addEventListener('click', () => {
  if (!currentUser) {
    alert('Please log in to view your history.');
    return;
  }
  document.getElementById('historyModal').classList.remove('hidden');
});

// Auto-login check (optional)
const loadingSpinner = document.getElementById('loadingSpinner');
const mainContent = document.getElementById('mainContent');
async function checkAuthStatus() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/session', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      updateUIForLoggedInUser();
    }
  } catch (error) {
    console.error('Failed to check authentication status:', error);
  } finally {
    // Hide loading spinner and show main content after fetching
    loadingSpinner.classList.add('hidden');
    mainContent.classList.remove('hidden');
  }
}

// Check authentication on page load
checkAuthStatus();

window.addEventListener("load", async () => {
  await checkAuthStatus();
});

const historyContainer = document.getElementById("historyContainer");
const noHistoryText = document.getElementById("noHistoryText");
const userId = currentUser ? currentUser.id : null;



// Function to load history images dynamically
// function loadHistoryImages() {
//   historyContainer.innerHTML = ""; // Clear previous images before loading
//   if (savedImages.length === 0) {
//     noHistoryText.style.display = "block";
//     historyContainer.appendChild(noHistoryText);
//   } else {
//     noHistoryText.style.display = "none";
//     savedImages.forEach((imageSrc, index) => {
//       const wrapper = document.createElement("div");
//       wrapper.classList.add("text-center");

//       const img = document.createElement("img");
//       img.src = imageSrc;
//       img.alt = `Canvas ${index + 1}`;
//       img.classList.add("w-full", "h-auto", "rounded-lg", "shadow-md");

//       const label = document.createElement("p");
//       label.textContent = `Canvas ${index + 1}`;
//       label.classList.add("text-gray-700", "font-semibold", "mt-2");

//       wrapper.appendChild(img);
//       wrapper.appendChild(label);
//       historyContainer.appendChild(wrapper);
//     });
//   }
// }

async function loadHistoryImages() {
  if (!currentUser) {
    console.error("No user logged in. Cannot fetch history.");
    noHistoryText.style.display = "block";
    noHistoryText.textContent = "No history available.";
    historyContainer.innerHTML = "";
    return;
  }

  try {
    // noHistoryText.style.display = "block";
    // noHistoryText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>';
    const response = await fetch(`http://localhost:3000/api/history/${currentUser.id}`);
    const images = await response.json();

    // historyContainer.innerHTML = ""; // Clear previous images

    if (images.length === 0) {
      noHistoryText.style.display = "block";
      noHistoryText.textContent = "No history available.";
    } else {
      noHistoryText.style.display = "none";

      // images.forEach((image, index) => {
      //   const wrapper = document.createElement("div");
      //   wrapper.classList.add("text-center");

      //   const img = document.createElement("img");
      //   img.src = image.imageUrl;
      //   img.alt = `Canvas ${index + 1}`;
      //   img.classList.add("w-full", "h-auto", "rounded-lg", "shadow-md");

      //   const label = document.createElement("p");
      //   label.textContent = `Canvas ${index + 1}`;
      //   label.classList.add("text-gray-700", "font-semibold", "mt-2");

      //   // img.addEventListener("click", () => {setCanvasBackground(img.src)});
      //   img.addEventListener("click", () => {
      //     historyModal.classList.remove('active');
      //     profileModal.classList.remove('active');
      //     setCanvasBackground(img.src);
      //     localStorage.setItem("savedCanvasBackground", img.src); // Save to localStorage
      //   });

      //   const deleteBtn = document.createElement("button");
      //   deleteBtn.innerHTML = "❌"; // Unicode cross icon
      //   // deleteBtn.classList.add(
      //   //   "relative", "top-2", "right-2", 
      //   //   "bg-white-500", "text-red", 
      //   //   "w-6", "h-6", "rounded-full", 
      //   //   "flex", "items-center", "justify-center", 
      //   //   "text-xs", "shadow-md", "cursor-pointer", "hover:bg-white-700"
      //   // );

      //   deleteBtn.classList.add("relative", "top-2", "right-2", "bg-red-500", "text-white", "w-6", "h-6", "rounded-full", "flex", "items-center", "justify-center", "text-xs", "shadow-md", "cursor-pointer", "hover:bg-red-700");
      //   deleteBtn.addEventListener("click", () => deleteHistoryImage(image.id, wrapper));
        
      //   wrapper.appendChild(img);
      //   wrapper.appendChild(deleteBtn);
      //   wrapper.appendChild(label);
      //   historyContainer.appendChild(wrapper);
      // });


      images.forEach((image, index) => {
        // Create a wrapper div
        const wrapper = document.createElement("div");
        wrapper.classList.add("text-center");
      
        // Create the image element
        const img = document.createElement("img");
        img.src = image.imageUrl;
        img.alt = `Canvas ${index + 1}`;
        img.classList.add("w-full", "h-auto", "rounded-lg", "shadow-md", "cursor-pointer");
      
        // Click event to set background
        img.addEventListener("click", () => {
          historyModal.classList.remove('active');
          profileModal.classList.remove('active');
          setCanvasBackground(img.src);
          localStorage.setItem("savedCanvasBackground", img.src); // Save to localStorage
        });
      
        // Create a flex container for the label and delete button
        const labelContainer = document.createElement("div");
        labelContainer.classList.add("flex", "justify-between", "items-center", "mt-2");
      
        // Create the label
        const label = document.createElement("p");
        label.textContent = `Canvas ${index + 1}`;
        label.classList.add("text-gray-700", "font-semibold");
      
        // Create the delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.classList.add(
          "bg-grey-500",
          "w-6", "h-6", "rounded",
          "flex", "items-center", "justify-center",
          "text-xs", "cursor-pointer"
        );
      
        // Delete button click event
        deleteBtn.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent triggering the image click event
          deleteHistoryImage(image._id, wrapper);
        });
      
        // Append label and delete button inside labelContainer
        labelContainer.appendChild(label);
        labelContainer.appendChild(deleteBtn);
      
        // Append elements
        wrapper.appendChild(img);
        wrapper.appendChild(labelContainer); // Append flex container
        historyContainer.appendChild(wrapper);
      });
      

      const savedBackground = localStorage.getItem("savedCanvasBackground");
      if (savedBackground) {
        setCanvasBackground(savedBackground);
      }
    }
  } catch (error) {
    console.error("Error fetching history:", error);
    noHistoryText.style.display = "block";
    noHistoryText.textContent = "Failed to load history.";
  }
}

async function deleteHistoryImage(imageId, element) {
  // const confirmDelete = confirm("Are you sure you want to delete this image?");
  // if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:3000/api/history/delete/${imageId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();
    // console.log(result);
    if (result.success) {
      element.remove(); // Remove from UI
      // alert("Image deleted successfully!");
      // const alertBox = document.getElementById("customAlert");
      // alertBox.classList.remove("opacity-0", "scale-95");
      // alertBox.classList.add("opacity-100", "scale-100");

      // // Auto-hide after 3 seconds
      // setTimeout(() => {
      //     hideAlert();
      // }, 3000);
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    alert("Failed to delete the image.");
  }
}


window.addEventListener("load", () => {
  const canvas = document.getElementById("drawingCanvas");
  if (!canvas) return;
  const savedBackground = localStorage.getItem("savedCanvasBackground");

  if (savedBackground) {
    setCanvasBackground(savedBackground);
  }
});

function setCanvasBackground(imageSrc) {
  const canvas = document.getElementById("drawingCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = imageSrc;
  img.onload = function () {
    // Resize the image to fit the canvas
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

// Load history when history modal is opened
document.getElementById("showHistory")?.addEventListener("click", loadHistoryImages);

document.getElementById("clearBtn")?.addEventListener("click", () => {
  const canvas = document.getElementById("drawingCanvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.removeItem("savedCanvasBackground"); // Clear saved background
});

document.getElementById("saveBtn")?.addEventListener("click", async () => {
  const canvas = document.getElementById("drawingCanvas"); // Get the drawing canvas
  // const canvas = document.getElementById("canvas"); // Get the drawing canvas
  if (!canvas) {
    alert("Canvas not found!");
    return;
  }

  const imageUrl = canvas.toDataURL("image/png"); // Convert canvas to image URL
  // const fileInput = document.getElementById("imageInput");
  // const file = fileInput.files[0];
  if (!currentUser) {
    alert("You must be logged in to save history.");
    return;
  }
  // const formData = new FormData();
  // formData.append("userId", currentUser._id); // Send user ID
  // formData.append("image", imageUrl);
  try {
    const response = await fetch("http://localhost:3000/api/history/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, imageUrl })
      // body: formData
    });

    const data = await response.json();
    if (response.ok) {
      // alert("Image saved successfully!");
      const alertBox = document.getElementById("customAlert");
      alertBox.classList.remove("opacity-0", "scale-95");
      alertBox.classList.add("opacity-100", "scale-100");

      // Auto-hide after 3 seconds
      setTimeout(() => {
          hideAlert();
      }, 3000);
    } else {
      alert(data.message || "Failed to save image.");
    }
  } catch (error) {
    console.error("Error saving image:", error);
    // alert("Error saving image.");
  }
});



function hideAlert() {
  const alertBox = document.getElementById("customAlert");
  alertBox.classList.remove("opacity-100", "scale-100");
  alertBox.classList.add("opacity-0", "scale-95");
}