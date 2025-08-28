
// document.addEventListener('DOMContentLoaded', function() {
//     const languageButton = document.getElementById('languageButton');
//     const languageDropdown = document.getElementById('languageDropdown');
//     const currentFlag = document.getElementById('currentFlag');
//     const languageOptions = document.querySelectorAll('.language-option');
    
//     // Check if elements exist
//     if (!languageButton || !languageDropdown || !currentFlag) {
//         console.log('Language switcher elements not found');
//         return;
//     }
    
//     // Get saved language from localStorage or default to Nepal
//     let currentLanguage = localStorage.getItem('selectedLanguage') || 'np';
    
//     // Function to update flag display
//     function updateFlagDisplay(langCode, flagName, imagePath, altText) {
//         // Update image source
//         currentFlag.src = imagePath;
//         currentFlag.alt = altText;
        
//         // Keep the same CSS class
//         languageButton.className = 'flag-nepal';
        
//         // Update active state in dropdown
//         languageOptions.forEach(opt => {
//             opt.classList.remove('active');
//             if (opt.dataset.lang === langCode) {
//                 opt.classList.add('active');
//             }
//         });
        
//         // Save to localStorage
//         localStorage.setItem('selectedLanguage', langCode);
//         localStorage.setItem('selectedFlag', flagName);
//         localStorage.setItem('selectedImage', imagePath);
//         localStorage.setItem('selectedAlt', altText);
        
//         console.log('Language updated to:', langCode, 'with image:', imagePath);
//     }
    
//     // Restore saved language on page load
//     function restoreSavedLanguage() {
//         const savedLang = localStorage.getItem('selectedLanguage');
//         const savedImage = localStorage.getItem('selectedImage');
//         const savedAlt = localStorage.getItem('selectedAlt');
//         const savedFlag = localStorage.getItem('selectedFlag');
        
//         if (savedLang && savedImage && savedLang !== 'np') {
//             // Only restore if it's not the default Nepal
//             updateFlagDisplay(savedLang, savedFlag, savedImage, savedAlt);
//             console.log('Restored saved language:', savedLang);
//         }
//     }
    
//     // Restore saved language on page load
//     restoreSavedLanguage();
    
//     // Toggle dropdown
//     languageButton.addEventListener('click', function(e) {
//         e.preventDefault();
//         e.stopPropagation();
//         languageDropdown.classList.toggle('show');
//     });
    
//     // Close dropdown when clicking outside
//     document.addEventListener('click', function(e) {
//         if (!languageButton.contains(e.target) && !languageDropdown.contains(e.target)) {
//             languageDropdown.classList.remove('show');
//         }
//     });
    
//     // Handle language selection - FLEXIBLE IMAGE NAMING
//     languageOptions.forEach(option => {
//         option.addEventListener('click', function(e) {
//             e.preventDefault();
//             e.stopPropagation();
            
//             const selectedLang = this.dataset.lang;
//             const selectedFlag = this.dataset.flag;
//             const selectedImage = this.dataset.image; // Use exact image path provided
//             const selectedAlt = this.dataset.alt;
//             const selectedFormat = this.dataset.format || 'png'; // Default format
//             const selectedName = this.dataset.name; // Custom file name
            
//             console.log('Language option clicked:', {
//                 lang: selectedLang,
//                 flag: selectedFlag,
//                 image: selectedImage,
//                 alt: selectedAlt,
//                 format: selectedFormat,
//                 name: selectedName
//             });
            
//             // Determine image path with flexible naming
//             let imagePath;
//             if (selectedImage) {
//                 // Use exact path provided in data-image
//                 imagePath = selectedImage;
//             } else if (selectedName) {
//                 // Use custom name with format
//                 imagePath = `assets/images/${selectedName}.${selectedFormat}`;
//             } else {
//                 // Fallback to standard naming
//                 imagePath = `assets/images/${selectedFlag}.${selectedFormat}`;
//             }
            
//             // Determine alt text
//             let altText;
//             if (selectedAlt) {
//                 altText = selectedAlt;
//             } else {
//                 altText = `${selectedFlag.charAt(0).toUpperCase() + selectedFlag.slice(1)} Flag`;
//             }
            
//             console.log('Final image path:', imagePath);
            
//             // Update display
//             updateFlagDisplay(selectedLang, selectedFlag, imagePath, altText);
            
//             // Close dropdown
//             languageDropdown.classList.remove('show');
            
//             // Check if image loads successfully
//             currentFlag.onload = function() {
//                 console.log('Flag image loaded successfully:', imagePath);
//             };
            
//             currentFlag.onerror = function() {
//                 console.error('Failed to load flag image:', imagePath);
//                 console.error('Please check if the image file exists at this path');
//             };
//         });
//     });
// });
