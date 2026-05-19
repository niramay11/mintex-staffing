import React from 'react';
import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
    title: 'Contact Us - Get In Touch | Mintex Staffing',
    description: 'Have a question or need talent? Contact Mintex Staffing today. We are ready to help you connecting with top talent.',
};

const ContactUsPage = () => {
    return <ContactClient />;
};

export default ContactUsPage;