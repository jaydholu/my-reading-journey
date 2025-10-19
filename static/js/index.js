function openDeleteModal(deleteUrl, bookTitle) {
    // Set the action URL on the new form element
    const deleteBookForm = document.getElementById('deleteBookForm');
    if (deleteBookForm) {
        deleteBookForm.action = deleteUrl;
    }
    
    // Set the book title in the modal
    const bookNameElement = document.getElementById('bookNameToDelete');
    if (bookNameElement) {
        bookNameElement.textContent = `"${bookTitle}"`;
    }

    // Show the modal
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if(modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target == modal) {
        closeDeleteModal();
    }
}

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeDeleteModal();
    }
});
