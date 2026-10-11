import GetData from "../helper/Ajax.js";

// ==========================================================================
// Theme Management (Dark / Light Mode)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem("instagram-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  const themeToggleBtn = document.querySelector("#theme-toggle-btn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("instagram-theme", newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme === "dark" ? "Dark" : "Light"} mode 🌓`);
    });
  }
}

function updateThemeIcon(theme) {
  const iconSpan = document.querySelector("#theme-toggle-btn span");
  if (iconSpan) {
    iconSpan.innerText = theme === "dark" ? "Light Mode" : "Dark Mode";
  }
}
initTheme();

// ==========================================================================
// Toast Notification Utility
// ==========================================================================
export function showToast(message) {
  const container = document.querySelector("#toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ==========================================================================
// User State & Profile Sync
// ==========================================================================
function getCurrentUser() {
  let user = null;
  try {
    const raw = localStorage.getItem("User");
    if (raw) user = JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  let image = (user && user.image) || "../photos/mustafa.jpg";
  if (image === "../photos/ahmed.jfif") image = "../photos/mustafa.jpg";

  return {
    fullname: (user && user.fullname) || "Mustafa Mahmoud",
    username: (user && user.username) || "mustafa",
    email: (user && user.email) || "demo@instagram.com",
    image: image,
  };
}

function updateCurrentUserUI() {
  const user = getCurrentUser();

  const profileImgNav = document.querySelector("#profile-image-navbar");
  const profileImgBottom = document.querySelector("#image-bottom-navbar");
  const profileImgContainer = document.querySelector("#image-profile-container");
  const authorAvatarCreate = document.querySelector("#create-author-avatar");
  const authorUserCreate = document.querySelector("#create-author-username");
  const navProfileName = document.querySelector("#nav-profile-name");
  const userNameDetails = document.querySelector("#UserNameDetails");

  if (profileImgNav) profileImgNav.src = user.image;
  if (profileImgBottom) profileImgBottom.src = user.image;
  if (profileImgContainer) profileImgContainer.src = user.image;
  if (authorAvatarCreate) authorAvatarCreate.src = user.image;
  if (authorUserCreate) authorUserCreate.innerText = user.username;
  if (navProfileName) navProfileName.innerText = user.username;

  if (userNameDetails) {
    userNameDetails.innerHTML = `
      <strong>${user.username}</strong>
      <span>${user.fullname}</span>
    `;
  }
}
updateCurrentUserUI();

// ==========================================================================
// Stories Component & Story Viewer
// ==========================================================================
let allUsersData = [];
let currentStoryIndex = 0;
let storyTimer = null;
const STORY_DURATION = 5000;

function initStories(users) {
  allUsersData = users;
  const container = document.querySelector("#stories-container");
  if (!container || !users) return;

  container.innerHTML = "";

  users.forEach((user, index) => {
    const firstName = user.name ? user.name.split(" ")[0] : `User${index + 1}`;
    const el = document.createElement("div");
    el.className = "story";
    el.innerHTML = `
      <div class="gradient-border">
        <img src="${user.src}" alt="${user.name}" loading="lazy" />
      </div>
      <p>${firstName}</p>
    `;
    el.addEventListener("click", () => openStoryViewer(index));
    container.appendChild(el);
  });
}

function openStoryViewer(index) {
  if (!allUsersData || allUsersData.length === 0) return;
  currentStoryIndex = (index + allUsersData.length) % allUsersData.length;
  const modal = document.querySelector("#story-modal-view");
  if (!modal) return;

  modal.style.display = "flex";
  renderCurrentStory();
}

function renderCurrentStory() {
  const user = allUsersData[currentStoryIndex];
  if (!user) return;

  const avatar = document.querySelector("#story-user-avatar");
  const name = document.querySelector("#story-user-name");
  const media = document.querySelector("#story-media-img");
  const fill = document.querySelector("#story-fill-0");

  if (avatar) avatar.src = user.src;
  if (name) name.innerText = user.name;
  if (media) media.src = user.srcBack || user.postphoto;

  // Reset and animate progress bar
  if (fill) {
    fill.style.transition = "none";
    fill.style.width = "0%";
    setTimeout(() => {
      fill.style.transition = `width ${STORY_DURATION}ms linear`;
      fill.style.width = "100%";
    }, 50);
  }

  // Clear existing timer and auto-advance
  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => {
    if (currentStoryIndex < allUsersData.length - 1) {
      currentStoryIndex++;
      renderCurrentStory();
    } else {
      closeStoryViewer();
    }
  }, STORY_DURATION);
}

function closeStoryViewer() {
  clearTimeout(storyTimer);
  const modal = document.querySelector("#story-modal-view");
  if (modal) modal.style.display = "none";
}

// Story viewer controls
document.querySelector("#close-story-modal-btn")?.addEventListener("click", closeStoryViewer);
document.querySelector("#story-prev-btn")?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentStoryIndex > 0) {
    currentStoryIndex--;
    renderCurrentStory();
  }
});
document.querySelector("#story-next-btn")?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentStoryIndex < allUsersData.length - 1) {
    currentStoryIndex++;
    renderCurrentStory();
  } else {
    closeStoryViewer();
  }
});
document.querySelector("#story-modal-view")?.addEventListener("click", (e) => {
  if (e.target.id === "story-modal-view") closeStoryViewer();
});

