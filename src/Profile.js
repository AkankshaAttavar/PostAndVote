import { useState, useEffect } from 'react';
import { Row, Form, Button, Card, Col } from 'react-bootstrap';
import axios from 'axios';

const pinataSecretApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3YTE0YWI3My1iZDhlLTQzOTEtODZkOS03ZDhlYjJlZjkxYzIiLCJlbWFpbCI6ImFrc2h1YXR0YXZhckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiODgwYjEwOTExOGE4NGVlM2ZjOGUiLCJzY29wZWRLZXlTZWNyZXQiOiJhYTg5MDI5ZjFjNmM0NzM4OTAwZDVlMmQ2YTQ0YjgwODk4ZjQ4OTE3M2Y3NGE0ZWFiZjRkMDVlNmVhNzNkMjc2IiwiaWF0IjoxNzIzMTQ3MDE5fQ.AEqEvWbmg83HBsDgqUUYp5NXgKpBn29lyTvLxX7Ts7o';
const pinataBaseUrl = 'https://api.pinata.cloud/pinning/';

const Profile = ({ contract }) => {
    const [profile, setProfile] = useState(null);
    const [nfts, setNfts] = useState([]);
    const [avatar, setAvatar] = useState(null);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);

    // Load user's NFTs
    const loadMyNFTs = async () => {
        try {
            // Get user's NFT IDs
            const results = await contract.getMyNfts();
            // Fetch metadata of each NFT and add that to NFT object
            const nfts = await Promise.all(results.map(async (id) => {
                const uri = await contract.tokenURI(id);
                const response = await fetch(uri);
                const metadata = await response.json();
                return {
                    id,
                    username: metadata.username,
                    avatar: metadata.avatar
                };
            }));
            setNfts(nfts);
            getProfile(nfts);
        } catch (error) {
            console.error("Error loading NFTs:", error);
        }
    };

    // Get profile of the user
    const getProfile = async (nfts) => {
        try {
            const address = await contract.signer.getAddress();
            const id = await contract.profiles(address);
            const profile = nfts.find((i) => i.id.toString() === id.toString());
            setProfile(profile);
        } catch (error) {
            console.error("Error getting profile:", error);
        } finally {
            setLoading(false);
        }
    };

    // Upload file to IPFS via Pinata
    const uploadToIPFS = async (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await axios.post(`${pinataBaseUrl}pinFileToIPFS`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${pinataSecretApiKey}`
                    }
                });
                const ipfsHash = response.data.IpfsHash;
                setAvatar(`https://black-random-gamefowl-99.mypinata.cloud/ipfs/${ipfsHash}`);
            } catch (error) {
                console.log("Pinata image upload error: ", error);
            }
        }
    };

    // Mint NFT profile
    const mintProfile = async () => {
        if (!avatar || !username) {
            console.log("Avatar or username missing");
            return;
        }
        try {
            // Pin the JSON data to IPFS via Pinata
            const result = await axios.post(`${pinataBaseUrl}pinJSONToIPFS`, JSON.stringify({ avatar, username }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${pinataSecretApiKey}`
                }
            });

            // Extract the IPFS hash from the Pinata response
            const ipfsHash = result.data.IpfsHash;
            const ipfsUrl = `https://black-random-gamefowl-99.mypinata.cloud/ipfs/${ipfsHash}`;

            // Set the loading state to true before initiating the minting process
            setLoading(true);

            // Mint the NFT using the IPFS URL
            const tx = await contract.mint(ipfsUrl);
            await tx.wait();

            // Load the user's NFTs after successful minting
            loadMyNFTs();
        } catch (error) {
            console.error("Error in mintProfile:", error);
            window.alert("IPFS URI upload error: " + error.message);
        } finally {
            // Reset the loading state regardless of success or failure
            setLoading(false);
        }
    };

    // Switch user profile to a different NFT
    const switchProfile = async (nft) => {
        try {
            setLoading(true);
            const tx = await contract.setProfile(nft.id);
            await tx.wait();
            getProfile(nfts);
        } catch (error) {
            console.error("Error switching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (nfts.length === 0) {
            loadMyNFTs();
        }
    }, [nfts]);

    if (loading) return (
        <div className='text-center'>
            <main style={{ padding: "1rem 0" }}>
                <h2>Loading...</h2>
            </main>
        </div>
    );

    return (
        <div className="mt-4 text-center">
            {profile ? (
                <div className="mb-3">
                    <h3 className="mb-3">{profile.username}</h3>
                    <img className="mb-3" style={{ width: '400px' }} src={profile.avatar} alt="Profile" />
                </div>
            ) : (
                <h4 className="mb-4">No NFT profile, please create one...</h4>
            )}

            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                    <div className="content mx-auto">
                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToIPFS}
                            />
                            <Form.Control
                                onChange={(e) => setUsername(e.target.value)}
                                size="lg"
                                required
                                type="text"
                                placeholder="Username"
                            />
                            <div className="d-grid px-0">
                                <Button onClick={mintProfile} variant="primary" size="lg">
                                    Mint NFT Profile
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
            <div className="px-5 container">
                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {nfts.map((nft, idx) => {
                        if (nft.id === profile?.id) return null;
                        return (
                            <Col key={idx} className="overflow-hidden">
                                <Card>
                                    <Card.Img variant="top" src={nft.avatar} alt="NFT Avatar" />
                                    <Card.Body color="secondary">
                                        <Card.Title>{nft.username}</Card.Title>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div className='d-grid'>
                                            <Button onClick={() => switchProfile(nft)} variant="primary" size="lg">
                                                Set as Profile
                                            </Button>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </div>
    );
};

export default Profile;
