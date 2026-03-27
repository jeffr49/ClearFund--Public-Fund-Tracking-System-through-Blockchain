// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProjectEscrow {

    address public government;
    address public contractor;

    uint256 public totalFunds;
    uint256 public releasedFunds;

    uint8 public approvalThreshold;

    address[] public approvers;
    mapping(address => bool) public isApprover;

    uint256 public currentMilestone;
    uint256 public milestoneCount;

    struct Milestone {
        uint256 amount;
        uint256 deadline;
        string ipfsHash;

        uint8 approvals;
        uint8 rejections;

        bool submitted;
        bool released;

        mapping(address => bool) voted;
        mapping(address => bool) rejected;
    }

    mapping(uint256 => Milestone) public milestones;

    // EVENTS
    event ProofSubmitted(uint256 milestoneId, string ipfsHash);
    event MilestoneApproved(uint256 milestoneId, address approver);
    event MilestoneRejected(uint256 milestoneId, address approver);
    event FundsReleased(uint256 milestoneId, uint256 amount);
    event DeadlineExtended(uint256 milestoneId, uint256 newDeadline);

    // MODIFIERS
    modifier onlyGovernment() {
        require(msg.sender == government, "Not government");
        _;
    }

    modifier onlyContractor() {
        require(msg.sender == contractor, "Not contractor");
        _;
    }

    modifier onlyApprover() {
        require(isApprover[msg.sender], "Not approver");
        _;
    }

    constructor(
        address _government,
        address _contractor,
        address[] memory _approvers,
        uint256[] memory _amounts,
        uint256[] memory _deadlines,
        uint8 _threshold
    ) payable {
        require(_amounts.length == _deadlines.length, "Invalid input");

        government = _government;
        contractor = _contractor;
        approvers = _approvers;
        approvalThreshold = _threshold;

        totalFunds = msg.value;
        milestoneCount = _amounts.length;

        for (uint i = 0; i < _approvers.length; i++) {
            isApprover[_approvers[i]] = true;
        }

        for (uint i = 0; i < milestoneCount; i++) {
            milestones[i].amount = _amounts[i];
            milestones[i].deadline = _deadlines[i];
        }
    }

    // ========================
    // CONTRACTOR ACTIONS
    // ========================

    function submitProof(uint256 id, string memory hash)
        public
        onlyContractor
    {
        require(id == currentMilestone, "Not current milestone");

        Milestone storage m = milestones[id];

        // Reset approvals & rejections for resubmission
        m.approvals = 0;
        m.rejections = 0;

        m.ipfsHash = hash;
        m.submitted = true;

        emit ProofSubmitted(id, hash);
    }

    // ========================
    // APPROVER ACTIONS
    // ========================

    function approveMilestone(uint256 id)
        public
        onlyApprover
    {
        Milestone storage m = milestones[id];

        require(m.submitted, "Proof not submitted");
        require(!m.voted[msg.sender], "Already approved");
        require(!m.rejected[msg.sender], "Already rejected");

        m.voted[msg.sender] = true;
        m.approvals++;

        emit MilestoneApproved(id, msg.sender);
    }

    function rejectMilestone(uint256 id)
        public
        onlyApprover
    {
        Milestone storage m = milestones[id];

        require(m.submitted, "Proof not submitted");
        require(!m.rejected[msg.sender], "Already rejected");
        require(!m.voted[msg.sender], "Already approved");

        m.rejected[msg.sender] = true;
        m.rejections++;

        emit MilestoneRejected(id, msg.sender);
    }

    function extendDeadline(uint256 id, uint256 extraTime)
        public
        onlyApprover
    {
        Milestone storage m = milestones[id];

        require(!m.released, "Already completed");

        m.deadline += extraTime;

        emit DeadlineExtended(id, m.deadline);
    }

    // ========================
    // FUND RELEASE
    // ========================

    function releaseFunds(uint256 id) public {
        Milestone storage m = milestones[id];

        require(m.approvals >= approvalThreshold, "Not enough approvals");
        require(!m.released, "Already released");

        m.released = true;
        releasedFunds += m.amount;

        payable(contractor).transfer(m.amount);

        currentMilestone++;

        emit FundsReleased(id, m.amount);
    }

    // ========================
    // VIEW FUNCTION
    // ========================

    function getMilestone(uint256 id)
        public
        view
        returns (
            uint256 amount,
            uint256 deadline,
            string memory ipfsHash,
            uint8 approvals,
            uint8 rejections,
            bool submitted,
            bool released
        )
    {
        Milestone storage m = milestones[id];

        return (
            m.amount,
            m.deadline,
            m.ipfsHash,
            m.approvals,
            m.rejections,
            m.submitted,
            m.released
        );
    }
}