// Story quick heart like
document.querySelector("#story-like-btn")?.addEventListener("click", function() {
  const svg = this.querySelector("svg");
  if (svg) {
    const isLiked = svg.getAttribute("fill") === "#ff3040";
    svg.setAttribute("fill", isLiked ? "none" : "#ff3040");
    svg.setAttribute("stroke", isLiked ? "white" : "#ff3040");
    showToast(isLiked ? "Reaction removed" : "Sent ❤️ to story!");
  }
});

// ==========================================================================
// Posts & Feed Rendering (Dynamic + Custom User Posts)
// ==========================================================================
function getCustomPosts() {
  try {
    const raw = localStorage.getItem("instagram-custom-posts");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCustomPosts(posts) {
  localStorage.setItem("instagram-custom-posts", JSON.stringify(posts));
}

function initFeed(users) {
  const container = document.querySelector("#post-container");
  if (!container) return;
  container.innerHTML = "";

  const customPosts = getCustomPosts();
  const allPosts = [...customPosts, ...users];

  allPosts.forEach((post, index) => {
    const postEl = createPostElement(post, index);
    container.appendChild(postEl);
  });

  if (window.feather) feather.replace();
}

function createPostElement(data, index) {
  const initialLikes = data.likes || 120 + (index * 23) % 1150;
  const isCustom = !!data.isCustom;
  const postId = data.id || `post-${index}`;
  const authorAvatar = (data.src === "../photos/ahmed.jfif" ? "../photos/mustafa.jpg" : data.src) || "../photos/mustafa.jpg";
  const authorName = data.name || "User";
  const authorHandle = data.handleuser || "@user";
  const postImg = data.postphoto || data.image;
  const postCaption = data.caption || data.tweet || data.body || "Living my best life ✨";
  const timeLabel = data.time || `${(index % 8) + 1}h`;
  const filterClass = data.filter || "";

  // Check if saved
  const savedPosts = getSavedPosts();
  const isSaved = savedPosts.includes(postId);

  const postDiv = document.createElement("article");
  postDiv.className = "post";
  postDiv.id = postId;

  postDiv.innerHTML = `
    <header class="post-header">
      <div class="post-info-flex">
        <img src="${authorAvatar}" alt="${authorName}" class="profile-pic" />
        <div class="post-user-names">
          <span class="author-name">
            ${authorHandle.replace("@", "")}
            <svg class="verified-badge" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.5l-3.7-3.7 1.4-1.4 2.3 2.3 5.3-5.3 1.4 1.4-6.7 6.7z"/>
            </svg>
          </span>
          <span class="post-time">${timeLabel} &bull; Following</span>
        </div>
      </div>
      <button class="post-more-btn" title="More options">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2">
          <circle cx="12" cy="12" r="1.5"></circle>
          <circle cx="6" cy="12" r="1.5"></circle>
          <circle cx="18" cy="12" r="1.5"></circle>
        </svg>
      </button>
    </header>

    <div class="post-media-container" title="Double tap to like ❤️">
      <img src="${postImg}" alt="Post media" class="post-img ${filterClass}" loading="lazy" />
      <div class="heart-pop-animation">
        <svg viewBox="0 0 24 24" width="96" height="96" fill="#ff3040" stroke="white" stroke-width="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </div>
    </div>

    <div class="post-actions">
      <div class="post-actions-left">
        <button class="icon-btn like-btn" data-liked="false" data-count="${initialLikes}" title="Like">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-width="2"></path>
          </svg>
        </button>
        <button class="icon-btn comment-focus-btn" title="Comment">
          <svg viewBox="0 0 24 24">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke-width="2"></path>
          </svg>
        </button>
        <button class="icon-btn share-post-btn" title="Share / Copy link">
          <svg viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13" stroke-width="2"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2" stroke-width="2"></polygon>
          </svg>
        </button>
      </div>
      <button class="icon-btn bookmark-btn ${isSaved ? 'saved' : ''}" data-post-id="${postId}" title="Save">
        <svg viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-width="2"></path>
        </svg>
      </button>
    </div>

    <div class="post-details">
      <div class="likes">${initialLikes} likes</div>
      <div class="caption">
        <strong>${authorHandle.replace("@", "")}</strong>
        <span>${postCaption}</span>
      </div>
      <div class="view-comments-btn">View all comments</div>
      <div class="user-comments-list"></div>
    </div>

    <form class="add-comment-box">
      <button type="button" class="comment-emoji-btn" title="Add emoji">😊</button>
      <input type="text" class="comment-input" placeholder="Add a comment..." />
      <button type="submit" class="post-comment-btn">Post</button>
    </form>
  `;

  // Attach Post Interactive Handlers
  attachPostInteractions(postDiv, postId, initialLikes);

  return postDiv;
}

function attachPostInteractions(postDiv, postId, initialLikes) {
  const likeBtn = postDiv.querySelector(".like-btn");
  const likesDisplay = postDiv.querySelector(".likes");
  const mediaContainer = postDiv.querySelector(".post-media-container");
  const heartPop = postDiv.querySelector(".heart-pop-animation");
  const bookmarkBtn = postDiv.querySelector(".bookmark-btn");
  const shareBtn = postDiv.querySelector(".share-post-btn");
  const commentFocusBtn = postDiv.querySelector(".comment-focus-btn");
  const commentInput = postDiv.querySelector(".comment-input");
  const commentForm = postDiv.querySelector(".add-comment-box");
  const commentsList = postDiv.querySelector(".user-comments-list");
  const postCommentBtn = postDiv.querySelector(".post-comment-btn");

  let likeCount = initialLikes;
  let isLiked = false;

  const triggerLike = () => {
    isLiked = !isLiked;
    likeCount = isLiked ? likeCount + 1 : likeCount - 1;
    likeBtn.classList.toggle("liked", isLiked);
    likeBtn.setAttribute("data-liked", isLiked);
    likesDisplay.innerText = `${likeCount} likes`;
  };

  // Like button click
  likeBtn.addEventListener("click", triggerLike);

  // Double tap on image
  let lastTap = 0;
  mediaContainer.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastTap < 350) {
      // Double tap detected!
      if (!isLiked) triggerLike();
      heartPop.classList.remove("animate");
      void heartPop.offsetWidth; // re-flow
      heartPop.classList.add("animate");
    }
    lastTap = now;
  });

  // Focus comment input
  commentFocusBtn.addEventListener("click", () => commentInput.focus());

  // Copy link / Share
  shareBtn.addEventListener("click", () => {
    const dummyUrl = `${window.location.origin}/Home-page/Home.html#${postId}`;
    navigator.clipboard?.writeText(dummyUrl).then(() => {
      showToast("Link copied to clipboard! 📋");
    }).catch(() => {
      showToast("Post link ready to share! 🔗");
    });
  });

  // Bookmark / Save post
  bookmarkBtn.addEventListener("click", () => {
    const isNowSaved = toggleSavedPost(postId);
    bookmarkBtn.classList.toggle("saved", isNowSaved);
    showToast(isNowSaved ? "Saved to your collection 🔖" : "Removed from Saved");
  });

  // Comment input typing
  commentInput.addEventListener("input", () => {
    postCommentBtn.classList.toggle("active", commentInput.value.trim().length > 0);
  });

  // Add Comment Form
  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = commentInput.value.trim();
    if (!text) return;

    const user = getCurrentUser();
    const row = document.createElement("div");
    row.className = "comment-row";
    row.innerHTML = `
      <div>
        <strong class="comment-author">${user.username}</strong>
        <span>${text}</span>
      </div>
      <button class="delete-comment-btn" title="Delete comment">&times;</button>
    `;

    row.querySelector(".delete-comment-btn").addEventListener("click", () => {
      row.remove();
      showToast("Comment deleted");
    });

    commentsList.appendChild(row);
    commentInput.value = "";
    postCommentBtn.classList.remove("active");
  });
}

