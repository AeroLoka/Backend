const generateBookingEmailTemplate = (bookingDetail) => {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f9; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #0073e6; text-align: center;">Booking Confirmation</h2>
                <p style="font-size: 16px; line-height: 1.6;">Dear ${bookingDetail.email},</p>
                <p style="font-size: 16px; line-height: 1.6;">Thank you for booking with us! Your booking has been confirmed. Below are the details:</p>
                
                <hr style="border: 1px solid #ddd;">
                
                <h3 style="color: #333;">Booking Information</h3>
                <ul style="list-style-type: none; padding: 0; font-size: 16px; line-height: 1.6;">
                    <li><strong>Booking Code:</strong> ${bookingDetail.bookingCode}</li>
                    <li><strong>Booking Date:</strong> ${bookingDetail.bookingDate}</li>
                    <li><strong>Total Price:</strong> ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(bookingDetail.totalPrice).replace('IDR', '').trim()}</li>
                    <li><strong>Booking Status:</strong> ${bookingDetail.bookingStatus}</li>
                    <li><strong>Total Passengers:</strong> ${bookingDetail.totalPassenger}</li>
                </ul>
                
                <hr style="border: 1px solid #ddd;">
                
                <h3 style="color: #333;">Passenger Information</h3>
                <ul style="list-style-type: none; padding: 0; font-size: 16px; line-height: 1.6;">
                    ${bookingDetail.passengers.map(passenger => `
                        <li><strong>Name:</strong> ${passenger.firstName} ${passenger.lastName}</li>
                        <li><strong>Phone Number:</strong> ${bookingDetail.phoneNumber}</li>
                        <li><strong>Nationality:</strong> ${passenger.nationality}</li>
                        <li><strong>KTP Number:</strong> ${passenger.ktpNumber || 'N/A'}</li>
                        <li><strong>Passport Number:</strong> ${passenger.passportNumber || 'N/A'}</li>
                        <li><strong>Passport Country:</strong> ${passenger.passportCountry || 'N/A'}</li>
                        <li><strong>Passport Expiry Date:</strong> ${passenger.passportExpiry || 'N/A'}</li>
                        <br>
                    `).join('')}
                </ul>
                
                <hr style="border: 1px solid #ddd;">
                
                <h3 style="color: #333;">Seat Information</h3>
                <ul style="list-style-type: none; padding: 0; font-size: 16px; line-height: 1.6;">
                    <li><strong>Seat(s):</strong> ${bookingDetail.seats.join(', ')}</li>
                </ul>
                
                <hr style="border: 1px solid #ddd;">
                
                <p style="font-size: 16px; line-height: 1.6;"><strong>Next Steps:</strong> Please complete your payment to confirm your booking. If you have any questions or need assistance, feel free to contact us.</p>
                <p style="font-size: 16px; line-height: 1.6;">Thank you for choosing us for your travel needs!</p>
                
                <p style="font-size: 16px; line-height: 1.6;">Best regards,<br>[AeroLoka]</p>
            </div>
        </div>
    `;
};

const generateSimpleEmailTemplate = (detailMessage) => {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f9; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #0073e6; text-align: center;">Notification</h2>
                <p style="font-size: 16px; line-height: 1.6;">${detailMessage}</p>
                <hr style="border: 1px solid #ddd;">
                <p style="font-size: 14px; line-height: 1.6; color: #555;">If you have any questions or need assistance, please contact our support team.</p>
                <p style="font-size: 14px; line-height: 1.6; color: #555;">Thank you for choosing our service!</p>
                <p style="font-size: 14px; line-height: 1.6; color: #555;">Best regards,<br>[Your Company Name]</p>
            </div>
        </div>
    `;
};

module.exports = { generateBookingEmailTemplate, generateSimpleEmailTemplate };
