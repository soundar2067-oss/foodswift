import React from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Mail, MapPin, Phone, HelpCircle } from 'lucide-react';

const InfoPage = ({ pageKey, setActivePage }) => {
  const getPageContent = (key) => {
    const contents = {
      about: {
        title: 'About FoodSwift',
        subtitle: 'Our Mission & Story',
        body: (
          <div>
            <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
              Founded in 2026, FoodSwift is a next-generation online food delivery platform committed to connecting customers with their favorite local restaurants instantly. Using our premium MERN stack architecture, we optimize the complete food ordering lifecycle from preparation to delivery.
            </p>
            <p style={{ lineHeight: 1.6, marginBottom: '24px' }}>
              We believe in culinary excellence, sustainable logistics, and support for local kitchens. Our driver network guarantees delivery in under 30 minutes, ensuring your food arrives hot, fresh, and delicious.
            </p>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Why Choose Us?</h3>
            <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle2 size={16} color="var(--primary)" /> 2,400+ handpicked food items across the city.</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle2 size={16} color="var(--primary)" /> Integrated smart AI Chatbot with automated recommendations.</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle2 size={16} color="var(--primary)" /> Real-time active tracking from kitchen to your doorstep.</li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle2 size={16} color="var(--primary)" /> Dual currency options (INR and USD) for international convenience.</li>
            </ul>
          </div>
        )
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Quick answers for you',
        body: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <HelpCircle size={16} color="var(--primary)" /> How fast is the delivery?
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Our deliveries average under 30 minutes. Delivery speed depends on food preparation time and distance from the restaurant.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <HelpCircle size={16} color="var(--primary)" /> Can I pay with Cash on Delivery?
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Yes! We support card checkout as well as Cash on Delivery (COD) for your convenience.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <HelpCircle size={16} color="var(--primary)" /> Can I order from multiple restaurants?
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                To ensure fresh delivery and smooth logistics, you can only order from a single restaurant per cart checkout. If you want items from another restaurant, you can easily clear your current cart or place a separate order.
              </p>
            </div>
          </div>
        )
      },
      privacy: {
        title: 'Privacy Policy',
        subtitle: 'How we manage your data',
        body: (
          <div>
            <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
              Your privacy is extremely important to us. This policy describes how we collect, store, protect, and use your credentials when you register and interact with our web platform.
            </p>
            <p style={{ lineHeight: 1.6, marginBottom: '16px', display: 'flex', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--secondary)" /> We secure all passwords using industry-grade bcrypt hashing.
            </p>
            <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
              We do not share your private contact information, addresses, or purchase history with third-party advertising companies. Data is used strictly to fulfill food preparation and logistics routing.
            </p>
          </div>
        )
      },
      terms: {
        title: 'Terms of Service',
        subtitle: 'Our user agreement details',
        body: (
          <div style={{ lineHeight: 1.6 }}>
            <p style={{ marginBottom: '12px' }}>Welcome to FoodSwift! By registering an account and ordering food, you agree to the following conditions:</p>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><strong>Registration:</strong> You must provide a valid email or phone number and secure password to place orders.</li>
              <li><strong>Cancellation:</strong> Orders can be cancelled by the customer before the restaurant accepts them. Once accepted, cancellations are subject to restaurant approval.</li>
              <li><strong>Payments:</strong> All prices displayed represent the final meal price. You can select either USD or INR formatting.</li>
            </ol>
          </div>
        )
      },
      catering: {
        title: 'Catering Services',
        subtitle: 'Food for corporate events & groups',
        body: (
          <div>
            <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
              Planning a corporate lunch, birthday party, or family get-together? FoodSwift offers custom bulk catering plans from our network of 20 top-tier restaurants.
            </p>
            <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
              Get custom spreads of Indian dishes, Pizzas, Sushi platters, or Bakery items delivered to your venue in specialized thermal packaging.
            </p>
            <p style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Contact our corporate catering desk at: catering@foodswift.com
            </p>
          </div>
        )
      },
      careers: {
        title: 'Careers at FoodSwift',
        subtitle: 'Shape the future of food logistics',
        body: (
          <div>
            <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
              We are constantly hiring talented individuals to join our software engineering, culinary operations, marketing, and logistics networks.
            </p>
            <h4 style={{ fontWeight: 700, marginBottom: '10px' }}>Open Positions:</h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Full Stack Web Developer (Node.js & React)</li>
              <li>Logistics Operations Manager</li>
              <li>Creative Content Writer</li>
              <li>Delivery Network Partner (Flexible Hours)</li>
            </ul>
          </div>
        )
      },
      partner: {
        title: 'Partner with Us',
        subtitle: 'Grow your restaurant business',
        body: (
          <div>
            <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
              Boost your sales by listing your restaurant menu on FoodSwift! We provide your kitchen with a state-of-the-art admin dashboard to manage menus, track orders, and view sales details.
            </p>
            <p style={{ lineHeight: 1.6, marginBottom: '16px' }}>
              Join 20+ partner restaurants today and reach thousands of customers instantly.
            </p>
            <button className="btn btn-primary" onClick={() => setActivePage('login')} style={{ fontSize: '0.85rem' }}>
              Register as Restaurant Partner
            </button>
          </div>
        )
      },
      contact: {
        title: 'Contact Support',
        subtitle: 'Here to help you 24/7',
        body: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ lineHeight: 1.6 }}>Have a question about your order, account details, or payment status? Feel free to contact our customer support executive network.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={16} color="var(--primary)" /> <span>support@foodswift.com</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={16} color="var(--primary)" /> <span>+1 (800) 555-FOOD (3663)</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <MapPin size={16} color="var(--primary)" /> <span>456 Gastronomy Tower, Suite 100, Tech City</span>
              </div>
            </div>
          </div>
        )
      }
    };

    return contents[key] || {
      title: 'Information Page',
      subtitle: 'Details',
      body: <p>Information not found.</p>
    };
  };

  const content = getPageContent(pageKey);

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px' }}>
      {/* Back Button */}
      <button 
        className="btn btn-secondary" 
        onClick={() => setActivePage('home')}
        style={{ marginBottom: '24px', display: 'flex', gap: '6px', padding: '8px 16px' }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* Header */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '36px', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{content.title}</h1>
        <p style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>{content.subtitle}</p>
      </div>

      {/* Body Content */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '36px', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          backgroundColor: 'rgba(22, 26, 36, 0.4)'
        }}
      >
        {content.body}
      </div>
    </div>
  );
};

export default InfoPage;
