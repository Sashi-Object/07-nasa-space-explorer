// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');

const modal = document.getElementById('apodModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModalButton = document.getElementById('closeModalButton');

const API_KEY = 'xz45LLFFb5BpSsV3xWU4rlDFUQsCclgMfyzr2hMW';
const APOD_BASE_URL = 'https://api.nasa.gov/planetary/apod';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

function showMessage(message, icon) {
	gallery.innerHTML = `
		<div class="placeholder">
			<div class="placeholder-icon">${icon}</div>
			<p>${message}</p>
		</div>
	`;
}

function createGalleryCard(item) {
	const card = document.createElement('article');
	card.className = 'gallery-item';
	card.innerHTML = `
		<img src="${item.url}" alt="${item.title}" loading="lazy" />
		<h3>${item.title}</h3>
		<p class="gallery-date">${item.date}</p>
	`;

	card.addEventListener('click', () => {
		modalImage.src = item.hdurl || item.url;
		modalImage.alt = item.title;
		modalTitle.textContent = item.title;
		modalDate.textContent = item.date;
		modalExplanation.textContent = item.explanation;
		modal.classList.add('open');
		document.body.classList.add('modal-open');
	});

	return card;
}

function closeModal() {
	modal.classList.remove('open');
	document.body.classList.remove('modal-open');
}

async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate) {
		showMessage('Please choose both a start date and an end date.', '⚠️');
		return;
	}

	if (startDate > endDate) {
		showMessage('Start date must be before end date.', '⚠️');
		return;
	}

	showMessage('Loading space photos...', '🔄');
	getImagesButton.disabled = true;
	getImagesButton.textContent = 'Loading...';

	try {
		const requestUrl = `${APOD_BASE_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
		const response = await fetch(requestUrl);

		if (!response.ok) {
			throw new Error('NASA API request failed.');
		}

		const data = await response.json();

		// APOD sometimes returns videos, so we keep image items for the image gallery.
		const imageItems = data
			.filter((item) => item.media_type === 'image')
			.sort((a, b) => new Date(b.date) - new Date(a.date));

		if (imageItems.length === 0) {
			showMessage('No images were found in this date range.', '🛰️');
			return;
		}

		gallery.innerHTML = '';
		imageItems.forEach((item) => {
			const card = createGalleryCard(item);
			gallery.appendChild(card);
		});
	} catch (error) {
		showMessage('Something went wrong while loading NASA images. Please try again.', '🚨');
	} finally {
		getImagesButton.disabled = false;
		getImagesButton.textContent = 'Get Space Images';
	}
}

getImagesButton.addEventListener('click', getSpaceImages);
closeModalButton.addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
	if (event.target === modal) {
		closeModal();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && modal.classList.contains('open')) {
		closeModal();
	}
});

// Load images for the default 9-day range right away.
getSpaceImages();
