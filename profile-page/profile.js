import GetData from "../helper/Ajax.js";

// ==========================================================================
// Theme Synchronization
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem("instagram-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const themeBtn = document.querySelector("#theme-toggle-profile-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("instagram-theme", next);
    });
  }
}
initTheme();

// ==========================================================================
// User Data Management & Display
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
    bio: (user && user.bio) || "Creating visual stories & software experiences 🚀📸\nExploring code, design & coffee ☕",
    image: image,
  };
}

function renderUserProfile() {
  const user = getCurrentUser();

  const heroAvatar = document.querySelector("#profile-picture");
  const headerAvatar = document.querySelector("#image-container");
  const usernameHeader = document.querySelector("#fullname");
  const fullnameBio = document.querySelector("#Username");
  const bioText = document.querySelector("#user-bio");

  if (heroAvatar) heroAvatar.src = user.image;
  if (headerAvatar) headerAvatar.src = user.image;
  if (usernameHeader) usernameHeader.innerText = user.username;
  if (fullnameBio) fullnameBio.innerText = user.fullname;
  if (bioText) bioText.innerText = user.bio;
}
renderUserProfile();

// ==========================================================================
// Edit Profile Modal
// ==========================================================================
function initEditProfile() {
  const modal = document.querySelector("#edit-profile-modal");
  const openBtn = document.querySelector("#edit-profile-btn");
  const avatarWrapper = document.querySelector("#profile-avatar-wrapper");
  const closeBtn = document.querySelector("#close-edit-modal-btn");
  const form = document.querySelector("#edit-profile-form");

  const nameInput = document.querySelector("#edit-fullname-input");
  const userInput = document.querySelector("#edit-username-input");
  const bioInput = document.querySelector("#edit-bio-input");
  const avatarInput = document.querySelector("#edit-avatar-input");

  const openModal = () => {
    const user = getCurrentUser();
    nameInput.value = user.fullname;
    userInput.value = user.username;
    bioInput.value = user.bio;
    avatarInput.value = user.image.startsWith("data:") ? "" : user.image;
    modal.style.display = "flex";
  };

  const closeModal = () => {
    modal.style.display = "none";
  };

  openBtn?.addEventListener("click", openModal);
  avatarWrapper?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const current = getCurrentUser();
    const updated = {
      ...current,
      fullname: nameInput.value.trim() || current.fullname,
      username: userInput.value.trim() || current.username,
      bio: bioInput.value.trim() || current.bio,
      image: avatarInput.value.trim() || current.image,
    };

    localStorage.setItem("User", JSON.stringify(updated));
    renderUserProfile();
    closeModal();
  });
}
initEditProfile();

