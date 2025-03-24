import React, { useState, useEffect } from 'react';
import './styles.css';

const RestaurantDashboard = () => {
  const [activePage, setActivePage] = useState('orders');
  const [activeOrderTab, setActiveOrderTab] = useState('new');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (activePage === 'orders') {
      fetchOrders(activeOrderTab);
    }
    if (activePage === 'menu') {
      fetchMenuItems();
    }
  }, [activePage, activeOrderTab]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/menu/items');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchOrders = async (statusTab) => {
    let status = '';
    if (statusTab === 'new') status = 'pending';
    else if (statusTab === 'taken') status = 'in the kitchen';
    else if (statusTab === 'completed') status = 'ready';
    try {
      const response = await fetch(`http://localhost:8080/orders?status=${status}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleAddOrUpdateItem = async () => {
    const payload = { name: itemName, price: parseInt(itemPrice, 10) };
    const url = editingItem ? 'http://localhost:8080/menu/update' : 'http://localhost:8080/menu/add';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem ? { ...payload, itemId: editingItem.itemId } : payload)
      });
      setItemName('');
      setItemPrice('');
      setEditingItem(null);
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/menu/delete/${id}`, { method: 'DELETE' });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(item.price);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await fetch(`http://localhost:8080/orders/updateStatus/${orderId}?status=${status}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchOrders(activeOrderTab);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-inner">
          <h1>Restaurant Dashboard</h1>
          <nav className="nav">
            <button className={activePage === 'orders' ? 'active' : ''} onClick={() => setActivePage('orders')}>
              Orders
            </button>
            <button className={activePage === 'menu' ? 'active' : ''} onClick={() => setActivePage('menu')}>
              Menu Items
            </button>
            <button className={activePage === 'about' ? 'active' : ''} onClick={() => setActivePage('about')}>
              About
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {activePage === 'orders' && (
          <div className="orders-page">
            <div className="order-tabs">
              <button
                className={activeOrderTab === 'new' ? 'active' : ''}
                onClick={() => setActiveOrderTab('new')}
              >
                New Orders
              </button>
              <button
                className={activeOrderTab === 'taken' ? 'active' : ''}
                onClick={() => setActiveOrderTab('taken')}
              >
                Taken Orders
              </button>
              <button
                className={activeOrderTab === 'completed' ? 'active' : ''}
                onClick={() => setActiveOrderTab('completed')}
              >
                Completed Orders
              </button>
            </div>
            <div className="orders-cards-container">
              {orders.length === 0 && <div className="empty">No orders available</div>}
              {orders.map((order) => (
                <div key={order.orderId} className="order-card">
                  <div className="order-info">
                    <span className="order-number">Order #{order.orderId}</span>
                    <span className="order-status">Status: {order.status}</span>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <ul className="order-items">
                      {order.items.map((item, index) => (
                        <li key={index} className="order-item-detail">
                          {item.name} – Qty: {item.quantity}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="order-actions">
                    {activeOrderTab === 'new' && (
                      <>
                        <button className="btn accept" onClick={() => updateOrderStatus(order.orderId, 'in the kitchen')}>
                          Accept
                        </button>
                        <button className="btn reject" onClick={() => updateOrderStatus(order.orderId, 'cancelled')}>
                          Reject
                        </button>
                      </>
                    )}
                    {activeOrderTab === 'taken' && (
                      <button className="btn ready" onClick={() => updateOrderStatus(order.orderId, 'ready')}>
                        Ready
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === 'menu' && (
          <div className="menu-page">
            <h2>Manage Menu Items</h2>
            <div className="form-group">
              <input
                type="text"
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Price"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
              />
              <button className="btn primary" onClick={handleAddOrUpdateItem}>
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
            <ul className="menu-items-list">
              {menuItems.length === 0 && <li className="empty">No menu items available</li>}
              {menuItems.map((item) => (
                <li key={item.itemId} className="menu-item">
                  <span>{item.name} – ₹{item.price}</span>
                  <div className="item-actions">
                    <button className="btn edit" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button className="btn delete" onClick={() => handleDelete(item.itemId)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activePage === 'about' && (
          <div className="about-page">
            <h2>About This Project</h2>
            <p>
              This restaurant dashboard is built to help manage orders and menu items efficiently. It integrates
              with a Spring Boot backend to provide real-time updates.
            </p>
            <h3>Guide</h3>
            <div className="guide-info">
              <img src="src\assets\guide.jpg" alt="Guide" className="profile-pic" />
              <div>
                <h2>	Mr.K.Vijaya Karthikeyan</h2>
                <h4>Assistant Professor, Department of Computer Science</h4>
                <h4>Rohini COllege of Engineering and Technology</h4>
              </div>
            </div>
            <h3>Team Members</h3>
            <ul className="team-list">

              <li className="team-member">
                <img src="src\assets\sariga.jpeg" alt="Team Member" className="profile-pic" />
                <div>
                  <h4>Sariga</h4>
                  <p>Reg. No: 963321104045</p>
                  <a href="https://www.linkedin.com/in/sariga-chandran435/" target="_blank" rel="noopener noreferrer">Visit LinkedIn Profile</a>
                </div>
              </li>

              <li className="team-member">
                <img src="src\assets\sariga.jpeg" alt="Team Member" className="profile-pic" />
                <div>
                  <h4>Sariga</h4>
                  <p>Reg. No: 963321104045</p>
                  <a href="https://www.linkedin.com/in/sariga" target="_blank" rel="noopener noreferrer">Visit LinkedIn Profile</a>
                </div>
              </li>

              <li className="team-member">
                <img src="src\assets\sariga.jpeg" alt="Team Member" className="profile-pic" />
                <div>
                  <h4>Sariga</h4>
                  <p>Reg. No: 963321104045</p>
                  <a href="https://www.linkedin.com/in/sariga" target="_blank" rel="noopener noreferrer">Visit LinkedIn Profile</a>
                </div>
              </li>

              <li className="team-member">
                <img src="src\assets\sariga.jpeg" alt="Team Member" className="profile-pic" />
                <div>
                  <h4>Sariga</h4>
                  <p>Reg. No: 963321104045</p>
                  <a href="https://www.linkedin.com/in/sariga" target="_blank" rel="noopener noreferrer">Visit LinkedIn Profile</a>
                </div>
              </li>

            </ul>
          </div>
        )}

      </main>
    </div>
  );
};

export default RestaurantDashboard;
