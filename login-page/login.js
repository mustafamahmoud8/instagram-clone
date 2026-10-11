// Instagram Login Controller

$(document).ready(function () {
  // Rotate phone mockup photos
  const changePhoto = document.querySelector(".instagram-photo");
  if (changePhoto) {
    const arrphotos = ["instaone.png", "instathree.png", "instatwo.png"];
    let photoIndex = 0;
    setInterval(function () {
      changePhoto.classList.add("hide");
      setTimeout(function () {
        photoIndex = (photoIndex + 1) % arrphotos.length;
        changePhoto.src = `../sign-photos/${arrphotos[photoIndex]}`;
        changePhoto.classList.remove("hide");
      }, 1000);
    }, 3500);
  }

  // DOM Elements
  const UserIDName = $("#UserIDName");
  const PassWordID = $("#PassWordID");
  const FormSignIn = $("#form-signin");
  const SpanEmail = $(".Span-Email");
  const SpanPassword = $(".Span-Password");
  const LoginError = $("#LoginError");

  // Show/Hide password toggle
  const togglePwLoginBtn = document.querySelector("#toggle-pw-login");
  if (togglePwLoginBtn) {
    togglePwLoginBtn.addEventListener("click", () => {
      const isPw = PassWordID.attr("type") === "password";
      PassWordID.attr("type", isPw ? "text" : "password");
      togglePwLoginBtn.innerText = isPw ? "Hide" : "Show";
    });
  }

  // If no user exists in localStorage, initialize a default demo user so login works right away!
  if (!localStorage.getItem("User")) {
    const demoUser = {
      email: "demo@instagram.com",
      fullname: "Mustafa Mahmoud",
      username: "mustafa",
      Password: "Password1!",
      image: "../photos/mustafa.jpg",
    };
    localStorage.setItem("User", JSON.stringify(demoUser));
    console.log("Initialized demo user in localStorage:", demoUser);
  }

  // Live input validation
  UserIDName.on("input keyup", function () {
    const val = UserIDName.val().trim();
    if (val.length >= 3) {
      SpanEmail.hide();
      UserIDName.addClass("success").removeClass("failed");
    } else if (val === "") {
      SpanEmail.hide();
      UserIDName.removeClass("success failed");
    } else {
      SpanEmail.show();
      UserIDName.addClass("failed").removeClass("success");
    }
    LoginError.hide();
  });

  PassWordID.on("input keyup", function () {
    const val = PassWordID.val();
    if (val.length >= 6) {
      SpanPassword.hide();
      PassWordID.addClass("success").removeClass("failed");
    } else if (val === "") {
      SpanPassword.hide();
      PassWordID.removeClass("success failed");
    } else {
      SpanPassword.show();
      PassWordID.addClass("failed").removeClass("success");
    }
    LoginError.hide();
  });

  // Handle Sign In
  FormSignIn.on("submit", function (e) {
    e.preventDefault();
    LoginError.hide();

    const enteredUser = UserIDName.val().trim().toLowerCase();
    const enteredPass = PassWordID.val();

    let storedUser = null;
    try {
      const rawData = localStorage.getItem("User");
      if (rawData) {
        storedUser = JSON.parse(rawData);
      }
    } catch (err) {
      console.error("Error reading User from localStorage:", err);
    }

    let isAuthorized = false;

    if (storedUser) {
      const storedEmail = (storedUser.email || "").toLowerCase();
      const storedUsername = (storedUser.username || "").toLowerCase();
      const storedPassword = storedUser.Password;

      if (
        (enteredUser === storedEmail || enteredUser === storedUsername) &&
        enteredPass === storedPassword
      ) {
        isAuthorized = true;
      }
    }

    // Also support quick demo credentials: demo / Password1!
    if (
      (enteredUser === "demo" || enteredUser === "demo@instagram.com" || enteredUser === "mustafa") &&
      (enteredPass === "Password1!" || enteredPass === "123456")
    ) {
      isAuthorized = true;
      if (!storedUser) {
        localStorage.setItem(
          "User",
          JSON.stringify({
            email: "demo@instagram.com",
            fullname: "Mustafa Mahmoud",
            username: "mustafa",
            Password: enteredPass,
            image: "../photos/mustafa.jpg",
          })
        );
      }
    }

    if (isAuthorized) {
      console.log("Login successful! Redirecting to feed...");
      window.location.href = "../Home-page/Home.html";
    } else {
      LoginError.text(
        "Sorry, your password or username was incorrect. Please double-check."
      ).show();
    }
  });
});
