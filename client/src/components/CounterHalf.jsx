import React, { useState, useEffect } from 'react';
import API from '../../Api.js';
import backgroundImage from '../assets/backgroundCustomer.jpg'; 
import '../styles.css'; 


const CounterHalf = (props) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomerData = async () => {
    try {
      const userInfo = await API.getUserInfo();    
      let number = null;
      if (userInfo.username == 'manager1') {
        number = 2;  // Extract the number from manager1
      } else if (userInfo.username == 'manager2') {
        number = 3; // Extract the number from manager2
      }  
      const data = await API.getNextTicket(number);
      props.setCurrentCustomer(data);
      setError('');
    } catch (error) {
      props.setCurrentCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNextCustomer = async () => {
    setLoading(true);
    await fetchCustomerData();
  };


  if (loading) {
    return <div style={{ color: 'white' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <>
      <img
        src={backgroundImage}
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -1
        }}
      />
      <div className="container vh-100 d-flex align-items-center justify-content-center">
        <div className="row w-100">
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center">
            <div className="info-container text-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '20px', borderRadius: '10px' }}>
              <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '3rem' }}>
              Ticket in Service: {props.currentCustomer?.ticket ? props.currentCustomer.ticket : 'No customer in service'}
              </h2>
              <button
                className="btn btn-primary"
                onClick={handleNextCustomer}
                style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1.5rem' }}
              >
                Next Customer
              </button>
            </div>  
          </div>
        </div>
      </div>
    </>
  );
};

export default CounterHalf;

