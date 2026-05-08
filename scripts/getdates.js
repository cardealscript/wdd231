// This code print the corrent year
const correntYear = document.getElementById("currentYear");
correntYear.textContent = new Date () .getFullYear();

// This Code print the last modified date and time
const lastModifiede = document.getElementById("lastModified");
lastModifiede.textContent = "Last Modified " + document.lastModified;
