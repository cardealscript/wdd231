const courses = [
    {
        subject: 'CSE',
        number: 110,
        title: 'Introduction to Programming',
        credits: 2,
        completed: true,
        description: 'Introduction to programming concepts using Python. Covers input/output operations, variables, expressions, decisions, loops, lists, and file handling. Students build real-world programs from scratch with no prior experience required.',
        technology: 'Python'
    },
    {
        subject: 'WDD',
        number: 130,
        title: 'Web Fundamentals',
        credits: 2,
        completed: true,
        description: 'Foundation course in web development using HTML and CSS. Covers document structure, semantic elements, styling, box model, layouts, and responsive design principles. Students build and publish a multi-page website.',
        technology: 'HTML, CSS'
    },
    {
        subject: 'CSE',
        number: 111,
        title: 'Programming with Functions',
        credits: 2,
        completed: true,
        description: 'Intermediate Python programming focused on writing, testing, and debugging functions. Topics include parameter passing, return values, lists, dictionaries, file handling, exception handling, and object-oriented basics.',
        technology: 'Python'
    },
    {
        subject: 'WDD',
        number: 131,
        title: 'Dynamic Web Fundamentals',
        credits: 2,
        completed: true,
        description: 'Introduction to dynamic web development using JavaScript and the DOM. Topics include event handling, responsive images, forms, localStorage, and fetching data. Students build interactive and data-driven web pages.',
        technology: 'HTML, CSS, JavaScript'
    },
    {
        subject: 'CSE',
        number: 210,
        title: 'Programming with Classes',
        credits: 2,
        completed: true,
        description: 'Object-oriented programming using C#. Covers the four pillars of OOP: abstraction, encapsulation, inheritance, and polymorphism. Students design and build class-based programs solving real-world problems.',
        technology: 'C#'
    },
    {
        subject: 'WDD',
        number: 231,
        title: 'Web Frontend Development I',
        credits: 2,
        completed: false,
        description: 'Advanced frontend development using HTML, CSS, and JavaScript. Covers responsive layouts, accessibility, web performance, APIs, and dynamic content. Students build professional portfolio-quality web projects.',
        technology: 'HTML, CSS, JavaScript'
    },
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
        card.innerHTML = `
            <h3>${course.subject} ${course.number}</h3>
            <h4>${course.title}</h4>
            <p>${course.description}</p>
            <span class="tech-tag">${course.technology}</span>
            <span class="status">${course.completed ? '✅ Completed' : '🔄 In Progress'}</span>
        `;

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