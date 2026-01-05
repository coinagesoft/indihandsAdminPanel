"use client";
import React, { useState, useEffect } from "react";

const BillingAddressPage = () => {
  // Cards
  const [cards, setCards] = useState([
    { id: 1, number: "4356 3215 6548 7898", name: "John Doe", expiry: "08/28", primary: true },
  ]);
  const [newCard, setNewCard] = useState({ number: "", name: "", expiry: "", cvv: "", saveForFuture: false });

  // Addresses
  const [addresses, setAddresses] = useState([
    { id: 1, type: "office", firstName: "John", lastName: "Doe", city: "Pune", state: "MH", billing: true },
  ]);
  const [newAddress, setNewAddress] = useState({ type: "home", firstName: "", lastName: "", city: "", state: "", billing: false });

  // Initialize Materialize modals
  useEffect(() => {
    if (typeof window !== "undefined" && window.M) {
      const elems = document.querySelectorAll(".modal");
      window.M.Modal.init(elems);
    }
  }, []);

  const handleNewCardChange = (e) => {
    const { id, value, type, checked } = e.target;
    setNewCard(prev => ({ ...prev, [id.toLowerCase()]: type === "checkbox" ? checked : value }));
  };

  const handleNewAddressChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id === "home" || id === "office") setNewAddress(prev => ({ ...prev, type: id }));
    else setNewAddress(prev => ({ ...prev, [id.toLowerCase()]: type === "checkbox" ? checked : value }));
  };

  const addCard = (e) => {
    e.preventDefault();
    setCards(prev => [...prev, { ...newCard, id: Date.now() }]);
    setNewCard({ number: "", name: "", expiry: "", cvv: "", saveForFuture: false });
    window.M.Modal.getInstance(document.getElementById("addCardModal")).close();
  };

  const addAddress = (e) => {
    e.preventDefault();
    setAddresses(prev => [...prev, { ...newAddress, id: Date.now() }]);
    setNewAddress({ type: "home", firstName: "", lastName: "", city: "", state: "", billing: false });
    window.M.Modal.getInstance(document.getElementById("addAddressModal")).close();
  };

  return (
    <div className="container" style={{ padding: "30px 0" }}>
      <h4 className="blue-text">Billing & Addresses</h4>
      <div className="row">
        {/* Left Column: Cards */}
        <div className="col s12 m6">
          <h5>Billing Cards</h5>
          {cards.map(card => (
            <div className={`card ${card.primary ? "blue lighten-5" : "grey lighten-4"}`} key={card.id} style={{ padding: "15px", marginBottom: "10px" }}>
              <p><strong>{card.number}</strong> ({card.expiry})</p>
              <p>{card.name} {card.primary && <span className="blue-text">Primary</span>}</p>
            </div>
          ))}
          <button data-target="addCardModal" className="btn modal-trigger blue">Add New Card</button>
        </div>

        {/* Right Column: Addresses */}
        <div className="col s12 m6">
          <h5>Addresses</h5>
          {addresses.map(addr => (
            <div className={`card ${addr.billing ? "blue lighten-5" : "grey lighten-4"}`} key={addr.id} style={{ padding: "15px", marginBottom: "10px" }}>
              <p>{addr.type.toUpperCase()} Address</p>
              <p>{addr.firstName} {addr.lastName}, {addr.city}, {addr.state}</p>
              {addr.billing && <span className="blue-text">Billing Address</span>}
            </div>
          ))}
          <button data-target="addAddressModal" className="btn modal-trigger blue">Add New Address</button>
        </div>
      </div>

      {/* Add Card Modal */}
      <div id="addCardModal" className="modal">
        <div className="modal-content">
          <h5>Add New Card</h5>
          <form onSubmit={addCard}>
            <div className="input-field">
              <input id="number" type="text" value={newCard.number} onChange={handleNewCardChange} />
              <label htmlFor="number" className="active">Card Number</label>
            </div>
            <div className="input-field">
              <input id="name" type="text" value={newCard.name} onChange={handleNewCardChange} />
              <label htmlFor="name" className="active">Name</label>
            </div>
            <div className="input-field">
              <input id="expiry" type="text" value={newCard.expiry} onChange={handleNewCardChange} />
              <label htmlFor="expiry" className="active">Expiry</label>
            </div>
            <div className="input-field">
              <input id="cvv" type="text" value={newCard.cvv} onChange={handleNewCardChange} />
              <label htmlFor="cvv" className="active">CVV</label>
            </div>
            <div className="switch">
              <label>
                Save for future
                <input type="checkbox" id="saveForFuture" checked={newCard.saveForFuture} onChange={handleNewCardChange} />
                <span className="lever"></span>
              </label>
            </div>
            <button type="submit" className="btn blue">Add Card</button>
          </form>
        </div>
      </div>

      {/* Add Address Modal */}
      <div id="addAddressModal" className="modal">
        <div className="modal-content">
          <h5>Add New Address</h5>
          <form onSubmit={addAddress}>
            <p>
              <label>
                <input type="radio" id="home" name="type" checked={newAddress.type === "home"} onChange={handleNewAddressChange} />
                <span>Home</span>
              </label>
            </p>
            <p>
              <label>
                <input type="radio" id="office" name="type" checked={newAddress.type === "office"} onChange={handleNewAddressChange} />
                <span>Office</span>
              </label>
            </p>
            <div className="input-field">
              <input id="firstName" type="text" value={newAddress.firstName} onChange={handleNewAddressChange} />
              <label htmlFor="firstName" className="active">First Name</label>
            </div>
            <div className="input-field">
              <input id="lastName" type="text" value={newAddress.lastName} onChange={handleNewAddressChange} />
              <label htmlFor="lastName" className="active">Last Name</label>
            </div>
            <div className="input-field">
              <input id="city" type="text" value={newAddress.city} onChange={handleNewAddressChange} />
              <label htmlFor="city" className="active">City</label>
            </div>
            <div className="input-field">
              <input id="state" type="text" value={newAddress.state} onChange={handleNewAddressChange} />
              <label htmlFor="state" className="active">State</label>
            </div>
            <div className="switch">
              <label>
                Use as billing
                <input type="checkbox" id="billing" checked={newAddress.billing} onChange={handleNewAddressChange} />
                <span className="lever"></span>
              </label>
            </div>
            <button type="submit" className="btn blue">Add Address</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BillingAddressPage;
