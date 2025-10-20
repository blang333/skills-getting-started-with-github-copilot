document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

  // Clear loading message
  activitiesList.innerHTML = "";

  // Reset activity select (keep the placeholder option)
  activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
              ${
              details.participants.length > 0
                ? `<ul class="participants-list">
                    ${details.participants
                      .map(
                        (email) =>
                          `<li class="participant-item">
                              <span class="participant-email">${email}</span>
                              <button class="participant-delete" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(email)}" title="Remove participant" aria-label="Remove participant">
                                <svg class="icon-delete" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                                  <path fill="currentColor" d="M16.24 7.76a.75.75 0 0 0-1.06 0L12 10.94 8.82 7.76a.75.75 0 0 0-1.06 1.06L10.94 12l-3.18 3.18a.75.75 0 1 0 1.06 1.06L12 13.06l3.18 3.18a.75.75 0 0 0 1.06-1.06L13.06 12l3.18-3.18a.75.75 0 0 0 0-1.06z"/>
                                </svg>
                              </button>
                          </li>`
                      )
                      .join("")}
                  </ul>`
                : `<span class="no-participants">No participants yet.</span>`
            }
          </div>
        `;

        activitiesList.appendChild(activityCard);

          // Attach delete handlers for participant buttons
          activityCard.querySelectorAll('.participant-delete').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
              const activityName = decodeURIComponent(btn.dataset.activity);
              const email = decodeURIComponent(btn.dataset.email);

              if (!confirm(`Remove ${email} from ${activityName}?`)) return;

              try {
                const resp = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
                  method: 'DELETE',
                });

                const result = await resp.json();

                if (resp.ok) {
                  // Refresh activities list to reflect change
                  fetchActivities();
                  messageDiv.textContent = result.message;
                  messageDiv.className = 'success';
                  messageDiv.classList.remove('hidden');
                  setTimeout(() => messageDiv.classList.add('hidden'), 4000);
                } else {
                  messageDiv.textContent = result.detail || 'Failed to remove participant';
                  messageDiv.className = 'error';
                  messageDiv.classList.remove('hidden');
                }
              } catch (err) {
                console.error('Error removing participant:', err);
                messageDiv.textContent = 'Failed to remove participant. Please try again.';
                messageDiv.className = 'error';
                messageDiv.classList.remove('hidden');
              }
            });
          });

  // Add option to select dropdown
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list so the new participant shows up immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
