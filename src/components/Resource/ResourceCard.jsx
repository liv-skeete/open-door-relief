import React from 'react';

const ResourceCard = ({ 
  type, 
  title, 
  location, 
  spaceType, 
  partySize, 
  nights, 
  description, 
  contactInfo,
  contactMethods,
  additionalFields = {}
}) => {
  // Render additional fields based on type
  const renderAdditionalFields = () => {
    if (type === 'pledge') {
      return (
        <>
          <p><strong>Willing to Host Displaced:</strong> {additionalFields.willingToHostDisplaced ? 'Yes' : 'No'}</p>
          <p><strong>Willing to Host Evacuees:</strong> {additionalFields.willingToHostEvacuees ? 'Yes' : 'No'}</p>
          <p><strong>Pet Friendly:</strong> {additionalFields.petFriendly ? 'Yes' : 'No'}</p>
        </>
      );
    } else if (type === 'request') {
      return (
        <>
          <p><strong>Emergency:</strong> {additionalFields.emergency || 'Not specified'}</p>
          <p><strong>Needs Displaced:</strong> {additionalFields.needsDisplaced ? 'Yes' : 'No'}</p>
          <p><strong>Needs Evacuee:</strong> {additionalFields.needsEvacuee ? 'Yes' : 'No'}</p>
          <p><strong>Pet Owner:</strong> {additionalFields.petFriendly ? 'Yes' : 'No'}</p>
        </>
      );
    }
    return null;
  };

  // Render contact information
  const renderContactInfo = () => {
    if (!contactMethods && !contactInfo) {
      return <p>No contact information available</p>;
    }

    return (
      <div className="contact-section">
        <h4>Contact Information</h4>
        {contactInfo && <p>{contactInfo}</p>}
        {contactMethods && Object.entries(contactMethods).map(([method, details]) => (
          details.value && <p key={method}>{method.charAt(0).toUpperCase() + method.slice(1)}: {details.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className={`resource-card ${type}`}>
      <div className="card-header">
        <h3>{title}</h3>
        <span className="card-type-badge">{type}</span>
      </div>
      
      <div className="card-body">
        <p><strong>Location:</strong> {location || 'Not specified'}</p>
        <p><strong>Space Type:</strong> {spaceType || 'Not specified'}</p>
        <p><strong>Party Size:</strong> {partySize || 'Not specified'}</p>
        <p><strong>Nights:</strong> {nights || 'Not specified'}</p>
        
        {renderAdditionalFields()}
        
        {description && <p><strong>Description:</strong> {description}</p>}
        
        {renderContactInfo()}
      </div>
    </div>
  );
};

export default ResourceCard;