// ==========================================================================
// Profile Grid & Saved Posts
// ==========================================================================
function getCustomPosts() {
  try {
    const raw = localStorage.getItem("instagram-custom-posts");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function getSavedPostIds() {
  try {
    const raw = localStorage.getItem("instagram-saved-posts");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

let cachedUsers = [];

function loadProfileGrids(users) {
  cachedUsers = users;
  const customPosts = getCustomPosts();
  const allPosts = [...customPosts, ...users];

  // Update Posts counter
  const postsCountEl = document.querySelector("#posts-count");
  if (postsCountEl) postsCountEl.innerText = allPosts.length;

  // Render Main Posts Grid
  const gridContainer = document.querySelector("#profile-grid-container");
  if (gridContainer) {
    gridContainer.innerHTML = "";
    allPosts.forEach((post, i) => {
      const likes = post.likes || (120 + (i * 17) % 890);
      const comments = 5 + (i * 3) % 45;
      const imgSrc = post.postphoto || post.image;

      const item = document.createElement("div");
      item.className = "profile-grid-item";
      item.innerHTML = `
        <img src="${imgSrc}" alt="Post image" loading="lazy" />
        <div class="grid-overlay">
          <div class="grid-overlay-stat">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>${likes}</span>
          </div>
          <div class="grid-overlay-stat">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white" stroke="none">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span>${comments}</span>
          </div>
        </div>
      `;

      item.addEventListener("click", () => openPostModal(post, likes, comments));
      gridContainer.appendChild(item);
    });
  }

  // Render Saved Posts Grid
  renderSavedGrid(allPosts);
}

function renderSavedGrid(allPosts) {
  const savedContainer = document.querySelector("#saved-grid-container");
  if (!savedContainer) return;

  const savedIds = getSavedPostIds();
  const savedItems = allPosts.filter((p, index) => {
    const id = p.id || `post-${index}`;
    return savedIds.includes(id);
  });

  savedContainer.innerHTML = "";
  if (savedItems.length === 0) {
    savedContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <h5>No Saved Posts Yet</h5>
        <p style="font-size: 13px;">Save photos from your feed to view them in your private collection.</p>
      </div>
    `;
    return;
  }

  savedItems.forEach((post, i) => {
    const likes = post.likes || 150;
    const comments = 12;
    const imgSrc = post.postphoto || post.image;

    const item = document.createElement("div");
    item.className = "profile-grid-item";
    item.innerHTML = `
      <img src="${imgSrc}" alt="Saved post" loading="lazy" />
      <div class="grid-overlay">
        <div class="grid-overlay-stat">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white" stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>${likes}</span>
        </div>
      </div>
    `;
    item.addEventListener("click", () => openPostModal(post, likes, comments));
    savedContainer.appendChild(item);
  });
}

// ==========================================================================
// Post Detail Modal Preview
// ==========================================================================
function openPostModal(item, likes, comments) {
  let modal = document.querySelector("#profile-post-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "profile-post-modal";
    modal.className = "modal-custom";
    document.body.appendChild(modal);
  }

  const author = item.handleuser || "@mustafa";
  const avatar = (item.src === "../photos/ahmed.jfif" ? "../photos/mustafa.jpg" : item.src) || "../photos/mustafa.jpg";
  const media = item.postphoto || item.image;
  const caption = item.caption || item.tweet || item.body || "";

  modal.innerHTML = `
    <div class="modal-content-card" style="max-width: 620px; width: 90%;">
      <div class="modal-card-header">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
          <strong style="font-size: 14px;">${author.replace("@", "")}</strong>
        </div>
        <button id="close-post-modal-btn">&times;</button>
      </div>
      <img src="${media}" style="width: 100%; max-height: 480px; object-fit: cover; display: block; background: #000;" />
      <div style="padding: 16px;">
        <p style="font-size: 13.5px; margin: 0 0 8px 0; line-height: 1.4;">
          <strong>${author.replace("@", "")}</strong> ${caption}
        </p>
        <span style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">${likes} likes</span>
      </div>
    </div>
  `;

  modal.style.display = "flex";
  document.querySelector("#close-post-modal-btn")?.addEventListener("click", () => {
    modal.style.display = "none";
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}

// ==========================================================================
// Followers & Following Modals
// ==========================================================================
function initFollowersModals() {
  const modal = document.querySelector("#users-list-modal");
  const title = document.querySelector("#users-modal-title");
  const list = document.querySelector("#users-modal-list");
  const closeBtn = document.querySelector("#close-users-modal-btn");

  const followersBtn = document.querySelector("#followers-btn");
  const followingBtn = document.querySelector("#following-btn");

  const openList = (typeTitle) => {
    if (!cachedUsers) return;
    title.innerText = typeTitle;
    list.innerHTML = "";

    cachedUsers.forEach((user) => {
      const row = document.createElement("div");
      row.className = "user-modal-list-item";
      row.innerHTML = `
        <div class="user-modal-left">
          <img src="${user.src}" alt="${user.name}" />
          <div class="user-modal-info">
            <strong>${user.handleuser.replace("@", "")}</strong>
            <span>${user.name}</span>
          </div>
        </div>
        <button class="modal-follow-btn ${typeTitle === 'Following' ? 'following' : ''}">
          ${typeTitle === 'Following' ? 'Following' : 'Follow'}
        </button>
      `;

      const btn = row.querySelector(".modal-follow-btn");
      btn.addEventListener("click", () => {
        const isF = btn.classList.contains("following");
        btn.classList.toggle("following", !isF);
        btn.innerText = isF ? "Follow" : "Following";
      });

      list.appendChild(row);
    });

    modal.style.display = "flex";
  };

  followersBtn?.addEventListener("click", () => openList("Followers"));
  followingBtn?.addEventListener("click", () => openList("Following"));
  closeBtn?.addEventListener("click", () => { modal.style.display = "none"; });
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
}
initFollowersModals();

// Fetch Data & Initialize
GetData((data) => {
  if (data && Array.isArray(data)) {
    loadProfileGrids(data);
  }
});
