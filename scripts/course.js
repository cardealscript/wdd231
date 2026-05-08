const courses = [
    {subject: 'CSE', number: 110, title: 'Introduction to Programming', credits: 2, completed: true },
    {subject: 'WDD', number: 130, title: 'Web Fundamentals', credits: 2, completed: true },
    {subject: 'CSE', number: 111, title: 'Programming with Functions', credits: 2, completed: true },
    {subject: 'WDD', number: 131, title: 'Dynamic Web Fundamentals', credits: 2, completed: true },
    {subject: 'CSE', number: 210, title: 'Programming with Classes', credits: 2, completed: true },
    {subject: 'WDD', number: 231, title: 'Web Frontend Development I', credits: 2, completed: false },
]

// Get the div where courses will be displayed
const courseList = document.getElementById("course-list");

// Function to display courses
function displayCourses(courseArray) {
    
    // Clear the div before displaying new courses
    courseList.innerHTML = "";

    // For each course in the array, create a card
    courseArray.forEach(course => {
        const card = document.createElement("div");
        card.classList.add("course-card");

        // If the course is completed, add a different class
        if (course.completed) {
            card.classList.add("completed");
        }

        // Add content inside the card
        card.textContent = `${course.subject} ${course.number}`;

        // Add the card to the div
        courseList.appendChild(card);
    });
}

// Display all courses when the page loads
displayCourses(courses);

// ==========================================================

// Get filter buttons
const btnAll = document.getElementById("all");
const btnWDD = document.getElementById("wdd");
const btnCSE = document.getElementById("cse");

// Button ALL - shows all courses
btnAll.addEventListener("click", () => {
    displayCourses(courses);
    displayCredits(courses);
});

// Button WDD - shows only WDD courses
btnWDD.addEventListener("click", () => {
    const wddCourses = courses.filter(course => course.subject === "WDD");
    displayCourses(wddCourses);
    displayCredits(wddCourses);
});

// Button CSE - shows only CSE courses
btnCSE.addEventListener("click", () => {
    const cseCourses = courses.filter(course => course.subject === "CSE");
    displayCourses(cseCourses);
    displayCredits(cseCourses);
});

// Function to calculate and display total credits
function displayCredits(courseArray) {
    const total = courseArray.reduce((sum, course) => sum + course.credits, 0);
    document.getElementById("total-credits").textContent = `Total Credits: ${total}`;
}

// Display credits on page load
displayCredits(courses);