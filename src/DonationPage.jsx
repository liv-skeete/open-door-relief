import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

function DonationPage() {
  const [donationAmount, setDonationAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [isCompanyDonation, setIsCompanyDonation] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [taxReceipt, setTaxReceipt] = useState(true);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const auth = getAuth();
  
  // Pre-fill user information if logged in
  React.useEffect(() => {
    if (auth.currentUser) {
      setDonorEmail(auth.currentUser.email || "");
      setDonorName(auth.currentUser.displayName || "");
    }
  }, [auth.currentUser]);
  
  // Handle donation amount selection
  const handleAmountSelect = (amount) => {
    setDonationAmount(amount);
    if (amount !== "custom") {
      setCustomAmount("");
    }
  };
  
  // Format credit card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  // Format card expiry date (MM/YY)
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };
  
  // Calculate the actual donation amount
  const getActualAmount = () => {
    if (donationAmount === "custom") {
      return parseFloat(customAmount) || 0;
    }
    return parseFloat(donationAmount) || 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (donationAmount === "") {
      setError("Please select a donation amount.");
      return;
    }
    
    if (donationAmount === "custom" && (!customAmount || parseFloat(customAmount) <= 0)) {
      setError("Please enter a valid donation amount.");
      return;
    }
    
    if (!isAnonymous && !donorName) {
      setError("Please enter your name or select anonymous donation.");
      return;
    }
    
    if (!donorEmail) {
      setError("Please enter your email address for the receipt.");
      return;
    }
    
    if (paymentMethod === "creditCard") {
      if (!cardNumber || cardNumber.replace(/\s+/g, "").length < 16) {
        setError("Please enter a valid credit card number.");
        return;
      }
      
      if (!cardExpiry || cardExpiry.length < 5) {
        setError("Please enter a valid expiry date (MM/YY).");
        return;
      }
      
      if (!cardCVC || cardCVC.length < 3) {
        setError("Please enter a valid CVC code.");
        return;
      }
    }
    
    setLoading(true);
    setError("");
    
    try {
      // In a real app, you would integrate with a payment processor like Stripe
      // For this demo, we'll just simulate a successful donation
      
      // Record the donation in Firestore
      await addDoc(collection(db, "donations"), {
        amount: getActualAmount(),
        donorName: isAnonymous ? "Anonymous" : donorName,
        donorEmail: donorEmail,
        isAnonymous: isAnonymous,
        isRecurring: isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : null,
        isCompanyDonation: isCompanyDonation,
        companyName: isCompanyDonation ? companyName : null,
        taxReceipt: taxReceipt,
        comments: comments,
        timestamp: new Date(),
        userId: auth.currentUser ? auth.currentUser.uid : null,
        // Note: In a real app, you would never store credit card details
        // You would use a payment processor token instead
      });
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setDonationAmount("");
      setCustomAmount("");
      setComments("");
      setIsRecurring(false);
      setIsCompanyDonation(false);
      setCompanyName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCVC("");
      
    } catch (error) {
      console.error("Error processing donation:", error);
      setError("Failed to process donation. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate donation impact
  const getDonationImpact = () => {
    const amount = getActualAmount();
    
    if (amount >= 1000) {
      return "Your generous donation could help provide temporary housing for multiple families during a disaster.";
    } else if (amount >= 500) {
      return "Your donation could help a family find safe shelter for up to two weeks during a crisis.";
    } else if (amount >= 100) {
      return "Your donation could help verify and secure housing for those in need during emergencies.";
    } else if (amount >= 50) {
      return "Your donation helps us maintain our platform and connect those in need with safe shelter.";
    } else if (amount > 0) {
      return "Every dollar helps us continue our mission of connecting those affected by disasters with safe shelter.";
    }
    
    return "";
  };
  
  return (
    <div className="page">
      <h2>Support Our Mission</h2>
      <p className="subtitle">Your donation helps us connect those in need with safe shelter during disasters</p>
      
      {success ? (
        <div className="donation-success">
          <h3>Thank You for Your Donation!</h3>
          <p>Your generous contribution of ${getActualAmount().toFixed(2)} will help us continue our mission.</p>
          <p>A receipt has been sent to your email address.</p>
          <p>Your support makes a real difference in the lives of those affected by disasters.</p>
          <button onClick={() => setSuccess(false)} className="primary-button">Make Another Donation</button>
        </div>
      ) : (
        <div className="donation-container">
          <div className="donation-info">
            <h3>Why Donate?</h3>
            <p>
              Open Door Relief connects those displaced by disasters with community members
              offering temporary shelter. Your donation helps us:
            </p>
            <ul>
              <li>Maintain and improve our platform</li>
              <li>Verify users to ensure safety and trust</li>
              <li>Provide support services during disasters</li>
              <li>Expand our reach to help more communities</li>
              <li>Develop new features to better serve those in need</li>
            </ul>
            <p>
              As a 501(c)(3) non-profit organization, your donation is tax-deductible
              to the extent allowed by law.
            </p>
            
            <div className="donation-impact">
              <h4>Your Impact</h4>
              <p>{getDonationImpact()}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="donation-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-section">
              <h3>Donation Amount</h3>
              <div className="donation-amounts">
                {[25, 50, 100, 250, 500].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`amount-button ${donationAmount === amount.toString() ? 'selected' : ''}`}
                    onClick={() => handleAmountSelect(amount.toString())}
                  >
                    ${amount}
                  </button>
                ))}
                <button
                  type="button"
                  className={`amount-button ${donationAmount === "custom" ? 'selected' : ''}`}
                  onClick={() => handleAmountSelect("custom")}
                >
                  Custom
                </button>
              </div>
              
              {donationAmount === "custom" && (
                <div className="form-group">
                  <label>Custom Amount:</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">$</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  Make this a recurring donation
                </label>
              </div>
              
              {isRecurring && (
                <div className="form-group">
                  <label>Frequency:</label>
                  <select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="form-section">
              <h3>Donor Information</h3>
              
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  Make this an anonymous donation
                </label>
              </div>
              
              {!isAnonymous && (
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Your name"
                    required={!isAnonymous}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Email (for receipt):</label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="Your email"
                  required
                />
              </div>
              
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={isCompanyDonation}
                    onChange={(e) => setIsCompanyDonation(e.target.checked)}
                  />
                  This is a company donation
                </label>
              </div>
              
              {isCompanyDonation && (
                <div className="form-group">
                  <label>Company Name:</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                    required={isCompanyDonation}
                  />
                </div>
              )}
              
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={taxReceipt}
                    onChange={(e) => setTaxReceipt(e.target.checked)}
                  />
                  Send me a tax receipt
                </label>
              </div>
            </div>
            
            <div className="form-section">
              <h3>Payment Information</h3>
              
              <div className="form-group">
                <label>Payment Method:</label>
                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentMethod === "creditCard"}
                      onChange={() => setPaymentMethod("creditCard")}
                    />
                    <span>Credit Card</span>
                  </label>
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                    />
                    <span>PayPal</span>
                  </label>
                </div>
              </div>
              
              {paymentMethod === "creditCard" && (
                <>
                  <div className="form-group">
                    <label>Card Number:</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date:</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>CVC:</label>
                      <input
                        type="text"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, ""))}
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Billing Address:</label>
                    <input
                      type="text"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      placeholder="Street address"
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>City:</label>
                      <input
                        type="text"
                        value={billingCity}
                        onChange={(e) => setBillingCity(e.target.value)}
                        placeholder="City"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>State:</label>
                      <input
                        type="text"
                        value={billingState}
                        onChange={(e) => setBillingState(e.target.value)}
                        placeholder="State"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>ZIP Code:</label>
                      <input
                        type="text"
                        value={billingZip}
                        onChange={(e) => setBillingZip(e.target.value)}
                        placeholder="ZIP"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              {paymentMethod === "paypal" && (
                <div className="paypal-info">
                  <p>You will be redirected to PayPal to complete your donation.</p>
                </div>
              )}
            </div>
            
            <div className="form-section">
              <h3>Additional Information</h3>
              
              <div className="form-group">
                <label>Comments (Optional):</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share why you're supporting our mission..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="donation-summary">
              <h3>Donation Summary</h3>
              <div className="summary-row">
                <span>Donation Amount:</span>
                <span>${getActualAmount().toFixed(2)}</span>
              </div>
              {isRecurring && (
                <div className="summary-row">
                  <span>Frequency:</span>
                  <span>{recurringFrequency.charAt(0).toUpperCase() + recurringFrequency.slice(1)}</span>
                </div>
              )}
              <div className="summary-total">
                <span>Total:</span>
                <span>${getActualAmount().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="donate-button"
                disabled={loading}
              >
                {loading ? "Processing..." : `Donate ${isRecurring ? recurringFrequency.charAt(0).toUpperCase() + recurringFrequency.slice(1) : "Now"}`}
              </button>
            </div>
            
            <div className="donation-security">
              <p>
                <span className="security-icon">🔒</span> Your payment information is secure and encrypted.
                We never store your full credit card details.
              </p>
            </div>
          </form>
        </div>
      )}
      
      <div className="other-ways">
        <h3>Other Ways to Support</h3>
        <div className="support-options">
          <div className="support-option">
            <h4>Volunteer</h4>
            <p>
              Help us verify users, moderate content, or provide technical support.
              <a href="#" className="learn-more">Learn More</a>
            </p>
          </div>
          <div className="support-option">
            <h4>Corporate Partnerships</h4>
            <p>
              Partner with us to provide resources during disasters.
              <a href="#" className="learn-more">Contact Us</a>
            </p>
          </div>
          <div className="support-option">
            <h4>Spread the Word</h4>
            <p>
              Share our mission on social media and help us reach more people.
              <a href="#" className="learn-more">Share Now</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonationPage;