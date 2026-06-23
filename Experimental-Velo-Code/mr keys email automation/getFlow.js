

import wixData from 'wix-data';
import wixCrmBackend from 'wix-crm-backend';

const trigger = {
    contact: {
        get: async function (email = "") {
            try {
                let contactInfo = { emails: [{ tag: "MAIN", email: email, primary: true }] };
                const result = await wixCrmBackend.contacts.appendOrCreateContact(contactInfo);
                return result.contactId || "";
            } catch (err) {
                return "";
            }
        },
        emailContact: async function (contactId = "", vars = {}) {
            try {
                const options = { variables: vars };
                await wixCrmBackend.triggeredEmails.emailContact("Uxue6co", contactId, options);
                return true;
            } catch (err) {
                return false;
            }
        }
    },
    sendEmail: async function (email = "", vars = {}) {
        const contactId = await this.contact.get(email);
        if (!contactId) {
            return false;
        }

        // Default vars if none provided
        const defaultVars = {

        };

        const variables = Object.keys(vars).length ? vars : defaultVars;

        return await this.contact.emailContact(contactId, variables);
    }
};

export default trigger;