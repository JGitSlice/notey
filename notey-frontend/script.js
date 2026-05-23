const btn = document.getElementById("darkModeBtn");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");

    if (btn) {
        btn.textContent = "☀️";
    }
}

if (btn) {
    btn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            btn.textContent = "☀️";
        } else {
            localStorage.setItem("theme", "light");
            btn.textContent = "🌙";
        }
    });
}

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const menu = document.getElementById("menu");

if (menu) {
    if (isLoggedIn) {
        menu.innerHTML = `
            <a href="index.html">Home</a>
            <a href="browse.html">Browse Notes</a>
            <a href="upload.html">Upload Notes</a>
            <a href="mynotes.html">My Notes</a>
            <a href="profile.html">Profile</a>
            <a href="#" onclick="logout()">Logout</a>
        `;
    } else {
        menu.innerHTML = `
            <a href="index.html">Home</a>
            <a href="browse.html">Browse Notes</a>
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;
    }
}

const hamburger = document.getElementById("hamburger");

if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
        menu.classList.toggle("active");
    });
}

function logout() {

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");

    alert("Logged out successfully!");

    window.location.href = "login.html";
}

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("keyup", () => {
        const searchText = searchInput.value.toLowerCase();
        const notes = document.querySelectorAll(".note-card");

        notes.forEach(note => {
            const noteText = note.textContent.toLowerCase();

            if (noteText.includes(searchText)) {
                note.style.display = "block";
            } else {
                note.style.display = "none";
            }
        });
    });
}

const notesContainer = document.getElementById("notesContainer");

if (notesContainer) {
    fetch("http://localhost:8080/notes")
        .then(response => response.json())
        .then(notes => {
            notesContainer.innerHTML = "";

            notes.forEach(note => {
                notesContainer.innerHTML += `
                    <div class="note-card">
                        <h2>${note.title}</h2>
                        <h3>Subject: ${note.subject}</h3>
                        <h3>Semester: ${note.semester}</h3>
                        <p>${note.description}</p>

                        <div class="card-buttons">
                            <button onclick="location.href='note.html?id=${note.id}'">View</button>
                            <button onclick="window.open('http://localhost:8080/notes/download/${note.pdfFileName}')">
                                Download
                            </button>
                        </div>
                    </div>
                `;
            });
        })
        .catch(error => console.error("Error:", error));
}

const uploadForm = document.getElementById("uploadForm");

if (uploadForm) {

    uploadForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const formData = new FormData();

        formData.append("title", document.getElementById("title").value);
        formData.append("subject", document.getElementById("subject").value);
        formData.append("semester", document.getElementById("semester").value);
        formData.append("description", document.getElementById("description").value);
        formData.append("userEmail", localStorage.getItem("userEmail"));

        const pdfFile = document.getElementById("pdf").files[0];

        formData.append("pdf", pdfFile);

        fetch("http://localhost:8080/notes/upload", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Upload failed");
            }
            return response.json();
        })
        .then(data => {
            console.log("Saved note:", data);
            alert("Note uploaded successfully!");
            uploadForm.reset();
            window.location.href = "browse.html";
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Upload failed!");
        });

    });

}

function deleteNote(id) {
    if (confirm("Are you sure you want to delete this note?")) {

        fetch(`http://localhost:8080/notes/${id}`, {
            method: "DELETE"
        })
        .then(() => {
            alert("Note deleted successfully!");
            location.reload();
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to delete note.");
        });

    }
}

const noteTitle = document.getElementById("noteTitle");

if (noteTitle) {
    const params = new URLSearchParams(window.location.search);
    const noteId = params.get("id");

    fetch(`http://localhost:8080/notes/${noteId}`)
        .then(response => response.json())
        .then(note => {
            noteTitle.textContent = note.title;
            document.getElementById("noteSubject").textContent = note.subject;
            document.getElementById("noteSemester").textContent = note.semester;
            document.getElementById("noteDescription").textContent = note.description;

            const downloadBtn = document.getElementById("noteDownloadBtn");

            if (note.pdfFileName) {
                downloadBtn.onclick = function () {
                    window.open(`http://localhost:8080/notes/download/${note.pdfFileName}`);
                };
            } else {
                downloadBtn.onclick = function () {
                    alert("No PDF uploaded for this note");
                };
            }
        })
        .catch(error => {
            console.error("Error:", error);
            noteTitle.textContent = "Note not found";
        });
}

const myNotesContainer = document.getElementById("myNotesContainer");

