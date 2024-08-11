import {
  Link,
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { useState } from 'react';
import { ethers } from "ethers";
import DecentratwitterAbi from './contractsData/Postandvote.json';
import DecentratwitterAddress from './contractsData/PostandvoteAddress.json';
import { Spinner, Navbar, Nav, Button, Container } from 'react-bootstrap';
import logo from './logo.png';  // Add your logo here
import Home from './Home.js';
import Profile from './Profile.js';
import Login from './Login.js';
import Events from './Events.js';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  const web3Handler = async () => {
    try {
      if (!window.ethereum) {
        alert("Metamask is not installed. Please install it to use this app.");
        return;
      }

      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      // Setup event listeners for Metamask
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      window.ethereum.on('accountsChanged', async () => {
        setLoading(true);
        web3Handler();
      });

      // Get provider from Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Get signer
      const signer = provider.getSigner();
      loadContract(signer);
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
      alert("There was an issue connecting to Metamask. Please try again.");
    }
  };

  const loadContract = async (signer) => {
    try {
      const contract = new ethers.Contract(DecentratwitterAddress.address, DecentratwitterAbi.abi, signer);
      setContract(contract);
      setLoading(false);
    } catch (error) {
      console.error("Error loading contract:", error);
      alert("Failed to load contract. Please try again.");
    }
  };

  const handleAuthentication = () => {
    console.log("Setting authenticated to true");
    setAuthenticated(true);
  };

  return (
    <BrowserRouter>
      <div className="App">
        {!authenticated ? (
          <Login onLogin={handleAuthentication} />
        ) : (
          <>
            <Navbar expand="lg" className="navbar">
              <Container>
                <Navbar.Brand href="#" className="navbar-brand">

                  <span className="nav-title">Post and Vote</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="me-auto">
                    <Nav.Link as={Link} to="/" className="nav-link">Home</Nav.Link>
                    <Nav.Link as={Link} to="/profile" className="nav-link">Profile</Nav.Link>
                    <Nav.Link as={Link} to="/events" className="nav-link">Events</Nav.Link>
                  </Nav>
                  <Nav>
                    {account ? (
                      <Nav.Link
                        href={`https://etherscan.io/address/${account}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button nav-button">
                        <Button className="button nav-button">
                          {account.slice(0, 5) + '...' + account.slice(38, 42)}
                        </Button>
                      </Nav.Link>
                    ) : (
                      <Button onClick={web3Handler} className="button nav-button">Connect Wallet</Button>
                    )}
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
            <div className="content-wrapper">
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                  <Spinner animation="border" style={{ display: 'flex' }} />
                  <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={<Home contract={contract} />} />
                  <Route path="/profile" element={<Profile contract={contract} />} />
                  <Route path="/events" element={<Events contract={contract} />} />
                </Routes>
              )}
            </div>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
