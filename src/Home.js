import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Row, Form, Button, Card } from 'react-bootstrap';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Initialize IPFS client with Pinata URL
const pinataApiKey = process.env.pinataApiKey;
const pinataSecretApiKey = process.env.pinataSecretApiKey;

const auth = 'Basic ' + Buffer.from(`${pinataApiKey}:${pinataSecretApiKey}`).toString('base64');
const client = ipfsHttpClient({
    host: 'ipfs.pinata.cloud',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

const Home = ({ contract }) => {
    const [posts, setPosts] = useState([]);
    const [hasProfile, setHasProfile] = useState(false);
    const [post, setPost] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        try {
            // Get user's address
            const address = await contract.signer.getAddress();
            setAddress(address);

            // Check if user owns an NFT
            const balance = await contract.balanceOf(address);
            setHasProfile(balance > 0);

            // Get all posts
            const results = await contract.getAllPosts();

            // Fetch metadata of each post and add that to post object.
            const posts = await Promise.all(results.map(async (i) => {
                // Use hash to fetch the post's metadata stored on IPFS
                const response = await fetch(`https://ipfs.pinata.cloud/ipfs/${i.hash}`);
                const metadataPost = await response.json();

                // Get author's NFT profile
                const nftId = await contract.profiles(i.author);
                const uri = await contract.tokenURI(nftId);

                // Fetch NFT profile metadata
                const profileResponse = await fetch(uri);
                const metadataProfile = await profileResponse.json();

                // Define author object
                const author = {
                    address: i.author,
                    username: metadataProfile.username,
                    avatar: metadataProfile.avatar,
                };

                // Define post object
                const post = {
                    id: i.id,
                    content: metadataPost.post,
                    tipAmount: i.tipAmount,
                    author,
                };

                return post;
            }));

            setPosts(posts.sort((a, b) => b.tipAmount - a.tipAmount));
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []); // Empty dependency array to run once on mount

    const uploadPost = async () => {
        if (!post) return;

        try {
            setLoading(true);

            // Upload post to IPFS
            const result = await client.add(JSON.stringify({ post }));
            const hash = result.path;

            // Upload post to blockchain
            const tx = await contract.uploadPost(hash);
            await tx.wait();

            loadPosts();
        } catch (error) {
            console.error('Error uploading post:', error);
            alert('IPFS upload error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const tip = async (post) => {
        try {
            const tx = await contract.tipPostOwner(post.id, { value: ethers.utils.parseEther('0.1') });
            await tx.wait();
            loadPosts();
        } catch (error) {
            console.error('Error tipping post:', error);
            alert('Error tipping post: ' + error.message);
        }
    };

    if (loading) return (
        <div className='text-center'>
            <main style={{ padding: '1rem 0' }}>
                <h2>Loading...</h2>
            </main>
        </div>
    );

    return (
        <div className="container-fluid mt-5">
            {hasProfile ? (
                <div className="row">
                    <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                        <div className="content mx-auto">
                            <Row className="g-4">
                                <Form.Control
                                    onChange={(e) => setPost(e.target.value)}
                                    size="lg"
                                    required
                                    as="textarea"
                                    placeholder="What's on your mind?"
                                />
                                <div className="d-grid px-0 mt-3">
                                    <Button onClick={uploadPost} variant="primary" size="lg">
                                        Post!
                                    </Button>
                                </div>
                            </Row>
                        </div>
                    </main>
                </div>
            ) : (
                <div className="text-center">
                    <main style={{ padding: '1rem 0' }}>
                        <h2>Must own an NFT to post</h2>
                    </main>
                </div>
            )}

            <p>&nbsp;</p>
            <hr />
            <p className="my-auto">&nbsp;</p>
            {posts.length > 0 ? (
                posts.map((post, key) => (
                    <div key={key} className="col-lg-12 my-3 mx-auto" style={{ width: '1000px' }}>
                        <Card border="primary">
                            <Card.Header>
                                <img
                                    className='mr-2'
                                    width='30'
                                    height='30'
                                    src={post.author.avatar}
                                    alt="Avatar"
                                />
                                <small className="ms-2 me-auto d-inline">
                                    {post.author.username}
                                </small>
                                <small className="mt-1 float-end d-inline">
                                    {post.author.address}
                                </small>
                            </Card.Header>
                            <Card.Body>
                                <Card.Title>
                                    {post.content}
                                </Card.Title>
                            </Card.Body>
                            <Card.Footer className="list-group-item">
                                <div className="d-inline mt-auto float-start">
                                    Tip Amount: {ethers.utils.formatEther(post.tipAmount)} ETH
                                </div>
                                {address === post.author.address || !hasProfile ? null : (
                                    <div className="d-inline float-end">
                                        <Button
                                            onClick={() => tip(post)}
                                            className="px-0 py-0 font-size-16"
                                            variant="link"
                                            size="md"
                                        >
                                            Tip for 0.1 ETH
                                        </Button>
                                    </div>
                                )}
                            </Card.Footer>
                        </Card>
                    </div>
                ))
            ) : (
                <div className="text-center">
                    <main style={{ padding: '1rem 0' }}>
                        <h2>No posts yet</h2>
                    </main>
                </div>
            )}
        </div>
    );
};

export default Home