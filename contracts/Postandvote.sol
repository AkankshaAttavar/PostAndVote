// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Decentratwitter is ERC721URIStorage, Ownable {
    uint256 public tokenCount;
    uint256 public postCount;
    uint256 public eventCount;
    uint256 public participantFee = 0.005 ether; // Fee is 0.005 ETH
    uint256 public voteFee = 0.001 ether; // Fee to vote is 0.001 ETH
    uint256 public eventDuration = 2 days; // Event duration is 2 days

    struct Post {
        uint256 id;
        string hash;
        uint256 tipAmount;
        address payable author;
    }

    struct Event {
        uint256 id;
        string name;
        string category;
        uint256 maxParticipants;
        address payable[] participants;
        string[] posts;
        uint256 startTime;
        bool votingOpen;
        bool finalized;
        mapping(address => uint256) votes;
        uint256[2] voteCounts;
    }

    mapping(uint256 => Post) public posts;
    mapping(uint256 => Event) public events;
    mapping(address => uint256) public profiles; // Maps user address to NFT ID
    mapping(uint256 => mapping(address => bool)) public eventParticipants;

    event PostCreated(
        uint256 indexed id,
        string hash,
        uint256 tipAmount,
        address indexed author
    );
    event PostTipped(
        uint256 indexed id,
        string hash,
        uint256 tipAmount,
        address indexed author
    );
    event ProfileSet(address indexed user, uint256 indexed tokenId);
    event EventCreated(
        uint256 indexed id,
        string name,
        string category,
        uint256 maxParticipants
    );
    event JoinedEvent(uint256 indexed id, address indexed participant);
    event ImageUploaded(
        uint256 indexed id,
        address indexed participant,
        string image,
        string caption
    );
    event VoteCast(
        uint256 indexed id,
        address indexed voter,
        uint256 indexed postIndex
    );
    event EventFinalized(uint256 indexed id, address indexed winner);

    constructor() ERC721("Decentratwitter", "DAPP") {}

    // Mint a new NFT profile
    function mint(string memory _tokenURI) external returns (uint256) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
        setProfile(tokenCount); // Automatically set the profile to the new NFT

        emit ProfileSet(msg.sender, tokenCount);

        return tokenCount;
    }

    // Set a user's profile to a specific NFT they own
    function setProfile(uint256 _id) public {
        require(
            ownerOf(_id) == msg.sender,
            "Must own the NFT you want to set as your profile"
        );
        profiles[msg.sender] = _id;

        emit ProfileSet(msg.sender, _id);
    }

    // Upload a new post
    function uploadPost(string memory _postHash) external {
        require(
            balanceOf(msg.sender) > 0,
            "Must own a Decentratwitter NFT to post"
        );
        require(bytes(_postHash).length > 0, "Cannot pass an empty hash");

        postCount++;
        posts[postCount] = Post(postCount, _postHash, 0, payable(msg.sender));

        emit PostCreated(postCount, _postHash, 0, msg.sender);
    }

    // Tip the owner of a post
    function tipPostOwner(uint256 _id) external payable {
        require(_id > 0 && _id <= postCount, "Invalid post id");

        Post storage _post = posts[_id];
        require(_post.author != msg.sender, "Cannot tip your own post");

        _post.author.transfer(msg.value);
        _post.tipAmount += msg.value;

        emit PostTipped(_id, _post.hash, _post.tipAmount, _post.author);
    }

    // Create a new event
    function createEvent(
        string memory _name,
        string memory _category,
        uint256 _maxParticipants
    ) external {
        eventCount++;
        Event storage newEvent = events[eventCount];
        newEvent.id = eventCount;
        newEvent.name = _name;
        newEvent.category = _category;
        newEvent.maxParticipants = _maxParticipants;
        newEvent.startTime = block.timestamp;

        emit EventCreated(eventCount, _name, _category, _maxParticipants);
    }

    // Join an event by paying a participation fee and submitting a post
    function joinEvent(uint256 _eventId, string memory _post) external payable {
        require(msg.value == participantFee, "Incorrect fee to join the event");
        Event storage eventInstance = events[_eventId];
        require(
            eventInstance.participants.length < eventInstance.maxParticipants,
            "Event is full"
        );
        require(
            !eventParticipants[_eventId][msg.sender],
            "You have already joined this event"
        );

        eventInstance.participants.push(payable(msg.sender));
        eventInstance.posts.push(_post);
        eventParticipants[_eventId][msg.sender] = true;

        emit JoinedEvent(_eventId, msg.sender);

        if (
            eventInstance.participants.length == eventInstance.maxParticipants
        ) {
            eventInstance.votingOpen = true;
        }
    }

    // Vote for a post in an event
    function vote(uint256 _eventId, uint256 _postIndex) external payable {
        Event storage eventInstance = events[_eventId];
        require(eventInstance.votingOpen, "Voting is not open yet");
        require(!eventInstance.finalized, "Event is already finalized");
        require(msg.value == voteFee, "Incorrect voting fee");
        require(eventInstance.votes[msg.sender] == 0, "You have already voted");
        require(_postIndex < eventInstance.posts.length, "Invalid post index");

        eventInstance.voteCounts[_postIndex] += msg.value;
        eventInstance.votes[msg.sender] = _postIndex + 1;

        emit VoteCast(_eventId, msg.sender, _postIndex);
    }

    // Finalize the event and distribute rewards
    function finalizeEvent(uint256 _eventId) external {
        Event storage eventInstance = events[_eventId];
        require(
            block.timestamp >= eventInstance.startTime + eventDuration,
            "Event duration has not yet passed"
        );
        require(!eventInstance.finalized, "Event is already finalized");

        uint256 winningIndex = eventInstance.voteCounts[0] >
            eventInstance.voteCounts[1]
            ? 0
            : 1;
        uint256 reward = eventInstance.voteCounts[0] +
            eventInstance.voteCounts[1] +
            (participantFee * 2);

        // Transfer the reward to the winner
        eventInstance.participants[winningIndex].transfer(reward);

        eventInstance.finalized = true;

        emit EventFinalized(_eventId, eventInstance.participants[winningIndex]);
    }

    // Fetch all NFTs owned by the caller
    function getMyNfts() external view returns (uint256[] memory) {
        uint256 balance = balanceOf(msg.sender);
        uint256[] memory _ids = new uint256[](balance);

        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= tokenCount; i++) {
            if (ownerOf(i) == msg.sender) {
                _ids[currentIndex] = i;
                currentIndex++;
            }
        }

        return _ids;
    }

    // Override the _transfer function to ensure profile integrity
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._transfer(from, to, tokenId);

        if (profiles[from] == tokenId) {
            delete profiles[from]; // Reset the profile if the NFT is transferred
            profiles[to] = tokenId; // Optionally, set it as the new owner's profile
            emit ProfileSet(to, tokenId);
        }
    }
}
