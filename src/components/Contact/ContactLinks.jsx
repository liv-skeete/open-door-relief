import React from 'react';

const ContactLinks = ({ contactInfo }) => {
  console.log("contactInfo:", contactInfo);
  if (!contactInfo) {
    return null;
  }

  const phone = contactInfo?.phone?.value;
  const email = contactInfo?.email?.value;

  return (
    <div className="button-group">
      {phone && (
        <>
          <a href={`tel:${phone}`} className="contact-button">Call</a>
          <a href={`sms:${phone}`} className="contact-button">Text</a>
        </>
      )}
      {email && (
        <a href={`mailto:${email}`} className="contact-button">Email</a>
      )}
    </div>
  );
};

export default ContactLinks;