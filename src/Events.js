import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Form, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

const Events = ({ contract }) => {
    const [events, setEvents] = useState([]);
    const [newEventName, setNewEventName] = useState('');
    const [newEventCategory, setNewEventCategory] = useState('Meme');
    const [newEventParticipants, setNewEventParticipants] = useState(2);
    const [image, setImage] = useState(null);
    const [caption, setCaption] = useState('');

    useEffect(() => {
        if (contract) loadEvents();
    }, [contract]);

    const loadEvents = async () => {
        try {
            const eventCount = await contract.eventCount();
            const eventsArray = [];
            for (let i = 1; i <= eventCount; i++) {
                const eventData = await contract.events(i);
                eventsArray.push({
                    id: eventData.id.toNumber(),
                    name: eventData.name,
                    category: eventData.category,
                    maxParticipants: eventData.maxParticipants.toNumber(),
                });
            }
            setEvents(eventsArray);
        } catch (error) {
            console.error("Error loading events:", error);
        }
    };

    const createEvent = async () => {
        try {
            const tx = await contract.createEvent(newEventName, newEventCategory, newEventParticipants);
            await tx.wait();
            loadEvents();
        } catch (error) {
            console.error("Error creating event:", error);
        }
    };

    const joinEvent = async (eventId) => {
        try {
            const tx = await contract.joinEvent(eventId, { value: ethers.utils.parseEther("5.0") });
            await tx.wait();
            loadEvents();
        } catch (error) {
            console.error("Error joining event:", error);
        }
    };

    const uploadImage = async (eventId) => {
        try {
            if (!image) {
                alert("Please select an image to upload.");
                return;
            }

            const formData = new FormData();
            formData.append('file', image);

            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer YOUR_PINATA_JWT_TOKEN`,
                }
            });

            const imageUrl = `https://black-random-gamefowl-99.mypinata.cloud/ipfs/${response.data.IpfsHash}`;

            const tx = await contract.uploadImage(eventId, imageUrl, caption, { gasLimit: 1000000 });
            await tx.wait();
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    return (
        <div>
            <h2>Create New Event</h2>
            <Row>
                <Col>
                    <Form.Control
                        placeholder="Event Name"
                        onChange={(e) => setNewEventName(e.target.value)}
                    />
                </Col>
                <Col>
                    <Form.Control
                        as="select"
                        onChange={(e) => setNewEventCategory(e.target.value)}
                    >
                        <option value="Meme">Meme</option>
                        <option value="Art">Art</option>
                        <option value="Literature">Literature</option>
                        <option value="Random">Random</option>
                    </Form.Control>
                </Col>
                <Col>
                    <Form.Control
                        as="select"
                        onChange={(e) => setNewEventParticipants(parseInt(e.target.value))}
                    >
                        <option value={2}>2</option>
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                    </Form.Control>
                </Col>
                <Col>
                    <Button onClick={createEvent}>Create Event</Button>
                </Col>
            </Row>

            <hr />

            <h2>Available Events</h2>
            {events.map(event => (
                <Card key={event.id} className="my-3">
                    <Card.Body>
                        <Card.Title>{event.name}</Card.Title>
                        <Card.Text>Category: {event.category}</Card.Text>
                        <Button onClick={() => joinEvent(event.id)}>Join Event</Button>
                        <Form className="mt-3">
                            <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} />
                            <Form.Control
                                type="text"
                                placeholder="Write a caption"
                                onChange={(e) => setCaption(e.target.value)}
                                className="mt-2"
                            />
                            <Button onClick={() => uploadImage(event.id)} className="mt-2">Upload Image</Button>
                        </Form>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
};

export default Events;
