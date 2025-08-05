document.addEventListener('DOMContentLoaded', function() {
    // Loading screen
    setTimeout(() => {
        document.querySelector('.loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.loading-screen').style.display = 'none';
        }, 500);
    }, 1500);

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Scroll to top
            window.scrollTo(0, 0);
        });
    });

    // CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            document.querySelector(`.nav-link[data-section="${targetSection}"]`).classList.add('active');
            
            // Show target section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Scroll to top
            window.scrollTo(0, 0);
        });
    }

    // Booking form functionality
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        const formSteps = document.querySelectorAll('.form-step');
        const stepIndicators = document.querySelectorAll('.step-indicator .step');
        let currentStep = 1;
        const totalSteps = formSteps.length;
        
        // Initialize flatpickr for date input
        flatpickr(".datepicker", {
            minDate: "today",
            dateFormat: "Y-m-d",
            disable: [
                function(date) {
                    // Disable Sundays
                    return (date.getDay() === 0);
                }
            ]
        });
        
        // Show current step
        function showStep(step) {
            formSteps.forEach(formStep => formStep.classList.remove('active'));
            document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
            
            // Update step indicators
            stepIndicators.forEach(indicator => {
                if (parseInt(indicator.getAttribute('data-step')) <= step) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
            
            currentStep = step;
        }
        
        // Next step button
        document.querySelectorAll('.next-step').forEach(button => {
            button.addEventListener('click', function() {
                // Validate current step before proceeding
                const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
                const selectedOption = currentStepElement.querySelector('input[type="radio"]:checked');
                
                if (!selectedOption && currentStep < 9) {
                    alert('Please select an option before proceeding.');
                    return;
                }
                
                if (currentStep < totalSteps) {
                    showStep(currentStep + 1);
                    
                    // Update summary after step 8
                    if (currentStep === 8) {
                        updateOrderSummary();
                    }
                }
            });
        });
        
        // Previous step button
        document.querySelectorAll('.prev-step').forEach(button => {
            button.addEventListener('click', function() {
                if (currentStep > 1) {
                    showStep(currentStep - 1);
                }
            });
        });
        
        // Step indicator click
        stepIndicators.forEach(indicator => {
            indicator.addEventListener('click', function() {
                const step = parseInt(this.getAttribute('data-step'));
                if (step < currentStep) {
                    showStep(step);
                }
            });
        });
        
        // Update order summary with correct prices
        function updateOrderSummary() {
            const summaryElement = document.getElementById('order-summary');
            const totalPriceElement = document.getElementById('total-price');
            const discountTextElement = document.getElementById('discount-text');
            
            // Clear previous summary
            summaryElement.innerHTML = '';
            
            let totalPrice = 0;
            let discount = 0;
            
            // Price mapping based on HTML data-price attributes
            const priceMapping = {
                // Block Size
                'Small R100': 100,
                'Smedium R90': 90,
                'Medium R80': 80,
                'Large R70': 70,
                'Jumbo R60': 60,
                
                // Length
                'Shoulder R0': 0,
                'Mid Back +R50': 50,
                'Waist Length +R100': 100,
                'Bum Length +R150': 150,
                'Knee Length +R200': 200,
                
                // Style
                'None R0': 0,
                'Knotless +R60': 60,
                'Twist +R40': 40,
                'Locs +R200': 200,
                'French Curls +R80': 80,
                'Brazilian Twist +R70': 70,
                
                // Color
                '1 Color R0': 0,
                'Color Mix +R30': 30,
                
                // Hair Length
                'Short +R50': 50,
                'Normal R0': 0,
                
                // Curls
                'None R0': 0,
                'Bottom Curls Only +R30': 30,
                'Boho/Goddess Curls Only +R50': 50,
                'Both Bottom + Boho +R70': 70,
                
                // Curl Method
                'Client Brings Curls R0': 0,
                'I Curl the Hairpiece +R10': 10,
                'I Use My Own Curls +R50': 50,
                
                // Client Status (discount only)
                'First Time': 0,
                'Returning 10% off': 10,
                '5+ Styles Done 20% off': 20
            };
            
            // Get all selected options
            const formData = new FormData(bookingForm);
            const selectedOptions = {};
            
            for (let [name, value] of formData.entries()) {
                if (name !== 'name' && name !== 'email' && name !== 'phone' && name !== 'date') {
                    selectedOptions[name] = {
                        displayText: value.split(' R')[0].split(' +R')[0],
                        price: priceMapping[value] || 0
                    };
                    
                    totalPrice += selectedOptions[name].price;
                    
                    // Check for discount in client status
                    if (name === 'clientStatus') {
                        discount = priceMapping[value] || 0;
                    }
                }
            }
            
            // Add selected options to summary with correct prices
            for (let [name, option] of Object.entries(selectedOptions)) {
                const optionDiv = document.createElement('div');
                const optionName = document.createElement('span');
                const optionValue = document.createElement('span');
                
                // Format name for display
                const formattedName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                
                optionName.textContent = formattedName + ':';
                
                // Display the option with correct price
                if (option.price > 0) {
                    optionValue.textContent = `${option.displayText} (R${option.price})`;
                } else {
                    optionValue.textContent = option.displayText;
                }
                
                optionDiv.appendChild(optionName);
                optionDiv.appendChild(optionValue);
                summaryElement.appendChild(optionDiv);
            }
            
            // Calculate discount
            let discountedPrice = totalPrice;
            if (discount > 0) {
                discountedPrice = totalPrice * (1 - discount / 100);
                discountTextElement.textContent = `(Includes ${discount}% discount)`;
            } else {
                discountTextElement.textContent = '';
            }
            
            // Update total price
            totalPriceElement.textContent = discountedPrice.toFixed(2);
        }
        
        // Form submission
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const date = document.getElementById('date').value;
            
            if (!name || !email || !phone || !date) {
                alert('Please fill in all your details before submitting.');
                return;
            }
            
            // Collect form data
            const formData = new FormData(bookingForm);
            const selectedOptions = {};
            let totalPrice = 0;
            let discount = 0;
            
            const priceMapping = {
                // Block Size
                'Small R100': 100,
                'Smedium R90': 90,
                'Medium R80': 80,
                'Large R70': 70,
                'Jumbo R60': 60,
                
                // Length
                'Shoulder R0': 0,
                'Mid Back +R50': 50,
                'Waist Length +R100': 100,
                'Bum Length +R150': 150,
                'Knee Length +R200': 200,
                
                // Style
                'None R0': 0,
                'Knotless +R60': 60,
                'Twist +R40': 40,
                'Locs +R200': 200,
                'French Curls +R80': 80,
                'Brazilian Twist +R70': 70,
                
                // Color
                '1 Color R0': 0,
                'Color Mix +R30': 30,
                
                // Hair Length
                'Short +R50': 50,
                'Normal R0': 0,
                
                // Curls
                'None R0': 0,
                'Bottom Curls Only +R30': 30,
                'Boho/Goddess Curls Only +R50': 50,
                'Both Bottom + Boho +R70': 70,
                
                // Curl Method
                'Client Brings Curls R0': 0,
                'I Curl the Hairpiece +R10': 10,
                'I Use My Own Curls +R50': 50,
                
                // Client Status (discount only)
                'First Time': 0,
                'Returning 10% off': 10,
                '5+ Styles Done 20% off': 20
            };
            
            for (let [name, value] of formData.entries()) {
                selectedOptions[name] = value;
                
                // Calculate total price using our price mapping
                if (priceMapping.hasOwnProperty(value)) {
                    totalPrice += priceMapping[value];
                }
                
                // Check for discount
                if (name === 'clientStatus') {
                    discount = priceMapping[value] || 0;
                }
            }
            
            // Apply discount
            if (discount > 0) {
                totalPrice = totalPrice * (1 - discount / 100);
            }
            
            // Prepare data for email and WhatsApp
            const bookingDetails = {
                name: selectedOptions.name,
                email: selectedOptions.email,
                phone: selectedOptions.phone,
                date: selectedOptions.date,
                blockSize: selectedOptions.blockSize,
                length: selectedOptions.length,
                style: selectedOptions.style,
                color: selectedOptions.color,
                hairLength: selectedOptions.hairLength,
                curls: selectedOptions.curls,
                curlMethod: selectedOptions.curlMethod,
                clientStatus: selectedOptions.clientStatus,
                totalPrice: `R${totalPrice.toFixed(2)}`
            };
            
            // Create WhatsApp message
            let whatsappMessage = `New Booking from ${bookingDetails.name}:\n\n`;
            whatsappMessage += `📅 Date: ${bookingDetails.date}\n`;
            whatsappMessage += `📞 Phone: ${bookingDetails.phone}\n`;
            whatsappMessage += `📧 Email: ${bookingDetails.email}\n\n`;
            whatsappMessage += `💇‍♀️ Block Size: ${bookingDetails.blockSize} (R${priceMapping[bookingDetails.blockSize] || 0})\n`;
            whatsappMessage += `📏 Length: ${bookingDetails.length} (R${priceMapping[bookingDetails.length] || 0})\n`;
            whatsappMessage += `💈 Style: ${bookingDetails.style} (R${priceMapping[bookingDetails.style] || 0})\n`;
            whatsappMessage += `🎨 Color: ${bookingDetails.color} (R${priceMapping[bookingDetails.color] || 0})\n`;
            whatsappMessage += `✂️ Hair Length: ${bookingDetails.hairLength} (R${priceMapping[bookingDetails.hairLength] || 0})\n`;
            whatsappMessage += `🌀 Curls: ${bookingDetails.curls} (R${priceMapping[bookingDetails.curls] || 0})\n`;
            whatsappMessage += `✨ Curl Method: ${bookingDetails.curlMethod} (R${priceMapping[bookingDetails.curlMethod] || 0})\n`;
            whatsappMessage += `👤 Status: ${bookingDetails.clientStatus}\n\n`;
            whatsappMessage += `💰 Total: ${bookingDetails.totalPrice}`;
            
            // Encode for WhatsApp URL
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappUrl = `https://wa.me/27818744472?text=${encodedMessage}`;
            
            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');
            
            // Prepare email data
            const emailData = {
                to: 'sachah456@gmail.com',
                subject: `New Booking from ${bookingDetails.name}`,
                body: whatsappMessage
            };
            
            console.log('Email data:', emailData);
            
            // Show success message
            alert('Thank you for your booking! A WhatsApp message has been opened with your booking details. Please send it to confirm your appointment.');
            
            // Reset form
            bookingForm.reset();
            showStep(1);
        });
        
        // Initialize first step
        showStep(1);
    }
    
    // Floating spots animation
    const floatingSpots = document.querySelector('.floating-spots');
    if (floatingSpots) {
        for (let i = 0; i < 5; i++) {
            const spot = document.createElement('div');
            const colors = ['pink', 'purple', 'black'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 200 + 100;
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const animationDuration = Math.random() * 20 + 10;
            const animationDelay = Math.random() * 10;
            
            spot.classList.add('spot', randomColor);
            spot.style.width = `${size}px`;
            spot.style.height = `${size}px`;
            spot.style.left = `${left}%`;
            spot.style.top = `${top}%`;
            spot.style.animationDuration = `${animationDuration}s`;
            spot.style.animationDelay = `${animationDelay}s`;
            
            floatingSpots.appendChild(spot);
        }
    }
});


