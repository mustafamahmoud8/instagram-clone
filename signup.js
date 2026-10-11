// Instagram Signup Controller

$(document).ready(function () {
  const formm = $("#signup-form");
  const SpanEmail = $(".span-Email");
  const SpanName = $(".span-name");
  const SpanUserName = $(".span-Username");
  const SpanPassword = $(".span-Password");
  const btnInput = $(".button");

  const EmailSignupId = $("#EmailSignupId");
  const FullnSignupId = $("#FullnSignupId");
  const UsrSignupId = $("#UsrSignupId");
  const PwSignupId = $("#PwSignupId");
  const imageInput = $("#imageInput");

  let uploadedImageBase64 = "";

  // Rotating screenshots in mockup
  const changePhoto = document.querySelector(".instagram-photo");
  if (changePhoto) {
    const arrphotos = ["instaone.png", "instathree.png", "instatwo.png"];
    let photoIndex = 0;
    setInterval(function () {
      changePhoto.classList.add("hide");
      setTimeout(function () {
        photoIndex = (photoIndex + 1) % arrphotos.length;
        changePhoto.src = `sign-photos/${arrphotos[photoIndex]}`;
        changePhoto.classList.remove("hide");
      }, 1000);
    }, 3500);
  }

  // Show/Hide password toggle
  const togglePwBtn = document.querySelector("#toggle-pw-signup");
  if (togglePwBtn) {
    togglePwBtn.addEventListener("click", () => {
      const isPw = PwSignupId.attr("type") === "password";
      PwSignupId.attr("type", isPw ? "text" : "password");
      togglePwBtn.innerText = isPw ? "Hide" : "Show";
    });
  }

  // Handle profile image upload
  imageInput.on("change", function (event) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadedImageBase64 = e.target.result;
        console.log("Image successfully loaded as base64 data URL.");
      };
      reader.readAsDataURL(file);
    }
  });

  // Validation functions
  function validateEmail() {
    const val = EmailSignupId.val().trim();
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phonePattern = /^(\+?\d{8,15})$/;
    if (emailPattern.test(val) || phonePattern.test(val)) {
      SpanEmail.hide();
      EmailSignupId.addClass("success").removeClass("failed");
      return true;
    } else if (val === "") {
      SpanEmail.hide();
      EmailSignupId.removeClass("success failed");
      return false;
    } else {
      SpanEmail.show();
      EmailSignupId.addClass("failed").removeClass("success");
      return false;
    }
  }

  function validateFullName() {
    const val = FullnSignupId.val().trim();
    if (val.length >= 2) {
      SpanName.hide();
      FullnSignupId.addClass("success").removeClass("failed");
      return true;
    } else if (val === "") {
      SpanName.hide();
      FullnSignupId.removeClass("success failed");
      return false;
    } else {
      SpanName.show();
      FullnSignupId.addClass("failed").removeClass("success");
      return false;
    }
  }

  function validateUsername() {
    const val = UsrSignupId.val().trim();
    const usernamePattern = /^[a-zA-Z0-9._-]{3,}$/;
    if (usernamePattern.test(val)) {
      SpanUserName.hide();
      UsrSignupId.addClass("success").removeClass("failed");
      return true;
    } else if (val === "") {
      SpanUserName.hide();
      UsrSignupId.removeClass("success failed");
      return false;
    } else {
      SpanUserName.show();
      UsrSignupId.addClass("failed").removeClass("success");
      return false;
    }
  }

  function validatePassword() {
    const val = PwSignupId.val();
    if (val.length >= 6) {
      SpanPassword.hide();
      PwSignupId.addClass("success").removeClass("failed");
      return true;
    } else if (val === "") {
      SpanPassword.hide();
      PwSignupId.removeClass("success failed");
      return false;
    } else {
      SpanPassword.show();
      PwSignupId.addClass("failed").removeClass("success");
      return false;
    }
  }

  // Keyup listeners for live feedback
  EmailSignupId.on("input keyup", validateEmail);
  FullnSignupId.on("input keyup", validateFullName);
  UsrSignupId.on("input keyup", validateUsername);
  PwSignupId.on("input keyup", validatePassword);

  // Form submit
  formm.on("submit", function (e) {
    e.preventDefault();

    const isEmailOk = validateEmail();
    const isNameOk = validateFullName();
    const isUserOk = validateUsername();
    const isPassOk = validatePassword();

    if (!isEmailOk || !isNameOk || !isUserOk || !isPassOk) {
      alert("Please ensure all fields are filled out correctly.");
      return;
    }

    const Email = EmailSignupId.val().trim();
    const FullName = FullnSignupId.val().trim();
    const UserName = UsrSignupId.val().trim();
    const PassWord = PwSignupId.val();

    // Default image if none uploaded
    const finalImage = uploadedImageBase64 || "../photos/mustafa.jpg";

    const DetailsObj = {
      email: Email,
      fullname: FullName,
      username: UserName,
      Password: PassWord,
      image: finalImage,
    };

    localStorage.setItem("User", JSON.stringify(DetailsObj));
    console.log("User registered successfully:", DetailsObj);

    // Redirect to login page
    window.location.href = "login-page/login.html";
  });
});
