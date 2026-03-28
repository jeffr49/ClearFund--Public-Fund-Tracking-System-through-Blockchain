// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProjectEscrow
 * @notice Audit / state machine for milestone workflow. Amounts are **whole Indian Rupees (INR)**,
 *         matching the contractor's bid milestone quotes. No native ETH (or other tokens) is held or
 *         sent by this contract. When `releaseFunds` runs after approvals, fiat payout to the
 *         contractor's **bank account** must be executed off-chain (treasury / banking integration)
 *         using the `FundsReleased` event (milestone id + INR amount).
 */
contract ProjectEscrow {

    address public government;
    address public contractor;

    /// @notice Total project budget in INR (whole rupees), sum of milestone amounts
    uint256 public totalFunds;
    /// @notice Cumulative INR marked released on-chain (off-chain bank transfer should mirror this)
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
        uint256 submissionRound;

        uint8 approvals;
        uint8 rejections;

        bool submitted;
        bool released;

        mapping(address => uint256) approvedRound;
        mapping(address => uint256) rejectedRound;
    }

    mapping(uint256 => Milestone) public milestones;

    event ProofSubmitted(uint256 milestoneId, string ipfsHash);
    event MilestoneApproved(uint256 milestoneId, address approver);
    event MilestoneRejected(uint256 milestoneId, address approver);
    /// @param amount Milestone payout in **whole INR** (off-chain bank settlement)
    event FundsReleased(uint256 milestoneId, uint256 amount);
    event DeadlineExtended(uint256 milestoneId, uint256 newDeadline);

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
    ) {
        require(_amounts.length == _deadlines.length, "Invalid input");

        government = _government;
        contractor = _contractor;
        approvers = _approvers;
        approvalThreshold = _threshold;

        milestoneCount = _amounts.length;
        uint256 sum;
        for (uint i = 0; i < milestoneCount; i++) {
            milestones[i].amount = _amounts[i];
            milestones[i].deadline = _deadlines[i];
            sum += _amounts[i];
        }
        totalFunds = sum;

        for (uint i = 0; i < _approvers.length; i++) {
            isApprover[_approvers[i]] = true;
        }
    }

    function submitProof(uint256 id, string memory hash)
        public
        onlyContractor
    {
        require(id == currentMilestone, "Not current milestone");

        Milestone storage m = milestones[id];

        m.submissionRound++;
        m.approvals = 0;
        m.rejections = 0;

        m.ipfsHash = hash;
        m.submitted = true;

        emit ProofSubmitted(id, hash);
    }

    function approveMilestone(uint256 id)
        public
        onlyApprover
    {
        Milestone storage m = milestones[id];

        require(m.submitted, "Proof not submitted");
        require(
            m.approvedRound[msg.sender] != m.submissionRound,
            "Already approved"
        );
        require(
            m.rejectedRound[msg.sender] != m.submissionRound,
            "Already rejected"
        );

        m.approvedRound[msg.sender] = m.submissionRound;
        m.approvals++;

        emit MilestoneApproved(id, msg.sender);

        // Consensus reached: release funds automatically
        if (m.approvals >= approvalThreshold && !m.released) {
            _releaseFunds(id);
        }
    }

    function rejectMilestone(uint256 id)
        public
        onlyApprover
    {
        Milestone storage m = milestones[id];

        require(m.submitted, "Proof not submitted");
        require(
            m.rejectedRound[msg.sender] != m.submissionRound,
            "Already rejected"
        );
        require(
            m.approvedRound[msg.sender] != m.submissionRound,
            "Already approved"
        );

        m.rejectedRound[msg.sender] = m.submissionRound;
        m.rejections++;

        emit MilestoneRejected(id, msg.sender);

        // Consensus rejected: extend deadline automatically
        if (m.rejections >= approvalThreshold) {
            _extendDeadline(id, 7 days);
        }
    }

    function extendDeadline(uint256 id, uint256 extraTime)
        public
        onlyApprover
    {
        _extendDeadline(id, extraTime);
    }

    function _extendDeadline(uint256 id, uint256 extraTime) internal {
        Milestone storage m = milestones[id];
        require(!m.released, "Already completed");

        m.deadline += extraTime;
        emit DeadlineExtended(id, m.deadline);
    }

    /**
     * @notice Records milestone payout in INR. Does **not** move cryptocurrency. Treasury should
     *         pay the contractor's bank account for `m.amount` INR off-chain.
     */
    function releaseFunds(uint256 id) public {
        _releaseFunds(id);
    }

    function _releaseFunds(uint256 id) internal {
        Milestone storage m = milestones[id];

        require(m.approvals >= approvalThreshold, "Not enough approvals");
        require(!m.released, "Already released");

        m.released = true;
        releasedFunds += m.amount;

        currentMilestone++;

        emit FundsReleased(id, m.amount);
    }

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
