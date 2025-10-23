document.addEventListener("DOMContentLoaded", () => {
    
    // --- Theme Toggler ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const toggleIcon = themeToggleBtn.querySelector('i');

    // Function to set the theme
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        // Update icon
        if (theme === 'dark') {
            toggleIcon.classList.remove('fa-moon');
            toggleIcon.classList.add('fa-sun');
        } else {
            toggleIcon.classList.remove('fa-sun');
            toggleIcon.classList.add('fa-moon');
        }
    }

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    setTheme(savedTheme);

    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    
    // --- Career Tabbed Interface ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Deactivate all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Activate the clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    fetchGitHubProjects();

    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navContainer = document.querySelector('.nav-container');
    const navLinks = document.querySelectorAll('.nav-links a');

    hamburgerBtn.addEventListener('click', () => {
        navContainer.classList.toggle('active');
        const icon = hamburgerBtn.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }

});

// Close menu when a link is clicked (on mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navContainer.classList.remove('active');
                // Reset icon to bars
                hamburgerBtn.querySelector('i').classList.add('fa-bars');
                hamburgerBtn.querySelector('i').classList.remove('fa-times');
            }
        });
    });
});

// --- GitHub Projects Loader ---
async function fetchGitHubProjects() {
    const container = document.querySelector('.projects-container');
    const username = 'bmislol';
    
    // This API call fetches repos, sorted by the last date they were pushed (most recent first)
    const url = `https://api.github.com/users/${username}/repos?sort=pushed&direction=desc`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        const repos = await response.json();

        if (repos.length === 0) {
            container.innerHTML = '<p>No public projects found.</p>';
            return;
        }

        repos.forEach(repo => {
            // Create the card as a link (<a> tag)
            const card = document.createElement('a');
            card.className = 'project-card';
            card.href = repo.html_url; // This makes it click-to-repo
            card.target = '_blank';    // Opens in a new tab
            card.rel = 'noopener noreferrer'; // Security best practice

            card.innerHTML = `
                <h3>${repo.name.replaceAll('-', ' ')}</h3>
                <p>${repo.description || "No description provided."}</p>
                <div class="project-footer">
                    <span>${repo.language || 'Code'}</span>
                    <span>★ ${repo.stargazers_count}</span>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to fetch GitHub projects:', error);
        container.innerHTML = '<p>Could not load projects. Please try again later.</p>';
    }
}