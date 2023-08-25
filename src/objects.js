/*
 * id: an ID object that identifies this instance of Venue
 * name: string representing the name of the venue
 * contactEmail: string representing the email address of the venue
 * address: object with the following fields:
 *    street1: string
 *    street2: string
 *    city: string
 *    state: string (2-letter notation, i.e. AL)
 *    zip: string (5 character notation, i.e. 36830)
 * presetTimeSlots: array of objects with the following fields:
 *    start: string representing the start time of the preset time slot (HH-mm notation)
 *    end: string representing the end time of the preset time slot (HH-mm notation)
 * artistConfirmationSendOut:
 *    day: integer representing the day of the month of the send out (must be <= 28)
 * artistInvoiceSendOut:
 *    day: integer representing the day of the month of the send out (must be <= 28)
 * monthlyBookingListSendOut:
 *    day: integer representing the day of the month of the send out (must be <= 28)
 */
export class Venue {
    constructor(_data, _id) {
        if (!_data) _data = {};
        this.id = _id || null;
        this.name = _data.name || "";
        // this.contactEmail = _data.email || "";
        // this.address = _data.address || {
        //     street1: _data.street1 || "",
        //     street2: _data.street2 || "",
        //     city: _data.city || "",
        //     state: _data.state || "",
        //     zip: _data.zip || ""
        // };
        // this.presetTimeSlots = _data.presetTimeSlots || [];
        // this.artistConfirmationSendOut = _data.artistConfirmationSendOut || 1;
        // this.artistInvoiceSendOut = _data.artistInvoiceSendOut || 1;
        // this.monthlyBookingListSendOut = _data.monthlyBookingListSendOut || 1;
        // this.monthlyCalendarSendOut = _data.monthlyCalendarSendOut || 1;
        // this.allConfirmationsLastSent = _data.allConfirmationsLastSent || "";
        // this.allInvoicesLastSent = _data.allInvoicesLastSent || "";
        // this.bookingListLastSent = _data.bookingListLastSent || "";
        // this.calendarLastSent = _data.calendarLastSent || "";
        // this.emaillist = _data.emaillist || []; 
    }

    update(data) {
        this.name = data.name || this.name;
        // this.contactEmail = data.email || this.contactEmail;

        // this.address = {
        //     street1: data.street1 || this.address.street1,
        //     street2: data.street2 || this.address.street2,
        //     city: data.city || this.address.city,
        //     state: data.state || this.address.state,
        //     zip: (data.zip || this.address.zip).toString()
        // };
        // this.presetTimeSlots = data.presetTimeSlots || this.presetTimeSlots;
        // this.artistConfirmationSendOut = data.artistConfirmationSendOut || this.artistConfirmationSendOut;
        // this.artistInvoiceSendOut = data.artistInvoiceSendOut || this.artistInvoiceSendOut;
        // this.monthlyBookingListSendOut = data.monthlyBookingListSendOut || this.monthlyBookingListSendOut;
        // this.monthlyCalendarSendOut = data.monthlyCalendarSendOut || this.monthlyCalendarSendOut;

        // this.allConfirmationsLastSent = data.allConfirmationsLastSent || this.allConfirmationsLastSent;
        // this.allInvoicesLastSent = data.allInvoicesLastSent || this.allInvoicesLastSent;
        // this.bookingListLastSent = data.bookingListLastSent || this.bookingListLastSent;
        // this.calendarLastSent = data.calendarLastSent || this.calendarLastSent;
        // this.emaillist = data.emaillist || this.emaillist;
    }

    toData() {
        return {
            name: this.name,
            // email: this.contactEmail,
            // address: this.address,
            // presetTimeSlots: this.presetTimeSlots || [],
            // artistConfirmationSendOut: this.artistConfirmationSendOut || 1,
            // artistInvoiceSendOut: this.artistInvoiceSendOut || 1,
            // monthlyBookingListSendOut: this.monthlyBookingListSendOut || 1,
            // monthlyCalendarSendOut: this.monthlyCalendarSendOut || 1,
            // allConfirmationsLastSent: this.allConfirmationsLastSent || "",
            // allInvoicesLastSent: this.allInvoicesLastSent || "",
            // bookingListLastSent: this.bookingListLastSent || "",
            // calendarLastSent: this.calendarLastSent || "",
            // emaillist: this.emaillist || [] 
        };
    }
}