if (myNotesContainer) {
    const userEmail = localStorage.getItem("userEmail");
    fetch(`http://localhost:8080/notes/user/${userEmail}`)
        .then(response => response.json())
        .then(notes => {
            myNotesContainer.innerHTML = "";

            notes.forEach(note => {
                myNotesContainer.innerHTML += `
                    <div class="note-card">
                        <h2>${note.title}</h2>
                        <h3>Subject: ${note.subject}</h3>
                        <h3>Semester: ${note.semester}</h3>
                        <p>${note.description}</p>

                        <div class="card-buttons">
                            <button onclick="location.href='note.html?id=${note.id}'">
                                View
                            </button>

                            <button onclick="window.open('http://localhost:8080/notes/download/${note.pdfFileName}')">
                                Download
                            </button>

                            <button onclick="location.href='editnote.html?id=${note.id}'">
                                Edit
                            </button>

                            <button onclick="deleteNote(${note.id})">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
            });
        })
        .catch(error => console.error("Error:", error));
}

const editForm = document.getElementById("editForm");

if (editForm) {

    const params = new URLSearchParams(window.location.search);
    const noteId = params.get("id");

    fetch(`http://localhost:8080/notes/${noteId}`)
        .then(response => response.json())
        .then(note => {

            document.getElementById("editTitle").value = note.title;
            document.getElementById("editSubject").value = note.subject;
            document.getElementById("editSemester").value = note.semester;
            document.getElementById("editDescription").value = note.description;

        });

    editForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const formData = new FormData();

        formData.append("title",
            document.getElementById("editTitle").value);

        formData.append("subject",
            document.getElementById("editSubject").value);

        formData.append("semester",
            document.getElementById("editSemester").value);

        formData.append("description",
            document.getElementById("editDescription").value);

        const pdfFile =
            document.getElementById("editPdf").files[0];

        if (pdfFile) {
            formData.append("pdf", pdfFile);
        }

        fetch(`http://localhost:8080/notes/update-with-pdf/${noteId}`, {
            method: "PUT",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Update failed with status " + response.status);
            }
            return response.json();
        })
        .then(data => {
            alert("Note updated successfully!");
            window.location.href = "mynotes.html";
        })
        .catch(error => {
            console.error("Error:", error);
            alert(error.message);
        });

    });

}

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const user = {
            username: document.getElementById("registerUsername").value,
            email: document.getElementById("registerEmail").value,
            password: document.getElementById("registerPassword").value
        };

        fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
        .then(response => response.text())
        .then(data => {

            alert(data);

            if (data === "User registered successfully!") {
                window.location.href = "login.html";
            }

        })
        .catch(error => {
            console.error("Error:", error);
            alert("Registration failed!");
        });

    });

}

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const loginData = {
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        };

        fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        })
        .then(response => response.text())
        .then(data => {

            alert(data);

            if (data === "Login successful!") {

                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userEmail", loginData.email);

                window.location.href = "index.html";
            }

        })
        .catch(error => {
            console.error("Error:", error);
            alert("Login failed!");
        });

    });

}

const protectedPages = ["upload.html", "mynotes.html", "editnote.html"];

const currentPage = window.location.pathname.split("/").pop();

if (protectedPages.includes(currentPage)) {

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {

        alert("Please login first!");

        window.location.href = "login.html";
    }
}

const homeNotesContainer = document.getElementById("homeNotesContainer");

if (homeNotesContainer) {

    fetch("http://localhost:8080/notes")
        .then(response => response.json())
        .then(notes => {

            homeNotesContainer.innerHTML = "";

            const latestNotes = notes.slice(-3).reverse();

            latestNotes.forEach(note => {

                homeNotesContainer.innerHTML += `
                    <div class="note-card">
                        <h2>${note.title}</h2>
                        <h3>Subject: ${note.subject}</h3>
                        <h3>Semester: ${note.semester}</h3>
                        <p>${note.description}</p>

                        <div class="card-buttons">

                            <button onclick="location.href='note.html?id=${note.id}'">
                                View
                            </button>

                            <button onclick="window.open('http://localhost:8080/notes/download/${note.pdfFileName}')">
                                Download
                            </button>

                        </div>
                    </div>
                `;
            });

        })
        .catch(error => console.error("Error:", error));
}

const profileUsername =
    document.getElementById("profileUsername");

if (profileUsername) {

    const userEmail =
        localStorage.getItem("userEmail");

    fetch(`http://localhost:8080/auth/user/${userEmail}`)
        .then(response => response.json())
        .then(user => {

            document.getElementById("profileUsername")
                .textContent = user.username;

            document.getElementById("profileEmail")
                .textContent = user.email;

        });

    fetch(`http://localhost:8080/notes/user/${userEmail}`)
        .then(response => response.json())
        .then(notes => {

            document.getElementById("profileNotesCount")
                .textContent = notes.length;

        });
}

const profileImageInput =
    document.getElementById("profileImageInput");

if (profileImageInput) {

    const userEmail =
        localStorage.getItem("userEmail");

    fetch(`http://localhost:8080/auth/user/${userEmail}`)
        .then(response => response.json())
        .then(user => {

            if (user.profilePic) {

                document.getElementById("profilePic").src =
                    `http://localhost:8080/auth/profile-pic/${user.profilePic}`;
            }
        });

    profileImageInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        const formData = new FormData();

        formData.append("profilePic", file);

        fetch(`http://localhost:8080/auth/profile-pic/${userEmail}`, {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(user => {

            document.getElementById("profilePic").src =
                `http://localhost:8080/auth/profile-pic/${user.profilePic}`;

            alert("Profile picture updated!");
        })
        .catch(error => {

            console.error("Error:", error);

            alert("Failed to upload profile picture.");
        });

    });
}

const editProfileForm = document.getElementById("editProfileForm");

if (editProfileForm) {
    const userEmail = localStorage.getItem("userEmail");

    fetch(`http://localhost:8080/auth/user/${userEmail}`)
        .then(response => response.json())
        .then(user => {
            document.getElementById("editProfileUsername").value = user.username;
            document.getElementById("editProfileEmail").value = user.email;
        });

    editProfileForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const updatedUser = {
            username: document.getElementById("editProfileUsername").value
        };

        fetch(`http://localhost:8080/auth/user/${userEmail}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedUser)
        })
        .then(response => response.json())
        .then(data => {
            alert("Profile updated successfully!");
            window.location.href = "profile.html";
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to update profile.");
        });
    });
}

const resetPasswordForm = document.getElementById("resetPasswordForm");

if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const userEmail = localStorage.getItem("userEmail");

        const passwordData = {
            password: document.getElementById("currentPassword").value,
            username: document.getElementById("newPassword").value
        };

        fetch(`http://localhost:8080/auth/reset-password/${userEmail}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(passwordData)
        })
        .then(response => response.text())
        .then(data => {
            alert(data);

            if (data === "Password updated successfully!") {
                window.location.href = "profile.html";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to reset password.");
        });
    });
}