// ==========================================================================
// Saved Posts Store
// ==========================================================================
function getSavedPosts() {
  try {
    const raw = localStorage.getItem("instagram-saved-posts");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function toggleSavedPost(id) {
  let list = getSavedPosts();
  let isSaved = false;
  if (list.includes(id)) {
    list = list.filter((item) => item !== id);
    isSaved = false;
  } else {
    list.push(id);
    isSaved = true;
  }
  localStorage.setItem("instagram-saved-posts", JSON.stringify(list));
  return isSaved;
}

// ==========================================================================
// Suggestions Sidebar
// ==========================================================================
function initSuggestions(users) {
  const container = document.querySelector("#profile-div");
  if (!container || !users) return;

  container.innerHTML = "";
  users.slice(0, 5).forEach((user) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.innerHTML = `
      <div class="suggestion-user-left">
        <img src="${user.src}" alt="${user.name}" loading="lazy" />
        <div class="suggestion-details">
          <strong>${user.handleuser.replace("@", "")}</strong>
          <span>${user.name}</span>
        </div>
      </div>
      <button class="follow-toggle-btn">Follow</button>
    `;

    const btn = item.querySelector(".follow-toggle-btn");
    btn.addEventListener("click", () => {
      const isFollowing = btn.classList.contains("following");
      if (isFollowing) {
        btn.classList.remove("following");
        btn.innerText = "Follow";
      } else {
        btn.classList.add("following");
        btn.innerText = "Following";
        showToast(`Started following ${user.name} 👤`);
      }
    });

    container.appendChild(item);
  });
}

// ==========================================================================
// Create New Post Modal Functionality
// ==========================================================================
function initCreatePostModal() {
  const modal = document.querySelector("#create-post-modal");
  const openBtn = document.querySelector("#nav-create-btn");
  const mobileOpenBtn = document.querySelector("#mobile-create-btn");
  const closeBtn = document.querySelector("#close-create-post-btn");
  const fileInput = document.querySelector("#new-post-file-input");
  const sampleSelect = document.querySelector("#sample-photo-select");
  const previewImg = document.querySelector("#create-preview-img");
  const dropzone = document.querySelector("#upload-dropzone");
  const captionInput = document.querySelector("#create-caption-input");
  const shareBtn = document.querySelector("#share-post-btn");
  const filterPills = document.querySelectorAll(".filter-pill");

  let selectedImageDataUrl = "";
  let activeFilter = "";

  const openModal = () => {
    modal.style.display = "flex";
  };

  const closeModal = () => {
    modal.style.display = "none";
    resetCreateForm();
  };

  const resetCreateForm = () => {
    selectedImageDataUrl = "";
    activeFilter = "";
    previewImg.src = "";
    previewImg.style.display = "none";
    previewImg.className = "create-preview-img";
    dropzone.style.display = "flex";
    captionInput.value = "";
    filterPills.forEach((p) => p.classList.toggle("active", p.getAttribute("data-filter") === "none"));
  };

  openBtn?.addEventListener("click", openModal);
  mobileOpenBtn?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle file select
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        selectedImageDataUrl = event.target.result;
        previewImg.src = selectedImageDataUrl;
        previewImg.style.display = "block";
        dropzone.style.display = "none";
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle sample select
  sampleSelect?.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val) {
      selectedImageDataUrl = val;
      previewImg.src = val;
      previewImg.style.display = "block";
      dropzone.style.display = "none";
    }
  });

  // Handle Filter Pills
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const f = pill.getAttribute("data-filter");
      activeFilter = f === "none" ? "" : f;
      previewImg.className = `create-preview-img ${activeFilter}`;
    });
  });

  // Share Post
  shareBtn?.addEventListener("click", () => {
    if (!selectedImageDataUrl) {
      showToast("Please choose an image to share!");
      return;
    }

    const user = getCurrentUser();
    const caption = captionInput.value.trim() || "Just shared a new post! ✨";

    const newPost = {
      id: `custom-post-${Date.now()}`,
      isCustom: true,
      name: user.fullname,
      handleuser: `@${user.username}`,
      src: user.image,
      postphoto: selectedImageDataUrl,
      caption: caption,
      filter: activeFilter,
      time: "Just now",
      likes: 1,
    };

    // Save in custom posts
    const customList = getCustomPosts();
    customList.unshift(newPost);
    saveCustomPosts(customList);

    // Prepend to feed
    const postContainer = document.querySelector("#post-container");
    if (postContainer) {
      const postEl = createPostElement(newPost, 0);
      postEl.style.animation = "scaleUpModal 0.4s ease";
      postContainer.prepend(postEl);
    }

    closeModal();
    showToast("Your post has been shared! 🎉");
  });
}
initCreatePostModal();

