const API_URL = "http://localhost:8000";
let userId = localStorage.getItem("user_id");
let currentMediaType = "movie";

// DOM Elements
const chatContainer = document.getElementById("messages-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const toneSelector = document.getElementById("tone-selector");
const mediaTypeSelector = document.getElementById("media-type-selector");
const authModal = document.getElementById("auth-modal");
const profileModal = document.getElementById("profile-modal");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    if (!userId) {
        authModal.classList.remove("hidden");
    } else {
        authModal.classList.add("hidden");
        // Optionally load history here
    }

    // Auto-resize textarea
    userInput.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });
});

// --- Authentication ---
document.getElementById("login-btn").addEventListener("click", async () => {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    await performAuth("/login", u, p);
});

document.getElementById("register-btn").addEventListener("click", async () => {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    await performAuth("/register", u, p);
});

async function performAuth(endpoint, username, password) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            if (endpoint === "/register") {
                alert("Registration successful! Please login.");
            } else {
                userId = data.user_id;
                localStorage.setItem("user_id", userId);
                authModal.classList.add("hidden");
            }
        } else {
            alert(data.detail || "Authentication failed");
        }
    } catch (e) {
        console.error(e);
        alert("Server error");
    }
}

// --- Chat Logic ---
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

mediaTypeSelector.addEventListener("change", (e) => {
    currentMediaType = e.target.value;
    appendMessage("agent", `Switched to ${currentMediaType === 'movie' ? 'Movie' : 'Book'} mode.`);
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    if (!userId) {
        authModal.classList.remove("hidden");
        return;
    }

    // 1. UI Update (User)
    appendMessage("user", text);
    userInput.value = "";
    userInput.style.height = "50px";

    // 2. Loading State
    const loadingId = appendMessage("agent", "<i class='fas fa-spinner fa-spin'></i> Thinking...");

    try {
        const tone = toneSelector.value;
        const res = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: parseInt(userId),
                query_text: text,
                tone: tone,
                media_type: currentMediaType
            })
        });

        const data = await res.json();
        
        // Remove loading
        document.getElementById(loadingId).remove();

        if (res.ok) {
            renderAgentResponse(data);
        } else {
            appendMessage("agent", "Sorry, I encountered an error: " + (data.detail || "Unknown error"));
        }
        
    } catch (e) {
        document.getElementById(loadingId).remove();
        appendMessage("agent", "Network error. Is the server running?");
    }
}

function appendMessage(role, htmlContent) {
    const id = "msg-" + Date.now();
    const div = document.createElement("div");
    div.className = `message ${role}-message`;
    div.id = id;
    
    div.innerHTML = `
        <div class="avatar"><i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i></div>
        <div class="content">${htmlContent}</div>
    `;
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

function renderAgentResponse(data) {
    // 1. Text Message
    const msgId = appendMessage("agent", data.agent_message);
    const contentDiv = document.querySelector(`#${msgId} .content`);

    // 2. Recommendations Grid
    if (data.recommendations && data.recommendations.length > 0) {
        const grid = document.createElement("div");
        grid.className = "rec-grid";
        
        data.recommendations.forEach(rec => {
            const card = document.createElement("div");
            card.className = "rec-card";
            card.innerHTML = `
                <img src="${rec.thumbnail_url}" alt="${rec.title}" onerror="this.src='cover_image.jpeg'">
                <div class="rec-info">
                    <div class="rec-title">${rec.title}</div>
                    <div class="rec-desc">${rec.description}</div>
                </div>
            `;
            grid.appendChild(card);
        });
        
        contentDiv.appendChild(grid);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// --- Profile Modal ---
document.getElementById("profile-btn").addEventListener("click", async () => {
    profileModal.classList.remove("hidden");
    await loadProfile();
});

document.querySelector(".close-modal").addEventListener("click", () => {
    profileModal.classList.add("hidden");
});

async function loadProfile() {
    if (!userId) return;
    const res = await fetch(`${API_URL}/profile/${userId}`);
    const data = await res.json();
    
    const favList = document.getElementById("favorites-list");
    const disList = document.getElementById("dislikes-list");
    favList.innerHTML = "";
    disList.innerHTML = "";
    
    data.favorites.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        favList.appendChild(li);
    });
    
    data.dislikes.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        disList.appendChild(li);
    });
}

window.addPreference = async (type) => {
    const inputId = type === 'FAVORITE' ? 'new-favorite' : 'new-dislike';
    const val = document.getElementById(inputId).value;
    if (!val) return;
    
    await fetch(`${API_URL}/profile/preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: parseInt(userId),
            preference_type: type,
            item_value: val,
            category: "GENRE" // Default
        })
    });
    document.getElementById(inputId).value = "";
    loadProfile(); // Refresh
};
