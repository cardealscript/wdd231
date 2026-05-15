// JSON source URL
const url = 'https://byui-cse.github.io/cse-ww-program/data/latter-day-prophets.json';

// Select the #cards container from the DOM
const cards = document.querySelector('#cards');

// Fetch prophet data from the JSON source
async function getProphetData() {
    const response = await fetch(url);
    const data = await response.json();
    displayProphets(data.prophets);
}

// Build and display a card for each prophet
const displayProphets = (prophets) => {
    prophets.forEach((prophet) => {

        // Create card elements
        const card = document.createElement('section');
        const fullName = document.createElement('h2');
        const birthDate = document.createElement('p');
        const birthPlace = document.createElement('p');
        const portrait = document.createElement('img');

        // Set text content
        fullName.textContent = `${prophet.name} ${prophet.lastname}`;
        birthDate.textContent = `Date of Birth: ${prophet.birthdate}`;
        birthPlace.textContent = `Place of Birth: ${prophet.birthplace}`;

        // Set image attributes
        portrait.setAttribute('src', prophet.imageurl);
        portrait.setAttribute('alt', `Portrait of ${prophet.name} ${prophet.lastname}`);
        portrait.setAttribute('loading', 'lazy');
        portrait.setAttribute('width', '340');
        portrait.setAttribute('height', '440');

        // Append elements to card
        card.appendChild(fullName);
        card.appendChild(birthDate);
        card.appendChild(birthPlace);
        card.appendChild(portrait);

        // Append card to the #cards container
        cards.appendChild(card);
    });
};

// Initialize
getProphetData();