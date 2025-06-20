const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});

// Load GitHub Projects Dynamically
async function loadGitHubProjects() {
    const container = document.querySelector('.projects-container');
    try {
        const res = await fetch('https://api.github.com/users/bmislol/repos?sort=updated');
        const repos = await res.json();

        if (!repos.length) {
            container.innerHTML = '<p>No public projects found.</p>';
            return;
        }

        repos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${repo.description || "No description provided."}</p>
                <a href="${repo.html_url}" target="_blank">View on GitHub</a>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Failed to fetch GitHub repos:", err);
        container.innerHTML = '<p>Failed to load projects.</p>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const projectsSection = document.getElementById("Projects");
    const container = document.createElement("div");
    container.className = "projects-container";
    projectsSection.appendChild(container);
    loadGitHubProjects();

    // Mobile Menu Toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuToggle = document.getElementById('menu-toggle');

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    mobileMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            mobileMenu.classList.remove('active');
        }
    });
});

// Load saved theme preference
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});