// ==========================================================================
// Search Drawer Functionality
// ==========================================================================
function initSearchDrawer(users) {
  const drawer = document.querySelector("#search-drawer");
  const openBtn = document.querySelector("#nav-search-btn");
  const mobileOpenBtn = document.querySelector("#mobile-search-btn");
  const closeBtn = document.querySelector("#close-search-btn");
  const input = document.querySelector("#search-input");
  const resultsContainer = document.querySelector("#search-results-list");

  const toggleDrawer = () => {
    drawer.classList.toggle("open");
    if (drawer.classList.contains("open")) {
      input.focus();
      renderSearchResults(input.value.trim());
    }
  };

  openBtn?.addEventListener("click", toggleDrawer);
  mobileOpenBtn?.addEventListener("click", toggleDrawer);
  closeBtn?.addEventListener("click", () => drawer.classList.remove("open"));

  input?.addEventListener("input", (e) => {
    renderSearchResults(e.target.value.trim());
  });

  function renderSearchResults(query) {
    resultsContainer.innerHTML = "";
    const filtered = users.filter((u) => {
      const q = query.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.handleuser.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<p style="color: var(--text-secondary); font-size: 13px; text-align: center; margin-top: 20px;">No users found</p>`;
      return;
    }

    filtered.forEach((user) => {
      const row = document.createElement("div");
      row.className = "search-result-item";
      row.innerHTML = `
        <img src="${user.src}" alt="${user.name}" />
        <div class="search-result-info">
          <strong>${user.handleuser.replace("@", "")}</strong>
          <span>${user.name}</span>
        </div>
      `;
      row.addEventListener("click", () => {
        drawer.classList.remove("open");
        showToast(`Viewing @${user.handleuser.replace("@", "")}`);
      });
      resultsContainer.appendChild(row);
    });
  }
}

// ==========================================================================
// Notifications Drawer & More Dropdown
// ==========================================================================
function initDrawersAndMenus() {
  const notifDrawer = document.querySelector("#notifications-drawer");
  const notifBtn = document.querySelector("#nav-notifications-btn");
  const notifClose = document.querySelector("#close-notif-btn");
  const badge = document.querySelector("#notif-badge");

  notifBtn?.addEventListener("click", () => {
    notifDrawer.classList.toggle("open");
    if (badge) badge.style.display = "none";
  });
  notifClose?.addEventListener("click", () => notifDrawer.classList.remove("open"));

  // More Dropdown Menu
  const moreBtn = document.querySelector("#nav-more-btn");
  const moreMenu = document.querySelector("#more-dropdown-menu");

  moreBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isShowing = moreMenu.style.display === "flex";
    moreMenu.style.display = isShowing ? "none" : "flex";
  });

  document.addEventListener("click", (e) => {
    if (!moreBtn?.contains(e.target) && !moreMenu?.contains(e.target)) {
      if (moreMenu) moreMenu.style.display = "none";
    }
  });

  // Logout button
  document.querySelector("#logout-btn")?.addEventListener("click", () => {
    localStorage.removeItem("User");
    showToast("Logged out successfully");
    setTimeout(() => {
      window.location.href = "../login-page/login.html";
    }, 600);
  });
}
initDrawersAndMenus();

// ==========================================================================
// Bootstrap Data Fetch & Init
// ==========================================================================
GetData((data) => {
  if (data && Array.isArray(data)) {
    initStories(data);
    initFeed(data);
    initSuggestions(data);
    initSearchDrawer(data);
  }
});
